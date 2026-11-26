# tymly-cli-rest-client

[![npm (scoped)](https://img.shields.io/npm/v/@wmfs/tymly-cli-rest-client.svg)](https://www.npmjs.com/package/@wmfs/tymly-cli-rest-client) [![CircleCI](https://circleci.com/gh/wmfs/tymly-cli-rest-client.svg?style=svg)](https://circleci.com/gh/wmfs/tymly-cli-rest-client) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/wmfs/tymly-cli-rest-client/blob/master/LICENSE)

> Starts Tymly state machines over REST. Cron jobs on the Tymly server use it to run scheduled jobs.

Scheduled jobs are planned to move into Tymly itself (tymly-schedule-plugin), after which this package will be retired.

## Contents

1. [How it works](#how-it-works)
2. [Install](#install)
3. [Environment variables](#environment-variables)
4. [Running a job](#running-a-job)
5. [Inputs](#inputs)
6. [Commands](#commands)
7. [Adding or changing a job](#adding-or-changing-a-job)
8. [Development](#development)
9. [Security](#security)

## How it works

1. A cron job runs `npm run cli -- --command=<command>` in the package directory, with any inputs as extra flags.
2. The CLI gets a token from Auth0 using the client credentials grant.
3. It posts the command's state machine name, input and options to `<TYMLY_API_URL>/executions`.
4. It waits for the response the run configuration asks for (see [Exit codes](#exit-codes)), then exits.

Each command is a run configuration in the `run-configurations` directory.

## Install

```bash
$ npm install @wmfs/tymly-cli-rest-client
$ npm ls @wmfs/tymly-cli-rest-client    # check the installed version
```

Releases are published to npm automatically when changes are merged to `master`.

## Environment variables

| Environment Variable | Notes | Example |
| -------------------- | ----- | ------- |
| `TYMLY_API_URL` | The base URL of Tymly (required) | `http://localhost:3210` |
| `TYMLY_NIC_AUTH0_DOMAIN` | The Auth0 domain (required) | `abc.de.auth0.com` |
| `TYMLY_NIC_AUTH0_CLIENT_ID` | The Auth0 client ID (required) | `abc...` |
| `TYMLY_NIC_AUTH0_CLIENT_SECRET` | The Auth0 client secret (required) | `abc...` |
| `TYMLY_AUTH_AUDIENCE` | The Tymly audience (required) | `abc...` |
| `WEB_API_TIMEOUT_IN_MS` | Timeout for the Auth0 token request. Defaults to 3000 (optional) | `5000` |
| `DEBUG` | Turns on debug output (optional). Don't set it for scheduled jobs. | `tymly-cli` |

If any required variable is missing, the CLI lists them all and exits with code 1.

## Running a job

```bash
$ npm run cli -- --command=<command> [--<input>=<value> ...]
```

Put the flags after `--`, and write them as `--name=value`. npm then passes them to the CLI untouched.

Without the `--`, npm reads each flag as one of its own settings and passes it on as an environment variable. That still works for most flags, so older crontab entries keep running, but flags that are also npm settings lose their value: `--long=-2.0` arrives as `true`, and `--dryRun=false` arrives empty. npm also plans to stop passing unknown flags on this way. If a flag is given both ways, the one after `--` wins.

Add `quiet` (or `q`) to print nothing except errors:

```bash
$ npm run cli -- quiet --command=identifyOverdueRpFaults --dryRun=true
```

Example crontab entry, run from the package directory:

```
0 6 * * * cd <package directory> && npm run cli -- quiet --command=archiveStaleExecution >> <log file> 2>&1
```

### Exit codes

| Code | Meaning |
| ---- | ------- |
| `0` | The request succeeded. What that proves depends on the command's response type (below). |
| `1` | Something failed. The reason is printed after `ERROR`. |

The CLI exits with `1` when an environment variable or input is missing or invalid, the command is unknown, the token request fails, the request to Tymly fails or times out, or the state machine returns `FAILED`.

What a `0` proves depends on the run configuration's `sendResponse`:

| `sendResponse` | Tymly responds | A `0` means |
| -------------- | -------------- | ----------- |
| `COMPLETE` | when the state machine finishes | it finished and did not fail |
| `IMMEDIATELY` (or not set) | as soon as the execution starts | Tymly accepted it and it started. It doesn't say whether it finished: check Tymly for the outcome |

A run configuration can set `timeout` in milliseconds. Without one, the CLI waits up to 30 minutes. For jobs that take longer than that, such as `refreshAll`, use `IMMEDIATELY` rather than a longer timeout. A timeout makes the CLI exit with `1`, but the execution carries on in Tymly. A proxy or load balancer in front of the Tymly API may close a long request sooner (an HTTP 504), with the same result.

## Inputs

Only the flags you pass are sent to the state machine. The values in a run configuration's `input` are examples that set each input's type, not defaults:

| Example value | Flag | Sent as |
| ------------- | ---- | ------- |
| `""` (string) | `--query=99_vauxhall_road` | `"99 vauxhall road"` (underscores become spaces) |
| `0` (number) | `--limit=12` | `12` |
| `false` (boolean) | `--dryRun=true` | `true` (only `true` or `false` are accepted) |
| `[]` (array) | `--categoryRestriction=gazetteer,fireSafety` | `["gazetteer", "fireSafety"]` |

Flag names aren't case-sensitive, so `--dryRun` and `--dryrun` are the same flag. An invalid value, including a blank number, stops the CLI before anything is started.

## Commands

### Scheduled jobs

These are meant to be run by cron on the Tymly server. Check the server's crontab for which ones are scheduled, and when.

| Command | State machine | Inputs | Tymly responds |
| ------- | ------------- | ------ | -------------- |
| `archiveStaleExecution` | `tymly_archiveStaleExecutions_1_0` | | when finished |
| `checkSawApptNotifications` | `wmfs_checkSawApptNotifications_1_0` | | when finished |
| `fullReindex` | `tymly_fullReindex_1_0` | | when finished |
| `identifyOverdueRpFaults` | `rpFault_identifyOverdue_1_0` | dryRun | when finished |
| `refreshAll` | `wmfs_runRefreshRankingAll_1_0` | | when started |
| `sendCnoReferralIncidentNotifications` | `wmfs_sendCnoReferralIncidentNotifications_1_0` | | when finished |
| `sendCnoReminders` | `wmfs_sendCnoReminders_1_0` | | when finished |

`fullReindex` needs the Auth0 client to have the `tymly_solrAdmin` role. It finishes as soon as Solr has started the full import, so its exit code doesn't say whether the reindex itself worked.

```bash
$ npm run cli -- --command=archiveStaleExecution
$ npm run cli -- --command=checkSawApptNotifications
$ npm run cli -- --command=fullReindex
$ npm run cli -- --command=refreshAll
$ npm run cli -- --command=sendCnoReferralIncidentNotifications
$ npm run cli -- --command=sendCnoReminders
```

**Identify overdue RP faults.** `--dryRun=true` finds overdue faults and reports them without changing anything or sending Teams notifications. Leave the flag out for a normal run, which marks faults as overdue and sends the notifications. Only schedule it with `--dryRun=true` while a dry run has been agreed.

```bash
$ npm run cli -- --command=identifyOverdueRpFaults --dryRun=true
```

### Manual commands

These are for running by hand, for example to test the connection to Tymly. Don't schedule them.

| Command | State machine | Inputs (* = required) | Tymly responds |
| ------- | ------------- | --------------------- | -------------- |
| `refreshRanking` | `wmfs_refreshRanking_1_0` | schema*, category* | when finished |
| `search` | `tymly_search_1_0` | query*, offset*, limit*, domain, orderBy, showActiveEventsOnly, lat, long, categoryRestriction | when finished |

Refresh the rankings for one category (`refreshAll` refreshes all of them):

```bash
$ npm run cli -- --command=refreshRanking --schema=wmfs --category=factory
```

Search:

```bash
$ npm run cli -- --command=search --query=99_vauxhall_road --limit=10 --offset=0 --categoryRestriction=gazetteer,fireSafety
```

## Adding or changing a job

1. Add or edit a JSON file in `run-configurations`:

   | Field | Notes |
   | ----- | ----- |
   | `stateMachineName` | Required, e.g. `rpFault_identifyOverdue_1_0` |
   | `input` | Required (`{}` if none). Each key is an accepted flag; its value sets the type (see [Inputs](#inputs)) |
   | `required` | Optional. Inputs that must be passed |
   | `options.instigatingClient` | Required: `{ "appName": "tymly-cli", "domain": "cli" }` |
   | `options.sendResponse` | `COMPLETE` to wait until the state machine finishes, or `IMMEDIATELY` for long jobs so Tymly responds as soon as the run starts. Don't wait for a resource callback such as `awaitingHumanInput`: that's for a user's card, and nobody will complete it |
   | `timeout` | Optional, in milliseconds. Defaults to 30 minutes |

2. Register it in `run-configurations/index.js`. The key is the command name.
3. Add it to the [Scheduled jobs](#scheduled-jobs) or [Manual commands](#manual-commands) table, with an example using `--command=<key>`. The tests check every command has one.
4. Commit with a [conventional commit](https://www.conventionalcommits.org) message (`fix:`, `feat:`), and merge to `master`. CircleCI publishes the new version to npm.
5. Ask the infrastructure team to install the new version and add or change the crontab entry.

## Development

```bash
$ npm test      # unit and command line tests; fails if coverage drops below the minimum in package.json
$ npm run lint
```

The tests need no credentials and make no network requests.

## Security

- Credentials only come from environment variables. Never put them in a run configuration.
- Don't set `DEBUG` for scheduled jobs.
- Error messages never include the bearer token or the client secret.
- The Auth0 client should only have the Tymly roles needed to start these state machines.
- Dependencies are pinned to exact versions. Check updates before merging them.

## License

[MIT](https://github.com/wmfs/tymly-cli-rest-client/blob/master/LICENSE)
