FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install all dependencies (including workspaces)
RUN npm ci

# Copy source code
COPY client ./client
COPY server ./server

# Build client and generate Prisma client
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
