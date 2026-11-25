/* eslint-env mocha */

const expect = require('chai').expect
const { readFlag, coerce, missingRequired, buildInput } = require('../lib/input')
const configs = require('../run-configurations')

describe('input flags', () => {
  describe('readFlag', () => {
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
