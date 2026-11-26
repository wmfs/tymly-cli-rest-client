// Flags can reach the CLI in two ways:
//
//   npm run cli -- --command=search --long=-2.0   (recommended)
//     Everything after `--` is passed to the script untouched, in process.argv.
//
//   npm run cli --command=search --query=kebab
//     npm treats each flag as one of its own settings and passes it as an environment
//     variable, lower-casing the name (--dryRun=true arrives as npm_config_dryrun).
//     Flags that are also real npm settings lose their value: --long=-2.0 arrives as
//     npm_config_long=true. npm also plans to stop forwarding unknown flags this way.
//
// Command-line flags win over npm's environment variables.

function parseArgv (argv = process.argv) {
  const flags = {}
  for (const arg of argv.slice(2)) {
    const match = /^--([^=]+)=([\s\S]*)$/.exec(arg)
    if (match) flags[match[1].toLowerCase()] = match[2]
  }
  return flags
}

function readFlag (key, env = process.env, argvFlags = {}) {
  const fromArgv = argvFlags[key.toLowerCase()]
  const value = fromArgv !== undefined
    ? fromArgv
    : env[`npm_config_${key}`] ?? env[`npm_config_${key.toLowerCase()}`]
  return value === '' ? undefined : value
}

// Convert a flag's string value to the type of the example value in the run configuration.
function coerce (key, raw, example) {
  if (Array.isArray(example)) return raw.split('_').join(' ').split(',')

  if (typeof example === 'boolean') {
    if (raw === 'true') return true
    if (raw === 'false') return false
    throw new Error(`Invalid value for ${key}: '${raw}' (expected true or false)`)
  }

  if (typeof example === 'number') {
    const n = raw.trim() === '' ? NaN : Number(raw)
    if (Number.isNaN(n)) throw new Error(`Invalid value for ${key}: '${raw}' (expected a number)`)
    return n
  }

  return raw.split('_').join(' ')
}

function missingRequired (required = [], env = process.env, argvFlags = {}) {
  return required.filter(key => readFlag(key, env, argvFlags) === undefined)
}

// Only flags that were passed are sent; the values in the run configuration are examples
// that set each input's type, not defaults.
function buildInput (configInput = {}, env = process.env, argvFlags = {}) {
  const input = {}
  for (const [key, example] of Object.entries(configInput)) {
    const raw = readFlag(key, env, argvFlags)
    if (raw !== undefined) input[key] = coerce(key, raw, example)
  }
  return input
}

module.exports = { parseArgv, readFlag, coerce, missingRequired, buildInput }
