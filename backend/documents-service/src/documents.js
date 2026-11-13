/**
 * Generic documents and subdocuments operations.
 *
 * Storage layout (unchanged since the first version of the backend):
 *  - A document is a MongoDB document of its collection. Its `_id` is exposed as `id`.
 *  - Subdocuments live inside their parent, in an array field named `_<subCollection>`,
 *    each one with its own ObjectId `_id` (also exposed as `id`).
 *  - Fields starting with `_` are internal: they are never returned nor accepted.
 *
 * Every operation is first authorized through the GET_OPERATION_PERMISSIONS query,
 * except when it is executed by the SYSTEM user (internal reads made by permission rules).
 */
import { ObjectId } from 'mongodb'

const INTERNAL_FIELDS_PREFIX = '_'
const FIELD_ID_NAME = 'id'
export const SYSTEM_USER_ID = 'SYSTEM'

const toPlainObject = (document) => {
  if (document === null) return {}
  const plainObject = {}
  Object.keys(document).forEach((key) => { plainObject[key] = document[key] })
  return plainObject
}

const validateFieldNames = (plainObject) => {
  const hasInvalidFieldNames = Object.keys(plainObject)
    .some((key) => key.startsWith(INTERNAL_FIELDS_PREFIX) || key === FIELD_ID_NAME)

  if (hasInvalidFieldNames) {
    throw new Error('DocumentEntity: document contains invalid field names')
  }
}

/** Builds a validated plain object from user input */
const createPlainObject = (document = {}) => {
  const plainObject = toPlainObject(document)
  validateFieldNames(plainObject)
  return plainObject
}

const removeInternalFields = (mongoDocument) => {
  const filteredDocument = {}
  Object.keys(mongoDocument).forEach((key) => {
    if (key.startsWith(INTERNAL_FIELDS_PREFIX)) return
    filteredDocument[key] = mongoDocument[key]
  })
  return filteredDocument
}

/** Maps a stored (sub)document to its public representation */
const toPublicDocument = (mongoDocument) => {
  const plainObject = createPlainObject(removeInternalFields(mongoDocument))
  return { id: `${mongoDocument._id}`, ...plainObject }
}

const isPrimitive = (value) => value === null || (typeof value !== 'object' && typeof value !== 'function')

/**
 * Search criteria can only be a flat list of equality conditions.
 * This prevents MongoDB operators ($where, $ne, $regex...) from being injected by clients.
 */
export const isSafeCriteria = (criteria) => {
  if (typeof criteria !== 'object' || criteria === null || Array.isArray(criteria)) return false

  return Object.keys(criteria).every((key) =>
    !key.startsWith('$') && isPrimitive(criteria[key])
  )
}

/**
 * @param {object} dependencies
 * @param {(name: string) => any} dependencies.getCollection Returns a MongoDB collection
 * @param {{query: Function, subscribe: Function}} dependencies.eventBusRepository
 * @param {Object<string, (id: string) => Promise<void>>} [dependencies.afterDelete]
 *        Clean up to run once a document of a collection has been deleted
 */
