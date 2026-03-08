FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Change ownership to the 'node' user
RUN chown -R node:node /app

# Switch to the non-root user
USER node

# Expose the API port
EXPOSE 3001

# Start the Node server
CMD ["npm", "start"]
