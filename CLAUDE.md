# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Passager is an open-source password manager built with React and designed to work both locally (using browser localStorage) and in cloud mode (with a backend). The application supports:

- Local-only mode for maximum privacy
- Cloud mode with password sharing capabilities
- Installable Progressive Web App (service worker, offline, WebAuthn biometric unlock).
- End-to-end encryption using WebCrypto API
- Multi-language support with i18next

## Architecture

### Frontend (React)

- **Domain Layer**: Clean architecture with Use Cases, Services, Repositories pattern
    - `src/domain/` contains business logic organized by entity (folders, passwords, users, backups)
    - Each domain has UseCases, Services, Repositories with factory pattern
    - Configuration layer supports local vs backend modes via `src/domain/config/`
- **Components**: Atomic design structure (atoms, molecules, organisms, pages, templates)
- **Providers**: React context providers for folders, passwords, and user state
- **Routing**: React Router for navigation

### Backend (Node.js 22, plain JavaScript, no build step)

- Two services under `backend/`: `authentication-service` (port 3001, e-mail code login issuing a 30-day HS256 JWT) and `documents-service` (port 3002, documents/subdocuments CRUD on MongoDB with permission rules in `src/{users,folders,userSharingSettings}`)
- `backend/shared`: HTTP/CORS/JWT helpers using only Node built-ins
- The only dependencies are `mongodb` and `nodemailer`. It no longer uses docky or Express, but keeps the same HTTP API, token format, env vars and database layout, so any frontend version works with any backend version
- Tests need no database: they replay recorded requests against `test/golden.json`, captured from the original docky services. Do not edit goldens by hand

### PWA

- `public/service-worker.js` is stamped by `bin/postbuild.js` with a build id and the precache list
- `src/libs/pwa.js` registers it, applies updates and handles installation
- `src/libs/biometric.js`: WebAuthn + PRF biometric unlock (the master password is never stored)

## Development Commands

### Frontend Development

```bash
# Start development server (Vite, port 3000)
pnpm start

# Build for production (Vite + service worker stamping)
pnpm run build

# Run tests (Vitest)
pnpm test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Docker Development

```bash
# Development with hot reload
pnpm run build:docker:dev
pnpm run start:docker:dev

# Production build
pnpm run build:docker
pnpm run start:docker
```

### Backend Development

```bash
cd backend/
# Install dependencies for both services
(cd authentication-service && pnpm install --ignore-workspace)
(cd documents-service && pnpm install --ignore-workspace)

# Run services individually (configuration comes from environment variables)
pnpm start  # in each service directory

# Run the tests of both services
pnpm test
```

## Testing

- Uses React Testing Library with Vitest (jsdom)
- Test files follow pattern `*.test.js`
- Components have individual test files in their directories
- Run tests with `pnpm test`
- `src/libs/crypto/crypto.test.js` proves wire compatibility with old clients using the original library and data kept in `src/libs/crypto/__fixtures__`

## Key Libraries

- **UI**: React, styled-components, @mdi/js icon paths (rendered by `atoms/Icon`)
- **Crypto**: WebCrypto API (browser native)
- **i18n**: react-i18next for translations
- **Storage**: `src/libs/localStorageDatabase` for local mode (its layout must not change)
- **Build**: Vite; JSX lives in `.js` files (see the plugin in `vite.config.js`)
- **Code Quality**: ESLint, Prettier, Husky for pre-commit hooks

## Configuration Modes

The app supports different configurations via `src/domain/config/`:

- **Local mode**: Data stored in browser localStorage
- **Backend mode**: Connected to Passager backend services
- Configuration is injected through the domain layer factories

## Security Model

1. Master password derives 256-bit AES-GCM key
2. Each user has RSA-OAEP key pair (private key wrapped with master password)
3. Each folder has unique AES-GCM key encrypted with user's public key
4. Folder sharing encrypts folder key with recipient's public key
5. All cryptography uses browser's native WebCrypto API (`src/libs/crypto`, no dependencies)
6. The wrapped private key is versioned inside its own string (`pv2.` prefix = PBKDF2 600k). Legacy values (no prefix, PBKDF2 250k) must stay readable forever

## Backward compatibility rules

- Item types (card, key pair, file, note) live inside the existing password fields: a `passager://<type>` marker in `url` and JSON in the encrypted `password` (see `src/libs/items.js`). Never add document fields for them, and keep requests under the backends' 100 KB body limit
- Files larger than 48 KB are stored apart in encrypted pieces (`src/libs/fileStorage.js`): IndexedDB in local mode, the `files` / `fileChunks` collections in backends that announce it in `GET /capabilities`. Older backends lack that endpoint, so the frontend keeps files inside the item and limits their size. New backend features must be announced there and the frontend must degrade without them
- UI colours come only from the CSS variables in `src/styles/GlobalStyle.js` (light/dark themes)

- Never publish a `version.manifest.json` file in the web root. The former iOS/Android apps request `https://cloud.passager.app/version.manifest.json` on start; today they get the SPA `index.html` (see the rewrite in `vercel.json`), fail to parse it and keep running their bundled code. A real manifest would make them download and run the current bundle

- Backends validate documents against strict field whitelists: never add fields to `users`, `folders`, `passwords`, `userSharingSettings` or `sharedFolders` documents
- Folder keys and passwords formats are shared between users on different versions: never change them
- Old frontends must keep working against the current backend, and this frontend against old backends
- A legacy private key is wrapped again with the current encryption version automatically on password unlock (`UserProvider.upgradeKeyEncryption`); from then on older clients reject that account's master password, which is accepted
