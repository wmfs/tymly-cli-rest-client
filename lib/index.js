const configs = require('../run-configurations')
const axios = require('axios')
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
  console.log('TOKEN >', token)
  executeStateMachine(
    config.stateMachineName,
    input,
    config.options,
    token
  )
}

// npm run cli --name=search --query=kebab --limit=12

function executeStateMachine (stateMachineName, input, options, token) {
  console.log('Executing: ', {stateMachineName, input, options})

  return axios.post(
    EXECUTIONS_URL,
    {stateMachineName, input, options},
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  ).then(response => console.log('>>>', response))
}
