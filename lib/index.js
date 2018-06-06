const configs = require('../run-configurations')
const axios = require('axios')
const auth = require('./auth')
const debug = require('debug')('tymly-cli')

const BASE_URL = process.env.TYMLY_API_URL
const EXECUTIONS_URL = `${BASE_URL}/executions`

module.exports = async function () {
  const configKey = process.env.npm_config_command
  if (!configKey) throw new Error(`You must specify a command`)

  debug(`Starting ${configKey}`)
  const config = configs[configKey]

  if (!config) throw new Error(`Unknown config '${configKey}'`)

  const input = {}
  Object.keys(config.input).forEach(i => {
    if (process.env[`npm_config_${i}`]) input[i] = process.env[`npm_config_${i}`]
  })

  const token = await auth()
  debug(`Token: ${token}`)

  executeStateMachine(
    config.stateMachineName,
    input,
    config.options,
    token,
    config.timeout || 0
  )
}

function executeStateMachine (stateMachineName, input, options, token, timeout) {
  console.log('Executing:\n', {stateMachineName, input, options})

  return axios.post(
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

      console.log('Response:\n', response.data)
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
