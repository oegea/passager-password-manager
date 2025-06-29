# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Passager is an open-source password manager built with React and designed to work both locally (using browser localStorage) and in cloud mode (with a backend). The application supports:

-   Local-only mode for maximum privacy
-   Cloud mode with password sharing capabilities
-   Mobile apps via Capacitor (iOS and Android)
-   End-to-end encryption using WebCrypto API
-   Multi-language support with i18next

## Architecture

### Frontend (React)

-   **Domain Layer**: Clean architecture with Use Cases, Services, Repositories pattern
    -   `src/domain/` contains business logic organized by entity (folders, passwords, users, backups)
    -   Each domain has UseCases, Services, Repositories with factory pattern
    -   Configuration layer supports local vs backend modes via `src/domain/config/`
-   **Components**: Atomic design structure (atoms, molecules, organisms, pages, templates)
-   **Providers**: React context providers for folders, passwords, and user state
-   **Routing**: React Router for navigation

### Backend (Node.js/TypeScript)

-   Microservices architecture with separate authentication and documents services
-   Uses Docky framework for frontend-first development
-   Runs on ports 3001 (auth) and 3002 (documents)

### Mobile

-   Capacitor for cross-platform mobile development
-   Native biometric authentication support
-   File system access for backups

## Development Commands

### Frontend Development

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Mobile development
npm run start:android
npm run start:ios
```

### Docker Development

```bash
# Development with hot reload
npm run build:docker:dev
npm run start:docker:dev

# Production build
npm run build:docker
npm run start:docker
```

### Backend Development

```bash
cd backend/
# Install dependencies for both services
cd authentication-service && npm i
cd ../documents-service && npm i

# Run services individually
npm run start  # in each service directory
```

## Testing

-   Uses React Testing Library with Jest
-   Test files follow pattern `*.test.js`
-   Components have individual test files in their directories
-   Run tests with `npm test`

## Key Libraries

-   **UI**: React, styled-components, @mdi/react for icons
-   **Crypto**: WebCrypto API (browser native)
-   **i18n**: react-i18next for translations
-   **Mobile**: Capacitor ecosystem
-   **Storage**: @useful-tools/localstorage for local mode
-   **Code Quality**: ESLint, Prettier, Husky for pre-commit hooks

## Configuration Modes

The app supports different configurations via `src/domain/config/`:

-   **Local mode**: Data stored in browser localStorage
-   **Backend mode**: Connected to Passager backend services
-   Configuration is injected through the domain layer factories

## Security Model

1. Master password derives 256-bit AES-GCM key
2. Each user has RSA-OAEP key pair (private key wrapped with master password)
3. Each folder has unique AES-GCM key encrypted with user's public key
4. Folder sharing encrypts folder key with recipient's public key
5. All cryptography uses browser's native WebCrypto API
