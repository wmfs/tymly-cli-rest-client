/* eslint-env mocha */

const expect = require('chai').expect
const { parseArgv, readFlag, coerce, missingRequired, buildInput } = require('../lib/input')
const configs = require('../run-configurations')

describe('input flags', () => {
  describe('parseArgv', () => {
    it('reads --key=value arguments, lower-casing the key', () => {
      const argv = ['node', 'lib/cli', 'quiet', '--command=search', '--long=-2.0', '--dryRun=true', '--query=a=b']
      expect(parseArgv(argv)).to.eql({ command: 'search', long: '-2.0', dryrun: 'true', query: 'a=b' })
    })

    it('ignores node, the script and positional arguments', () => {
      expect(parseArgv(['node', 'lib/cli', 'quiet', 'q'])).to.eql({})
    })
  })

  describe('readFlag', () => {
    it('prefers a command-line flag to npm\'s environment variable', () => {
      // npm passes --long=-2.0 as npm_config_long=true, because long is one of its own settings
      expect(readFlag('long', { npm_config_long: 'true' }, { long: '-2.0' })).to.eql('-2.0')
    })

    it('matches a command-line flag case-insensitively', () => {
      expect(readFlag('dryRun', {}, { dryrun: 'true' })).to.eql('true')
    })

    it('reads a flag npm passed in lower case', () => {
      expect(readFlag('dryRun', { npm_config_dryrun: 'true' })).to.eql('true')
    })

    it('reads a flag with the exact name', () => {
      expect(readFlag('query', { npm_config_query: 'kebab' })).to.eql('kebab')
    })

    it('treats a missing or empty flag as not passed', () => {
      expect(readFlag('query', {})).to.eql(undefined)
      expect(readFlag('query', { npm_config_query: '' })).to.eql(undefined)
    })
  })

  describe('coerce', () => {
    it('converts booleans', () => {
      expect(coerce('dryRun', 'true', false)).to.eql(true)
      expect(coerce('dryRun', 'false', true)).to.eql(false)
    })

    it('rejects an invalid boolean', () => {
      expect(() => coerce('dryRun', 'yes', false)).to.throw('Invalid value for dryRun')
    })

    it('converts numbers', () => {
      expect(coerce('limit', '12', 10)).to.eql(12)
    })

    it('rejects an invalid number', () => {
      expect(() => coerce('limit', 'ten', 10)).to.throw('Invalid value for limit')
    })

    it('rejects a blank number rather than sending 0', () => {
      expect(() => coerce('limit', ' ', 10)).to.throw('Invalid value for limit')
    })

    it('converts negative and decimal numbers', () => {
      expect(coerce('long', '-1.8904', 0)).to.eql(-1.8904)
    })

    it('converts arrays, replacing underscores with spaces', () => {
      expect(coerce('categoryRestriction', 'gazetteer,fire_safety', [])).to.eql(['gazetteer', 'fire safety'])
    })

    it('converts strings, replacing underscores with spaces', () => {
      expect(coerce('query', '99_vauxhall_road', '')).to.eql('99 vauxhall road')
    })
  })

  describe('missingRequired', () => {
    it('lists required flags that were not passed', () => {
      const env = { npm_config_query: 'kebab', npm_config_limit: '10' }
      expect(missingRequired(['query', 'offset', 'limit'], env)).to.eql(['offset'])
    })

    it('accepts required flags from the command line', () => {
      expect(missingRequired(['query'], {}, { query: 'kebab' })).to.eql([])
    })

    it('handles configs with no required flags', () => {
      expect(missingRequired(undefined, {})).to.eql([])
    })
  })

  describe('buildInput', () => {
    it('only sends flags that were passed', () => {
      expect(buildInput({ dryRun: false }, {})).to.eql({})
    })

    it('sends dryRun as a boolean for the overdue RP faults job', () => {
      const env = { npm_config_dryrun: 'true' }
      expect(buildInput(configs.identifyOverdueRpFaults.input, env)).to.eql({ dryRun: true })
    })

    it('builds input from command-line flags', () => {
      const argvFlags = { query: 'kebab', limit: '1', offset: '0', lat: '52.48', long: '-1.89' }
      expect(buildInput(configs.search.input, {}, argvFlags)).to.eql({
        query: 'kebab', limit: 1, offset: 0, lat: 52.48, long: -1.89
      })
    })

    it('builds typed search input', () => {
      const env = {
        npm_config_query: 'kebab',
        npm_config_limit: '12',
        npm_config_offset: '0',
        npm_config_categoryrestriction: 'gazetteer,fireSafety'
      }
      expect(buildInput(configs.search.input, env)).to.eql({
        query: 'kebab',
        limit: 12,
        offset: 0,
        categoryRestriction: ['gazetteer', 'fireSafety']
      })
    })
  })
})
