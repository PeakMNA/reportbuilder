# Testing Infrastructure Setup Guide

**Document Version:** 1.0  
**Date:** January 2025  
**Application:** ReportBuilder MVP 80% Complete  
**Purpose:** Step-by-step guide to implement comprehensive testing framework

---

## Quick Start

### 1. Install Testing Dependencies
```bash
# Core testing framework
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# E2E and browser testing
npm install --save-dev @playwright/test @axe-core/playwright

# API mocking and utilities
npm install --save-dev msw @types/jest ts-jest

# Performance and visual testing
npm install --save-dev lighthouse @lhci/cli bundlesize

# Coverage and reporting
npm install --save-dev @codecov/webpack-plugin
```

### 2. Configure Package.json Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:performance": "npm run lighthouse && npm run bundlesize",
    "test:accessibility": "playwright test --grep accessibility",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "lighthouse": "lighthouse http://localhost:3000/designer --output=json --output-path=./lighthouse-results.json",
    "bundlesize": "bundlesize"
  }
}
```

### 3. Create Basic Test Structure
```bash
# Create test directories
mkdir -p __tests__/components/designer
mkdir -p __tests__/integration
mkdir -p __tests__/utils
mkdir -p tests/e2e
mkdir -p tests/fixtures
mkdir -p tests/mocks

# Create configuration files
touch jest.config.js
touch jest.setup.js
touch playwright.config.ts
touch tests/mocks/server.js
```

---

## Detailed Configuration

### Jest Configuration

#### jest.config.js
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './components/designer/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testTimeout: 10000,
  maxWorkers: '50%',
}
```

#### jest.setup.js
```javascript
import '@testing-library/jest-dom'
import { server } from './tests/mocks/server'

// Enable API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock Next.js components
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock canvas operations
global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({
    data: new Array(4),
  })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => []),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock PDF generation
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addPage: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
    save: jest.fn(),
    addImage: jest.fn(),
    setTextColor: jest.fn(),
    setDrawColor: jest.fn(),
    setFillColor: jest.fn(),
    rect: jest.fn(),
    line: jest.fn(),
  }))
})

// Mock file operations
global.File = class MockFile {
  constructor(content, filename, options = {}) {
    this.content = content
    this.name = filename
    this.size = content.length
    this.type = options.type || ''
    this.lastModified = Date.now()
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.result = null
    this.error = null
    this.readyState = 0
    this.onload = null
    this.onerror = null
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.result = file.content
      this.readyState = 2
      this.onload?.({ target: this })
    }, 0)
  }
  
  readAsDataURL(file) {
    setTimeout(() => {
      this.result = `data:${file.type};base64,${btoa(file.content)}`
      this.readyState = 2
      this.onload?.({ target: this })
    }, 0)
  }
}

// Console error filter (suppress expected warnings)
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: React.createFactory') ||
     args[0].includes('act(...) is not supported'))
  ) {
    return
  }
  originalError.call(console, ...args)
}
```

### MSW Server Setup

#### tests/mocks/server.js
```javascript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

#### tests/mocks/handlers.js
```javascript
import { rest } from 'msw'

