# ===================================
# TestCentral - Production Dockerfile
# ===================================

# Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --silent

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ===================================
# Production stage
# ===================================
FROM node:18-alpine AS production

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S testcentral -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --silent

# Copy built application from builder stage
COPY --from=builder --chown=testcentral:nodejs /app/dist ./dist

# Create data directory for future use
RUN mkdir -p /app/data && chown testcentral:nodejs /app/data

# Switch to non-root user
USER testcentral

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --version || exit 1

# Start the application
CMD ["npm", "start"]
