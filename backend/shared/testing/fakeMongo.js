/**
 * In-memory stand-in for the small part of the MongoDB collection API that the
 * services use, so their test suites run without a database.
 *
 * Supported: insertOne, findOne (with the two projections used for subdocuments),
 * find().toArray() with equality criteria, updateOne with $set / $push / $pull
 * (including `$[element]` + arrayFilters by _id) and deleteMany.
 */

const isId = (value) => typeof value === 'object' && value !== null && typeof value.toHexString === 'function'

const equals = (a, b) => {
  if (isId(a) || isId(b)) return String(a) === String(b)
  // As MongoDB does, null matches missing fields
  if (a === null || a === undefined) return b === null || b === undefined
  return a === b
}

const clone = (value) => {
  if (Array.isArray(value)) return value.map(clone)
  if (typeof value === 'object' && value !== null && !isId(value) && !(value instanceof Date)) {
    const copy = {}
    for (const key of Object.keys(value)) copy[key] = clone(value[key])
    return copy
  }
  return value
}

const matches = (document, filter) => Object.keys(filter).every((key) => {
  if (key.startsWith('$')) throw new Error(`fakeMongo: unsupported operator ${key}`)
  const expected = filter[key]
  if (typeof expected === 'object' && expected !== null && !isId(expected)) {
    throw new Error('fakeMongo: only equality conditions are supported')
  }

  const [field, subField] = key.split('.')
  if (subField === undefined) return equals(document[field], expected)

  return Array.isArray(document[field]) && document[field].some((element) => equals(element[subField], expected))
})

/**
 * @param {() => any} createId Generates identifiers (the ObjectId constructor of the driver)
 */
export const createFakeMongo = (createId) => {
  const collections = new Map()

  const getDocuments = (name) => {
    if (!collections.has(name)) collections.set(name, [])
    return collections.get(name)
  }

  const getCollection = (name) => ({
    async insertOne (document) {
      if (document._id === undefined) document._id = createId()
      getDocuments(name).push(clone(document))
      return { insertedId: document._id }
    },

    async findOne (filter, options = {}) {
      const document = getDocuments(name).find((candidate) => matches(candidate, filter))
      if (document === undefined) return null

      const { projection } = options
      if (projection === undefined) return clone(document)

      const result = {}
      for (const key of Object.keys(projection)) {
        if (key === '_id' || projection[key] !== 1) continue
        if (key.endsWith('.$')) {
          // Positional projection: only the array element matched by the filter
          const field = key.slice(0, -2)
          const condition = Object.keys(filter).find((filterKey) => filterKey.startsWith(`${field}.`))
          const subField = condition.split('.')[1]
          result[field] = document[field].filter((element) => equals(element[subField], filter[condition])).slice(0, 1).map(clone)
        } else if (document[key] !== undefined) {
          result[key] = clone(document[key])
        }
      }
      return result
    },

    find (filter) {
      return {
        toArray: async () => getDocuments(name).filter((candidate) => matches(candidate, filter)).map(clone)
      }
    },

    async updateOne (filter, update, options = {}) {
      const document = getDocuments(name).find((candidate) => matches(candidate, filter))

      if (update.$set && Object.keys(update.$set).length === 0) {
        throw new Error("'$set' is empty. You must specify a field like so: {$set: {<field>: ...}}")
      }
      if (document === undefined) return { matchedCount: 0 }

      for (const key of Object.keys(update.$set || {})) {
        if (key.endsWith('.$[element]')) {
          const field = key.slice(0, -'.$[element]'.length)
          const id = options.arrayFilters[0]['element._id']
          document[field] = (document[field] || []).map((element) => equals(element._id, id) ? clone(update.$set[key]) : element)
        } else {
          document[key] = clone(update.$set[key])
        }
      }
      for (const key of Object.keys(update.$push || {})) {
        document[key] = [...(document[key] || []), clone(update.$push[key])]
      }
      for (const key of Object.keys(update.$pull || {})) {
        document[key] = (document[key] || []).filter((element) => !matches(element, update.$pull[key]))
      }
      return { matchedCount: 1 }
    },

    async deleteMany (filter) {
      const documents = getDocuments(name)
      const remaining = documents.filter((candidate) => !matches(candidate, filter))
      collections.set(name, remaining)
      return { deletedCount: documents.length - remaining.length }
    }
  })

  return { getCollection }
}
