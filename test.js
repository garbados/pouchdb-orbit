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
  // fixme: ipfs doesn't close nicely
  process.exit(0)
})

describe('pouchdb-orbit', function () {
  before(function () {
    this.db = new PouchDB(DB_NAME)
  })

  it('should add some database methods', function () {
    assert(this.db.toAddress)
    assert(this.db.join)
    assert(this.db.load)
  })

  it('should load OK', async function () {
    await this.db.load(this.orbit)
    let address = this.db.toAddress()
    assert(address.root)
    assert.equal(address.path, DB_NAME)
  })
})
