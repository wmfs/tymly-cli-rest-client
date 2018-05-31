/* eslint-env mocha */

const expect = require('chai').expect
const exec = require('child_process').exec

describe('tymly-cli tests', function () {
  this.timeout(5000)

  process.env.TYMLY_API_URL = 'http://localhost:3210'

  it('should run the script', done => {
    if (
      process.env.TYMLY_NIC_AUTH0_DOMAIN &&
      process.env.TYMLY_NIC_AUTH0_CLIENT_ID &&
      process.env.TYMLY_NIC_AUTH0_CLIENT_SECRET &&
      process.env.TYMLY_API_URL
    ) {
      exec(
        'npm run cli --name=search --query=kebab --limit=12',
        (err, stdout, stderr) => {
          expect(err).to.eql(null)
          console.log('stdout', stdout)
          console.log('stderr', stderr)
          done()
        }
      )
    } else {
      console.log('Skipping test because missing env vars')
      done()
    }
  })
})
