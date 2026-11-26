/* eslint-env mocha */

const expect = require('chai').expect
const run = require('../lib/index')
const { TEST_ENV, fakeHttp, httpError, expectCliError } = require('./helpers')

const getToken = async () => 'test-token'
const silent = () => {}

// flags: passed the npm way (npm_config_* environment variables)
// args: passed after `--`, so they arrive in process.argv
function runWith ({ flags = {}, args = [], argv = [], http = fakeHttp(), log = silent } = {}) {
  const env = { ...TEST_ENV }
  for (const [key, value] of Object.entries(flags)) env[`npm_config_${key.toLowerCase()}`] = value
  return { http, promise: run({ env, argv: ['node', 'lib/cli', ...argv, ...args], http, getToken, log }) }
}

describe('run', () => {
  it('starts the overdue RP faults job in dry-run mode', async () => {
    const { http, promise } = runWith({ flags: { command: 'identifyOverdueRpFaults', dryRun: 'true' } })
    await promise

    expect(http.calls).to.have.length(1)
    const [call] = http.calls
    expect(call.url).to.eql('https://tymly.example.com/executions')
    expect(call.body.stateMachineName).to.eql('rpFault_identifyOverdue_1_0')
    expect(call.body.input).to.eql({ dryRun: true })
    expect(call.body.options.sendResponse).to.eql('COMPLETE')
    expect(call.options.headers).to.eql({ Authorization: 'Bearer test-token' })
    expect(call.options.timeout).to.eql(300000)
  })

  it('takes the command and inputs from the command line', async () => {
    const { http, promise } = runWith({
      args: ['--command=search', '--query=kebab', '--offset=0', '--limit=5', '--lat=52.48', '--long=-1.89']
    })
    await promise
    expect(http.calls[0].body.stateMachineName).to.eql('tymly_search_1_0')
    expect(http.calls[0].body.input).to.eql({ query: 'kebab', offset: 0, limit: 5, lat: 52.48, long: -1.89 })
  })

  it('prefers command-line flags to npm\'s environment variables', async () => {
    const { http, promise } = runWith({
      flags: { command: 'search', query: 'a', offset: '0', limit: '1', long: 'true' },
      args: ['--long=-1.89']
    })
    await promise
    expect(http.calls[0].body.input.long).to.eql(-1.89)
  })

  it('sends no input when no flags are passed', async () => {
    const { http, promise } = runWith({ flags: { command: 'identifyOverdueRpFaults' } })
    await promise
    expect(http.calls[0].body.input).to.eql({})
  })

  it('uses the default timeout when the run configuration has none', async () => {
    const { http, promise } = runWith({ flags: { command: 'fullReindex' } })
    await promise
    expect(http.calls[0].options.timeout).to.eql(run.DEFAULT_TIMEOUT_MS)
  })

  it('returns the execution description', async () => {
    const http = fakeHttp({ data: { status: 'SUCCEEDED', executionName: 'x-1' } })
    const { promise } = runWith({ flags: { command: 'fullReindex' }, http })
    expect(await promise).to.eql({ status: 'SUCCEEDED', executionName: 'x-1' })
  })

  it('logs the request and response', async () => {
    const lines = []
    const { promise } = runWith({ flags: { command: 'fullReindex' }, log: (...args) => lines.push(args) })
    await promise
    expect(lines).to.have.length(2)
  })

  it('logs nothing in quiet mode', async () => {
    for (const flag of ['quiet', 'q']) {
      const lines = []
      const { promise } = runWith({ flags: { command: 'fullReindex' }, argv: [flag], log: (...args) => lines.push(args) })
      await promise
      expect(lines, flag).to.have.length(0)
    }
  })

  it('requires a command', async () => {
    const { http, promise } = runWith()
    await expectCliError(promise, 'You must specify a command')
    expect(http.calls).to.have.length(0)
  })

  it('rejects an unknown command', async () => {
    const { promise } = runWith({ flags: { command: 'searchStuff' } })
    await expectCliError(promise, "Unknown config: 'searchStuff'")
  })

  it('lists every missing required input', async () => {
    const { http, promise } = runWith({ flags: { command: 'search', query: 'kebab' } })
    await expectCliError(promise, 'Missing input: offset, limit')
    expect(http.calls).to.have.length(0)
  })

  it('rejects an invalid input value before starting anything', async () => {
    const { http, promise } = runWith({ flags: { command: 'identifyOverdueRpFaults', dryRun: 'yes' } })
    await expectCliError(promise, "Invalid value for dryRun: 'yes'")
    expect(http.calls).to.have.length(0)
  })

  it('fails when the state machine fails', async () => {
    const http = fakeHttp({ data: { status: 'FAILED', errorCode: 'TaskFailed', errorMessage: 'Something broke' } })
    const { promise } = runWith({ flags: { command: 'fullReindex' }, http })
    await expectCliError(promise, 'State machine failed: TaskFailed: Something broke')
  })

  it('reports an HTTP error without leaking the token', async () => {
    const http = fakeHttp({ fail: httpError(503, 'Service Unavailable') })
    const { promise } = runWith({ flags: { command: 'fullReindex' }, http })
    const err = await expectCliError(promise, 'Request to https://tymly.example.com/executions failed: HTTP 503 Service Unavailable')
    expect(err.message).to.not.include('test-token')
  })

  it('includes the error detail from Tymly\'s response', async () => {
    const http = fakeHttp({ fail: httpError(403, 'Forbidden', { error: 'Forbidden', message: 'No permission to start tymly_fullReindex_1_0' }) })
    const { promise } = runWith({ flags: { command: 'fullReindex' }, http })
    await expectCliError(promise, 'HTTP 403 Forbidden (Forbidden: No permission to start tymly_fullReindex_1_0)')
  })

  it('reports a timeout or network error', async () => {
    const timeout = Object.assign(new Error('timeout of 300000ms exceeded'), { code: 'ECONNABORTED' })
    const { promise } = runWith({ flags: { command: 'identifyOverdueRpFaults' }, http: fakeHttp({ fail: timeout }) })
    await expectCliError(promise, 'ECONNABORTED timeout of 300000ms exceeded')
  })
})
