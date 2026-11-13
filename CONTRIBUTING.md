# Contributing guidelines

Welcome to Passager Password Manager! Before sending your pull requests, please make sure that you read the whole guidelines. If you have any doubt on the contribution guide, please feel free to state it clearly in an issue or a discussion topic.

## Getting started

### Environment

To run and make modifications to Passager you need:

- Node: `v22`
- pnpm: `v11+`

Install the dependencies with `pnpm install` before starting the project. The backend services have their own dependencies: see the [backend directory](/backend/).

### Main commands

These are the available commands:

- `pnpm start`: Starts the project in development mode, on port `3000`.
- `pnpm run build`: Makes a production build of the web application, including its service worker.
- `pnpm run preview`: Serves the production build locally.
- `pnpm test`: Runs the tests.
- `pnpm run lint`: Lints the code.
- `pnpm run format`: Formats the code.
- `pnpm run prepare`: Installs husky git hooks to ensure tests are executed before commiting changes to the repo.

In the `backend` directory, `pnpm test` runs the tests of both services.

## Guidelines

### General guidelines

- Please be sure that you have intelectual property of any submitted contribution. By contributing to Passager you agree to release your contribution as part of the project, under the project's license.
- If your contribution may not be aligned with Passager's vision and goal, it could be useful to previously discuss it on a dedicated issue. Huge changes or important architectural changes are good candidates to be openly discussed before commiting PRs.

### Development guidelines

- Always use the existing dependencies to handle specific topics. (i.e. style your components using `styled-components`, not by adding css files or any other pre-processor).
- Respect the components design system hierarchy (atoms, molecules, organisms, etc.)
- Please ensure that new components are well documented and tested.
- Use only the colours defined as CSS variables in `src/styles/GlobalStyle.js`, so both the light and the dark theme keep working.
- Add every new text to all the languages in `src/i18n`.

### Compatibility guidelines

Different versions of Passager coexist: people on an older web application, organizations with an older backend, and users on different versions sharing folders. A contribution must not break any of them:

- Do not add fields to the documents stored in the backend, and do not change the format of folder keys or passwords.
- A new backend feature has to be announced in `GET /capabilities`, and the web application has to keep working without it.
- Data encrypted by earlier versions must stay readable.

See the "Compatibility" section of the [README](/README.md) for more details.

## Submitting a PR

To submit new contributions, please open a new PR following the existing template.
Code owners will approve it and/or provide feedback ASAP.

Community is encouraged to provide feedback on PRs.
