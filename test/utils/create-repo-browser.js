/* global self */
'use strict'

const IPFSRepo = require('ipfs-repo')

const idb = self.indexedDB ||
  self.mozIndexedDB ||
  self.webkitIndexedDB ||
  self.msIndexedDB

function createTempRepo (repoPath) {
  repoPath = repoPath || '/tmp/ipfs-test-' + Math.random().toString().substring(2, 8)

  const repo = new IPFSRepo(repoPath)

  repo.teardown = (done) => {
    repo.close((err) => {
      if (err) {
        return done(err)
      }
      idb.deleteDatabase(repoPath)
      idb.deleteDatabase(repoPath + '/blocks')
      done()
    })
  }

  return repo
}

module.exports = createTempRepo
