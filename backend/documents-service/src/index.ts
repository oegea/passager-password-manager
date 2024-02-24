import {getExpressApp, loadConfig, startDocumentsService, NativeEventBusRepository, TYPE_QUERY} from '@useful-tools/docky-documents-service/dist'
import {onGetOperationPermissions} from './onGetOperationPermissions'

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
eventBusRepository.subscribe(TYPE_QUERY, 'GET_OPERATION_PERMISSIONS', onGetOperationPermissions)

const app = getExpressApp()

app.get('/services-url', function(req, res) {
    res.json({
        authenticationUrl: process.env.AUTH_PUBLIC_URL,
        documentsUrl: process.env.DOCS_PUBLIC_URL
    })
});


startDocumentsService()