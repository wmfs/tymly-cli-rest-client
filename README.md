# tymly-cli

[![npm (scoped)](https://img.shields.io/npm/v/@wmfs/tymly-cli.svg)](https://www.npmjs.com/package/@wmfs/tymly-cli) [![Build Status](https://travis-ci.org/wmfs/tymly-cli.svg?branch=master)](https://travis-ci.org/wmfs/tymly-cli) [![codecov](https://codecov.io/gh/wmfs/tymly-cli/branch/master/graph/badge.svg)](https://codecov.io/gh/wmfs/tymly-cli) [![CodeFactor](https://www.codefactor.io/repository/github/wmfs/tymly-cli/badge)](https://www.codefactor.io/repository/github/wmfs/tymly-cli) [![Dependabot badge](https://img.shields.io/badge/Dependabot-active-brightgreen.svg)](https://dependabot.com/) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly-cli/blob/master/LICENSE)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fwmfs%2Ftymly-cli.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fwmfs%2Ftymly-cli?ref=badge_shield)

> CLI tool to launch Tymly State Machines over REST

## <a name="install"></a>Install
```bash
$ npm install tymly-cli --save
```

## <a name="usage"></a>Usage

```bash
$ npm run cli --command configKey
```

### --command
Key of the configuration you want to run, it must match with a config command. e.g. search, refreshRanking

Each config will have it's own set of input values and must be added as extra flags.
For example, if you wish to launch the search state machine you can pass in a query, a limit and an offset so the command will look like the following:

```bash
$ npm run cli --command=search --query=kebab --limit=12 --offset=0
```

To find the input flags, you can look in the run-configurations directory and find the state machine you wish to run.

### quiet | q
Including 'quiet' in the command will make it run in 'quiet mode' and does not put anything onto the console

```bash
$ npm run cli quiet --command=incidentsInProgress
```

```bash
$ npm run cli q --command=incidentsInProgress
```

## <a name="runConfig"></a>Run Configurations

1. [Incidents In Progress](#incidentsInProgress)
2. [Search](#search)
3. [Refresh Ranking](#refreshRanking)

### <a name="incidentsInProgress"></a>Incidents In Progress

```bash
$ npm run cli --command=incidentsInProgress
```

### <a name="search"></a>Search

#### Inputs:
* query (required)
* limit (required)
* offset (required)
* domain
* orderBy
* showActiveEventsOnly
* lat
* long
* categoryRestriction

```bash
$ npm run cli --command=search --query=kebabs --limit=10 --offset=0 
```

When a value to any of the inputs contains multiple words then separate them with underscores. See query:

```bash
$ npm run cli --command=search --query=99_vauxhall_road --limit=10 --offset=0 
```

When a value to any of the inputs is an array then separate them with commas. See categoryRestriction:

```bash
$ npm run cli --command=search --query=kebabs --limit=10 --offset=0 --categoryRestriction=gazetteer,fireSafety
```

### <a name="refreshRanking"></a>Refresh Ranking

#### Inputs:
* schema (required)
* category (required)

```bash
$ npm run cli --command=refreshRanking --schema=wmfs --category=factory 
```

## <a name="buildEnv"></a>Build environment variables
| Environment Variable | Notes | Example |
| -------------------- | ----- | ------- |
| `TYMLY_API_URL`     | The base URL of Tymly (Required) | `http://localhost:3210` |
| `TYMLY_NIC_AUTH0_CLIENT_ID`     | The client ID (as supplied by Auth0) (Required) | `abc...` |
| `TYMLY_NIC_AUTH0_CLIENT_SECRET`  | The client secret (as supplied by Auth0) (Required) | `abc...` |
| `TYMLY_NIC_AUTH0_DOMAIN` | The client domain (as supplied by Auth0) (Required) | `abc.de.auth0.com` |
| `TYMLY_AUTH_AUDIENCE` | The Tymly audience (Required) | `abc...` |
| `DEBUG` | To enable debug statements (Optional) | `tymly-cli` |
| `WEB_API_TIMEOUT_IN_MS` | Specify a timeout. Default to 3000. (Optional) | `5000` |

Once the environment variables have been set, you can run the tests like this:

```bash
$ npm test
```


## <a name="license"></a>License

[MIT](https://github.com/wmfs/tymly-cli/blob/master/LICENSE)


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fwmfs%2Ftymly-cli.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fwmfs%2Ftymly-cli?ref=badge_large)