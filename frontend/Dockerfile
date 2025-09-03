FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
# Clear npm cache and install with no-cache
RUN npm cache clean --force
RUN npm install 

COPY . .

RUN npm run relay

RUN npm run build 

FROM nginx:stable-alpine

# Copy built React app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
