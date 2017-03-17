'use strict'

const series = require('async/series')

module.exports = (self) => {
  return (callback) => {
    callback = callback || function noop () {}

    self._blockService.goOffline()
    self._bitswap.stop()

    series([
      (cb) => {
        if (self._options.EXPERIMENTAL.pubsub) {
          self._pubsub.stop(cb)
        } else {
          cb()
        }
      },
      (cb) => self.libp2p.stop(cb),
      (cb) => self._repo.close(cb)
    ], (err) => {
      if (err) {
        return callback(err)
      }
      self.emit('stop')
      callback()
    })
  }
}
