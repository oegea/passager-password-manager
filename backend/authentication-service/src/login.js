/**
 * Passwordless login: a one-time code is sent by e-mail, and exchanged for a
 * session token (JWT) once the user proves they received it.
 */
import { randomInt } from 'node:crypto'
import { signToken } from '../../shared/jwt.js'

const DEFAULT_WAIT_TIME = 3000
const IP_LIMIT_COLLECTION_NAME = 'ipLimit'
const CONFIG_SPLIT_MARK = ', '
const SESSION_DURATION_IN_SECONDS = 30 * 24 * 60 * 60
const MIN_CODE = 1000000
const MAX_CODE = 9999999
const EMAIL_FORMAT = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

// #region Validations
const validateEmail = (email) => {
  if (typeof email !== 'string') { throw new Error(`EmailValueObject: Invalid type provided for email property. Expected string, got ${typeof email}`) }

  if (email.length < 1) { throw new Error('EmailValueObject: email property could not be shorter than 1 character.') }

  if (email.length > 255) { throw new Error('EmailValueObject: email property could not be larger than 255 characters.') }

  if (!EMAIL_FORMAT.test(email)) { throw new Error('EmailValueObject: email format is not valid') }
}

const emailValidationIsEnabled = () => process.env.AUTH_LIMIT_ACCESS_BY_EMAIL === 'true'

const emailIsSpecificallyAllowed = (email) =>
  process.env.AUTH_ALLOWED_EMAILS.split(CONFIG_SPLIT_MARK).includes(email)

const validateEmailIsAuthorized = (email) => {
  if (!emailValidationIsEnabled() || emailIsSpecificallyAllowed(email)) return

  const allowedDomains = process.env.AUTH_ALLOWED_DOMAINS.split(CONFIG_SPLIT_MARK)
  const currentDomain = email.split('@')[1] || ''

  if (!allowedDomains.includes(currentDomain)) {
    throw new Error('StartLoginRequestValueObject: email is not authorized to login')
  }
}
// #endregion

/**
 * @param {object} dependencies
 * @param {(name: string) => any} dependencies.getCollection Returns a MongoDB collection
 * @param {(message: object) => Promise<boolean>} dependencies.sendEmail
 * @param {number} [dependencies.waitTime] Artificial delay applied to every attempt
 */
export const createLoginModule = ({ getCollection, sendEmail, waitTime = DEFAULT_WAIT_TIME }) => {
  const getAuthCollection = () => getCollection(process.env.AUTH_COLLECTION)
  const getIpLimitCollection = () => getCollection(IP_LIMIT_COLLECTION_NAME)

  // #region Attempts limit by IP address (optional)
  const getAttemptsLimitByIp = () => Number(process.env.AUTH_LIMIT_ATTEMPTS_PER_IP)
  const isAttemptsLimitEnabled = () => getAttemptsLimitByIp() > 0

  const hasIpReachedLimit = async (ipAddress) => {
    const result = await getIpLimitCollection().findOne({ ipAddress })

    if (!result) { return false }
    if (result.attempts < getAttemptsLimitByIp()) { return false }
    if (result.expirationTime < Date.now()) { return false }

    return true
  }

  const registerAttempt = async (ipAddress) => {
    const ipLimitCollection = getIpLimitCollection()
    const result = await ipLimitCollection.findOne({ ipAddress })

    let attempts = 1
    if (result && result.expirationTime > Date.now()) {
      attempts = result.attempts + 1
    }
    if (result) {
      await ipLimitCollection.deleteMany({ ipAddress })
    }

    await ipLimitCollection.insertOne({
      ipAddress,
      attempts,
      expirationTime: Date.now() + Number(process.env.AUTH_LIMIT_ATTEMPTS_PER_IP_WAIT_TIME)
    })
  }
  // #endregion

  const saveCode = async ({ email, ipAddress, code }) => {
    try {
      if (isAttemptsLimitEnabled()) {
        await registerAttempt(ipAddress)
      }

      const collection = getAuthCollection()
      // Only the latest code of an e-mail is valid
      await collection.deleteMany({ email })
      await collection.insertOne({
        email,
        number: code,
        createdAt: new Date(Date.now())
      })
    } catch (e) {
      console.error(e)
      return false
    }

    return true
  }

  const sendCode = async ({ email, code }) => {
    const appName = process.env.COMMON_APP_NAME
    const organizationName = process.env.COMMON_ORGANIZATION_NAME
    const subject = `Please verify your e-mail to use ${appName}`

    if (process.env.HTML_EMAIL_TEMPLATE !== undefined) {
      return await sendEmail({
        to: email,
        subject,
        html: process.env.HTML_EMAIL_TEMPLATE.replace('[code]', `${code}`)
      })
    }

    return await sendEmail({
      to: email,
      subject,
      text: `
          Hello,
  
          Your code to identify on ${appName} is ${code}.
  
          Thank you for using ${appName}.
  
          This e-mail has been sent by ${organizationName}.
  
          --
  
          Hola,
  
          Tu código para identificarte en ${appName} es ${code}.
  
          Gracias por usar ${appName}.
  
          Este correo electrónico ha sido enviado por ${organizationName}.
      `
    })
  }

  const startLogin = async ({ email, ipAddress }) => {
    validateEmail(email)
    validateEmailIsAuthorized(email)

    // For security purposes, every attempt takes some time
    await wait(waitTime)

    if (isAttemptsLimitEnabled() && await hasIpReachedLimit(ipAddress)) {
      throw new Error('StartLoginService: reached limit of attempts by ip')
    }

    const code = randomInt(MIN_CODE, MAX_CODE + 1)

    if (!await saveCode({ email, ipAddress, code })) {
      throw new Error('StartLoginService: error while saving random verification code')
    }

    if (!await sendCode({ email, code })) {
      throw new Error('StartLoginService: error while sending verification email')
    }
  }

  const validateLogin = async ({ email, code, sessionDetails }) => {
    validateEmail(email)

    // For security purposes, every attempt takes some time
    await wait(waitTime)

    const collection = getAuthCollection()
    const codeIsValid = Boolean(await collection.findOne({ email, number: code }))

    // The code is single use: it is removed even if the received one is not valid
    await collection.deleteMany({ email })

    if (!codeIsValid) { throw new Error('ValidateLoginService: received code is not valid') }

    return signToken({ email, sessionDetails }, process.env.COMMON_TOKEN_SECRET, {
      expiresInSeconds: SESSION_DURATION_IN_SECONDS
    })
  }

  /**
   * Operations reject with the failure reason as a plain string,
   * which is what HTTP clients receive in the `message` field.
   */
  const withMessageRejection = (operation) => async (parameters) => {
    try {
      return await operation(parameters)
    } catch (e) {
      // eslint-disable-next-line no-throw-literal
      throw e.message
    }
  }

  const operations = {
    startLogin: withMessageRejection(startLogin),
    validateLogin: withMessageRejection(validateLogin)
  }

  const setupHttpEntryPoints = (app) => {
    app.get('/login/:email', async ({ req, success }) => {
      const { email } = req.params
      // The service is designed to be placed behind a proxy, otherwise the forwarded address cannot be trusted
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress

      await operations.startLogin({ email, ipAddress })
      success()
    })

    app.get('/login/:email/validate/:code', async ({ req, success }) => {
      const { email, code } = req.params
      const { sessionDetails } = req.body

      success(await operations.validateLogin({ email, code: parseInt(code), sessionDetails }))
    })
  }

  return { ...operations, setupHttpEntryPoints }
}
