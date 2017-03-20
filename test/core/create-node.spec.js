/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const series = require('async/series')

const isNode = require('detect-node')
const IPFS = require('../../src/core')

// This gets replaced by require('../utils/create-repo-browser.js')
// in the browser
const createTempRepo = require('../utils/create-repo-node.js')

describe.only('create node', () => {
  it('custom repoPath', (done) => {
    const node = new IPFS({
      repo: '/tmp/ipfs-repo-' + Math.random()
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()

      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('custom repo', (done) => {
    const node = new IPFS({
      repo: createTempRepo()
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('IPFS.createNode', (done) => {
    const node = IPFS.createNode({
      repo: createTempRepo()
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Identity).to.exist()
        // note: key length doesn't map to buffer length
        expect(config.Identity.PrivKey.length).is.below(2048)

        node.once('stop', done)
        node.stop()
      })
    })
  })

  it('init: { bits: 1024 }', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: {
        bits: 1024
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()
        expect(config.Identity).to.exist()
        expect(config.Identity.PrivKey.length).is.below(1024)
        node.once('stop', done)
        node.stop()
      })
    })
  })

  // this does not throw currently
  it.skip('init: false errors (start default: true)', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: false
    })
    node.once('error', (err) => {
      expect(err).to.exist()
      done()
    })
  })

  it('init: false, start: false', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: false,
      start: false
    })

    let happened = false

    function shouldNotHappen () {
      happened = true
    }

    node.once('error', shouldNotHappen)
    node.once('start', shouldNotHappen)
    node.once('stop', shouldNotHappen)

    setTimeout(() => {
      expect(happened).to.equal(false)
      done()
    }, 250)
  })

  it('init: true, start: false', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: true,
      start: false
    })

    node.once('error', done)
    node.once('stop', done)
    node.once('start', () => node.stop())

    node.once('init', () => {
      node.start()
    })
  })

  it('init: true, start: false, use callback', (done) => {
    const node = new IPFS({
      repo: createTempRepo(),
      init: true,
      start: false
    })

    node.once('error', done)
    node.once('init', () => {
      node.start(() => node.stop(done))
    })
  })

  it('overload config', (done) => {
    if (!isNode) {
      return done()
    }
    const node = new IPFS({
      repo: createTempRepo(),
      config: {
        Addresses: {
          Swarm: ['/ip4/127.0.0.1/tcp/9977']
        }
      }
    })

    node.once('start', (err) => {
      expect(err).to.not.exist()
      node.config.get((err, config) => {
        expect(err).to.not.exist()

        expect(config.Addresses.Swarm).to.eql(
          ['/ip4/127.0.0.1/tcp/9977']
        )
        node.stop(done)
      })
    })
  })

  it.only('start and stop, start and stop', (done) => {
    const node = new IPFS({
      repo: createTempRepo()
    })
    const l = (text, inner) => {
      console.log('doing ' + text)
      return inner
    }
    series([
      (cb) => l('start', node.once('start', cb)),
      (cb) => l('stop', node.stop(cb)),
      (cb) => l('start', node.start(cb)),
      (cb) => l('stop', node.stop(cb))
    ], done)
  })
})
