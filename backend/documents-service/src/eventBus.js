/**
 * In-process query bus.
 *
 * Permission rules use it to read documents with system privileges, and the
 * documents module uses it to ask those rules whether an operation is allowed.
 * `query` resolves with an array holding the result of every subscriber, or
 * null when nobody is subscribed to the query.
 */
const subscriptions = []

export const eventBusRepository = {
  subscribe (name, callback) {
    subscriptions.push({ name, callback })
  },

  async query (name, payload) {
    const subscribers = subscriptions.filter((subscription) => subscription.name === name)

    if (subscribers.length === 0) {
      return null
    }

    return await Promise.all(subscribers.map((subscription) => subscription.callback(payload)))
  },

  /** Removes every subscription. Only meant to be used by tests. */
  reset () {
    subscriptions.length = 0
  }
}
