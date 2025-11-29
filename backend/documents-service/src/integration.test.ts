/**
 * Integration test for documents service with updated Docky version
 * This test verifies that the documents service can be initialized
 * and that all required exports are available
 */

describe('Documents Service Integration', () => {
  it('should export all required functions from docky-documents-service', () => {
    const dockyDocs = require('@useful-tools/docky-documents-service/dist')

    expect(typeof dockyDocs.getExpressApp).toBe('function')
    expect(typeof dockyDocs.loadConfig).toBe('function')
    expect(typeof dockyDocs.startDocumentsService).toBe('function')
    expect(typeof dockyDocs.NativeEventBusRepository).toBe('function')
  })

  it('should export TYPE_QUERY constant', () => {
    const { TYPE_QUERY } = require('@useful-tools/docky-documents-service/dist')
    expect(TYPE_QUERY).toBeDefined()
    expect(typeof TYPE_QUERY).toBe('string')
  })

  it('should be able to call loadConfig without errors', () => {
    const { loadConfig } = require('@useful-tools/docky-documents-service/dist')

    // Test with mock configuration
    expect(() => {
      loadConfig({
        commonAppName: 'test-app',
        commonDisableCors: false,
        commonOrganizationName: 'test-org',
        commonMongoDbConnectionString: 'mongodb://localhost:27017',
        commonTokenSecret: 'test-secret',
        commonMongoDbDatabase: 'test-db',
        docsPort: 3002
      })
    }).not.toThrow()
  })

  it('should be able to instantiate NativeEventBusRepository', () => {
    const { NativeEventBusRepository } = require('@useful-tools/docky-documents-service/dist')

    expect(() => {
      const eventBus = new NativeEventBusRepository()
      expect(eventBus).toBeDefined()
      expect(typeof eventBus.subscribe).toBe('function')
    }).not.toThrow()
  })

  it('should validate that the imported module structure matches expected API', () => {
    const dockyDocs = require('@useful-tools/docky-documents-service/dist')

    // Verify all expected exports exist
    const expectedExports = [
      'getExpressApp',
      'loadConfig',
      'startDocumentsService',
      'NativeEventBusRepository',
      'TYPE_QUERY',
      'TYPE_COMMAND'
    ]

    expectedExports.forEach(exportName => {
      expect(dockyDocs).toHaveProperty(exportName)
    })
  })
})
