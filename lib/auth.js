const error = require('./error')
const axios = require('axios')
const debug = require('debug')('tymly-cli')

module.exports = async function (options) {
  const config = {
    clientId: options.TYMLY_NIC_AUTH0_CLIENT_ID,
    secret: options.TYMLY_NIC_AUTH0_CLIENT_SECRET,
    audience: options.TYMLY_AUTH_AUDIENCE,
    accessTokenUrl: `https://${options.TYMLY_NIC_AUTH0_DOMAIN}/oauth/token`,
    timeoutMs: options.WEB_API_TIMEOUT_IN_MS || 3000
  }

  debug('Getting Auth Token.')
  const response = await axios.request({
    method: 'post',
    url: config.accessTokenUrl,
    headers: {
      'content-type': 'application/json'
    },
    data: {
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.secret,
      audience: config.audience
    },
    timeout: config.timeoutMs,
    responseType: 'json'
  })
  const body = response.data

  if (body.access_token && body.token_type && body.token_type === 'Bearer') {
    return body.access_token
  }
  if (body.statusCode && body.error && body.message && body.errorCode) {
    error(`${body.errorCode}: ${body.error}`)
  }
  if (body) {
    error(`Invalid response from ${config.accessTokenUrl}`)
  }
  error(`auth0 response ${response.status} ${response.statusText}`)
}
