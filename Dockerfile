# Multi-stage build for React Native Expo app
# Stage 1: Build the app
FROM node:18-alpine AS builder

# Install system dependencies
RUN apk add --no-cache git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN cd backend && npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build backend
RUN cd backend && npm run build

# Build frontend for web
RUN npm run build || echo "Frontend build not configured"

# Stage 2: Production runtime
FROM node:18-alpine AS production

# Install system dependencies for production
RUN apk add --no-cache \
    curl \
    tini \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=builder --chown=nodejs:nodejs /app/backend/package.json ./backend/package.json

# Copy other necessary files
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/app.json ./
COPY --from=builder --chown=nodejs:nodejs /app/assets ./assets

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Use tini as entrypoint for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the backend server
CMD ["node", "backend/dist/server.js"]