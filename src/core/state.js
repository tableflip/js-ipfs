'use strict'

const machina = require('machina')

module.exports = (self) => {
  return new machina.Fsm({
    namespace: 'jsipfs',
    initialState: 'uninitalized',
    states: {
      uninitalized: {
        init: 'initializing'
      },
      initializing: {
        initialized: 'stopped'
      },
      stopped: {
        start: 'starting'
      },
      starting: {
        started: 'running'
      },
      running: {
        stop: 'stopping'
      },
      stopping: {
        stopped: 'stopped'
      }
    },
    init () {
      this.handle('init')
    },
    initialized () {
      this.handle('initialized')
    },
    stop () {
      this.handle('stop')
    },
    stopped () {
      this.handle('stopped')
    },
    start () {
      this.handle('start')
    },
    started () {
      this.handle('started')
    }
  })
}
