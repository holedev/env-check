# System Patterns

This file documents recurring patterns and standards used in the project.
2025-06-28 15:46:58 - Initial creation

## Coding Patterns

### File Structure
* Feature-based organization in /app/tools
* Separation of UI components into custom and base
* Clear distinction between client and server components
* Consistent file naming conventions

### Component Patterns
* Client-side components suffix: `.client.tsx`
* Base components in `/components/ui`
* Custom components in `/components/custom`
* Shared layouts and templates in base components

### Type Safety
* TypeScript throughout the project
* Shared type definitions in `/types`
* Response type standardization
* Strong typing for API responses

## Architectural Patterns

### Routing
* App Router-based organization
* Feature-based routing in /tools
* Nested routing for tool categories
* Dynamic route handling

### State Management
* Server-side state management
* Client-side state isolation
* Loading state patterns
* Error boundary implementation

### API Integration
* Standardized API validation patterns
* Error handling middleware
* Response formatting utilities
* Type-safe API responses

## Testing Patterns

### Unit Testing
* Jest for test runner
* Component-level testing
* Utility function testing
* API integration testing

### Development Workflow
* Docker-based development environment
* Git hooks for quality checks
* Automated formatting and linting
* Standardized commit messages

### Code Quality
* Biome for consistent formatting
* Pre-commit hooks validation
* Commitlint message standards
* Continuous testing during development

## Test Organization Patterns

### Test File Co-location
* Tool-specific tests co-located with implementation files
* Pattern: `{filename}.test.ts` adjacent to `{filename}.ts`
* Alternative: `__tests__/` directory within tool folder
* Shared/general tests remain in root `/test/` directory

### Test File Naming
* Co-located tests: `actions.test.ts`, `form.client.test.tsx`, `page.test.tsx`
* Integration tests: `__tests__/integration.test.ts`
* API tests: `__tests__/api.test.ts`
* General tests: `/test/{feature}.test.ts`

### Test Discovery Pattern
* Jest configured to find tests in multiple locations:
  - `/test/**/*.test.ts`
  - `/app/tools/**/*.test.ts`
  - `/app/tools/**/__tests__/*.test.ts`

[2025-06-28 16:08:25] - Test organization patterns documented