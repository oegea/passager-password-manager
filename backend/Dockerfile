FROM node:16

# Install dependencies for authentication service
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/authentication-service
COPY ./authentication-service/package*.json ./authentication-service
WORKDIR /usr/src/app/authentication-service
RUN npm install

# Install dependencies for documents service
WORKDIR /usr/src/app
RUN mkdir -p /usr/src/app/documents-service
COPY ./documents-service/package*.json ./documents-service
WORKDIR /usr/src/app/documents-service
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

# Expose default ports
EXPOSE 3001
EXPOSE 3002

# Install globally required dependencies
RUN npm install -g forever

# Change to the main workdir
WORKDIR /usr/src/app

# Execute run.sh which will run both services
CMD ["/bin/bash", "./run.sh"]
