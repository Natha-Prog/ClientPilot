FROM node:18-alpine

WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm install

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm install
COPY client ./client
RUN cd client && npm run build

# Install server dependencies and generate Prisma client
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server ./server
RUN cd server && npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "server/src/index.js"]
