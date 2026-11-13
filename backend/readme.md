# Passager Password Manager Backend

This project is a set of web services to use Passager Password Manager within an organization, enabling password sharing capabilities and other features which are available only when Passager doesn't run in local mode.

# How to quick start

You can quickly build and run the backend docker image by:

1. Copy the content of `.env_template` to a file named `.env` and complete it with real configuration parameters.
2. Run `docker run -d --restart=always --env-file /path/to/your/.env -p 3001-3002:3001-3002 oriolegea/passager-backend:latest` to start the docker container. It will restart automatically in case something goes wrong and the app crashes.

While the container is up, you will be able to access the service at `http://localhost:3001` (authentication service) and `http://localhost:3002` (documents service).

# Developing in local

If you prefer to run this project without using containers, you can run each service in local. They only need Node.js 22: there is no build step.

Configuration params need to be defined on environment variables (see `.env_template`).

Do not forget to install dependencies by running `pnpm install --ignore-workspace` (or `npm i`) inside the `documents-service` and `authentication-service` directories.

Both services can be run with the `npm run start` command, and tested with `npm test` (tests do not need a database nor a mail server).

If you do not have a mail server at hand, `node shared/testing/fakeSmtp.js 2525` starts a fake one that prints every login code it receives.

# Available services

-   `authentication-service`: Completes the login process by sending a code via e-mail, and generating a jwt token once the e-mail is validated.
-   `documents-service`: Allows to perform basic CRUD operations to a set of database schemas while ensuring that specific permission rules are meet.
-   `shared`: HTTP, CORS and JWT helpers used by both services, written only with Node.js built-in modules.

## Dependencies

The services are intentionally small and only depend on:

-   [`mongodb`](https://www.npmjs.com/package/mongodb), the official MongoDB driver (both services).
-   [`nodemailer`](https://www.npmjs.com/package/nodemailer), to send the login e-mails (authentication service).

Everything else (HTTP server and routing, CORS, JSON parsing, JWT signing and verification, tests) relies on Node.js itself.

Previous versions were built on top of [`docky`](https://github.com/oegea/docky) and Express. The current implementation keeps exactly the same HTTP API, token format, environment variables and database layout, so it is a drop-in replacement: any version of the Passager frontend works with any version of the backend, and existing data and sessions remain valid after upgrading (or downgrading). The test suites replay the requests of the frontend and compare every answer with the ones recorded from the original services (`test/golden.json`).

## Security notes

-   `COMMON_TOKEN_SECRET` is mandatory: services refuse to start without it. Use a long random value.
-   The authentication service is designed to be placed behind a reverse proxy.
-   Search requests only accept plain `field: value` conditions. MongoDB operators are rejected.

# Reasons to build this

This project's unique mission is to replace firebase as the default backend for Passager Password Manager.

Before developing this project, Passager was able both to store passwords locally using localStorage, and in the cloud by using firebase as the main backend.

Unfortunatelly, Firebase was not the ideal solution when compiling Passager as a mobile app using Capacitor, as the Firebase web SDK is not 100% compatible and the login process doesn't work without requiring third party plugins that are complex to configure.

This set of basic web services offer a way to use Passager remotely, even when it is compiled as a mobile app.

Additionally, with this new approach each organization is able to serve these services and maintain their own database and infrastructure, so maintainers of Passager does not need to maintain and be responsible for a set of centralized systems, which allow the maintainers to focus their efforts in Passager's Open Source development, instead of focusing them on offering a high-available service and comply with data processing laws and regulations.

# File storage

Besides the original API, the documents service stores files for the folders of Passager:

-   `GET /capabilities` announces what this version supports (`{ "files": { "maxBytes", "chunkBytes" } }`). Versions before this one do not have the endpoint, and the web application then keeps files small enough to travel inside an item.
-   A file is a document of the `files` collection (`folder`, `owner`) and its content is uploaded as documents of `fileChunks` (`file`, `index`, `data`), each within the 100 KB request limit. The web application encrypts every piece before sending it.
-   Whoever can access a folder can access its files. Files and pieces can not be modified, and the pieces are removed with the file.
-   `DOCS_MAX_FILE_BYTES` sets the largest file accepted (50 MB by default).