export const createDocumentsModule = ({ getCollection, eventBusRepository, afterDelete = {} }) => {
  const subCollectionField = (subCollection) => `${INTERNAL_FIELDS_PREFIX}${subCollection}`

  // #region Permissions
  const hasPermission = async ({ collection, currentUserId, id, subCollection, parentId, operationType, payload }) => {
    if (currentUserId === SYSTEM_USER_ID) { return true }

    const hasPermissions = await eventBusRepository.query('GET_OPERATION_PERMISSIONS', {
      collection,
      currentUserId,
      id,
      subCollection,
      parentId,
      operationType,
      payload
    })

    if (hasPermissions === null) { return false }

    return hasPermissions[0]
  }
  // #endregion

  // #region Documents storage
  const findMongoDocumentById = async (collection, id) => {
    try {
      return await collection.findOne({ _id: new ObjectId(id) })
    } catch (e) {
      console.error(e)
      return null
    }
  }
  // #endregion

  // #region Documents
  const getDocument = async ({ collection, currentUserId, id }) => {
    if (!await hasPermission({
      collection,
      currentUserId,
      id,
      subCollection: null,
      parentId: null,
      operationType: 'get_document',
      payload: { id }
    })) { throw new Error('GetDocumentService: insufficient permissions to perform this operation') }

    const result = await findMongoDocumentById(getCollection(collection), id)

    if (result === null) { throw new Error('GetDocumentService: error while getting a document') }

    return toPublicDocument(result)
  }

  const createDocument = async ({ collection, currentUserId, document }) => {
    const plainObject = createPlainObject(document)

    if (!await hasPermission({
      collection,
      currentUserId,
      id: null,
      subCollection: null,
      parentId: null,
      operationType: 'create_document',
      payload: { id: null, ...plainObject }
    })) { throw new Error('CreateDocumentService: insufficient permissions to perform this operation') }

    const mongoCollection = getCollection(collection)
    const mongoDocument = { ...plainObject }
    try {
      // insertOne adds the generated _id to mongoDocument
      await mongoCollection.insertOne(mongoDocument)
    } catch (e) {
      console.error(e)
      throw new Error('CreateDocumentService: error while creating a new document')
    }

    return toPublicDocument(mongoDocument)
  }

  const deleteDocument = async ({ collection, currentUserId, id }) => {
    if (!await hasPermission({
      collection,
      currentUserId,
      id,
      subCollection: null,
      parentId: null,
      operationType: 'delete_document',
      payload: { id }
    })) { throw new Error('DeleteDocumentService: insufficient permissions to perform this operation') }

    try {
      await getDocument({ collection, currentUserId, id })
    } catch (e) {
      return false
    }

    const mongoCollection = getCollection(collection)
    try {
      await mongoCollection.deleteMany({ _id: new ObjectId(id) })
    } catch (e) {
      console.error(e)
      return false
    }

    if (typeof afterDelete[collection] === 'function') {
      try {
        await afterDelete[collection](id)
      } catch (e) {
        console.error(e)
      }
    }

    return true
  }

  const findDocument = async ({ collection, currentUserId, criteria }) => {
    if (!await hasPermission({
      collection,
      currentUserId,
      id: null,
      subCollection: null,
      parentId: null,
      operationType: 'find_document',
      payload: criteria
    })) { throw new Error('FindDocumentService: insufficient permissions to perform this operation') }

    const mongoCollection = getCollection(collection)
    try {
      if (!isSafeCriteria(criteria)) {
        throw new Error('Search criteria must be a flat object of field/value pairs')
      }
      const mongoDocuments = await mongoCollection.find(criteria).toArray()
      return mongoDocuments.map(toPublicDocument)
    } catch (e) {
      console.error(e)
      throw new Error('FindDocumentService: error while finding documents')
    }
  }

  const patchDocument = async ({ collection, currentUserId, id, document }) => {
    const plainObject = createPlainObject(document)

    if (!await hasPermission({
      collection,
      currentUserId,
      id,
      subCollection: null,
      parentId: null,
      operationType: 'patch_document',
      payload: { id, ...plainObject }
    })) { throw new Error('PatchDocumentService: insufficient permissions to perform this operation') }

    const mongoCollection = getCollection(collection)
    let result = null
    try {
      await mongoCollection.updateOne({ _id: new ObjectId(id) }, { $set: plainObject })
      const mongoDocument = await findMongoDocumentById(mongoCollection, id)
      result = mongoDocument === null ? null : toPublicDocument(mongoDocument)
    } catch (e) {
      console.error(e)
      result = null
    }

    if (result === null) { throw new Error('PatchDocumentService: error while patching a document') }

    return result
  }
  // #endregion

  // #region Subdocuments storage
  const findMongoSubDocumentById = async (mongoCollection, parentId, id, subCollection) => {
    const field = subCollectionField(subCollection)
    let result = null
    try {
      result = await mongoCollection.findOne(
        {
          _id: new ObjectId(parentId),
          [`${field}._id`]: new ObjectId(id)
        },
        {
          projection: {
            _id: 0,
            [`${field}.$`]: 1
          }
        }
      )
    } catch (e) {
      console.error(e)
      return null
    }

    if (
      result !== null &&
      Object.hasOwn(result, field) &&
      Array.isArray(result[field]) &&
      result[field].length === 1
    ) { return result[field][0] }

    return null
  }

  const findAllMongoSubDocuments = async (mongoCollection, parentId, subCollection) => {
    const field = subCollectionField(subCollection)
    let result = null
    try {
      result = await mongoCollection.findOne(
        { _id: new ObjectId(parentId) },
        { projection: { _id: 0, [field]: 1 } }
      )
    } catch (e) {
      console.error(e)
      return null
    }

    if (
      result !== null &&
      Object.hasOwn(result, field) &&
      Array.isArray(result[field])
    ) { return result[field] }

    return []
  }
  // #endregion

  // #region Subdocuments
  const getSubDocument = async ({ collection, currentUserId, parentId, subCollection, id }) => {
    if (!await hasPermission({
      collection,
      currentUserId,
      id,
      subCollection,
      parentId,
      operationType: 'get_subdocument',
      payload: { id }
    })) { throw new Error('GetSubDocumentService: insufficient permissions to perform this operation') }

    const result = await findMongoSubDocumentById(getCollection(collection), parentId, id, subCollection)

    if (result === null) { throw new Error('GetSubDocumentService: error while getting a document') }

    const plainObject = { ...result }
    delete plainObject._id

    return { id, ...createPlainObject(plainObject) }
  }

  const createSubDocument = async ({ collection, currentUserId, documentPlainObject, parentId, subCollection }) => {
    const plainObject = createPlainObject(documentPlainObject)

    if (!await parentDocumentExists({ collection, parentId })) {
      throw new Error('CreateSubDocumentService: parent document is not accessible')
    }

    if (!await hasPermission({
      collection,
      currentUserId,
      id: null,
      subCollection,
      parentId,
      operationType: 'create_subdocument',
      payload: { id: null, ...plainObject }
    })) { throw new Error('CreateSubDocumentService: insufficient permissions to perform this operation') }

    const mongoCollection = getCollection(collection)
    const mongoSubDocument = { _id: new ObjectId(), ...plainObject }
    try {
      await mongoCollection.updateOne({ _id: new ObjectId(parentId) }, {
        $push: {
          [subCollectionField(subCollection)]: mongoSubDocument
        }
      })
    } catch (e) {
      throw new Error('CreateSubDocumentService: error while creating a new subdocument')
    }

    return { id: mongoSubDocument._id.toString(), ...plainObject }
  }

  const deleteSubDocument = async ({ collection, currentUserId, parentId, subCollection, id }) => {
    if (!await hasPermission({
      collection,
      currentUserId,
      id,
      subCollection,
      parentId,
      operationType: 'delete_subdocument',
      payload: { id }
    })) { throw new Error('DeleteSubDocumentService: insufficient permissions to perform this operation') }

    if (!await subDocumentExists({ collection, parentId, subCollection, id })) {
      return false
    }

    const mongoCollection = getCollection(collection)
    try {
      await mongoCollection.updateOne({ _id: new ObjectId(parentId) }, {
        $pull: {
          [subCollectionField(subCollection)]: {
            _id: new ObjectId(id)
          }
        }
      })
      return true
    } catch (e) {
      return false
    }
  }

  const findSubDocument = async ({ collection, currentUserId, parentId, subCollection, criteria }) => {
    if (!await hasPermission({
      collection,
      currentUserId,
      id: null,
      subCollection,
      parentId,
      operationType: 'find_subdocument',
      payload: criteria
    })) { throw new Error('FindSubDocumentService: insufficient permissions to perform this operation') }

    const mongoSubDocuments = await findAllMongoSubDocuments(getCollection(collection), parentId, subCollection)

    if (mongoSubDocuments === null) { throw new Error('FindSubDocumentService: error while finding documents') }

    // Subdocuments are filtered in memory, by strict equality of every criteria field
    const criteriaKeys = Object.keys(criteria)
    return mongoSubDocuments
      .filter((mongoSubDocument) => criteriaKeys.every((key) => criteria[key] === mongoSubDocument[key]))
      .map(toPublicDocument)
  }

  const patchSubDocument = async ({ collection, currentUserId, parentId, subCollection, id, document }) => {
    const plainObject = createPlainObject(document)

    if (!await hasPermission({
      collection,
      currentUserId,
      id,
      subCollection,
      parentId,
      operationType: 'patch_subdocument',
      payload: { id, ...plainObject }
    })) { throw new Error('PatchSubDocumentService: insufficient permissions to perform this operation') }

    const mongoCollection = getCollection(collection)
    // A patch replaces the whole subdocument, keeping its identifier
    const mongoSubDocument = { _id: new ObjectId(id), ...plainObject }
    try {
      await mongoCollection.updateOne({ _id: new ObjectId(parentId) }, {
        $set: {
          [`${subCollectionField(subCollection)}.$[element]`]: mongoSubDocument
        }
      }, {
        arrayFilters: [
          { 'element._id': new ObjectId(id) }
        ]
      })
    } catch (e) {
      throw new Error('PatchSubDocumentService: error while patching a sub document')
    }

    return { id, ...plainObject }
  }
  // #endregion

  // #region Existence checks
  // Historical behaviour, kept on purpose: these checks only fail if the system query
  // itself cannot be executed. Access is enforced by the permission rules.
  const parentDocumentExists = async ({ collection, parentId }) => {
    try {
      const existingDocument = await eventBusRepository.query('GET_DOCUMENT', { collection, id: parentId })
      if (!Array.isArray(existingDocument)) { return false }
      if (existingDocument.length === 0) { return false }
      return true
    } catch (exception) {
      console.log(exception)
      return false
    }
  }

  const subDocumentExists = async ({ collection, parentId, subCollection, id }) => {
    try {
      const existingDocument = await eventBusRepository.query('GET_SUBDOCUMENT', { collection, id, subCollection, parentId })
      if (!Array.isArray(existingDocument)) { return false }
      if (existingDocument.length === 0) { return false }
      return true
    } catch (exception) {
      console.log(exception)
      return false
    }
  }
  // #endregion

  /**
   * Public operations reject with the failure reason as a plain string,
   * which is what HTTP clients receive in the `message` field.
   */
  const withMessageRejection = (operation) => async (parameters) => {
    try {
      return await operation(parameters)
    } catch (e) {
      // eslint-disable-next-line no-throw-literal
      throw e.message
    }
  }

  const operations = {
    createDocument: withMessageRejection(createDocument),
    getDocument: withMessageRejection(getDocument),
    deleteDocument: withMessageRejection(deleteDocument),
    findDocument: withMessageRejection(findDocument),
    patchDocument: withMessageRejection(patchDocument),
    createSubDocument: withMessageRejection(createSubDocument),
    getSubDocument: withMessageRejection(getSubDocument),
    deleteSubDocument: withMessageRejection(deleteSubDocument),
    findSubDocument: withMessageRejection(findSubDocument),
    patchSubDocument: withMessageRejection(patchSubDocument)
  }

  /**
   * Registers the queries that let other modules operate with system privileges.
   * They resolve with null instead of failing.
   */
  const setupEventEntryPoints = () => {
    const subscribeSystemQuery = (name, operation, mapPayload) => {
      eventBusRepository.subscribe(name, async (payload) => {
        try {
          return await operation({ ...mapPayload(payload), currentUserId: SYSTEM_USER_ID })
        } catch (e) {
          return null
        }
      })
    }

    subscribeSystemQuery('CREATE_DOCUMENT', operations.createDocument, ({ collection, document }) => ({ collection, document }))
    subscribeSystemQuery('CREATE_SUBDOCUMENT', operations.createSubDocument, ({ collection, parentId, subCollection, document }) => ({ collection, parentId, subCollection, documentPlainObject: document }))
    subscribeSystemQuery('DELETE_DOCUMENT', operations.deleteDocument, ({ collection, id }) => ({ collection, id }))
    subscribeSystemQuery('DELETE_SUBDOCUMENT', operations.deleteSubDocument, ({ collection, parentId, subCollection, id }) => ({ collection, parentId, subCollection, id }))
    subscribeSystemQuery('FIND_DOCUMENT', operations.findDocument, ({ collection, criteria }) => ({ collection, criteria }))
    subscribeSystemQuery('FIND_SUBDOCUMENT', operations.findSubDocument, ({ collection, parentId, subCollection, criteria }) => ({ collection, parentId, subCollection, criteria }))
    subscribeSystemQuery('GET_DOCUMENT', operations.getDocument, ({ collection, id }) => ({ collection, id }))
    subscribeSystemQuery('GET_SUBDOCUMENT', operations.getSubDocument, ({ collection, parentId, subCollection, id }) => ({ collection, parentId, subCollection, id }))
    subscribeSystemQuery('PATCH_DOCUMENT', operations.patchDocument, ({ collection, id, document }) => ({ collection, id, document }))
    subscribeSystemQuery('PATCH_SUBDOCUMENT', operations.patchSubDocument, ({ collection, parentId, subCollection, id, document }) => ({ collection, parentId, subCollection, id, document }))
  }

  /**
   * Registers the HTTP API on an application.
   */
  const setupHttpEntryPoints = (app) => {
    /* Documents */
    app.post('/documents/:collection', async ({ req, success }) => {
      const { collection } = req.params
      success(await operations.createDocument({ collection, currentUserId: req.user.email, document: req.body }))
    })

    app.get('/documents/:collection/:id', async ({ req, success }) => {
      const { collection, id } = req.params
      success(await operations.getDocument({ collection, currentUserId: req.user.email, id }))
    })

    app.delete('/documents/:collection/:id', async ({ req, success }) => {
      const { collection, id } = req.params
      success(await operations.deleteDocument({ collection, currentUserId: req.user.email, id }))
    })

    app.post('/documents/:collection/find', async ({ req, success }) => {
      const { collection } = req.params
      success(await operations.findDocument({ collection, currentUserId: req.user.email, criteria: req.body }))
    })

    app.patch('/documents/:collection/:id', async ({ req, success }) => {
      const { collection, id } = req.params
      success(await operations.patchDocument({ collection, currentUserId: req.user.email, id, document: req.body }))
    })

    /* Subdocuments */
    app.post('/documents/:collection/:parentId/:subCollection', async ({ req, success }) => {
      const { collection, parentId, subCollection } = req.params
      success(await operations.createSubDocument({ collection, currentUserId: req.user.email, documentPlainObject: req.body, parentId, subCollection }))
    })

    app.get('/documents/:collection/:parentId/:subCollection/:id', async ({ req, success }) => {
      const { collection, parentId, subCollection, id } = req.params
      success(await operations.getSubDocument({ collection, currentUserId: req.user.email, parentId, subCollection, id }))
    })

    app.delete('/documents/:collection/:parentId/:subCollection/:id', async ({ req, success }) => {
      const { collection, parentId, subCollection, id } = req.params
      success(await operations.deleteSubDocument({ collection, currentUserId: req.user.email, parentId, subCollection, id }))
    })

    app.post('/documents/:collection/:parentId/:subCollection/find', async ({ req, success }) => {
      const { collection, parentId, subCollection } = req.params
      success(await operations.findSubDocument({ collection, currentUserId: req.user.email, parentId, subCollection, criteria: req.body }))
    })

    app.patch('/documents/:collection/:parentId/:subCollection/:id', async ({ req, success }) => {
      const { collection, parentId, subCollection, id } = req.params
      success(await operations.patchSubDocument({ collection, currentUserId: req.user.email, parentId, subCollection, id, document: req.body }))
    })
  }

  return { ...operations, setupEventEntryPoints, setupHttpEntryPoints }
}
