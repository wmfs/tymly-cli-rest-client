/* eslint-env mocha */

const expect = require('chai').expect
const cli = require('../lib')

describe('tymly-cli tests', function () {
  this.timeout(5000)

  it('should run the function', () => {
    cli()
  })
})
