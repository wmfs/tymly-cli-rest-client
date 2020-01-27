const debug = require('debug')('tymly-cli')
const error = require('./error')
const required = [
  'TYMLY_NIC_AUTH0_DOMAIN',
  'TYMLY_NIC_AUTH0_CLIENT_ID',
  'TYMLY_NIC_AUTH0_CLIENT_SECRET',
  'TYMLY_AUTH_AUDIENCE',
  'TYMLY_API_URL'
]

module.exports = function () {
  debug('Checking environment variables.')
  const options = {}
  required.forEach(env => {
    if (!process.env[env]) error(`Missing env var: ${env}`)
    else options[env] = process.env[env]
  })
  return options
}
