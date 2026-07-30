FROM node:20-alpine AS base

WORKDIR /app

# Dependencies
COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Source code
COPY . .

EXPOSE 3000

# Development mode
CMD ["npm", "run", "dev"]
