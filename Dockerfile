# ------------------------------
# Stage 1: Build
# ------------------------------
    FROM node:20.11.1 AS builder

    # Enable corepack and pnpm
    RUN corepack enable
    
    # Set working directory
    WORKDIR /app
    
    # Copy package files
    COPY package.json pnpm-lock.yaml* ./
    
    # Install dependencies (no frozen lockfile!)
    RUN pnpm install --no-frozen-lockfile
    
    # Copy the rest of the source
    COPY . .
    
    # Build the app
    RUN pnpm run build
    
    # ------------------------------
    # Stage 2: Runtime
    # ------------------------------
    FROM node:20.11.1
    
    WORKDIR /app
    
    # Enable corepack and pnpm (in case you need runtime scripts)
    RUN corepack enable
    
    # Copy only necessary files from builder
    COPY --from=builder /app /app
    
    # Expose port (Heroku/Koyeb expect $PORT env variable)
    EXPOSE 3000
    
    # Start the app
    CMD ["node", "index.js"]
    