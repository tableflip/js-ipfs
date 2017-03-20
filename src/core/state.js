'use strict'

const machina = require('machina')
const repoStates = [
  'initializing',
  'initialized',
  'opening',
  'open',
  'closing',
  'closed'
]

module.exports = (self) => {
  // Track the state of the repo
  // const repo = new machina.Fsm({
  //   initialize () {
  //     repoStates.forEach((s) => {
  //       self._repo.on(s, () => this.transition(s))
  //     })
  //   },
  //   namespace: 'jsipfs:repo',
  //   initialValue: 'uninitalized',
  //   states: {
  //     uninitalized: {},
  //     initializing: {},
  //     initialized: {},
  //     opening: {},
  //     open: {},
  //     closing: {},
  //     closed: {}
  //   }
  // })

  const node = new machina.Fsm({
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
        _onEnter () {
          this.emit('stopped')
        },
        start: 'starting'
      },
      starting: {
        started: 'running'
      },
      running: {
        _onEnter () {
          this.emit('running')
        },
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

  return node
}