export const handlers = [
  // Template API endpoints
  rest.post('/api/templates', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        id: 'template-123',
        name: req.body.name,
        success: true,
        createdAt: new Date().toISOString(),
      })
    )
  }),
  
  rest.get('/api/templates', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Financial Statement Template',
          category: 'Finance',
          description: 'Standard financial reporting template',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          name: 'Quarterly Report Template',
          category: 'Reports',
          description: 'Quarterly business report template',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ])
    )
  }),
  
  rest.get('/api/templates/:id', (req, res, ctx) => {
    const { id } = req.params
    return res(
      ctx.json({
        id,
        name: 'Test Template',
        components: [
          {
            id: 'text-1',
            type: 'text',
            x: 100,
            y: 200,
            properties: { content: 'Test Content' },
          },
        ],
      })
    )
  }),
  
  // Data source endpoints
  rest.post('/api/data-sources/test-connection', (req, res, ctx) => {
    const { type, host, database } = req.body
    
    if (type === 'sql' && host && database) {
      return res(
        ctx.json({
          success: true,
          message: 'Connection successful',
          connectionId: 'conn-123',
        })
      )
    }
    
    return res(
      ctx.status(400),
      ctx.json({
        success: false,
        message: 'Invalid connection parameters',
      })
    )
  }),
  
  rest.post('/api/data-sources/preview', (req, res, ctx) => {
    return res(
      ctx.json({
        columns: ['Name', 'Value', 'Category'],
        rows: [
          ['Sample Item 1', '100', 'Type A'],
          ['Sample Item 2', '200', 'Type B'],
          ['Sample Item 3', '300', 'Type A'],
        ],
        totalRows: 3,
        dataTypes: {
          Name: 'string',
          Value: 'number',
          Category: 'string',
        },
      })
    )
  }),
  
  // CSV parsing endpoint
  rest.post('/api/parse-csv', (req, res, ctx) => {
    return res(
      ctx.json({
        columns: ['Product', 'Price', 'Category'],
        rows: [
          ['Laptop', '999.99', 'Electronics'],
          ['Mouse', '29.99', 'Electronics'],
          ['Desk', '299.99', 'Furniture'],
        ],
        totalRows: 3,
        errors: [],
      })
    )
  }),
  
  // PDF generation endpoint
  rest.post('/api/generate-pdf', (req, res, ctx) => {
    // Simulate processing time
    return res(
      ctx.delay(1000),
      ctx.set('Content-Type', 'application/pdf'),
      ctx.set('Content-Disposition', 'attachment; filename="report.pdf"'),
      ctx.body(new ArrayBuffer(1000)) // Mock PDF data
    )
  }),
  
  // File upload endpoint
  rest.post('/api/upload', (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        fileId: 'file-123',
        url: '/uploads/file-123.csv',
      })
    )
  }),
  
  // Error simulation endpoint
  rest.get('/api/error-test', (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal server error',
        message: 'Simulated error for testing',
      })
    )
  }),
]
```

### Playwright Configuration

#### playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

---

## Test Fixtures and Utilities

### Test Fixtures

#### tests/fixtures/components.ts
```typescript
import type { Component } from '@/types/component'

export const mockTextComponent: Component = {
  id: 'text-1',
  type: 'text',
  name: 'Text Component 1',
  x: 100,
  y: 200,
  width: 200,
  height: 40,
  properties: {
    content: 'Sample Text',
    fontSize: 14,
    fontWeight: 'normal',
    color: '#000000',
    alignment: 'left',
  },
}

export const mockTableComponent: Component = {
  id: 'table-1',
  type: 'table',
  name: 'Table Component 1',
  x: 100,
  y: 300,
  width: 400,
  height: 200,
  properties: {
    columns: ['Name', 'Value', 'Category'],
    rows: 5,
    showHeader: true,
    borderStyle: 'solid',
    dataSource: null,
  },
}

