/* eslint-env mocha */

const expect = require('chai').expect
const exec = require('child_process').exec

describe('tymly-cli tests', function () {
  this.timeout(5000)

  if (
    process.env.TYMLY_NIC_AUTH0_DOMAIN &&
    process.env.TYMLY_NIC_AUTH0_CLIENT_ID &&
    process.env.TYMLY_NIC_AUTH0_CLIENT_SECRET &&
    process.env.TYMLY_AUTH_AUDIENCE &&
    process.env.TYMLY_API_URL
  ) {
    it('should run the script', done => {
      exec(
        'npm run cli --name=search --query=kebab --limit=12 --offset=0',
        (err, stdout, stderr) => {
          expect(err).to.eql(null)
          done()
        }
      )
    })

    it('should run the script without a name specified', done => {
      exec(
        'npm run cli',
        (err, stdout, stderr) => {
          expect(err).to.eql(null)
          expect(stderr).to.not.eql(null)
          done()
        }
      )
    })
  } else {
    it('should run the script', done => {
      exec(
        'npm run cli --name=search --query=kebab --limit=12 --offset=0',
        (err, stdout, stderr) => {
          expect(err).to.eql(null)
          done()
        }
      )
    })
  }
})
