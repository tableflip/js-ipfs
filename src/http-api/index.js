'use strict'

const series = require('async/series')
const Hapi = require('hapi')
const debug = require('debug')
const fs = require('fs')
const path = require('path')
const IPFSRepo = require('ipfs-repo')
const multiaddr = require('multiaddr')
const setHeader = require('hapi-set-header')
const once = require('once')

const log = debug('jsipfs:api')
log.error = debug('jsipfs:api:error')

const IPFS = require('../core')
const errorHandler = require('./error-handler')

function uriToMultiaddr (uri) {
  const ipPort = uri.split('/')[2].split(':')
  return `/ip4/${ipPort[0]}/tcp/${ipPort[1]}`
}

function HttpApi (repo) {
  this.node = undefined
  this.server = undefined

  this.start = (callback) => {
    log('starting')
    if (typeof repo === 'string') {
      repo = new IPFSRepo(repo)
    }

    let apiFilePath

    series([
      (cb) => {
        // start the daemon
        try {
          this.node = new IPFS({
            repo: repo,
            init: false,
            start: true,
            EXPERIMENTAL: {
              pubsub: true
            }
          })
        } catch (err) {
          return cb(err)
        }

        cb = once(cb)

        this.node.once('error', (err) => {
          log('error starting core', err)
          err.code = 'ENOENT'
          cb(err)
        })
        this.node.once('start', cb)
      },
      (cb) => {
        log('fetching config')
        this.node._repo.config.get((err, config) => {
          if (err) {
            return callback(err)
          }

          // CORS is enabled by default
          this.server = new Hapi.Server({
            connections: { routes: { cors: true } }
          })

          this.server.app.ipfs = this.node
          const api = config.Addresses.API.split('/')
          const gateway = config.Addresses.Gateway.split('/')

          // select which connection with server.select(<label>) to add routes
          this.server.connection({
            host: api[2],
            port: api[4],
            labels: 'API'
          })

          this.server.connection({
            host: gateway[2],
            port: gateway[4],
            labels: 'Gateway'
          })

          // Nicer errors
          errorHandler(this.server)

          // load routes
          require('./routes')(this.server)

          // Set default headers
          setHeader(this.server,
            'Access-Control-Allow-Headers',
            'X-Stream-Output, X-Chunked-Output, X-Content-Length')
          setHeader(this.server,
            'Access-Control-Expose-Headers',
            'X-Stream-Output, X-Chunked-Output, X-Content-Length')

          this.server.start(cb)
        })
      },
      (cb) => {
        const api = this.server.select('API')
        const gateway = this.server.select('Gateway')
        this.apiMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/' + api.info.port)
        api.info.ma = uriToMultiaddr(api.info.uri)
        gateway.info.ma = uriToMultiaddr(gateway.info.uri)

        console.log('API is listening on: %s', api.info.ma)
        console.log('Gateway (readonly) is listening on: %s', gateway.info.ma)

        // for the CLI to know the where abouts of the API
        this.node._repo.setApiAddress(api.info.ma, cb)
      }
    ], callback)
  }

  this.stop = (callback) => {
    log('stopping')
    series([
      (cb) => this.server.stop(cb),
      (cb) => this.node.stop(cb)
    ], (err) => {
      if (err) {
        console.log('There were errors stopping')
      }
      callback()
    })
  }
}

module.exports = HttpApi
