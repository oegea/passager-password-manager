# Passager Password Manager

![Build](https://github.com/oegea/passager-password-manager/actions/workflows/main-tests.yml/badge.svg)
[![License](https://shields.io/badge/license-AGPL-green)](LICENSE.md)
![Code Size](https://shields.io/github/languages/code-size/oegea/passager-password-manager)
![Last Commit](https://shields.io/github/last-commit/oegea/passager-password-manager)
<a href="https://play.google.com/store/apps/details?id=im.oriol.passager" target="_blank">
<img height="20" src="https://img.shields.io/badge/Google_Play-414141?style=for-the-badge&logo=google-play&logoColor=white" alt="Available on Google Play Store"/>
</a>
<a href="https://apps.apple.com/es/app/passager-password-manager/id1631897662" target="_blank">
<img height="20" src="https://img.shields.io/badge/App_Store-0D96F6?style=for-the-badge&logo=app-store&logoColor=white"/>
</a>

Passager Password Manager is an open-source and easy-to-use password manager.

# Quick Start

## Run a production-ready build

Build the docker image with the following command:

```bash
npm run build:docker
```

Then start the container with:

```bash
npm run start:docker
```

A production-ready build will be available on the port `8000` under an apache server.

## Start developing locally with docker

Build the docker image with the following command:

```bash
npm run build:docker:dev
```

Then start the container with:

```bash
npm run start:docker:dev
```

A development build will be available on the port `3000`. Changes on the code will be reflected on the container.

## Starting a new Passager Backend instance

Passager has its own REST service to handle authentication and data storage. It can be easily started by building and starting its corresponding docker image.

Please refer to the [Passager Backend directory](/backend/) for more information.

## Reasons to create Passager

You could be wondering why the world needs another password manager.

The answer is that the world doesn't really need more password managers, but I used to need an open source, easy to install and maintain one, and I have never found it.

This is the reason to create `passager`. To bring to the world a password manager that is:

-   Simple to use and maintain, both for users and sys admins.
-   Secure by design.
-   Usable by teams.

These are the three topics around the value-proposition of `passager`, and these points should be the foundation to define its vision and goals.

## Disclaimer

This is a personal project and I do not consider myself responsible for the usage given to this software.
Please understand that I can't be responsible for any direct or indirect damage this software may cause due to any kind of problem.

I've developed this software with all my 💛, but as you know there are evil people outside in the network. Take care, install always all available updates, and use `passager` at your own risk.

If you find any security issue or possible improvement, feel free to submit a PR and I would try to do my best to handle it.

## Nice features

-   DDD architecture: Which allows to use `passager` in local mode, or in the cloud using firebase.
-   Password sharing capabilities when using `passager` in cloud mode.
-   Screen lock after ten minutes of inactivity.

## Technical decisions

To achieve simplicity, security and usability for teams, the following technical decisions have been adopted:

-   Get inspiration, without just copying them, from services like Google Drive, or apps like Finder. A password manager should be as easy-to-use as a file explorer is.
-   Use third-party services (firebase) for authentication and database, to reduce the risk of implementing a property login system or administrating a database system.
-   Decouple the application as much as possible from firebase, to reduce efforts if a service provider change is needed on a future.
-   Handle encryption of data on the client's browser, using native APIs to perform crypto operations.
-   Ensure that team sharing features do not reduce software security.

## Most relevant dependencies

-   `@mdi/js` and `@mdi/react`, to require and render material design icons.
-   `create-react-app`, and all dependencies included in the default template are used to build the project foundation and scaffolding.
-   `react-i18next` and `i18next`, to translate the app to different languages.
-   `styled-components`, is used to style components.
-   `@capacitor/android`, `@capacitor/cli`, `@capacitor/core`, `@capacitor/ios`, `@capacitor/status-bar` and `capacitor-native-biometric` are used to compile the app for mobile devices.

## Development dependencies

-   `husky`, to run tests before commiting changes to the repository.

## About cryptography

WebCrypto API is used to encrypt and decrypt data from passager. This theorically means, as long as your browser is updated, your crypto algorithms will be safe.
These are the techniques followed to protect user passwords:

1. Each user defines a master password, from which is derived a 256 bits AES-GCM key.
2. Additionally, each user has an RSA-OAEP key-pair. Private key is wrapped using the master password's derived key.
3. After the user logs in and writes his master password, the private key is unwrapped and loaded in memory.
4. Each folder has its specific AES-GCM key, which is stored encrypted using the user's RSA public key.
5. When a user wants to access a specific folder, folder's key is decrypted with the user's private key, then the content is accessed and decrypted using the folder-specific key.
6. When a folder is shared, its AES-GCM key is encrypted using the receiver public key, and shared with him.

## Attributions

-   **Favicon**: Safe box icons created by Freepik - Flaticon - https://www.flaticon.com/free-icons/safe-box
-   Google Play and the Google Play logo are trademarks of Google LLC.

## Available Scripts

`create-react-app` is the `passager`'s scaffolding engine.
In the project directory, you can run:

### `npm run prepare`

Set up husky git hooks to run before a commit is submited.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
