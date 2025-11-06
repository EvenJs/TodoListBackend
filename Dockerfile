# Use Node 20 official image
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 4000

# Run backend with tsx
CMD ["npx", "tsx", "src/app.ts"]
