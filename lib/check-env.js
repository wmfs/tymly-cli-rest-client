const debug = require('debug')('tymly-cli')
const error = require('./error')

const REQUIRED = [
  'TYMLY_NIC_AUTH0_DOMAIN',
  'TYMLY_NIC_AUTH0_CLIENT_ID',
  'TYMLY_NIC_AUTH0_CLIENT_SECRET',
  'TYMLY_AUTH_AUDIENCE',
  'TYMLY_API_URL'
]
const OPTIONAL = ['WEB_API_TIMEOUT_IN_MS']

module.exports = function checkEnv (env = process.env) {
  debug('Checking environment variables.')
  const missing = REQUIRED.filter(name => !env[name])
  if (missing.length) error(missing.map(name => `Missing env var: ${name}`).join('\n'))

  const options = {}
  for (const name of [...REQUIRED, ...OPTIONAL]) {
    if (env[name]) options[name] = env[name]
  }
  return options
}

module.exports.REQUIRED = REQUIRED
