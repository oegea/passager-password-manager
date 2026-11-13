import { getPort, requireTokenSecret } from '../../shared/config.js'
import { createDocumentsApp } from './app.js'
import { getCollection } from './mongo.js'

requireTokenSecret()

const port = getPort(process.env.DOCS_PORT, 3002)
const app = createDocumentsApp({ getCollection })

// Pieces of a file are always looked up by file
getCollection('fileChunks').createIndex({ file: 1, index: 1 }).catch((error) => {
  console.error('Could not create the fileChunks index', error.message)
})

await app.listen(port)
console.log(`Documents service is running on port ${port}`)
