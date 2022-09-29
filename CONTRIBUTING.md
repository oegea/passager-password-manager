# Contributing guidelines

Welcome to Passager Password Manager! Before sending your pull requests, please make sure that you read the whole guidelines. If you have any doubt on the contribution guide, please feel free to state it clearly in an issue or a discussion topic.

## Getting started

### Environment

To run and make modifications to Passager, please note that it has been built with:

* Node: `v16+`
* NPM: `v8`

Do not forget to install dependencies before trying to start the project.

### Main commands

These are the available commands:

* `npm run start`: Starts the project in development mode.
* `npm run build`: Makes a production build of the project and syncronizes mobile app projects.
* `npm run test`: Runs component tests.
* `npm run prepare`: Installs husky git hooks to ensure tests are executed before commiting changes to the repo.
* `npm run start:android`: Starts mobile app in android.
* `npm run start:ios`: Starts mobile app in iOS.
* `npm run build:icons`: Updates mobile app project icons to the latest ones.

## Guidelines

### General guidelines

* Please be sure that you have intelectual property of any submitted contribution. By contributing to Passager you agree to release your contribution as part of the project, under the project's license.
* If your contribution may not be aligned with Passager's vision and goal, it could be useful to previously discuss it on a dedicated issue. Huge changes or important architectural changes are good candidates to be openly discussed before commiting PRs.

### Development guidelines

* Always use the existing dependencies to handle specific topics. (i.e. style your components using `styled-components`, not by adding css files or any other pre-processor).
* Respect the components design system hierarchy (atoms, molecules, organisms, etc.)
* Please ensure that new components are well documented and tested.

## Submitting a PR

To submit new contributions, please open a new PR following the existing template.
Code owners will approve it and/or provide feedback ASAP. 

Community is encouraged to provide feedback on PRs.
