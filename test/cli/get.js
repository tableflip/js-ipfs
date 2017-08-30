/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const compareDir = require('dir-compare').compareSync
const rimraf = require('rimraf').sync
const runOnAndOff = require('../utils/on-and-off')

describe('ipfs files get', () => runOnAndOff((thing) => {
  let ipfs
  const readme = fs.readFileSync(path.join(process.cwd(), '/src/init-files/init-docs/readme'))
                   .toString('utf-8')

  before(() => {
    ipfs = thing.ipfs
  })

  it('get', () => {
    return ipfs('files get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out)
          .to.eql('Saving file(s) QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')

        const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        expect(fs.readFileSync(file).toString()).to.eql(readme)

        rimraf(file)
      })
  })

  it('get alias', () => {
    return ipfs('get QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')
      .then((out) => {
        expect(out)
          .to.eql('Saving file(s) QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB\n')

        const file = path.join(process.cwd(), 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZCtioEB')

        expect(fs.readFileSync(file).toString()).to.eql(readme)

        rimraf(file)
      })
  })

  it('get recursively', () => {
    const outDir = path.join(process.cwd(), 'QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
    rimraf(outDir)

    return ipfs('files get QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
      .then((out) => {
        expect(out).to.eql(
          'Saving file(s) QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2\n'
        )

        const outDir = path.join(process.cwd(), 'QmYmW4HiZhotsoSqnv2o1oUusvkRM8b9RweBoH7ao5nki2')
        const expectedDir = path.join(process.cwd(), 'test', 'test-data', 'recursive-get-dir')

        const compareResult = compareDir(outDir, expectedDir, {
          compareContent: true,
          compareSize: true
        })

        expect(compareResult.differences).to.equal(0)
        rimraf(outDir)
      })
  })
}))
