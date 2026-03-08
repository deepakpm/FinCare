FROM node:20-alpine

WORKDIR /app

# Install a simple static file server globally (must be done as root)
RUN npm install -g serve

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Change ownership of the working directory to the 'node' user
RUN chown -R node:node /app

# Switch to the non-root user
USER node

# Expose port (default for serve is 3000)
EXPOSE 3000

# Start the server
CMD ["serve", "-s", "dist", "-l", "3000"]
