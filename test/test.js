/* eslint-env mocha */

const expect = require('chai').expect
const exec = require('child_process').exec

describe('tymly-cli tests', function () {
  this.timeout(5000)

  const hasEnv = !!(
    process.env.TYMLY_NIC_AUTH0_DOMAIN &&
    process.env.TYMLY_NIC_AUTH0_CLIENT_ID &&
    process.env.TYMLY_NIC_AUTH0_CLIENT_SECRET &&
    process.env.TYMLY_AUTH_AUDIENCE &&
    process.env.TYMLY_API_URL
  )

  it('should run the script successfully', done => {
    exec(
      'npm run cli --command=search --query=kebab --limit=12 --offset=0',
      (err, stdout, stderr) => {
        if (hasEnv) {
          expect(err).to.eql(null)
          console.log(`stdout: '${stdout}'`)
          console.log(`stderr: '${stderr}'`)
        } else {
          expect(err).to.not.eql(null)
          expect(stderr).to.not.eql(null)
          expect(stdout.split('\n').includes(`Missing env var: TYMLY_NIC_AUTH0_DOMAIN`)).to.eql(true)
        }
        done()
      }
    )
  })

  it('should run the script without a command specified', done => {
    exec(
      'npm run cli',
      (err, stdout, stderr) => {
        expect(err).to.not.eql(null)
        expect(stderr).to.not.eql(null)

        if (hasEnv) expect(stdout.split('\n').includes(`You must specify a command`)).to.eql(true)
        else expect(stdout.split('\n').includes(`Missing env var: TYMLY_NIC_AUTH0_DOMAIN`)).to.eql(true)

        done()
      }
    )
  })

  it('should run the script with an unknown config command', done => {
    exec(
      'npm run cli --command=searchStuff ',
      (err, stdout, stderr) => {
        expect(err).to.not.eql(null)
        expect(stderr).to.not.eql(null)

        if (hasEnv) expect(stdout.split('\n').includes(`Unknown config: 'searchStuff'`)).to.eql(true)
        else expect(stdout.split('\n').includes(`Missing env var: TYMLY_NIC_AUTH0_DOMAIN`)).to.eql(true)

        done()
      }
    )
  })

  it('should run the script with quiet flag', done => {
    exec(
      'npm run cli quiet --command=incidentsInProgress',
      (err, stdout, stderr) => {
        if (hasEnv) {
          expect(err).to.eql(null)
        } else {
          expect(err).to.not.eql(null)
          expect(stdout.split('\n').includes(`Missing env var: TYMLY_NIC_AUTH0_DOMAIN`)).to.eql(true)
        }
        done()
      }
    )
  })
})