export const mockTemplate = {
  id: 'template-1',
  name: 'Test Template',
  description: 'Template for testing purposes',
  category: 'Test',
  components: [mockTextComponent, mockTableComponent],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

export const createMockComponent = (overrides: Partial<Component>): Component => ({
  ...mockTextComponent,
  ...overrides,
  id: overrides.id || `component-${Date.now()}`,
})
```

#### tests/fixtures/data.ts
```typescript
export const mockCSVData = `Name,Age,Department,Salary
John Doe,30,Engineering,75000
Jane Smith,28,Marketing,65000
Bob Johnson,35,Sales,70000
Alice Brown,32,Engineering,80000`

export const mockFinancialData = [
  { account: 'Cash', amount: 150000, category: 'Assets' },
  { account: 'Accounts Receivable', amount: 85000, category: 'Assets' },
  { account: 'Inventory', amount: 120000, category: 'Assets' },
  { account: 'Accounts Payable', amount: 45000, category: 'Liabilities' },
  { account: 'Revenue', amount: 500000, category: 'Income' },
  { account: 'Expenses', amount: 350000, category: 'Expenses' },
]

export const createLargeDataset = (rowCount: number) => {
  const headers = ['ID', 'Name', 'Department', 'Salary', 'Start Date']
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance']
  
  const rows = Array.from({ length: rowCount }, (_, i) => [
    i + 1,
    `Employee ${i + 1}`,
    departments[i % departments.length],
    Math.floor(Math.random() * 100000) + 30000,
    new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
  ])
  
  return { headers, rows }
}
```

### Test Utilities

#### tests/utils/test-helpers.ts
```typescript
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { DndContext } from '@dnd-kit/core'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <DndContext>
      {children}
    </DndContext>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper functions
export const waitForComponentToRender = async (testId: string) => {
  const { findByTestId } = render(<div />)
  return await findByTestId(testId)
}

export const dragAndDrop = async (user: any, source: HTMLElement, target: HTMLElement, position?: { x: number; y: number }) => {
  await user.pointer([
    { keys: '[MouseLeft>]', target: source },
    { coords: position || { x: 100, y: 100 }, target: target },
    { keys: '[/MouseLeft]' },
  ])
}

export const createMockFile = (content: string, filename: string, type: string = 'text/plain') => {
  return new File([content], filename, { type })
}

export const mockLocalStorage = () => {
  const storage: { [key: string]: string } = {}
  
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => {
      storage[key] = value
    },
    removeItem: (key: string) => {
      delete storage[key]
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key])
    },
  }
}

// Performance testing helpers
export const measureRenderTime = (renderFn: () => void) => {
  const start = performance.now()
  renderFn()
  return performance.now() - start
}

export const waitForStablePerformance = async (testFn: () => Promise<number>, iterations: number = 5) => {
  const times = []
  
  for (let i = 0; i < iterations; i++) {
    const time = await testFn()
    times.push(time)
  }
  
  const average = times.reduce((a, b) => a + b, 0) / times.length
  const variance = times.reduce((a, b) => a + Math.pow(b - average, 2), 0) / times.length
  
  return { average, variance, times }
}
```

---

## Example Test Files

### Unit Test Example

#### __tests__/components/designer/report-designer.test.tsx
```typescript
import { render, screen, waitFor } from '@/tests/utils/test-helpers'
import userEvent from '@testing-library/user-event'
import { ReportDesigner } from '@/components/designer/report-designer'

describe('ReportDesigner', () => {
  beforeEach(() => {
    // Reset any global state before each test
    localStorage.clear()
  })

  test('renders all main panels on load', () => {
    render(<ReportDesigner />)
    
    expect(screen.getByRole('region', { name: /component palette/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /design canvas/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /properties panel/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /data preview/i })).toBeInTheDocument()
  })

  test('adds component to canvas via drag and drop', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    const textComponent = screen.getByTestId('palette-text-component')
    const canvas = screen.getByTestId('design-canvas')
    
    await user.pointer([
      { keys: '[MouseLeft>]', target: textComponent },
      { coords: { x: 200, y: 300 }, target: canvas },
      { keys: '[/MouseLeft]' },
    ])
    
    await waitFor(() => {
      expect(screen.getByTestId(/component-text-/)).toBeInTheDocument()
    })
  })

  test('updates component properties in real-time', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add component and select it
    const textComponent = screen.getByTestId('palette-text-component')
    const canvas = screen.getByTestId('design-canvas')
    await user.pointer([
      { keys: '[MouseLeft>]', target: textComponent },
      { coords: { x: 200, y: 300 }, target: canvas },
      { keys: '[/MouseLeft]' },
    ])
    
    const addedComponent = await screen.findByTestId(/component-text-/)
    await user.click(addedComponent)
    
    // Update content property
    const contentInput = screen.getByLabelText(/content/i)
    await user.clear(contentInput)
    await user.type(contentInput, 'Updated Text')
    
    // Verify immediate update on canvas
    expect(addedComponent).toHaveTextContent('Updated Text')
  })

  test('handles undo/redo operations correctly', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add component
    const textComponent = screen.getByTestId('palette-text-component')
    const canvas = screen.getByTestId('design-canvas')
    await user.pointer([
      { keys: '[MouseLeft>]', target: textComponent },
      { coords: { x: 200, y: 300 }, target: canvas },
      { keys: '[/MouseLeft]' },
    ])
    
    const addedComponent = await screen.findByTestId(/component-text-/)
    expect(addedComponent).toBeInTheDocument()
    
    // Undo addition
    await user.keyboard('{Control>}z{/Control}')
    await waitFor(() => {
      expect(screen.queryByTestId(/component-text-/)).not.toBeInTheDocument()
    })
    
    // Redo addition
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    await waitFor(() => {
      expect(screen.getByTestId(/component-text-/)).toBeInTheDocument()
    })
  })
})
```

### Integration Test Example

#### __tests__/integration/template-workflow.test.tsx
```typescript
import { render, screen, waitFor } from '@/tests/utils/test-helpers'
import userEvent from '@testing-library/user-event'
import { ReportDesigner } from '@/components/designer/report-designer'
import { mockTemplate } from '@/tests/fixtures/components'

