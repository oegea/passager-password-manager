import { MongoClient } from 'mongodb'

let client = null

const getClient = () => {
  if (client === null) {
    client = new MongoClient(process.env.COMMON_MONGODB_CONNECTION_STRING)
    client.on('topologyClosed', () => { client = null })
  }
  return client
}

/**
 * Returns a collection of the configured database. The connection is lazily
 * opened by the driver the first time an operation is executed.
 */
export const getCollection = (collectionName) =>
  getClient().db(String(process.env.COMMON_MONGODB_DATABASE)).collection(collectionName)
