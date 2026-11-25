// Inputs are passed as npm config flags, e.g. `npm run cli --command=search --query=kebab`.
// npm exposes each flag as an environment variable, lower-casing the name:
// --dryRun=true arrives as npm_config_dryrun, not npm_config_dryRun.

function readFlag (key, env = process.env) {
  const value = env[`npm_config_${key}`] ?? env[`npm_config_${key.toLowerCase()}`]
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
    const n = Number(raw)
    if (Number.isNaN(n)) throw new Error(`Invalid value for ${key}: '${raw}' (expected a number)`)
    return n
  }

  return raw.split('_').join(' ')
}

function missingRequired (required = [], env = process.env) {
  return required.filter(key => readFlag(key, env) === undefined)
}

// Only flags that were passed are sent; the values in the run configuration are examples
// that set each input's type, not defaults.
function buildInput (configInput = {}, env = process.env) {
  const input = {}
  for (const [key, example] of Object.entries(configInput)) {
    const raw = readFlag(key, env)
    if (raw !== undefined) input[key] = coerce(key, raw, example)
  }
  return input
}

module.exports = { readFlag, coerce, missingRequired, buildInput }
