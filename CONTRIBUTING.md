# Contributing to env-check

Thank you for your interest in contributing to env-check! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Prerequisites**
   - Node.js (version specified in `.nvmrc`)
   - pnpm (recommended package manager)
   - Git

2. **Local Development**
   ```bash
   # Clone the repository
   git clone https://github.com/holedev/env-check.git
   cd env-check

   # Install dependencies
   pnpm install

   # Start development server
   pnpm dev
   ```

## Development Standards

### AI Assistance

We use [Roo Code with Memory Bank](https://github.com/GreatScottyMac/roo-code-memory-bank) to accelerate development workflows and maintain code consistency. You can access the memory bank for this project at folder `./memory-bank`.

### Code Style

We use Biome for formatting and linting with the following key rules:
- 2 space indentation
- 120 character line width
- Double quotes for JavaScript strings
- Single quotes for JSX attributes

To check and fix formatting:
```bash
pnpm check:fix
```

### Adding New Service Support

- Check steps by steps in [TOOL_TODO.md](TOOL_TODO.md).

### Security Considerations
- Never store API keys on the server
- All validation must happen client-side
- Handle errors appropriately using `handleErrorServerNoAuth`

## Git Workflow

### Commit Messages

Follow conventional commits:
```bash
git commit -m "feat: add support for new-service validation"
```

### Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Keep changes focused and atomic
4. Reference any related issues

## Getting Help

- Create an issue for bugs or feature requests
- Questions? Use the Discussions tab
- Security concerns? Report privately to maintainers