describe('Template Management Workflow', () => {
  test('complete save and load template cycle', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Create a simple report
    const textComponent = screen.getByTestId('palette-text-component')
    const canvas = screen.getByTestId('design-canvas')
    await user.pointer([
      { keys: '[MouseLeft>]', target: textComponent },
      { coords: { x: 200, y: 300 }, target: canvas },
      { keys: '[/MouseLeft]' },
    ])
    
    // Configure the component
    const addedComponent = await screen.findByTestId(/component-text-/)
    await user.click(addedComponent)
    
    const contentInput = screen.getByLabelText(/content/i)
    await user.clear(contentInput)
    await user.type(contentInput, 'Integration Test Text')
    
    // Save template
    await user.click(screen.getByRole('button', { name: /save template/i }))
    
    const templateNameInput = screen.getByLabelText(/template name/i)
    await user.type(templateNameInput, 'Integration Test Template')
    
    const descriptionInput = screen.getByLabelText(/description/i)
    await user.type(descriptionInput, 'Template created during integration testing')
    
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Wait for save confirmation
    await waitFor(() => {
      expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
    })
    
    // Clear the canvas
    await user.click(screen.getByRole('button', { name: /new report/i }))
    await waitFor(() => {
      expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    })
    
    // Load the saved template
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await waitFor(() => {
      expect(screen.getByText('Integration Test Template')).toBeInTheDocument()
    })
    
    await user.click(screen.getByText('Integration Test Template'))
    
    // Verify template loaded correctly
    await waitFor(() => {
      expect(screen.getByText('Integration Test Text')).toBeInTheDocument()
    })
    
    const restoredComponent = screen.getByTestId(/component-text-/)
    expect(restoredComponent).toBeInTheDocument()
    
    // Verify properties are preserved
    await user.click(restoredComponent)
    expect(screen.getByDisplayValue('Integration Test Text')).toBeInTheDocument()
  })
})
```

### E2E Test Example

#### tests/e2e/designer-workflow.spec.ts
```typescript
import { test, expect } from '@playwright/test'

