# PouchDB-Orbit

[![Stability](https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square)](https://nodejs.org/api/documentation.html#documentation_stability_index)
[![NPM Version](https://img.shields.io/npm/v/pouchdb-orbit.svg?style=flat-square)](https://www.npmjs.com/package/pouchdb-orbit)
[![JS Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Build Status](https://img.shields.io/travis/garbados/pouchdb-orbit/master.svg?style=flat-square)](https://travis-ci.org/garbados/pouchdb-orbit)
[![Coverage Status](https://img.shields.io/coveralls/github/garbados/pouchdb-orbit/master.svg?style=flat-square)](https://coveralls.io/github/garbados/pouchdb-orbit?branch=master)

An [OrbitDB](https://github.com/orbitdb/orbit-db) plugin for [PouchDB](https://pouchdb.com/) that adds some methods for P2P replication:

```javascript
const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-orbit'))

// ... once you have an orbit instance ...

const db = new PouchDB(dbName)
db.load(orbit).then(function () {
  // DB now synced over IPFS
  console.log('hooray!')
  // share this address with friends
  // and they can replicate the DB
  // across P2P infrastructure
  console.log(db.address)
})
```

You can also pre-load from a certain hash:

```javascript
// ... using the hash from above ...
db.load(orbit, address).then(function () {
  // DB is now synced with the given hash!
  // Any properly formatted log entries
  // will have been mapped to the DB.
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

The plugin adds some methods and properties to each PouchDB instance:

- `.load(orbit, [address]) -> Promise`

Creates an OrbitDB store and registers event listeners with it and the PouchDB changes feed in order to both stores synchronized with each other. Returns a promise that resolves once the the OrbitDB store is ready for querying.

- `.merge(address)`

Retrieves entries from the given OrbitDB address and merges them locally, adding them to PouchDB. Returns a promise that resolves once all the documents have been processed.

- `.address`

Getter for the OrbitDB address (`{ root, path }`) for this database.

- `.key`

Getter for the keypair for this OrbitDB instance.

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)
