const boom = require('boom')
const axios = require('axios')

module.exports = async function () {
  checkEnv()
  const config = {
    clientId: process.env.TYMLY_NIC_AUTH0_CLIENT_ID,
    secret: process.env.TYMLY_NIC_AUTH0_CLIENT_SECRET,
    audience: process.env.TYMLY_AUTH_AUDIENCE,
    accessTokenUrl: `https://${process.env.TYMLY_NIC_AUTH0_DOMAIN}/oauth/token`,
    timeoutMs: process.env.WEB_API_TIMEOUT_IN_MS || 3000
  }

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
    throw body
  }
  if (body) {
    throw boom.boomify(new Error(`Invalid response from ${config.accessTokenUrl}`))
  }
  throw boom.boomify(new Error(`auth0 response ${response.status} ${response.statusText}`))
}

function checkEnv () {
  const required = [
    'TYMLY_NIC_AUTH0_DOMAIN',
    'TYMLY_NIC_AUTH0_CLIENT_ID',
    'TYMLY_NIC_AUTH0_CLIENT_SECRET',
    'TYMLY_AUTH_AUDIENCE'
  ]
  required.forEach(env => {
    if (!process.env[env]) throw boom.boomify(new Error(`Missing env var: ${env}`))
  })
}
