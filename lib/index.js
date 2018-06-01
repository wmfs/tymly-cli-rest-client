const configs = require('../run-configurations')
const axios = require('axios') // TODO: Handle proxy
const auth = require('./auth')

const BASE_URL = process.env.TYMLY_API_URL
const EXECUTIONS_URL = `${BASE_URL}/executions`

module.exports = async function () {
  const configName = process.env.npm_config_name
  const config = configs[configName]
  const input = {}
  Object.keys(config.input).forEach(i => {
    if (process.env[`npm_config_${i}`]) input[i] = process.env[`npm_config_${i}`]
  })

  const token = await auth()

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
  ).then(response => console.log('Response:\n', response.data))
}
