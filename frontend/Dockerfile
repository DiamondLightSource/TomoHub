FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# Copy the built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and process the runtime config file
COPY config.js.template /usr/share/nginx/html/config.js

# Replace environment variables in config.js at runtime
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/config.js > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
