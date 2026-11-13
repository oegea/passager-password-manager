/**
 * Normalises the configuration received through environment variables.
 */
export const loadConfig = () => {
  // Historical behaviours, kept on purpose so existing deployments behave exactly as before:
  //  - Access is limited by e-mail as soon as AUTH_LIMIT_ACCESS_BY_EMAIL has any
  //    non-empty value (even "false"). Leave it unset or empty to allow any e-mail.
  //  - The SMTP port is normalised as a number.
  //  - Missing text settings are read as the literal text "undefined".
  process.env.AUTH_LIMIT_ACCESS_BY_EMAIL = Boolean(process.env.AUTH_LIMIT_ACCESS_BY_EMAIL).toString()
  process.env.AUTH_SMTP_PORT = Number(process.env.AUTH_SMTP_PORT).toString()
  for (const name of [
    'COMMON_APP_NAME',
    'COMMON_ORGANIZATION_NAME',
    'COMMON_MONGODB_CONNECTION_STRING',
    'COMMON_MONGODB_DATABASE',
    'AUTH_COLLECTION',
    'AUTH_SMTP_HOST',
    'AUTH_SMTP_USER',
    'AUTH_SMTP_PASSWORD',
    'AUTH_SMTP_SENDER',
    'AUTH_ALLOWED_DOMAINS',
    'AUTH_ALLOWED_EMAILS'
  ]) {
    process.env[name] = String(process.env[name])
  }
}
