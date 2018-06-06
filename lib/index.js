const configs = require('../run-configurations')
const axios = require('axios')
const auth = require('./auth')
const debug = require('debug')('tymly-cli')

const BASE_URL = process.env.TYMLY_API_URL
const EXECUTIONS_URL = `${BASE_URL}/executions`

module.exports = async function () {
  if (!process.env.npm_config_name) throw new Error(`You must specify a name`)

  debug(`Starting ${process.env.npm_config_name}`)
  const config = configs[process.env.npm_config_name]
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
    token
  )
}

function executeStateMachine (stateMachineName, input, options, token) {
  console.log('Executing:\n', {stateMachineName, input, options})

  return axios.post(
    EXECUTIONS_URL,
    {stateMachineName, input, options},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
    .then(response => console.log('Response:\n', response.data))
    .catch(err => console.error(err))
}
