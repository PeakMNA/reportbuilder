# Coding Style and Conventions

## TypeScript Configuration
- **Target**: ES2017
- **Strict Mode**: Enabled
- **JSX**: preserve (processed by Next.js)
- **Module Resolution**: bundler
- **Path Aliases**: `@/*` maps to project root

## Code Style Patterns (from existing code)
- **Function Components**: Default export arrow functions with TypeScript
- **Props**: Uses `Readonly<{}>` wrapper for immutable props
- **Imports**: ES6 modules with type imports when needed
- **File Naming**: kebab-case for config files, PascalCase for React components

## React/Next.js Conventions
- **Component Structure**: Functional components with TypeScript
- **Layout Pattern**: RootLayout component with children prop pattern
- **Metadata**: Export const metadata for page metadata
- **Font Loading**: Uses next/font/google with CSS variables
- **Image Optimization**: Uses Next.js Image component with optimization

## CSS/Styling Conventions
- **Tailwind Classes**: Utility-first approach with responsive prefixes
- **CSS Variables**: Uses CSS custom properties for theming
- **Font Variables**: CSS variables for font families (--font-geist-sans, --font-geist-mono)
- **Dark Mode**: Prefers-color-scheme media query for automatic theme switching

## ESLint Configuration
- Uses Next.js core-web-vitals and TypeScript rules
- Flat config format (eslint.config.mjs)
- Compatible with Next.js 15 standards

## Current Quality Standards
- TypeScript strict mode enforcement
- ESLint integration with Next.js best practices
- No testing framework currently configured
- No additional code formatting tools (Prettier) detected