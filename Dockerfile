FROM node:20-bookworm-slim AS build

WORKDIR /usr/src/app

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

# Copy manifest and lockfile
COPY ./package.json ./pnpm-lock.yaml ./pnpm-workspace.yaml ./

# Install dependencies (frozen lockfile for reproducibility)
RUN pnpm install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Build the bundle
RUN pnpm run build:web

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
