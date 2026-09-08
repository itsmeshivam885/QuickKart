# Stage 1: Build the React Application with Vite
FROM node:20-alpine AS build

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build
COPY . .
ARG VITE_API_URL=https://quickkart-ollt.onrender.com
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve static production assets with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled build output from Stage 1
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
