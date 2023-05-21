FROM node:16

# Create app directory
WORKDIR /usr/src/app

RUN mkdir -p /usr/src/app/authentication-service
RUN mkdir -p /usr/src/app/documents-service

# Install app dependencies
COPY ./authentication-service/package*.json ./authentication-service
COPY ./documents-service/package*.json ./documents-service

WORKDIR /usr/src/app/authentication-service
RUN npm install

WORKDIR /usr/src/app/documents-service
RUN npm install

# Bundle app source
WORKDIR /usr/src/app
COPY ./authentication-service ./authentication-service
COPY ./documents-service ./documents-service
COPY ./.env ./.env

WORKDIR /usr/src/app/authentication-service
RUN export TERM=linux && npm run build

WORKDIR /usr/src/app/documents-service
RUN export TERM=linux && npm run build

WORKDIR /usr/src/app

# EXPOSE 3001 and 3002
EXPOSE 3001
EXPOSE 3002

RUN npm install -g forever

# Now run npm run start:background on both folders
WORKDIR /usr/src/app/
CMD cd ./authentication-service/;npm run start;cd ../documents-service/;npm run start
