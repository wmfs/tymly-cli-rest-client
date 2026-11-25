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
  if (err.response) return `HTTP ${err.response.status} ${err.response.statusText || ''}`.trim()
  return err.code ? `${err.code} ${err.message}` : err.message
}

module.exports = error
module.exports.CliError = CliError
module.exports.printError = printError
module.exports.describeHttpError = describeHttpError
