'use strict'

const series = require('async/series')
const Bitswap = require('ipfs-bitswap')
const FloodSub = require('libp2p-floodsub')
const once = require('once')

module.exports = (self) => {
  return (callback) => {
    callback = once(callback) || function noop () {}
    self.once('error', callback)
    self.once('start', callback)

    if (self.state.state !== 'stopped') {
      self.log('sub', self.state.state)
      const sub = self.state.on('stopped', () => {
        sub.off()
        start()
      })
    } else {
      start()
    }

    function start () {
      self.log('starting')
      self.state.start()
      const done = (err) => {
        if (err) {
          return self.emit('error', err)
        }

        self.state.started()
        self.emit('start')
      }

      series([
        (cb) => {
          if (self._repo.closed) {
            self._repo.open(cb)
          } else {
            cb()
          }
        },
        (cb) => self.preStart(cb),
        (cb) => self.libp2p.start(cb)
      ], (err) => {
        if (err) {
          return done(err)
        }

        self._bitswap = new Bitswap(
          self._libp2pNode,
          self._repo.blockstore,
          self._peerInfoBook
        )

        self._bitswap.start()
        self._blockService.goOnline(self._bitswap)

        if (self._options.EXPERIMENTAL.pubsub) {
          self._pubsub = new FloodSub(self._libp2pNode)
          self._pubsub.start(done)
        } else {
          done()
        }
      })
    }
  }
}
