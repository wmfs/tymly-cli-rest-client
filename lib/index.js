const axios = require('axios')
const chalk = require('chalk')
const debug = require('debug')('tymly-cli')
const auth = require('./auth')
const error = require('./error')
const { describeHttpError } = require('./error')
const checkEnv = require('./check-env')
const { parseArgv, readFlag, missingRequired, buildInput } = require('./input')
const configs = require('../run-configurations')

// Used when a run configuration has no timeout. Without one, a state machine that never
// responds would leave the cron job's process waiting forever.
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000

async function run ({
  env = process.env,
  argv = process.argv,
  http = axios,
  getToken = auth,
  log = console.log
} = {}) {
  const options = checkEnv(env)
  const executionsUrl = `${options.TYMLY_API_URL}/executions`
  const quiet = argv.includes('quiet') || argv.includes('q')
  const argvFlags = parseArgv(argv)

  const configKey = readFlag('command', env, argvFlags)
  if (!configKey) error('You must specify a command')

  debug(`Starting ${configKey}`)
  const config = configs[configKey]
  if (!config) error(`Unknown config: '${configKey}'`)

  const missing = missingRequired(config.required, env, argvFlags)
  if (missing.length) error(`Missing input: ${missing.join(', ')}`)

  let input
  try {
    input = buildInput(config.input, env, argvFlags)
  } catch (err) {
    error(err.message)
  }

  const token = await getToken(options, http)
  debug('Got auth token.') // never log the token itself

  const body = { stateMachineName: config.stateMachineName, input, options: config.options }
  if (!quiet) log(chalk.green('Executing:\n'), body)

  let response
  try {
    response = await http.post(executionsUrl, body, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: config.timeout || DEFAULT_TIMEOUT_MS
    })
  } catch (err) {
    error(`Request to ${executionsUrl} failed: ${describeHttpError(err)}`)
  }

  const execution = response.data || {}
  if (execution.status === 'FAILED') {
    const detail = execution.errorMessage ? `: ${execution.errorMessage}` : ''
    error(`State machine failed: ${execution.errorCode}${detail}`)
  }

  if (!quiet) log(chalk.green('Response:\n'), execution)
  return execution
}

module.exports = run
module.exports.DEFAULT_TIMEOUT_MS = DEFAULT_TIMEOUT_MS
