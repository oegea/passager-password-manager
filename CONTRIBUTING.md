# Contributing guidelines

Welcome to Passager Password Manager! Before sending your pull requests, please make sure that you read the whole guidelines. If you have any doubt on the contribution guide, please feel free to state it clearly in an issue or a discussion topic.

## Getting started

### Environment

To run and make modifications to Passager, please note that it has been built with:

* Node: `v16+`
* NPM: `v8`

Do not forget to install dependencies before trying to start the project.

### Main commands

These are the available commands:

* `npm run start`: Starts the project in development mode.
* `npm run build`: Makes a production build of the project and syncronizes mobile app projects.
* `npm run test`: Runs component tests.
* `npm run prepare`: Installs husky git hooks to ensure tests are executed before commiting changes to the repo.
* `npm run start:android`: Starts mobile app in android.
* `npm run start:ios`: Starts mobile app in iOS.
* `npm run build:icons`: Updates mobile app project icons to the latest ones.