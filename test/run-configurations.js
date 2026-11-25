/* eslint-env mocha */

const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const configs = require('../run-configurations')

const dir = path.join(__dirname, '..', 'run-configurations')
const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8')

describe('run configurations', () => {
  it('registers every configuration file exactly once', () => {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'))
    const registered = Object.values(configs)
    expect(registered).to.have.length(files.length)
    for (const file of files) {
      const config = require(path.join(dir, file))
      expect(registered.filter(c => c === config), file).to.have.length(1)
    }
  })

  for (const [key, config] of Object.entries(configs)) {
    describe(key, () => {
      it('names a state machine', () => {
        expect(config.stateMachineName).to.match(/^[A-Za-z0-9]+_[A-Za-z0-9]+_\d+_\d+$/)
      })

      it('identifies the CLI as the instigating client', () => {
        expect(config.options.instigatingClient).to.eql({ appName: 'tymly-cli', domain: 'cli' })
      })

      it('gives every input an example value of a supported type', () => {
        expect(config.input).to.be.an('object')
        for (const [input, example] of Object.entries(config.input)) {
          const ok = Array.isArray(example) || ['string', 'number', 'boolean'].includes(typeof example)
          expect(ok, `${input} has an unsupported example value`).to.eql(true)
        }
      })

      it('only requires inputs it accepts', () => {
        for (const required of config.required || []) {
          expect(config.input, `${required} is required but not an input`).to.have.property(required)
        }
      })

      it('responds when started or when finished', () => {
        // Waiting for a resource callback (e.g. awaitingHumanInput) suits a user's card, not a cron job:
        // nobody completes it, so the CLI times out while the execution carries on.
        expect([undefined, 'IMMEDIATELY', 'COMPLETE']).to.include(config.options.sendResponse)
      })

      it('has a positive timeout if it sets one', () => {
        if (config.timeout !== undefined) expect(config.timeout).to.be.a('number').and.above(0)
      })

      it('is documented in the README', () => {
        expect(readme, `README has no example for --command=${key}`).to.include(`--command=${key}`)
      })
    })
  }
})
