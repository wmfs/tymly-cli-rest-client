# tymly-cli
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly-cli/blob/master/LICENSE)

> CLI tool to launch Tymly State Machines over REST

## <a name="install"></a>Install
```bash
$ npm install tymly-cli --save
```

### Usage

```bash
$ npm run [cli:live|cli:dev|cli:local] --name configName
```

##### --name
Name of the configuration you want to run. e.g. search 

Each config will have it's own set of input values

### Build environment variables
| Environment Variable | Notes | Example |
| -------------------- | ----- | ------- |
| `TYMLY_LIVE_URL`     | The base URL of the live Tymly API | `https://tymly.wmfs.net` |
| `TYMLY_DEV_URL`      | The base URL of the dev Tymly API | `https://tymly-dev.wmfs.net` |
| `TYMLY_LOCAL_URL`     | The base URL of the Tymly instance running locally | `http://localhost:3210` |
| `TYMLY_NIC_AUTH0_CLIENT_ID`     | The client ID (as supplied by Auth0) | `abc...` |
| `TYMLY_NIC_AUTH0_CLIENT_SECRET`  | The client secret (as supplied by Auth0) | `abc...` |
| `TYMLY_NIC_AUTH0_DOMAIN` | The client domain (as supplied by Auth0) | `abc.de.auth0.com` |

Once the environment variables have been set, you can run the tests like this:

```bash
$ npm test
```


## <a name="license"></a>License

[MIT](https://github.com/wmfs/tymly-cli/blob/master/LICENSE)
