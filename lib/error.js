const chalk = require('chalk')

class CliError extends Error {}

// Throws rather than exiting, so callers and tests can handle it.
// cli.js prints the message and sets a non-zero exit code.
function error (msg) {
  throw new CliError(msg)
}

function printError (msg, log = console.log) {
  log(chalk.bold.underline.red('ERROR'))
  log(chalk.bold.red(msg))
}

// Describe a failed HTTP request without including its config,
// which holds the bearer token or the Auth0 client secret.
function describeHttpError (err) {
  if (err.response) {
    const status = `HTTP ${err.response.status} ${err.response.statusText || ''}`.trim()
    const detail = describeErrorBody(err.response.data)
    return detail ? `${status} (${detail})` : status
  }
  return err.code ? `${err.code} ${err.message}` : err.message
}

// The error fields in a response body, e.g. Auth0's { error, error_description }.
// Only these named string fields are used, never the whole body.
function describeErrorBody (data) {
  if (!data || typeof data !== 'object') return ''
  const parts = [data.error, data.error_description || data.message]
    .filter(part => typeof part === 'string' && part.trim() !== '')
    .map(part => part.slice(0, 200))
  return parts.join(': ')
}

module.exports = error
module.exports.CliError = CliError
module.exports.printError = printError
module.exports.describeHttpError = describeHttpError
