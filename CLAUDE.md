# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ReportBuilder is a Next.js 15 web application built with React 19, TypeScript, and Tailwind CSS v4. This is currently a fresh project created from the Next.js template and is ready for report-building functionality development.

## Key Development Commands

### Development Workflow
```bash
# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### Alternative Package Managers
The project supports npm, yarn, pnpm, or bun. Use any of these:
- `npm run dev` / `yarn dev` / `pnpm dev` / `bun dev`

## Architecture & Structure

### Next.js App Router Structure
- `app/` - Next.js App Router directory (not Pages Router)
- `app/layout.tsx` - Root layout with Geist fonts and global styles
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles with Tailwind CSS and CSS custom properties
- `public/` - Static assets (SVG icons)

### Key Architectural Patterns
- **React Server Components** - Default components are server-side
- **Font Optimization** - Uses `next/font/google` with CSS variables
- **Path Aliases** - `@/*` configured for project root imports
- **Theme System** - CSS custom properties with automatic dark mode

## Code Style & Conventions

### TypeScript Configuration
- Strict mode enabled
- ES2017 target
- Bundler module resolution
- JSX preserve mode (processed by Next.js)


### React Patterns
```typescript
// Component structure
export default function ComponentName() {
  return (
    // JSX content
  );
}

// Props pattern
export default function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Component logic
}

// Metadata export for pages
export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description",
};
```

### CSS/Styling Conventions
- **Tailwind CSS v4** - Utility-first approach with responsive design
- **CSS Variables** - Use for theming (--background, --foreground, etc.)
- **Font Variables** - `--font-geist-sans`, `--font-geist-mono`
- **Dark Mode** - Automatic via `prefers-color-scheme`

## Feature Registry System - MANDATORY

**CRITICAL REQUIREMENT**: All new features MUST be registered in the Feature Registry System before implementation to prevent UI/functionality gaps.

### Feature Registration Rules
1. **Before implementing any new feature**: Register it in the Feature Registry (`/features` page)
2. **Update status as you progress**: Keep feature status current during development
3. **Mark validation checkboxes**: Update validation as you complete each aspect
4. **Cannot mark complete**: Unless all validation criteria are met (UI + backend + tests)

### Feature Registry Workflow
```bash
# Access the Feature Registry Dashboard
# Navigate to /features in your browser during development

1. Register feature BEFORE coding
2. Set status to "in_progress" when starting
3. Update validation checkboxes as you progress:
   - hasFunctionalBackend: true (when backend is complete)
   - hasCompleteUI: true (when UI is complete)
   - hasTestCoverage: true (when tests are added)
   - hasDocumentation: true (when documented)
   - passesAcceptanceCriteria: true (when criteria met)
4. Set status to "complete" only when ALL validation is true
```

### Preventing UI/Functionality Gaps
- **UI-Only Features**: Features with UI but no backend will show ⚠️ warnings
- **Mandatory Validation**: Cannot mark features complete without meeting all criteria
- **Real-time Tracking**: Dashboard shows features needing attention
- **Status Progression**: Clear progression from planned → in_progress → functional → testing → complete

## Task Completion Workflow

After making changes, always run:

1. **Update Feature Registry**: Update feature status and validation checkboxes
2. **Lint the code**: `npm run lint`
3. **Verify build**: `npm run build` (catches TypeScript errors)
4. **Test in development**: `npm run dev` and verify in browser
5. **Validate features**: Check Feature Registry for any UI-only warnings

### Notes
- No testing framework currently configured
- Hot reload is automatic in development
- TypeScript errors show in development console
- ESLint uses Next.js core-web-vitals and TypeScript rules
- **Feature Registry is mandatory** - prevents incomplete implementations

## UI Implementation Rules
### ShadCN Usage Rule
When asked to use shadcn components, use the MCP server.

### Planning Rule
When asked to plan using anything related to shadcn:

Use the MCP server during planning
Apply components wherever components are applicable

### Implementation Rule
When implementing:

First call the demo tool to see how it is used
Then implement it so that it is implemented correctly
Also install the components. Dont write the files yourself.

## Project Documentation

### Key Project Files
- **`TODO.md`** - Current development tasks and project roadmap
- **`UX-UI-Implementation-Plan.md`** - Comprehensive UI/UX design specifications
- **`prd/prd.md`** - Product Requirements Document with full project specifications

### Development Status
- **Phase 1 Complete**: Foundation UI components and layout system
- **Current Phase**: Core drag-and-drop functionality implementation
- **Next Milestone**: Functional component manipulation and data binding

## Technology Stack
- **Framework**: Next.js 15.4.6 (App Router)
- **UI Library**: React 19.1.0, Tailwind CSS v4, ShadCN
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + PostCSS
- **Fonts**: Geist Sans & Geist Mono
- **Linting**: ESLint with Next.js config
- **Package Manager**: npm (supports yarn/pnpm/bun)
- **Drag & Drop**: @dnd-kit/core
- **State Management**: React useState (Zustand planned for complex state)
- **Animations**: Framer Motion
- At session start read UX-UI-Implementation-Plan.md