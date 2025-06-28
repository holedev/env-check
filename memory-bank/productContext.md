# Product Context

This file provides a high-level overview of the project and the expected product that will be created. This content is initially based on projectBrief.md.
2025-06-28 15:44:35 - Initial creation based on projectBrief.md

## Project Goal

* Create a modern web application that serves as a centralized hub for various developer tools and integrations
* Primary focus: Quick validation of API keys across multiple popular services
* Target users: Developers who need to verify API key functionality

## Key Features

### Tool Categories
* AI Tools (Google Gemini integration)
* Analytics
* Cloud Services
* Database Tools
* Messaging Systems
* Payment Solutions
* Other Utilities

### Core Components
* Custom UI Components:
  - BaseLayout
  - Header with Theme Toggle
  - Sidebar Navigation
  - Tool-specific Components
* Interactive Features:
  - Search Command Interface
  - Language Selection (English, Vietnamese)
  - Dark/Light Theme Toggle
  - Responsive Design
  - Paste-enabled Input Components

## Overall Architecture

* Framework: Next.js 15 (App Router)
* Language: TypeScript
* UI Components: Customized shadcn/ui components
* Styling: Tailwind CSS
* Code Quality Tools:
  - Biome (Linting/Formatting)
  - Commitlint
  - Husky (Git Hooks)
  - Jest (Testing)
* Development: Docker containerization
* Internationalization: Built-in i18n support
* Key Architectural Features:
  - App Router-based routing
  - Server-side error handling
  - Global loading states
  - Custom hook implementations
  - Type-safe responses