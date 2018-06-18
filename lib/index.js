const auth = require('./auth')
const error = require('./error')
const checkEnv = require('./check-env')
const configs = require('../run-configurations')
const axios = require('axios')
const debug = require('debug')('tymly-cli')
const chalk = require('chalk')

module.exports = async function () {
  const options = checkEnv()

  const BASE_URL = options.TYMLY_API_URL
  const EXECUTIONS_URL = `${BASE_URL}/executions`
  const quietMode = process.argv.includes('quiet') || process.argv.includes('q')

  const configKey = process.env.npm_config_command
  if (!configKey) error(`You must specify a command`)

  debug(`Starting ${configKey}`)
  const config = configs[configKey]
  if (!config) error(`Unknown config: '${configKey}'`)

  if (config.required) {
    for (const req of config.required) {
      if (!process.env[`npm_config_${req}`]) error(`Missing input: ${req}`)
    }
  }

  const input = {}
  Object.keys(config.input).forEach(i => {
    if (process.env[`npm_config_${i}`]) {
      input[i] = Array.isArray(config.input[i])
        ? process.env[`npm_config_${i}`].split('_').join(' ').split(',')
        : process.env[`npm_config_${i}`].split('_').join(' ')
    }
  })

  const token = await auth(options)
  debug(`Token: ${token}`)

  executeStateMachine(
    config.stateMachineName,
    input,
    config.options,
    token,
    config.timeout || 0,
    quietMode,
    EXECUTIONS_URL
  )
}

function executeStateMachine (stateMachineName, input, options, token, timeout, quietMode, executionsUrl) {
  if (!quietMode) console.log(chalk.green('Executing:\n'), {stateMachineName, input, options})

  return axios
    .post(
      executionsUrl,
      {stateMachineName, input, options},
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout
      }
    )
    .then(response => {
      if (response.data.status === 'FAILED') error(`State machine fail: ${response.data.errorCode}`)
      if (!quietMode) console.log(chalk.green('Response:\n'), response.data)
    })
    .catch(err => error(err))
}
