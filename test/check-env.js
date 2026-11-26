/* eslint-env mocha */

const expect = require('chai').expect
const checkEnv = require('../lib/check-env')
const { TEST_ENV, expectCliError } = require('./helpers')

describe('checkEnv', () => {
  it('returns the required variables', () => {
    expect(checkEnv(TEST_ENV)).to.eql(TEST_ENV)
  })

  it('includes the optional auth timeout when set', () => {
    expect(checkEnv({ ...TEST_ENV, WEB_API_TIMEOUT_IN_MS: '5000' }).WEB_API_TIMEOUT_IN_MS).to.eql('5000')
  })

  it('ignores unrelated variables', () => {
    expect(checkEnv({ ...TEST_ENV, PATH: '/usr/bin' })).to.not.have.property('PATH')
  })

  it('lists every missing variable', async () => {
    const err = await expectCliError(
      Promise.resolve().then(() => checkEnv({ TYMLY_API_URL: 'https://tymly.example.com' })),
      'Missing env var: TYMLY_NIC_AUTH0_DOMAIN'
    )
    expect(err.message.split('\n')).to.have.length(checkEnv.REQUIRED.length - 1)
  })
})
