/**
 * [exports description]
 * @param  {[type]} PouchDB [description]
 * @return {[type]}         [description]
 */
module.exports = function (PouchDB) {
  PouchDB.prototype.toAddress = toAddress
  PouchDB.prototype.join = join
  PouchDB.prototype.load = load
}

/**
 * [load description]
 * @param  {[type]}   orbit    [description]
 * @param  {[type]}   hash     [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function load (orbit, hash, callback) {
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

  return orbit.docstore(hash || this.name).then((store) => {
    this._store = store
    this._store.events.on('replicated', onReplicated)
    this._feed.on('change', onChange)
  })
}

/**
 * [join description]
 * @param  {[type]} hash [description]
 * @return {[type]}      [description]
 */
function join (hash) {
  const head = { key: hash }
  return this._store.sync([head])
}

/**
 * [toHash description]
 * @return {[type]} [description]
 */
function toAddress () {
  return this._store.address
}
