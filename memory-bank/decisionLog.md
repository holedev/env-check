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

## Test File Organization
### Decision
* Tool-specific tests should be co-located with their implementations in `/app/tools/` directory structure
* General/shared tests remain in root `/test/` directory

### Rationale
* Improves discoverability and maintainability of tool-specific tests
* Follows modern development practices of keeping related code together
* Scales better as more tools are added to the project
* Clear separation between shared concerns and tool-specific functionality

### Implementation Details
* Tool tests co-located: `/app/tools/{category}/{tool}/__tests__/file.test.ts(x)`
* Jest configuration updated to recognize new test patterns
* Shared tests (i18n, tool constants) remain in `/test/`
* Testing templates established for new tool development

[2025-06-28 16:07:32] - Test organization architectural decision
[2025-07-01 15:24:31] - [Secure Input Component Implementation Complete]
## UI Architecture
### Decision
* Finalized secure input component implementation with show/hide toggle for sensitive data
* Standardized usage across all tools requiring sensitive input fields

### Rationale
* Improves security by masking sensitive information by default
* Enhances user experience with visibility toggle and paste functionality
* Ensures consistent handling of sensitive data across the application
* Reduces code duplication through centralized implementation

### Implementation Details
* Enhanced `InputWithPaste` component with `hidden` prop controlling visibility
* Optimized button positioning using absolute positioning for clean UI
* Successfully implemented in all relevant tool forms:
  - Google Gemini API key input
  - GitHub authentication token input
  - S3-Compatible secret access key input
  - MongoDB connection string input
* Standardized form styling with consistent submit button alignment