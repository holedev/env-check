# Decision Log

This file records architectural and implementation decisions using a list format.
2025-06-28 15:46:26 - Initial creation

## Framework Selection
### Decision
* Next.js 15 with App Router as the primary framework

### Rationale
* Modern React framework with built-in performance optimizations
* App Router provides more intuitive routing structure
* Better support for server-side rendering and API routes
* Strong TypeScript integration

### Implementation Details
* Using App Router for routing structure
* Implementing server-side error handling
* Utilizing built-in loading states
* TypeScript for type safety

## UI Architecture
### Decision
* Customized shadcn/ui components with Tailwind CSS

### Rationale
* High-quality, accessible component base
* Tailwind CSS for efficient styling
* Easy customization and maintenance
* Consistent design system

### Implementation Details
* Custom UI component library structure in /components
* Separate custom and base UI components
* Theme toggle implementation
* Responsive design considerations

## Development Tooling
### Decision
* Comprehensive tooling setup with Biome, Commitlint, Husky, and Jest

### Rationale
* Ensures code quality and consistency
* Automated testing and validation
* Standardized commit messages
* Git hooks for pre-commit checks

### Implementation Details
* Biome for linting and formatting
* Jest configuration for testing
* Husky setup for git hooks
* Commitlint rules implementation

## Internationalization
### Decision
* Built-in i18n support for English and Vietnamese

### Rationale
* Multi-language support from the start
* Scalable translation system
* Better user experience for different regions

### Implementation Details
* Translation files in /configs/messages
* Language selection component
* Default language handling
* Dynamic content translation