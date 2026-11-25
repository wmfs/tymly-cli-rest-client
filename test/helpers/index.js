const expect = require('chai').expect
const { CliError } = require('../../lib/error')

const TEST_ENV = {
  TYMLY_NIC_AUTH0_DOMAIN: 'auth.example.com',
  TYMLY_NIC_AUTH0_CLIENT_ID: 'test-client-id',
  TYMLY_NIC_AUTH0_CLIENT_SECRET: 'test-client-secret',
  TYMLY_AUTH_AUDIENCE: 'test-audience',
  TYMLY_API_URL: 'https://tymly.example.com'
}

// A stand-in for axios that records requests and returns a canned response or error.
function fakeHttp ({ data = { status: 'SUCCEEDED' }, status = 200, fail } = {}) {
  const calls = []
  const respond = async (call) => {
    calls.push(call)
    if (fail) throw fail
    return { status, data }
  }
  return {
    calls,
    post: (url, body, options) => respond({ method: 'post', url, body, options }),
    request: (options) => respond({ method: options.method, url: options.url, body: options.data, options })
  }
}

function httpError (status, statusText) {
  const err = new Error(`Request failed with status code ${status}`)
  err.response = { status, statusText }
  // axios errors carry the request config, which must never reach the output
  err.config = { headers: { Authorization: 'Bearer secret-token' }, data: '{"client_secret":"test-client-secret"}' }
  return err
}

async function expectCliError (promise, text) {
  let caught
  try {
    await promise
  } catch (err) {
    caught = err
  }
  expect(caught, 'expected a CliError').to.be.instanceOf(CliError)
  expect(caught.message).to.include(text)
  return caught
}

module.exports = { TEST_ENV, fakeHttp, httpError, expectCliError }