test.describe('Report Designer E2E Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer')
    await page.waitForLoadState('networkidle')
  })

  test('creates and exports a complete report', async ({ page }) => {
    // Add header component
    await page.locator('[data-testid="palette-page-header"]').dragTo(
      page.locator('[data-testid="design-canvas"]'),
      { targetPosition: { x: 100, y: 50 } }
    )
    
    // Configure header
    await page.click('[data-testid^="component-page-header-"]')
    await page.fill('[aria-label="Header Text"]', 'Financial Report Q4 2024')
    
    // Add table component
    await page.locator('[data-testid="palette-table"]').dragTo(
      page.locator('[data-testid="design-canvas"]'),
      { targetPosition: { x: 100, y: 200 } }
    )
    
    // Configure table
    await page.click('[data-testid^="component-table-"]')
    await page.click('text=Data')
    await page.fill('[aria-label="Table Title"]', 'Revenue Summary')
    
    // Add footer
    await page.locator('[data-testid="palette-page-footer"]').dragTo(
      page.locator('[data-testid="design-canvas"]'),
      { targetPosition: { x: 100, y: 600 } }
    )
    
    // Generate PDF
    await page.click('text=Generate PDF')
    
    // Wait for PDF generation
    await expect(page.locator('text=PDF Generated Successfully')).toBeVisible({ timeout: 10000 })
    
    // Verify download button appears
    await expect(page.locator('text=Download PDF')).toBeVisible()
    
    // Test the download
    const downloadPromise = page.waitForEvent('download')
    await page.click('text=Download PDF')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toMatch(/\.pdf$/)
  })

  test('handles data source connection and preview', async ({ page }) => {
    // Open data source dialog
    await page.click('text=Connect Data Source')
    
    // Select CSV option
    await page.selectOption('[aria-label="Data Source Type"]', 'csv')
    
    // Upload CSV file
    const fileInput = page.locator('[aria-label="Upload CSV File"]')
    await fileInput.setInputFiles({
      name: 'test-data.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('Name,Value,Category\nTest Item,100,Electronics\nSample Product,200,Furniture')
    })
    
    // Verify data preview appears
    await expect(page.locator('text=Test Item')).toBeVisible()
    await expect(page.locator('text=Sample Product')).toBeVisible()
    
    // Save data source
    await page.fill('[aria-label="Data Source Name"]', 'Test CSV Data')
    await page.click('text=Save Data Source')
    
    // Verify data appears in preview panel
    await expect(page.locator('[role="region"][aria-label*="data preview"]')).toContainText('Test Item')
  })

  test('validates accessibility throughout workflow', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'component-palette')
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'design-canvas')
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveText(/properties/i)
    
    // Test component selection with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter') // Should focus first component in palette
    
    await page.keyboard.press('Space') // Should select component
    await page.keyboard.press('Tab') // Move to canvas
    await page.keyboard.press('Enter') // Should place component
    
    // Verify component was added
    await expect(page.locator('[data-testid^="component-"]')).toBeVisible()
  })
})
```

---

## Performance Testing Setup

### Lighthouse Configuration

#### lighthouserc.js
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/', 'http://localhost:3000/designer'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### Bundle Size Monitoring

#### .bundlesizerc.json
```json
{
  "files": [
    {
      "path": ".next/static/chunks/pages/_app-*.js",
      "maxSize": "100 kB"
    },
    {
      "path": ".next/static/chunks/pages/designer-*.js",
      "maxSize": "200 kB"
    },
    {
      "path": ".next/static/chunks/framework-*.js",
      "maxSize": "50 kB"
    }
  ],
  "defaultCompression": "gzip"
}
```

---

## CI/CD Integration

### GitHub Actions

#### .github/workflows/test.yml
```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run type checking
        run: npm run type-check
        
      - name: Run unit tests
        run: npm run test:unit -- --coverage --watchAll=false
        
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unit-tests
          name: codecov-umbrella

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Run integration tests
        run: npm run test:integration -- --watchAll=false

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Start application
        run: npm start &
        
      - name: Wait for application
        run: npx wait-on http://localhost:3000
        
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        
      - name: Check bundle size
        run: npm run bundlesize

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Run accessibility tests
        run: npm run test:accessibility
        
      - name: Upload accessibility report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: accessibility-report
          path: playwright-report/
          retention-days: 30
```

---

## Monitoring and Reporting

### Test Results Dashboard

Create a simple dashboard to track test metrics over time:

#### scripts/generate-test-report.js
```javascript
const fs = require('fs')
const path = require('path')

