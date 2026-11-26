const axios = require('axios')
const debug = require('debug')('tymly-cli')
const error = require('./error')
const { describeHttpError } = require('./error')

const DEFAULT_AUTH_TIMEOUT_MS = 3000

module.exports = async function auth (options, http = axios) {
  const accessTokenUrl = `https://${options.TYMLY_NIC_AUTH0_DOMAIN}/oauth/token`

  debug('Getting auth token.')
  let response
  try {
    response = await http.request({
      method: 'post',
      url: accessTokenUrl,
      headers: { 'content-type': 'application/json' },
      data: {
        grant_type: 'client_credentials',
        client_id: options.TYMLY_NIC_AUTH0_CLIENT_ID,
        client_secret: options.TYMLY_NIC_AUTH0_CLIENT_SECRET,
        audience: options.TYMLY_AUTH_AUDIENCE
      },
      timeout: Number(options.WEB_API_TIMEOUT_IN_MS) || DEFAULT_AUTH_TIMEOUT_MS,
      responseType: 'json'
    })
  } catch (err) {
    error(`Could not get an auth token from ${accessTokenUrl}: ${describeHttpError(err)}`)
  }

  const body = response.data || {}
  if (body.access_token && body.token_type === 'Bearer') return body.access_token
  if (body.errorCode && body.error) error(`${body.errorCode}: ${body.error}`)
  error(`Invalid auth response from ${accessTokenUrl} (HTTP ${response.status})`)
}

module.exports.DEFAULT_AUTH_TIMEOUT_MS = DEFAULT_AUTH_TIMEOUT_MS
