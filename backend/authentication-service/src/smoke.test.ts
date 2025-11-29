/**
 * Smoke test to verify that the authentication service can be initialized
 * and that it doesn't crash on startup (without MongoDB)
 */

describe('Authentication Service Smoke Test', () => {
  it('should successfully import and use main index.ts without errors', () => {
    // Mock environment variables
    process.env.COMMON_APP_NAME = 'test-app'
    process.env.COMMON_ORGANIZATION_NAME = 'test-org'
    process.env.COMMON_MONGODB_CONNECTION_STRING = 'mongodb://localhost:27017'
    process.env.COMMON_TOKEN_SECRET = 'test-secret'
    process.env.COMMON_MONGODB_DATABASE = 'test-db'
    process.env.AUTH_COLLECTION = 'test-auth'
    process.env.AUTH_PORT = '3001'
    process.env.DOCS_PORT = '3002'

    // This should not throw any syntax or import errors
    expect(() => {
      const { loadConfig } = require('@useful-tools/docky-authentication-service/dist')

      loadConfig({
        commonAppName: process.env.COMMON_APP_NAME,
        commonOrganizationName: process.env.COMMON_ORGANIZATION_NAME,
        commonMongoDbConnectionString: process.env.COMMON_MONGODB_CONNECTION_STRING,
        commonTokenSecret: process.env.COMMON_TOKEN_SECRET,
        commonMongoDbDatabase: process.env.COMMON_MONGODB_DATABASE,
        authCollection: process.env.AUTH_COLLECTION,
        authPort: Number(process.env.AUTH_PORT),
        authSmtpHost: process.env.AUTH_SMTP_HOST,
        authSmtpPort: Number(process.env.AUTH_SMTP_PORT),
        authSmtpUser: process.env.AUTH_SMTP_USER,
        authSmtpPassword: process.env.AUTH_SMTP_PASSWORD,
        authSmtpSender: process.env.AUTH_SMTP_SENDER,
        authLimitAccessByEmail: Boolean(process.env.AUTH_LIMIT_ACCESS_BY_EMAIL),
        authAllowedDomains: process.env.AUTH_ALLOWED_DOMAINS,
        authAllowedEmails: process.env.AUTH_ALLOWED_EMAILS,
        docsPort: Number(process.env.DOCS_PORT)
      })
    }).not.toThrow()
  })

  it('should verify the structure matches the existing implementation', () => {
    const { loadConfig, startAuthenticationService } = require('@useful-tools/docky-authentication-service/dist')

    expect(loadConfig).toBeDefined()
    expect(startAuthenticationService).toBeDefined()
    expect(typeof loadConfig).toBe('function')
    expect(typeof startAuthenticationService).toBe('function')
  })
})
