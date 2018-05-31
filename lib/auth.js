const request = require('request')
const boom = require('boom')

module.exports = async function () {
  checkEnv()
  const config = {
    clientId: process.env.TYMLY_NIC_AUTH0_CLIENT_ID,
    secret: process.env.TYMLY_NIC_AUTH0_CLIENT_SECRET,
    audience: `https://${process.env.TYMLY_NIC_AUTH0_DOMAIN}/api/v2/`,
    accessTokenUrl: `https://${process.env.TYMLY_NIC_AUTH0_DOMAIN}/oauth/token`,
    timeoutMs: process.env.WEB_API_TIMEOUT_IN_MS || 3000
  }

  const [response, body] = await makeRequest({
    method: 'POST',
    url: config.accessTokenUrl,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.secret,
      audience: config.audience
    },
    json: true,
    timeout: config.timeoutMs
  })
  if (body.access_token && body.token_type && body.token_type === 'Bearer') {
    return body.access_token
  }
  if (body.statusCode && body.error && body.message && body.errorCode) {
    throw body
  }
  if (body) {
    throw boom.boomify(new Error(`Invalid response from ${config.accessTokenUrl}`))
  }
  throw boom.boomify(new Error(`auth0 response ${response.statusCode} ${response.statusMessage}`))
}

function makeRequest (options) {
  return new Promise((resolve, reject) => {
    const req = process.env.PROXY_URL ? request.defaults({proxy: process.env.PROXY_URL}) : request.defaults()
    req(
      options,
      (err, response, body) => {
        if (err) return reject(err)
        resolve([response, body])
      }
    )
  })
}

function checkEnv () {
  const required = [
    'TYMLY_NIC_AUTH0_DOMAIN',
    'TYMLY_NIC_AUTH0_CLIENT_ID',
    'TYMLY_NIC_AUTH0_CLIENT_SECRET'
  ]
  required.forEach(env => {
    if (!process.env[env]) throw boom.boomify(new Error(`Missing env var: ${env}`))
  })
}
