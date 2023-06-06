FROM node:16 AS build

WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/authentication-service&&mkdir -p /usr/src/app/documents-service

# Install dependencies for authentication service
WORKDIR /usr/src/app/authentication-service
COPY ./authentication-service/package*.json ./
RUN npm install

# Install dependencies for documents service
WORKDIR /usr/src/app/documents-service
COPY ./documents-service/package*.json ./
RUN npm install

# Copy code, scripts and configuration files
WORKDIR /usr/src/app
COPY ./authentication-service ./authentication-service
COPY ./documents-service ./documents-service
COPY ./.env ./.env
COPY ./run.sh ./run.sh

# Build the bundle
WORKDIR /usr/src/app/authentication-service
RUN export TERM=linux && npm run build

WORKDIR /usr/src/app/documents-service
RUN export TERM=linux && npm run build

FROM node:16 AS production

# Copy the bundle from the build stage
WORKDIR /usr/src/app
COPY --from=build /usr/src/app/ ./

# Expose default ports
EXPOSE 3001
EXPOSE 3002

# Change to the main workdir
WORKDIR /usr/src/app

# Execute run.sh which will run both services
CMD ["/bin/bash", "./run.sh"]
