FROM node:16 AS build

# Copy package.json and package-lock.json
WORKDIR /usr/src/app
COPY ./package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the bundle
RUN npm run build:web

FROM ubuntu:22.04 AS production

RUN apt-get update && apt-get install -y nginx && rm /var/www/html/index.nginx-debian.html

# Copy nginx config
COPY ./nginx.conf /etc/nginx/sites-available/default

# Copy the bundle from the build stage
COPY --from=build /usr/src/app/build /var/www/html

# Expose default ports
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]