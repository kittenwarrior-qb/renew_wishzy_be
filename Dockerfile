# ===============================
# Stage 1: Build stage
# ===============================
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependencies files
COPY package*.json ./

# Install all dependencies (dev + prod) for build
RUN npm install

# Copy source code
COPY . .

# Build the project (NestJS)
RUN npm run build

# ===============================
# Stage 2: Production stage
# ===============================
FROM node:18-alpine AS production

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only package.json for production dependencies
COPY package*.json ./

# Install production dependencies only
RUN npm install --production && npm cache clean --force

# Copy build output from builder
COPY --from=builder /app/dist ./dist

# Adjust ownership
RUN chown -R nestjs:nodejs /app

# Use non-root user
USER nestjs

# Expose application port
EXPOSE 8000

# Healthcheck for container
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/api/v1/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1)) || process.exit(1)"

# Start application
CMD ["node", "dist/main.js"]
