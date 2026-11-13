FROM node:22-bookworm-slim AS build

# Enable pnpm via corepack (only needed to install dependencies)
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

WORKDIR /usr/src/app

# Install production dependencies of the authentication service
WORKDIR /usr/src/app/authentication-service
COPY ./authentication-service/package.json ./authentication-service/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-workspace

# Install production dependencies of the documents service
WORKDIR /usr/src/app/documents-service
COPY ./documents-service/package.json ./documents-service/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-workspace

# Copy code and scripts. There is no build step: services run directly on Node.js
WORKDIR /usr/src/app
COPY ./shared ./shared
COPY ./authentication-service/src ./authentication-service/src
COPY ./documents-service/src ./documents-service/src
COPY ./run.sh ./run.sh

FROM node:22-bookworm-slim AS production

ENV NODE_ENV=production

# Copy the services from the build stage
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/ ./

# Expose default ports
EXPOSE 3001
EXPOSE 3002

# Do not run as root
USER node

# Execute run.sh which will run both services
CMD ["/bin/bash", "./run.sh"]
