/**
 * Smoke test to verify that the documents service can be initialized
 * and that it doesn't crash on startup (without MongoDB)
 */

describe('Documents Service Smoke Test', () => {
  it('should successfully import and configure the service without errors', () => {
    // Mock environment variables
    process.env.COMMON_APP_NAME = 'test-app'
    process.env.COMMON_ORGANIZATION_NAME = 'test-org'
    process.env.COMMON_MONGODB_CONNECTION_STRING = 'mongodb://localhost:27017'
    process.env.COMMON_TOKEN_SECRET = 'test-secret'
    process.env.COMMON_MONGODB_DATABASE = 'test-db'
    process.env.DOCS_PORT = '3002'
    process.env.AUTH_PUBLIC_URL = 'http://localhost:3001'
    process.env.DOCS_PUBLIC_URL = 'http://localhost:3002'

    // This should not throw any syntax or import errors
    expect(() => {
      const {
        loadConfig,
        NativeEventBusRepository,
        TYPE_QUERY
      } = require('@useful-tools/docky-documents-service/dist')

      loadConfig({
        commonAppName: process.env.COMMON_APP_NAME,
        commonDisableCors: false,
        commonOrganizationName: process.env.COMMON_ORGANIZATION_NAME,
        commonMongoDbConnectionString: process.env.COMMON_MONGODB_CONNECTION_STRING,
        commonTokenSecret: process.env.COMMON_TOKEN_SECRET,
        commonMongoDbDatabase: process.env.COMMON_MONGODB_DATABASE,
        docsPort: Number(process.env.DOCS_PORT)
      })

      const eventBusRepository = new NativeEventBusRepository()
      expect(eventBusRepository).toBeDefined()
      expect(TYPE_QUERY).toBeDefined()
    }).not.toThrow()
  })

  it('should verify the EventBus can subscribe to events', () => {
    const { NativeEventBusRepository, TYPE_QUERY } = require('@useful-tools/docky-documents-service/dist')

    const eventBusRepository = new NativeEventBusRepository()
    const mockHandler = jest.fn()

    // This should not throw
    expect(() => {
      eventBusRepository.subscribe(TYPE_QUERY, 'TEST_EVENT', mockHandler)
    }).not.toThrow()
  })

  it('should verify the structure matches the existing implementation', () => {
    const {
      getExpressApp,
      loadConfig,
      startDocumentsService,
      NativeEventBusRepository,
      TYPE_QUERY
    } = require('@useful-tools/docky-documents-service/dist')

    expect(getExpressApp).toBeDefined()
    expect(loadConfig).toBeDefined()
    expect(startDocumentsService).toBeDefined()
    expect(NativeEventBusRepository).toBeDefined()
    expect(TYPE_QUERY).toBeDefined()

    expect(typeof getExpressApp).toBe('function')
    expect(typeof loadConfig).toBe('function')
    expect(typeof startDocumentsService).toBe('function')
    expect(typeof NativeEventBusRepository).toBe('function')
  })

  it('should verify that getExpressApp returns an Express application', () => {
    // This verifies our custom code integration works
    const { getExpressApp, loadConfig } = require('@useful-tools/docky-documents-service/dist')

    loadConfig({
      commonAppName: 'test-app',
      commonDisableCors: false,
      commonOrganizationName: 'test-org',
      commonMongoDbConnectionString: 'mongodb://localhost:27017',
      commonTokenSecret: 'test-secret',
      commonMongoDbDatabase: 'test-db',
      docsPort: 3002
    })

    const app = getExpressApp()
    expect(app).toBeDefined()
    expect(typeof app.get).toBe('function')
    expect(typeof app.post).toBe('function')
  })
})
