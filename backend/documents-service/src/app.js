import { createApp } from '../../shared/http.js'
import { createDocumentsModule } from './documents.js'
import { eventBusRepository } from './eventBus.js'
import { getFileCapabilities, FILES_COLLECTION_NAME, FILE_CHUNKS_COLLECTION_NAME } from './files/index.js'
import { onGetOperationPermissions } from './onGetOperationPermissions.js'

/**
 * Builds the documents service application.
 * @param {object} dependencies
 * @param {(name: string) => any} dependencies.getCollection Returns a MongoDB collection
 */
export const createDocumentsApp = ({ getCollection }) => {
  const app = createApp({ getTokenSecret: () => process.env.COMMON_TOKEN_SECRET })

  eventBusRepository.reset()
  eventBusRepository.subscribe('GET_OPERATION_PERMISSIONS', onGetOperationPermissions)

  // Lets the frontend discover both services from a single URL
  app.get('/services-url', ({ json }) => {
    json({
      authenticationUrl: process.env.AUTH_PUBLIC_URL,
      documentsUrl: process.env.DOCS_PUBLIC_URL
    })
  })

  // What this version can do beyond the original API. Older versions do not
  // have this endpoint, which is how the frontend tells them apart.
  app.get('/capabilities', ({ json }) => {
    json({ files: getFileCapabilities() })
  })

  const documentsModule = createDocumentsModule({
    getCollection,
    eventBusRepository,
    afterDelete: {
      // The pieces of a file go away with it
      [FILES_COLLECTION_NAME]: async (id) => {
        await getCollection(FILE_CHUNKS_COLLECTION_NAME).deleteMany({ file: id })
      }
    }
  })
  documentsModule.setupHttpEntryPoints(app)
  documentsModule.setupEventEntryPoints()

  return app
}
