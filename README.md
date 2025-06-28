# env-check

A developer tool for quickly validating API keys across multiple popular services. Stop wondering if your API keys are working - just paste and check!

## Features

- 🔑 Instant API key validation for 15+ popular services
- 🚀 Clean, modern interface built with Next.js
- 🔒 Client-side only - your API keys never touch our servers
- 🌙 Dark/Light mode support
- 🌍 i18n support (English/Vietnamese)

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## Docker

```bash
# Run using the pre-built image
docker run -d \
  --name env-check \
  -p 3000:3000 \
  holedev/env-check

# Access the application at http://localhost:3000
```

You can also stop and remove the container:
```bash
# Stop the container
docker stop env-check

# Remove the container
docker rm env-check
```

## Vercel Deployment
You can deploy this application to Vercel with a single click:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fhole-dev%2Fenv-check)

## Development

This project uses:
- Next.js with TypeScript
- Tailwind CSS for styling
- Biome for formatting and linting
- Conventional commits with Husky hooks

Available commands:
```bash
pnpm dev         # Start development server
pnpm build       # Build for production
pnpm test        # Run tests
pnpm check:fix    # Run Biome formatter and linter
```

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

[GNU GPLv3](LICENSE)
