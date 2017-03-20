'use strict'

const series = require('async/series')

module.exports = (self) => {
  return (callback) => {
    callback = callback || function noop () {}
    self.log('stop', self._repo.closed, self._awaitInit)

    if (self.state.state !== 'running') {
      const sub = self.state.on('running', () => {
        sub.off()
        stop()
      })
    } else {
      stop()
    }

    function stop () {
      self.state.stop()
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
        self.state.stopped()
        self.emit('stop')
        callback()
      })
    }
  }
}
