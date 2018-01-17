'use strict'

module.exports = { load, sync }

/**
 * Given an OrbitDB instance, instantiates a local docstore
 * that maps to the latest state of the PouchDB instance, and returns
 * once both datastructures have been mapped to each other.
 * @param  {OrbitDB}   orbit      OrbitDB instance. Required.
 * @param  {Object} address       Address to an OrbitDB store.
 * @param  {String} address.root  Hash of the store's latest entry.
 * @param  {String} address.path  Name of the database.
 * @return {Promise}              A promise that resolves once the OrbitDB and PouchDB instances are up to date.
 */
function load (orbit, address) {
  if (!orbit) throw new Error('An instance of OrbitDB is required.')
  this._orbit = orbit
  this._feed = this.changes({ live: true, include_docs: true })

  const onReplicated = (address) => {
    // process updates en masse (fixme: selective updates)
    // pouchdb will reject those it recognizes
    return this.bulkDocs(this._store.all, { new_edits: false })
  }

  const onChange = (change) => {
    // play changes onto feed
    // 1. check if change already exists
    let doc1 = change.doc
    let inStore = this._store.get(doc1._id).filter((doc2) => {
      return doc1._rev === doc2._rev
    })
    // 2. exists ? skip : apply
    if (inStore.length === 0) {
      this._store.put(doc1)
    }
  }

  return orbit.docstore(address || this.name).then((store) => {
    this._store = store
    this._store.events.on('replicated', onReplicated)
    this._feed.on('change', onChange)
    this.address = this._store.address
    this.key = this._store.key
    return store.load()
  })
}

/**
 * Replicate with another OrbitDB store using its address,
 * pulling their records into yours. NOTE: This method does not
 * push documents to the store at the given address.
 * @param  {Object} address       Address to the other store.
 * @param  {String} address.root  Hash of the store's latest entry.
 * @param  {String} address.path  Name of the database.
 * @return {Promise}              Resolves once replication completes..
 */
function sync (address) {
  // FIXME `store.load()` returns before retrieving its own contents.
  return this._orbit.docstore(address).then((store) => {
    return store.load().then(() => {
      return this.bulkDocs(store.all, { new_edits: false })
    })
  })
}
