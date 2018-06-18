const chalk = require('chalk')

module.exports = function error (msg) {
  console.log(chalk.bold.underline.red('ERROR'))
  console.log(chalk.bold.red(msg))
  process.exit(1)
}
