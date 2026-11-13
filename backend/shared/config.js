/**
 * Configuration helpers shared by both services.
 */

/**
 * Refuses to run without a token secret.
 *
 * Previous versions silently fell back to the literal string "undefined" as
 * signing secret when COMMON_TOKEN_SECRET was missing, which allowed anyone to
 * forge sessions. A correctly configured deployment is not affected.
 */
export const requireTokenSecret = () => {
  const secret = process.env.COMMON_TOKEN_SECRET
  if (typeof secret !== 'string' || secret.length === 0) {
    throw new Error('COMMON_TOKEN_SECRET environment variable is required and cannot be empty')
  }
  return secret
}

/**
 * Returns a valid TCP port from an environment value, or the default one.
 */
export const getPort = (value, defaultPort) => {
  const port = Number(value)
  if (!Number.isInteger(port) || port < 0 || port > 65535 || value === undefined || value === '') {
    return defaultPort
  }
  return port
}
