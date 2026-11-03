# env-check

A developer tool for quickly validating API keys across multiple popular services. Stop wondering if your API keys are working - just paste and check!

**Live:** https://envcheck.vercel.app

## Features

- 🔑 Instant API key validation across AI, cloud, database, messaging and analytics services
- 🚀 Clean, modern interface built with Next.js
- 🔒 Validation runs in Next.js Server Actions - keys go only to the service being checked, and nothing is stored
- 🛡️ Strict security headers (CSP, HSTS, frame-ancestors) out of the box
- 🌙 Dark/Light mode support
- 🌍 i18n support (English/Vietnamese)

## Quick Start

Prerequisites: [mise](https://mise.jdx.dev) (provides the pinned Node and pnpm — versions live in `mise.toml`) and Git.

```bash
# Install the toolchain (Node + pnpm) from mise.toml
mise install

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
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fholedev%2Fenv-check)

Set `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-domain.com`) on your own deployment so canonical URLs, Open Graph tags and `sitemap.xml` point at your domain instead of `https://envcheck.vercel.app`.

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
pnpm lint:fix    # Run Biome formatter and linter
```

## Contributing

We welcome contributions! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting a pull request.

## License

[GNU GPLv3](LICENSE)
