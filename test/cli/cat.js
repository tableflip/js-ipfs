/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const runOnAndOff = require('../utils/on-and-off')

describe('ipfs files cat', () => runOnAndOff((thing) => {
  let ipfs
  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
                   .toString('utf-8')

  before(() => {
    ipfs = thing.ipfs
  })

  it('cat', () => {
    return ipfs('files cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out).to.eql(readme)
      })
  })

  it('cat alias', () => {
    return ipfs('cat QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out).to.eql(readme)
      })
  })
}))
