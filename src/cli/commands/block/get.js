'use strict'

const CID = require('cids')

module.exports = {
  command: 'get <key>',

  describe: 'Get a raw IPFS block',

  builder: {},

  handler (argv) {
    argv.ipfs.block.get(new CID(argv.key), (err, block) => {
      if (err) {
        throw err
      }

      process.stdout.write(block.data)
      process.stdout.write('\n')
    })
  }
}
