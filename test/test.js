/* eslint-env mocha */

// End-to-end checks of the command line. None of these reach Auth0 or Tymly: each one
// stops at a check that runs before any network request.

const expect = require('chai').expect
const { execFile } = require('child_process')
const path = require('path')
const { TEST_ENV } = require('./helpers')

const cwd = path.join(__dirname, '..')

function npmRunCli (args, env) {
  return new Promise(resolve => {
    execFile('npm', ['run', '--silent', 'cli', ...args], { cwd, env: { PATH: process.env.PATH, ...env } },
      (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }))
  })
}

describe('command line', function () {
  this.timeout(20000)

  it('fails and lists missing environment variables', async () => {
    const { code, stdout } = await npmRunCli(['--command=fullReindex'], {})
    expect(code).to.eql(1)
    expect(stdout).to.include('ERROR')
    expect(stdout).to.include('Missing env var: TYMLY_NIC_AUTH0_DOMAIN')
    expect(stdout).to.include('Missing env var: TYMLY_API_URL')
  })

  it('fails without a command', async () => {
    const { code, stdout } = await npmRunCli([], TEST_ENV)
    expect(code).to.eql(1)
    expect(stdout).to.include('You must specify a command')
  })

  it('fails with an unknown command', async () => {
    const { code, stdout } = await npmRunCli(['--command=searchStuff'], TEST_ENV)
    expect(code).to.eql(1)
    expect(stdout).to.include("Unknown config: 'searchStuff'")
  })

  it('receives flags after -- untouched, including names npm uses itself', async () => {
    // Without --, npm would pass --long=abc as npm_config_long=true. An invalid value proves
    // the real value arrived, and stops the run before it requests a token.
    const { code, stdout } = await npmRunCli(['--', '--command=search', '--query=x', '--offset=0', '--limit=1', '--long=abc'], TEST_ENV)
    expect(code).to.eql(1)
    expect(stdout).to.include("Invalid value for long: 'abc'")
  })

  it('receives camelCase flags from npm', async () => {
    // npm passes --dryRun as npm_config_dryrun. An invalid value proves the flag arrived,
    // and stops the run before it requests a token.
    const { code, stdout } = await npmRunCli(['--command=identifyOverdueRpFaults', '--dryRun=yes'], TEST_ENV)
    expect(code).to.eql(1)
    expect(stdout).to.include("Invalid value for dryRun: 'yes'")
  })
})
