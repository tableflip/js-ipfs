#! /usr/bin/env node

'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')
const utils = require('./utils')

const pkg = readPkgUp.sync({cwd: __dirname}).pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const cli = yargs
  .commandDir('commands')
  .demandCommand(1)

// NOTE: This creates an alias of
// `jsipfs files {add, get, cat}` to `jsipfs {add, get, cat}`.
// This will stay until https://github.com/ipfs/specs/issues/98 is resolved.
const addCmd = require('./commands/files/add')
const catCmd = require('./commands/files/cat')
const getCmd = require('./commands/files/get')
const aliases = [addCmd, catCmd, getCmd]
aliases.forEach((alias) => {
  cli.command(alias.command, alias.describe, alias.builder, alias.handler)
})

utils.getIPFS((err, ipfs, cleanup) => {
  if (err) {
    throw err
  }

  // finalize cli setup
  cli // eslint-disable-line
    .help()
    .strict()
    .completion()
    .parse(process.argv.slice(2), {
      ipfs: ipfs
    }, (err, argv, output) => {
      cleanup(() => {
        if (err) {
          throw err
        }
      })
    })
})
