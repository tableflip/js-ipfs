'use strict'

const EventEmitter = require('events').EventEmitter
const IPFSAPI = require('ipfs-api')
const series = require('async/series')
const rimraf = require('rimraf')
const IPFSRepo = require('ipfs-repo')
const tmpDir = require('../util').tmpDir

const IPFS = require('../../../src/core')
const HTTPAPI = require('../../../src/http-api')

function portConfig (port) {
  port = port + 5

  return {
    Gateway: '/ip4/127.0.0.1/tcp/' + (9090 + port),
    API: '/ip4/127.0.0.1/tcp/' + (5002 + port),
    Swarm: [
      '/ip4/127.0.0.1/tcp/' + (4003 + port),
      '/ip4/127.0.0.1/tcp/' + (4104 + port) + '/ws'
    ]
  }
}

class JsDaemon extends EventEmitter {
  constructor (opts) {
    super()
    opts = Object.assign({}, {
      disposable: true,
      init: true
    }, opts || {})

    this.path = opts.path
    this.disposable = opts.disposable
    this.init = opts.init
    this.port = opts.port || 1

    this.path = opts.path || tmpDir()

    if (this.init) {
      const p = portConfig(this.port)

      this.ipfs = new IPFS({
        repo: this.path,
        init: this.init,
        start: false,
        config: {
          Bootstrap: [],
          Addresses: p
        }
      })
    } else {
      const repo = new IPFSRepo(this.path)
      this.ipfs = new IPFS({
        repo: repo,
        init: this.init,
        start: false,
        EXPERIMENTAL: {
          pubsub: true
        }
      })
    }

    this._started = false

    this.ipfs.once('ready', () => {
      this.node = new HTTPAPI(this.ipfs._repo)
      this.node.start((err) => {
        if (err) {
          throw err
        }
        this._started = true
        this.api = new IPFSAPI(this.node.apiMultiaddr)

        this.emit('start')
      })
    })
  }

  start (callback) {
    if (!this._started) {
      return this.once('start', callback)
    }

    callback()
  }

  stop (callback) {
    this._started = false
    series([
      (cb) => this.node.stop(cb),
      (cb) => {
        if (this.disposable) {
          rimraf(this.path, cb)
        } else {
          cb()
        }
      }
    ], (err) => callback(err))
  }
}

module.exports = JsDaemon
