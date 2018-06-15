const configs = require('../run-configurations')
const axios = require('axios')
const auth = require('./auth')
const debug = require('debug')('tymly-cli')
const chalk = require('chalk')

const BASE_URL = process.env.TYMLY_API_URL
const EXECUTIONS_URL = `${BASE_URL}/executions`

module.exports = async function () {
  const quietMode = process.argv.includes('quiet') || process.argv.includes('q')

  const configKey = process.env.npm_config_command
  if (!configKey) throw new Error(`You must specify a command`)

  debug(`Starting ${configKey}`)
  const config = configs[configKey]
  if (!config) throw new Error(`Unknown config '${configKey}'`)

  if (config.required) {
    for (const req of config.required) {
      if (!process.env[`npm_config_${req}`]) throw new Error(`Missing input ${req}`)
    }
  }

  const input = {}
  Object.keys(config.input).forEach(i => {
    if (process.env[`npm_config_${i}`]) {
      if (Array.isArray(config.input[i])) {
        input[i] = process.env[`npm_config_${i}`].split('_').join(' ').split(',')
      } else {
        input[i] = process.env[`npm_config_${i}`].split('_').join(' ')
      }
    }
  })

  const token = await auth()
  debug(`Token: ${token}`)

  executeStateMachine(
    config.stateMachineName,
    input,
    config.options,
    token,
    config.timeout || 0,
    quietMode
  )
}

function executeStateMachine (stateMachineName, input, options, token, timeout, quietMode) {
  if (!quietMode) console.log(chalk.green('Executing:\n'), {stateMachineName, input, options})

  return axios
    .post(
      EXECUTIONS_URL,
      {stateMachineName, input, options},
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        timeout
      }
    )
    .then(response => {
      if (response.data.status === 'FAILED') {
        console.error(new Error(`state machine fail: ${response.data.errorCode}`))
        process.exit(1)
      }

      if (!quietMode) console.log(chalk.green('Response:\n'), response.data)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
