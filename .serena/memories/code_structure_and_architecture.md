# Code Structure and Architecture

## Project Structure
```
reportbuilder/
├── app/                 # Next.js App Router directory
│   ├── globals.css     # Global styles with Tailwind CSS
│   ├── layout.tsx      # Root layout component
│   ├── page.tsx        # Home page component
│   └── favicon.ico     # Favicon
├── public/             # Static assets
│   ├── *.svg          # SVG icons (next, vercel, file, globe, window)
├── Configuration files:
│   ├── package.json       # Project dependencies and scripts
│   ├── tsconfig.json      # TypeScript configuration
│   ├── next.config.ts     # Next.js configuration
│   ├── eslint.config.mjs  # ESLint configuration
│   ├── postcss.config.mjs # PostCSS configuration for Tailwind
│   └── next-env.d.ts      # Next.js TypeScript definitions
```

## Architecture Patterns
- **App Router**: Uses Next.js 15 App Router structure (not Pages Router)
- **React Server Components**: Default components are server components
- **Font Optimization**: Uses `next/font/google` for optimized font loading
- **CSS Architecture**: Tailwind CSS v4 with custom CSS variables for theming
- **TypeScript**: Strict mode enabled with modern ES2017+ target

## Key Architectural Decisions
- Path alias `@/*` configured for project root imports
- CSS custom properties for theme variables (light/dark mode support)
- Geist font family as primary typography
- ESLint flat config with Next.js and TypeScript rules
- PostCSS integration for Tailwind CSS processing