# Stage 1: Build & Runtime for QuickKart Node.js Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy entire backend source code
COPY . .

# Expose default port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start server
CMD ["node", "server.js"]
