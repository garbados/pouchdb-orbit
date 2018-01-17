# PouchDB-Orbit

An [OrbitDB](https://github.com/orbitdb/orbit-db) plugin for [PouchDB](https://pouchdb.com/) that adds some methods for P2P replication:

```javascript
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-orbit'))

// ... once you have an orbit instance ...

const db = new PouchDB(dbName)
db.load(orbit).then(function () {
  // DB now synced over IPFS
  return db.toMultihash()
}).then(function (hash) {
  // share this hash with friends
  // and they can replicate the DB
  // across P2P infrastructure
  console.log(hash)
})
```

You can also pre-load from a certain hash, or join one later:

```javascript
// ... using the hash from above ...
db.load(orbit, hash).then(function () {
  // DB is now synced with the given hash!
  // Any properly formatted log entries
  // will have been mapped to the DB.
})

// If a DB has already loaded
// you can use `.join(hash)`.
db.join(otherHash).then(function () {
  // DB is now synced with the given hash.
})
```

## Install

Install with [npm](https://npmjs.com/):

```bash
npm i pouchdb-orbit
```

Then, in your code, register it with PouchDB as a plugin like this:

```javascript
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-orbit'))
```

## Usage

The plugin adds three methods to instances of PouchDB:

* `db.load(orbit, hash)`: Given an OrbitDB instance, the plugin creates a docstore that it matches against the PouchDB's changes feed. The returned promise resolves once both datastructures have been synced.
* `db.join(hash)`: After a database has already been associated with an OrbitDB instance by calling `.load(orbit)`, you can sync with other hashes by calling this method. It returns a promise that resolves once the local datastructures, the PouchDB database and the OrbitDB docstore, have caught up to it.
* `db.toHash()`: Returns a promise that resolves to the hash address of this database. Share this hash with others, and they can pass it to `.load(orbit, hash)` or `.join(hash)`.

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
