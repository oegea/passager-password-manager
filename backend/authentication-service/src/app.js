import { createApp } from '../../shared/http.js'
import { createLoginModule } from './login.js'

/**
 * Builds the authentication service application.
 * @param {object} dependencies
 * @param {(name: string) => any} dependencies.getCollection Returns a MongoDB collection
 * @param {(message: object) => Promise<boolean>} dependencies.sendEmail
 * @param {number} [dependencies.waitTime] Artificial delay applied to every login attempt
 */
export const createAuthenticationApp = ({ getCollection, sendEmail, waitTime }) => {
  const app = createApp({ getTokenSecret: () => process.env.COMMON_TOKEN_SECRET })

  createLoginModule({ getCollection, sendEmail, waitTime }).setupHttpEntryPoints(app)

  return app
}
