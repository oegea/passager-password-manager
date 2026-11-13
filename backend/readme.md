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

The HTTP API, token format, environment variables and database layout are stable: any version of the Passager web application works with any version of the backend, and existing data and sessions remain valid after upgrading (or downgrading). The test suites replay the requests of the web application and compare every answer with the ones recorded from earlier releases (`test/golden.json`), so do not edit that file by hand.

## Security notes

-   `COMMON_TOKEN_SECRET` is mandatory: services refuse to start without it. Use a long random value.
-   The authentication service is designed to be placed behind a reverse proxy.
-   Search requests only accept plain `field: value` conditions. MongoDB operators are rejected.

# Reasons to build this

Passager can store everything in the browser, which is enough for personal use. Teams need more: the same passwords on every device and folders shared between people.

This set of small web services offers that, and each organization serves them with its own database and infrastructure. Nobody depends on a centralized service, and the maintainers of Passager can focus on its Open Source development instead of running a high-availability service and handling other people's data.

The services never see anything readable: passwords, the content of every other item, files and folder keys are encrypted by the web application before being sent.

# File storage

Besides the original API, the documents service stores files for the folders of Passager:

-   `GET /capabilities` announces what this version supports (`{ "files": { "maxBytes", "chunkBytes" } }`). Versions before this one do not have the endpoint, and the web application then keeps files small enough to travel inside an item.
-   A file is a document of the `files` collection (`folder`, `owner`) and its content is uploaded as documents of `fileChunks` (`file`, `index`, `data`), each within the 100 KB request limit. The web application encrypts every piece before sending it.
-   Whoever can access a folder can access its files. Files and pieces can not be modified, and the pieces are removed with the file.
-   `DOCS_MAX_FILE_BYTES` sets the largest file accepted (50 MB by default).

