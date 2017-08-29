/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const runOnAndOff = require('../utils/on-and-off')

describe('ipfs add', () => runOnAndOff((thing) => {
  let ipfs

  before(() => {
    ipfs = thing.ipfs
  })

  it('add --quiet', () => {
    return ipfs('files add -q src/init-files/init-docs/readme')
      .then((out) => {
        expect(out)
          .to.eql('added QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')
      })
  })
}))
