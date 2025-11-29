/**
 * Integration test for authentication service with updated Docky version
 * This test verifies that the authentication service can be initialized
 * and that all required exports are available
 */

describe('Authentication Service Integration', () => {
  it('should export loadConfig from docky-authentication-service', () => {
    const { loadConfig } = require('@useful-tools/docky-authentication-service/dist')
    expect(typeof loadConfig).toBe('function')
  })

  it('should export startAuthenticationService from docky-authentication-service', () => {
    const { startAuthenticationService } = require('@useful-tools/docky-authentication-service/dist')
    expect(typeof startAuthenticationService).toBe('function')
  })

  it('should be able to call loadConfig without errors', () => {
    const { loadConfig } = require('@useful-tools/docky-authentication-service/dist')

    // Test with mock configuration
    expect(() => {
      loadConfig({
        commonAppName: 'test-app',
        commonOrganizationName: 'test-org',
        commonMongoDbConnectionString: 'mongodb://localhost:27017',
        commonTokenSecret: 'test-secret',
        commonMongoDbDatabase: 'test-db',
        authCollection: 'test-auth',
        authPort: 3001,
        docsPort: 3002
      })
    }).not.toThrow()
  })

  it('should validate that the imported module structure matches expected API', () => {
    const dockyAuth = require('@useful-tools/docky-authentication-service/dist')

    // Verify all expected exports exist
    expect(dockyAuth).toHaveProperty('loadConfig')
    expect(dockyAuth).toHaveProperty('startAuthenticationService')

    // Verify types
    expect(typeof dockyAuth.loadConfig).toBe('function')
    expect(typeof dockyAuth.startAuthenticationService).toBe('function')
  })
})
