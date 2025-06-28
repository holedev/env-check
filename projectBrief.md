# Project Brief: Integrated Tools Hub

## Overview

This is a modern web application built with Next.js that serves as a centralized hub for various developer tools and integrations. This is a developer tool for quickly validating API keys across multiple popular services. Stop wondering if your API keys are working - just paste and check!

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Components**: Customized shadcn/ui components
- **Styling**: Tailwind CSS
- **Code Quality**:
  - Biome (Linting/Formatting)
  - Commitlint
  - Husky (Git Hooks)
  - Jest (Testing)
- **Development**: Docker containerization
- **Internationalization**: Built-in i18n support (English, Vietnamese)

## Key Features

### Tool Categories
- AI Tools (Google Gemini integration)
- Analytics
- Cloud Services
- Database Tools
- Messaging Systems
- Payment Solutions
- Other Utilities

### Core Components
- **Custom UI Components**:
  - BaseLayout
  - Header with Theme Toggle
  - Sidebar Navigation
  - Tool-specific Components
- **Interactive Features**:
  - Search Command Interface
  - Language Selection
  - Dark/Light Theme Toggle
  - Responsive Design
  - Paste-enabled Input Components

### Architecture Highlights
- App Router-based routing structure
- Server-side error handling
- Global loading states
- Custom hook implementations
- Type-safe responses

## Setup & Development

1. **Prerequisites**:
   - Node.js (version specified in .nvmrc)
   - pnpm package manager
   - Docker (optional, for containerized development)

2. **Installation**:
   ```bash
   pnpm install
   ```

3. **Development**:
   ```bash
   pnpm dev
   ```

4. **Testing**:
   ```bash
   pnpm test
   ```

5. **Docker Setup** (Optional):
   ```bash
   docker-compose up
   ```

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── tools/           # Tool-specific pages
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── custom/         # Custom components
│   └── ui/             # UI component library
├── configs/            # Configuration files
├── constants/          # Constant definitions
├── hooks/              # Custom React hooks
├── lib/               # Utility libraries
├── public/            # Static assets
├── test/              # Test files
├── types/             # TypeScript types
└── utils/             # Utility functions
```

## Contributing

See CONTRIBUTING.md for contribution guidelines.

## License

This project is licensed under the terms specified in LICENSE file.