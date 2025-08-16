# Task Completion Workflow

## Required Steps After Code Changes

### 1. Linting
```bash
npm run lint
```
Run ESLint to check for code quality issues and Next.js best practices

### 2. Type Checking
TypeScript compilation is handled automatically by Next.js, but you can verify by running:
```bash
npm run build
```
This will catch any TypeScript errors during the build process

### 3. Testing
**Note**: No testing framework is currently configured in this project. Consider adding:
- Jest + React Testing Library for unit/integration tests
- Playwright or Cypress for E2E tests

### 4. Build Verification
```bash
npm run build
```
Ensure the production build completes successfully

## Development Workflow
1. Make code changes
2. Development server auto-reloads (`npm run dev`)
3. Test changes in browser
4. Run `npm run lint` to check code quality
5. Commit changes with descriptive messages

## Pre-commit Checklist
- [ ] Code follows existing TypeScript and React patterns
- [ ] ESLint passes without errors
- [ ] Build completes successfully
- [ ] Changes tested in development server
- [ ] Commit message is descriptive

## Notes
- Hot reload is automatic in development mode
- TypeScript errors will show in development console
- Next.js provides built-in optimization for production builds