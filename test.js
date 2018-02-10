/* global describe, it, before, after */

const assert = require('assert')
const IPFS = require('ipfs')
const OrbitDB = require('orbit-db')
const PouchDB = require('pouchdb')
const rimraf = require('rimraf')
PouchDB.plugin(require('.'))

const DB_NAME = 'test'

describe([].join(' @ '), function () {
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
    // process.exit(0)
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

    it('should handle updates', function () {
      return this.db.post({ status: 'ok' }).then(() => {
        return new Promise((resolve) => {
          this.db._store.events.once('write', () => {
            assert.equal(this.db._store.all.length, 1)
            resolve()
          })
        })
      }).catch((e) => {
        console.log(e)
      })
    })
  })

  describe('#sync', function () {
    before(function () {
      this.dbs = [
        new PouchDB([DB_NAME, '0'].join('-')),
        new PouchDB([DB_NAME, '1'].join('-'))
      ]
    })

    it('should sync two databases', function () {
      const tasks = this.dbs.map((db) => {
        return db.load(this.orbit).then(() => {
          return db.post({ status: 'ok' })
        })
      })
      return Promise.all(tasks).then(() => {
        let db = this.dbs[0]
        let address = this.dbs[1].address
        return db.sync(address).then(function () {
          return db.allDocs()
        })
      }).then((result) => {
        assert.equal(result.rows.length, 2)
      }).catch((e) => {
        console.log(e)
      })
    })
  })
})
