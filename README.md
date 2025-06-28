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

## Usage

1. Select a service from the dashboard
2. Paste your API key
3. Get instant validation results

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
pnpm lint:fix    # Fix linting issues
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Adding New Service Support

1. Add service configuration in `constants/tool.ts`
2. Create new service component in `app/tools/[category]/[service]`
3. Implement key validation logic
4. Add i18n strings
5. Update tests (if needed)

## License

[GNU GPLv3](LICENSE)
