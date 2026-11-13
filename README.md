# Passager Password Manager

![Build](https://github.com/oegea/passager-password-manager/actions/workflows/main-tests.yml/badge.svg)
[![License](https://shields.io/badge/license-AGPL-green)](LICENSE.md)
![Code Size](https://shields.io/github/languages/code-size/oegea/passager-password-manager)
![Last Commit](https://shields.io/github/last-commit/oegea/passager-password-manager)

Passager Password Manager is an open-source and easy-to-use password manager.

---

## Nice features

- Possibility to use it in local mode or in cloud mode by connecting to a remote backend.
- Password sharing capabilities when using `passager` in cloud mode.
- Screen lock after ten minutes of inactivity.
- Besides passwords, folders can hold payment cards, key pairs, files and secure notes. They are stored inside the same encrypted fields a password uses, so they work with every backend version.
- Files up to 50 MB, encrypted in the device and stored in pieces (in local mode, and with backends that support it; older backends are limited to 48 KB per file).
- Light and dark themes.
- Installable Progressive Web App: add it to the home screen of your phone or to your desktop, and use it offline.
- Unlock with Face ID, Touch ID, fingerprint or Windows Hello (WebAuthn), without storing the master password.
- E2E encryption relies on the WebCrypto API. No third-party crypto libraries are used, which warranties that crypto code is up-to-date as long as the browser is.

## Try Passager now

Passager can be used in local mode, which means that all data is stored in the browser's local storage. This is the recommended mode if you want to be sure that your data is not stored in any server.

Just open it from your browser, on any device:

- [Try the latest web app version](https://cloud.passager.app)

Passager is a Progressive Web App. To install it, open it in your browser and use "Install" (Chrome, Edge) or "Share → Add to Home Screen" (Safari on iPhone and iPad). Once installed it opens like any other app, works offline in local mode, and can be unlocked with your device biometrics.

## Installing Passager in a production environment

### Run a production-ready build

It's possible to build the docker image with the following command:

```bash
pnpm run build:docker
```

Then start the container with:

```bash
pnpm run start:docker
```

A production-ready build will be available on the port `8000` served by nginx.

### Starting a new Passager Backend instance

Passager has its own REST service to handle authentication and data storage.
It works great for organizations that need to keep synchronized their passwords between different devices. Additionally, sharing capabilities are available when connecting Passager to a remote backend.

A new backend instance can be easily started by building and running its corresponding docker image.

Please refer to the [Passager Backend directory](/backend/) for more information.

## Starting developing

### Quick start with docker

Build the docker image with the following command:

```bash
pnpm run build:docker:dev
```

Then start the container with:

```bash
pnpm run start:docker:dev
```

A development build will be available on the port `3000`. Changes on the code will be reflected on the container.

### Available Scripts

`passager` is built with [Vite](https://vite.dev) and tested with [Vitest](https://vitest.dev). `pnpm` is the package manager.

In the project directory, you can run:

- `pnpm start`: development server on port `3000`.
- `pnpm test`: unit and integration tests.
- `pnpm run lint`: lint the code.
- `pnpm run build`: production bundle in `build/`, including the service worker.
- `pnpm run preview`: serve the production bundle locally.

## Technical decisions

To achieve simplicity, security and usability for teams, the following technical decisions have been adopted:

- Get inspiration, without just copying them, from services like Google Drive, or apps like Finder. A password manager should be as easy-to-use as a file explorer is.
- Keep third-party dependencies to the bare minimum, both in the web application and in the backend, to reduce the attack surface.
- Decouple the application as much as possible from its backend, which is a small self-hosted service with a stable API.
- Handle encryption of data on the client's browser, using native APIs to perform crypto operations.
- Ensure that team sharing features do not reduce software security.

## Reasons to create Passager

You could be wondering why the world needs another password manager.

The answer is that the world doesn't really need more password managers, but I used to need an open source, easy to install and maintain one, and I have never found it.

This is the reason to create `passager`. To bring to the world a password manager that is:

- Simple to use and maintain, both for users and sys admins.
- Secure by design.
- Usable by teams.

These are the three topics around the value-proposition of `passager`, and these points should be the foundation to define its vision and goals.

## Disclaimer

This is a personal project and I do not consider myself responsible for the usage given to this software.
Please understand that I can't be responsible for any direct or indirect damage this software may cause due to any kind of problem.

I've developed this software with all my 💛, but as you know there are evil people outside in the network. Take care, install always all available updates, and use `passager` at your own risk.

If you find any security issue or possible improvement, feel free to submit a PR and I would try to do my best to handle it.

## Most relevant dependencies

- `react`, `react-dom` and `react-router-dom`, to render and route the application.
- `styled-components`, is used to style components.
- `react-i18next` and `i18next`, to translate the app to different languages.
- `@mdi/js`, material design icon paths.
- `react-qr-code`, to render the QR codes of the access kit.

Cryptography (`src/libs/crypto`), local storage (`src/libs/localStorageDatabase`), the service worker and the biometric unlock are part of this repository and have no dependencies.

## Development dependencies

- `vite` and `vitest`, to build and test.
- `eslint` and `prettier`, to lint and format.
- `husky`, to run tests before commiting changes to the repository.

## About cryptography

WebCrypto API is used to encrypt and decrypt data from passager. This theorically means, as long as your browser is updated, your crypto algorithms will be safe.
These are the techniques followed to protect user passwords:

1. Each user defines a master password, from which is derived a 256 bits AES-GCM key (PBKDF2-HMAC-SHA256, 600.000 iterations).
2. Additionally, each user has an RSA-OAEP key-pair. Private key is wrapped using the master password's derived key.
3. After the user logs in and writes his master password, the private key is unwrapped and loaded in memory.
4. Each folder has its specific AES-GCM key, which is stored encrypted using the user's RSA public key.
5. When a user wants to access a specific folder, folder's key is decrypted with the user's private key, then the content is accessed and decrypted using the folder-specific key.
6. When a folder is shared, its AES-GCM key is encrypted using the receiver public key, and shared with him.

### Encryption versions

The wrapped private key is the only value that depends on the master password, and it is versioned:

| Version     | Format                                    | Key derivation                                                          |
| ----------- | ----------------------------------------- | ----------------------------------------------------------------------- |
| 1 (legacy)  | `base64(salt + iv + ciphertext)`          | PBKDF2-HMAC-SHA256, 250.000 iterations                                  |
| 2 (current) | `pv2.` + `base64(salt + iv + ciphertext)` | PBKDF2-HMAC-SHA256, 600.000 iterations, version bound to the ciphertext |

The version travels inside the value itself, so no document gains new fields and every backend version stores it unchanged. Accounts created with this version use version 2. Existing accounts are upgraded automatically the first time the user unlocks Passager with the master password: the private key itself does not change, it is only wrapped again, and the result is verified before being stored.

Folder keys, passwords and shared folders do not depend on the master password: they are unchanged and stay readable by every version, whatever version each user is on.

### Biometric unlock

WebAuthn with the PRF extension is used. The platform authenticator (Face ID, Touch ID, fingerprint, Windows Hello) releases a secret only after verifying the user; a key derived from it (HKDF-SHA256) wraps the private key with AES-256-GCM. Only that wrapped copy is stored in the device. The master password is never stored, nothing is sent to any server, and the master password is still required in any other device.

## Compatibility

Passager is designed so that different versions can coexist:

- **This web app with an older backend**: fully supported. No document has new fields.
- **Older web apps with the current backend**: fully supported. The backend keeps the same API, validation rules and storage layout.
- **Users on different versions sharing folders**: fully supported in both directions.
- **An account that has been opened with this version**: its encryption is upgraded, so from then on clients older than this version reject its master password. No data is lost, and this version keeps working.

## Attributions

- **Favicon**: Safe box icons created by Freepik - Flaticon - https://www.flaticon.com/free-icons/safe-box
