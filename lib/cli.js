const run = require('./index')
const { CliError, printError } = require('./error')

run().catch(err => {
  printError(err instanceof CliError ? err.message : `Unexpected error: ${err.message}`)
  process.exitCode = 1
})
