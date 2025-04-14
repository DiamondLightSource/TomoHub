FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --force 
COPY . .
RUN npm run build 

FROM nginx:stable-alpine

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy config.js.template correctly
COPY public/config.js.template /usr/share/nginx/html/config.js.template

# Ensure envsubst replaces variables at runtime
CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js && cat /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
