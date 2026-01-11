# Deploying to Vercel

This guide will walk you through deploying the AI Data Center Simulator to Vercel.

## Prerequisites

1. **GitHub Account** - You'll need a GitHub account
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Git** - Ensure Git is installed on your system

## Step 1: Initialize Git Repository (if not already done)

```bash
# Navigate to your project directory
cd "C:\Users\anile\OneDrive\Documents\Coding\DataCenterWebSimulator"

# Initialize git (skip if already initialized)
git init

# Create .gitignore if it doesn't exist
```

## Step 2: Create .gitignore

Create a `.gitignore` file in your project root with the following content:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Misc
.DS_Store
*.pem
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Vercel
.vercel
