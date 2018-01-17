/* global describe, it, before, after */

const assert = require('assert')
const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const PouchDB = require('pouchdb')
const rimraf = require('rimraf')
PouchDB.plugin(require('.'))

const DB_NAME = 'test'

before(function () {
  this.ipfs = new IPFS({
    EXPERIMENTAL: {
      pubsub: true
    }
  })
  this.orbit = new OrbitDB(this.ipfs, DB_NAME)
  return new Promise((resolve) => {
    this.ipfs.once('ready', resolve)
  })
})

after(function () {
  rimraf.sync(DB_NAME)
  rimraf.sync(DB_NAME + '-*')
  // fixme: ipfs doesn't close nicely
  process.exit(0)
})

describe('#load', function () {
  before(function () {
    this.db = new PouchDB(DB_NAME)
    return this.db.load(this.orbit)
  })

  it('should add some database methods', function () {
    assert(this.db.address)
    assert(this.db.key)
    assert(this.db.load)
    assert(this.db.sync)
  })

  it('should load OK', function () {
    let address = this.db.address
    assert(address.root)
    assert.equal(address.path, DB_NAME)
  })
})

// FIXME - requires dynamic permissions: https://github.com/orbitdb/orbit-db/issues/292
describe.skip('#sync', function () {
  before(function () {
    this.dbs = [
      new PouchDB([DB_NAME, '0'].join('-')),
      new PouchDB([DB_NAME, '1'].join('-'))
    ]
  })

  it('should sync two databases', function () {
    const tasks = this.dbs.map((db) => {
      return db.post({ status: 'ok' }).then(() => {
        return db.load(this.orbit)
      })
    })
    return Promise.all(tasks).then(() => {
      let db = this.dbs[0]
      let head = this.dbs[1].address.root
      return db.sync(head).then(function () {
        return db.allDocs()
      })
    }).then((result) => {
      assert.equal(result.length, 2)
    })
  })
})
