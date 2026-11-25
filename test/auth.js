/* eslint-env mocha */

const expect = require('chai').expect
const auth = require('../lib/auth')
const { TEST_ENV, fakeHttp, httpError, expectCliError } = require('./helpers')

describe('auth', () => {
  it('requests a client credentials token from Auth0', async () => {
    const http = fakeHttp({ data: { access_token: 'abc', token_type: 'Bearer' } })
    const token = await auth(TEST_ENV, http)

    expect(token).to.eql('abc')
    expect(http.calls).to.have.length(1)
    const [call] = http.calls
    expect(call.url).to.eql('https://auth.example.com/oauth/token')
    expect(call.body).to.eql({
      grant_type: 'client_credentials',
      client_id: 'test-client-id',
      client_secret: 'test-client-secret',
      audience: 'test-audience'
    })
    expect(call.options.timeout).to.eql(auth.DEFAULT_AUTH_TIMEOUT_MS)
  })

  it('uses WEB_API_TIMEOUT_IN_MS when set', async () => {
    const http = fakeHttp({ data: { access_token: 'abc', token_type: 'Bearer' } })
    await auth({ ...TEST_ENV, WEB_API_TIMEOUT_IN_MS: '10000' }, http)
    expect(http.calls[0].options.timeout).to.eql(10000)
  })

  it('reports an Auth0 error response', async () => {
    const http = fakeHttp({ data: { errorCode: 'access_denied', error: 'Unauthorized' } })
    await expectCliError(auth(TEST_ENV, http), 'access_denied: Unauthorized')
  })

  it('rejects a response without a bearer token', async () => {
    const http = fakeHttp({ data: { token_type: 'Basic' } })
    await expectCliError(auth(TEST_ENV, http), 'Invalid auth response from https://auth.example.com/oauth/token')
  })

  it('reports a failed request without leaking the client secret', async () => {
    const http = fakeHttp({ fail: httpError(401, 'Unauthorized') })
    const err = await expectCliError(auth(TEST_ENV, http), 'HTTP 401 Unauthorized')
    expect(err.message).to.not.include('test-client-secret')
  })
})