function generateTestReport() {
  const testResults = {
    timestamp: new Date().toISOString(),
    coverage: getCoverageData(),
    performance: getPerformanceData(),
    accessibility: getAccessibilityData(),
    e2e: getE2EResults(),
  }
  
  const reportPath = path.join(__dirname, '../test-reports', `report-${Date.now()}.json`)
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2))
  
  console.log(`Test report generated: ${reportPath}`)
  return testResults
}

function getCoverageData() {
  try {
    const coverageData = JSON.parse(fs.readFileSync('./coverage/coverage-summary.json', 'utf8'))
    return {
      lines: coverageData.total.lines.pct,
      branches: coverageData.total.branches.pct,
      functions: coverageData.total.functions.pct,
      statements: coverageData.total.statements.pct,
    }
  } catch (error) {
    return null
  }
}

function getPerformanceData() {
  try {
    const lighthouseData = JSON.parse(fs.readFileSync('./lighthouse-results.json', 'utf8'))
    return {
      performance: lighthouseData.categories.performance.score * 100,
      accessibility: lighthouseData.categories.accessibility.score * 100,
      bestPractices: lighthouseData.categories['best-practices'].score * 100,
      seo: lighthouseData.categories.seo.score * 100,
      fcp: lighthouseData.audits['first-contentful-paint'].numericValue,
      lcp: lighthouseData.audits['largest-contentful-paint'].numericValue,
      cls: lighthouseData.audits['cumulative-layout-shift'].numericValue,
    }
  } catch (error) {
    return null
  }
}

function getAccessibilityData() {
  try {
    const accessibilityResults = JSON.parse(fs.readFileSync('./test-results/accessibility.json', 'utf8'))
    return {
      violations: accessibilityResults.violations.length,
      passes: accessibilityResults.passes.length,
      score: accessibilityResults.violations.length === 0 ? 100 : 0,
    }
  } catch (error) {
    return null
  }
}

function getE2EResults() {
  try {
    const e2eResults = JSON.parse(fs.readFileSync('./test-results/results.json', 'utf8'))
    return {
      total: e2eResults.stats.total,
      passed: e2eResults.stats.expected,
      failed: e2eResults.stats.unexpected,
      skipped: e2eResults.stats.skipped,
      duration: e2eResults.stats.duration,
    }
  } catch (error) {
    return null
  }
}

if (require.main === module) {
  generateTestReport()
}

module.exports = { generateTestReport }
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Jest Configuration Issues
```bash
# Problem: Tests failing with module resolution errors
# Solution: Check moduleNameMapping in jest.config.js

# Problem: Canvas/DOM methods not defined
# Solution: Add mocks in jest.setup.js

# Problem: Next.js components not rendering
# Solution: Mock Next.js router and navigation
```

#### Playwright Setup Issues
```bash
# Problem: Browsers not installing
npx playwright install --with-deps

# Problem: Tests timing out
# Solution: Increase timeout in playwright.config.ts

# Problem: Flaky tests
# Solution: Add explicit waits and retry logic
```

#### Performance Testing Issues
```bash
# Problem: Lighthouse scores inconsistent
# Solution: Run multiple times and average results

# Problem: Bundle size growing
# Solution: Analyze with webpack-bundle-analyzer
npm install --save-dev webpack-bundle-analyzer
npm run build && npx webpack-bundle-analyzer .next/static/chunks/
```

### Debug Commands
```bash
# Run tests in debug mode
npm run test -- --verbose --no-cache

# Run single test file
npm run test -- __tests__/components/designer/report-designer.test.tsx

# Run tests with coverage
npm run test:coverage

# Debug Playwright tests
npx playwright test --debug

# Generate test report
node scripts/generate-test-report.js
```

---

This setup guide provides everything needed to implement a comprehensive testing framework for the ReportBuilder application. The framework scales from unit tests to full E2E testing with performance monitoring and accessibility validation.