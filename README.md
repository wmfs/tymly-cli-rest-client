# tymly-cli
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly-cli/blob/master/LICENSE)

> CLI tool to launch Tymly State Machines over REST

## <a name="install"></a>Install
```bash
$ npm install tymly-cli --save
```

### Usage

```bash
$ npm run cli --name configName
```

##### --name
Name of the configuration you want to run, it must match with a config name. e.g. search 

Each config will have it's own set of input values and must be added as extra flags.
For example, if you wish to launch the search state machine you can pass in a query and a limit so the command will look like the following:

```bash
$ npm run cli --name=search --query=kebab --limit=12
```

### Build environment variables
| Environment Variable | Notes | Example |
| -------------------- | ----- | ------- |
| `TYMLY_API_URL`     | The base URL of Tymly | `http://localhost:3210` |
| `TYMLY_NIC_AUTH0_CLIENT_ID`     | The client ID (as supplied by Auth0) | `abc...` |
| `TYMLY_NIC_AUTH0_CLIENT_SECRET`  | The client secret (as supplied by Auth0) | `abc...` |
| `TYMLY_NIC_AUTH0_DOMAIN` | The client domain (as supplied by Auth0) | `abc.de.auth0.com` |

Once the environment variables have been set, you can run the tests like this:

```bash
$ npm test
```


## <a name="license"></a>License

[MIT](https://github.com/wmfs/tymly-cli/blob/master/LICENSE)
