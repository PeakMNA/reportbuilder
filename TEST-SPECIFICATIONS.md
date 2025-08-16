# Test Specifications - ReportBuilder Application

**Document Version:** 1.0  
**Date:** January 2025  
**Status:** Implementation Ready  
**Application Version:** MVP 80% Complete  
**Technology Stack:** Next.js 15 + React 19 + TypeScript + @dnd-kit

---

## 1. Executive Summary

### 1.1 Testing Strategy Overview
This document provides comprehensive test specifications for the ReportBuilder application, a sophisticated drag-and-drop report designer platform. Testing covers unit, integration, user acceptance, and regression testing across all critical workflows.

### 1.2 Key Testing Principles
- **Risk-Based Testing:** Focus on critical business workflows and high-impact features
- **Progressive Coverage:** Start with MVP features, expand to advanced functionality
- **Performance-First:** Validate speed requirements from project brief
- **Accessibility-Native:** WCAG 2.1 AA compliance validation throughout
- **Real-World Scenarios:** Test with realistic data volumes and user conditions

### 1.3 Success Criteria
- **Unit Test Coverage:** ≥80% for components, ≥70% for utilities
- **Integration Test Coverage:** 100% of critical user workflows
- **Performance Benchmarks:** Load time <2s, PDF generation <5s (10 pages)
- **UAT Completion:** Finance team can generate report in <5 clicks
- **Regression Prevention:** Zero critical path failures during releases

---

## 2. Testing Framework Architecture

### 2.1 Technology Stack
```typescript
// Core Testing Framework
{
  "jest": "^29.7.0",                    // Test runner and assertion library
  "@testing-library/react": "^14.1.2", // React component testing utilities
  "@testing-library/jest-dom": "^6.1.6", // Custom Jest matchers
  "@testing-library/user-event": "^14.5.1", // User interaction simulation
  "playwright": "^1.40.0",             // E2E testing and browser automation
  "jest-environment-jsdom": "^29.7.0", // DOM simulation for React components
  "msw": "^2.0.0",                     // API mocking for integration tests
  "@storybook/react": "^7.6.0"         // Component documentation and testing
}

// Performance & Visual Testing
{
  "lighthouse": "^11.4.0",             // Performance auditing
  "@axe-core/playwright": "^4.8.3",    // Accessibility testing
  "percy-playwright": "^1.0.0",        // Visual regression testing
  "bundlesize": "^0.18.0"              // Bundle size monitoring
}
```

### 2.2 Test Data Management
```typescript
// Test Data Strategy
interface TestDataConfig {
  fixtures: {
    components: Component[]      // Sample report components
    templates: Template[]        // Predefined report templates
    datasets: DataSource[]       // Various data formats (CSV, JSON, SQL)
    users: UserProfile[]         // Different user roles and permissions
  }
  
  mocks: {
    api: MockApiResponses        // Simulated backend responses
    files: MockFileSystem        // File upload/download simulation
    canvas: MockCanvasOperations // Canvas interaction simulation
  }
  
  performance: {
    largeDatasets: DataSet[]     // 1000+ row datasets for stress testing
    complexTemplates: Template[] // Multi-section reports for performance
    concurrentUsers: number      // Load testing scenarios
  }
}
```

---

## 3. Unit Testing Specifications

### 3.1 Component Testing Strategy

#### 3.1.1 Core Designer Components
```typescript
// ReportDesigner Component Tests
describe('ReportDesigner', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset canvas state
    // Initialize command system
    // Setup mock data sources
  })

  describe('Initialization', () => {
    test('renders all main panels correctly', () => {
      render(<ReportDesigner />)
      
      expect(screen.getByRole('region', { name: /component palette/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /design canvas/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /properties panel/i })).toBeInTheDocument()
      expect(screen.getByRole('region', { name: /data preview/i })).toBeInTheDocument()
    })

    test('initializes with empty canvas and no selection', () => {
      render(<ReportDesigner />)
      
      expect(screen.queryByText(/selected component/i)).not.toBeInTheDocument()
      expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    })

    test('loads with correct default zoom level and grid settings', () => {
      render(<ReportDesigner />)
      
      const canvas = screen.getByTestId('design-canvas')
      expect(canvas).toHaveStyle('transform: scale(1)')
      expect(screen.getByRole('button', { name: /show grid/i })).toBeInTheDocument()
    })
  })

  describe('Drag and Drop Operations', () => {
    test('adds component to canvas on successful drop', async () => {
      const user = userEvent.setup()
      render(<ReportDesigner />)
      
      const textComponent = screen.getByTestId('palette-text-component')
      const canvas = screen.getByTestId('design-canvas')
      
      await user.drag(textComponent, canvas, {
        targetPosition: { x: 100, y: 150 }
      })
      
      expect(screen.getByText(/text component 1/i)).toBeInTheDocument()
      expect(screen.getByTestId('component-text-1')).toHaveStyle({
        left: '95px', // Snapped to 5mm grid
        top: '152px'
      })
    })

    test('prevents invalid drops outside canvas bounds', async () => {
      const user = userEvent.setup()
      render(<ReportDesigner />)
      
      const textComponent = screen.getByTestId('palette-text-component')
      const palette = screen.getByTestId('component-palette')
      
      await user.drag(textComponent, palette)
      
      expect(screen.queryByText(/text component 1/i)).not.toBeInTheDocument()
      expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    })

    test('snaps components to grid with 5mm precision', async () => {
      const user = userEvent.setup()
      render(<ReportDesigner />)
      
      const component = screen.getByTestId('palette-text-component')
      const canvas = screen.getByTestId('design-canvas')
      
      // Drop at irregular position
      await user.drag(component, canvas, {
        targetPosition: { x: 123, y: 187 }
      })
      
      const droppedComponent = screen.getByTestId('component-text-1')
      expect(droppedComponent).toHaveStyle({
        left: '114px', // Snapped to nearest 19px grid
        top: '190px'
      })
    })
  })

  describe('Command System Integration', () => {
    test('executes undo/redo operations correctly', async () => {
      const user = userEvent.setup()
      render(<ReportDesigner />)
      
      // Add component
      const textComponent = screen.getByTestId('palette-text-component')
      const canvas = screen.getByTestId('design-canvas')
      await user.drag(textComponent, canvas)
      
      expect(screen.getByText(/text component 1/i)).toBeInTheDocument()
      
      // Undo
      await user.keyboard('{Control>}z{/Control}')
      expect(screen.queryByText(/text component 1/i)).not.toBeInTheDocument()
      
      // Redo
      await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
      expect(screen.getByText(/text component 1/i)).toBeInTheDocument()
    })

    test('maintains command history with proper limits', async () => {
      render(<ReportDesigner />)
      
      // Simulate 60 operations (above 50 limit)
      for (let i = 0; i < 60; i++) {
        // Add and remove components to create commands
      }
      
      // Verify history is capped at 50 commands
      const commandSystem = screen.getByTestId('command-system-debug')
      expect(commandSystem).toHaveAttribute('data-history-size', '50')
    })
  })
})
```

#### 3.1.2 Canvas Operations Tests
```typescript
// DesignCanvas Component Tests
describe('DesignCanvas', () => {
  describe('Component Rendering', () => {
    test('renders components with correct positions and styling', () => {
      const testComponents = [
        { id: 'text-1', type: 'text', x: 100, y: 200, width: 150, height: 40 },
        { id: 'table-1', type: 'table', x: 300, y: 400, width: 300, height: 200 }
      ]
      
      render(<DesignCanvas components={testComponents} />)
      
      const textComponent = screen.getByTestId('component-text-1')
      expect(textComponent).toHaveStyle({
        position: 'absolute',
        left: '100px',
        top: '200px',
        width: '150px',
        height: '40px'
      })
    })

    test('applies zoom transformations correctly', () => {
      render(<DesignCanvas zoomLevel={1.5} />)
      
      const canvas = screen.getByTestId('design-canvas')
      expect(canvas).toHaveStyle('transform: scale(1.5)')
      expect(canvas).toHaveStyle('transform-origin: top center')
    })

    test('shows selection indicators for selected components', () => {
      const components = [{ id: 'text-1', type: 'text', x: 100, y: 200 }]
      
      render(<DesignCanvas components={components} selectedComponent="text-1" />)
      
      const selectionIndicator = screen.getByTestId('selection-indicator-text-1')
      expect(selectionIndicator).toBeInTheDocument()
      expect(selectionIndicator).toHaveClass('border-primary', 'border-2')
    })
  })

  describe('Grid System', () => {
    test('displays grid overlay when enabled', () => {
      render(<DesignCanvas showGrid={true} />)
      
      const gridOverlay = screen.getByTestId('grid-overlay')
      expect(gridOverlay).toBeInTheDocument()
      expect(gridOverlay).toHaveClass('opacity-50')
    })

    test('hides grid overlay when disabled', () => {
      render(<DesignCanvas showGrid={false} />)
      
      expect(screen.queryByTestId('grid-overlay')).not.toBeInTheDocument()
    })

    test('snaps components to grid intersections', () => {
      // Test component positioning logic
      const snapToGrid = (x: number, y: number) => {
        const gridSize = 19 // 5mm at 96 DPI
        return {
          x: Math.round(x / gridSize) * gridSize,
          y: Math.round(y / gridSize) * gridSize
        }
      }
      
      expect(snapToGrid(123, 187)).toEqual({ x: 114, y: 190 })
      expect(snapToGrid(50, 75)).toEqual({ x: 57, y: 76 })
    })
  })
})
```

#### 3.1.3 Properties Panel Tests
```typescript
// PropertiesPanel Component Tests
describe('PropertiesPanel', () => {
  describe('Property Rendering', () => {
    test('displays correct properties for selected text component', () => {
      const textComponent = {
        id: 'text-1',
        type: 'text',
        properties: {
          content: 'Sample Text',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#000000',
          alignment: 'left'
        }
      }
      
      render(<PropertiesPanel componentData={textComponent} />)
      
      expect(screen.getByDisplayValue('Sample Text')).toBeInTheDocument()
      expect(screen.getByDisplayValue('14')).toBeInTheDocument()
      expect(screen.getByDisplayValue('#000000')).toBeInTheDocument()
    })

    test('updates properties with real-time validation', async () => {
      const user = userEvent.setup()
      const mockOnPropertyUpdate = jest.fn()
      const component = { id: 'text-1', type: 'text', properties: { fontSize: 14 } }
      
      render(
        <PropertiesPanel 
          componentData={component} 
          onPropertyUpdate={mockOnPropertyUpdate} 
        />
      )
      
      const fontSizeInput = screen.getByLabelText(/font size/i)
      await user.clear(fontSizeInput)
      await user.type(fontSizeInput, '18')
      
      expect(mockOnPropertyUpdate).toHaveBeenCalledWith('properties.fontSize', 18)
    })

    test('prevents invalid property values', async () => {
      const user = userEvent.setup()
      const mockOnPropertyUpdate = jest.fn()
      
      render(<PropertiesPanel componentData={testComponent} onPropertyUpdate={mockOnPropertyUpdate} />)
      
      const fontSizeInput = screen.getByLabelText(/font size/i)
      await user.clear(fontSizeInput)
      await user.type(fontSizeInput, '-5')
      
      expect(screen.getByText(/font size must be positive/i)).toBeInTheDocument()
      expect(mockOnPropertyUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Property Groups and Tabs', () => {
    test('organizes properties into logical groups', () => {
      const tableComponent = { id: 'table-1', type: 'table' }
      
      render(<PropertiesPanel componentData={tableComponent} />)
      
      expect(screen.getByRole('tab', { name: /appearance/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /data/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /behavior/i })).toBeInTheDocument()
    })

    test('switches between property tabs correctly', async () => {
      const user = userEvent.setup()
      render(<PropertiesPanel componentData={testComponent} />)
      
      await user.click(screen.getByRole('tab', { name: /data/i }))
      
      expect(screen.getByText(/data source/i)).toBeInTheDocument()
      expect(screen.queryByText(/font size/i)).not.toBeInTheDocument()
    })
  })
})
```

### 3.2 Utility Functions Testing

#### 3.2.1 Canvas Utilities
```typescript
// Canvas utility functions tests
describe('Canvas Utilities', () => {
  describe('Position Calculations', () => {
    test('calculates drop position correctly with zoom', () => {
      const canvasRect = { left: 100, top: 150, width: 800, height: 600 }
      const mouseEvent = { clientX: 250, clientY: 300 }
      const zoomLevel = 1.5
      
      const position = calculateDropPosition(canvasRect, mouseEvent, zoomLevel)
      
      expect(position).toEqual({
        x: Math.round((250 - 100) / 1.5 / 19) * 19, // Grid snapped
        y: Math.round((300 - 150) / 1.5 / 19) * 19
      })
    })

    test('constrains positions to canvas bounds', () => {
      const canvasRect = { left: 0, top: 0, width: 800, height: 600 }
      const mouseEvent = { clientX: -50, clientY: -30 }
      
      const position = calculateDropPosition(canvasRect, mouseEvent, 1)
      
      expect(position.x).toBeGreaterThanOrEqual(0)
      expect(position.y).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Component Collision Detection', () => {
    test('detects overlapping components', () => {
      const component1 = { x: 100, y: 100, width: 150, height: 100 }
      const component2 = { x: 150, y: 150, width: 150, height: 100 }
      
      expect(detectCollision(component1, component2)).toBe(true)
    })

    test('allows non-overlapping components', () => {
      const component1 = { x: 100, y: 100, width: 150, height: 100 }
      const component2 = { x: 300, y: 300, width: 150, height: 100 }
      
      expect(detectCollision(component1, component2)).toBe(false)
    })
  })

  describe('Grid Snap Logic', () => {
    test('snaps to nearest grid intersection', () => {
      expect(snapToGrid(123, 5)).toBe(125) // 19px grid
      expect(snapToGrid(87, 5)).toBe(95)
      expect(snapToGrid(95, 5)).toBe(95) // Already aligned
    })
  })
})
```

#### 3.2.2 Data Processing Tests
```typescript
// Data processing utility tests
describe('Data Processing', () => {
  describe('CSV Parsing', () => {
    test('parses valid CSV data correctly', async () => {
      const csvData = `Name,Age,City
John Doe,30,New York
Jane Smith,25,Los Angeles`
      
      const result = await parseCSVData(csvData)
      
      expect(result.columns).toEqual(['Name', 'Age', 'City'])
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0]).toEqual(['John Doe', '30', 'New York'])
    })

    test('handles malformed CSV gracefully', async () => {
      const malformedCSV = `Name,Age
John Doe,30,Extra Field
Jane Smith`
      
      const result = await parseCSVData(malformedCSV)
      
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]).toContain('Extra field')
    })

    test('detects column data types automatically', async () => {
      const csvData = `Name,Age,Salary,Active
John Doe,30,50000.50,true`
      
      const result = await parseCSVData(csvData, { detectTypes: true })
      
      expect(result.columnTypes).toEqual({
        Name: 'string',
        Age: 'number',
        Salary: 'number',
        Active: 'boolean'
      })
    })
  })

  describe('Template Serialization', () => {
    test('serializes component data correctly', () => {
      const components = [
        { id: 'text-1', type: 'text', x: 100, y: 200, properties: { content: 'Test' } }
      ]
      
      const serialized = serializeTemplate(components, 'Test Template')
      const parsed = JSON.parse(serialized)
      
      expect(parsed.name).toBe('Test Template')
      expect(parsed.components).toHaveLength(1)
      expect(parsed.components[0].id).toBe('text-1')
    })

    test('handles empty templates', () => {
      const serialized = serializeTemplate([], 'Empty Template')
      const parsed = JSON.parse(serialized)
      
      expect(parsed.components).toEqual([])
      expect(parsed.metadata.componentCount).toBe(0)
    })
  })
})
```

### 3.3 Performance-Critical Component Tests

#### 3.3.1 Large Dataset Handling
```typescript
describe('Large Dataset Performance', () => {
  test('renders large component lists efficiently', () => {
    const largeComponentList = Array.from({ length: 1000 }, (_, i) => ({
      id: `component-${i}`,
      type: 'text',
      x: (i % 10) * 100,
      y: Math.floor(i / 10) * 50,
      properties: { content: `Text ${i}` }
    }))
    
    const startTime = performance.now()
    render(<DesignCanvas components={largeComponentList} />)
    const renderTime = performance.now() - startTime
    
    expect(renderTime).toBeLessThan(1000) // Under 1 second
    expect(screen.getByTestId('component-component-0')).toBeInTheDocument()
  })

  test('virtualizes off-screen components', () => {
    const components = Array.from({ length: 500 }, (_, i) => ({
      id: `component-${i}`,
      type: 'text',
      x: i * 1000, // Far off-screen
      y: i * 1000,
      properties: { content: `Text ${i}` }
    }))
    
    render(<DesignCanvas components={components} viewportWidth={800} viewportHeight={600} />)
    
    // Only visible components should be in DOM
    const renderedComponents = screen.getAllByTestId(/component-/)
    expect(renderedComponents.length).toBeLessThan(50) // Much less than 500
  })
})
```

---

## 4. Integration Testing Specifications

### 4.1 End-to-End Workflow Testing

#### 4.1.1 Complete Report Creation Workflow
```typescript
// Complete workflow integration tests
describe('Report Creation Workflow', () => {
  test('Finance team workflow: load template → bind data → generate PDF', async () => {
    const user = userEvent.setup()
    
    // Navigate to designer
    render(<App />)
    await user.click(screen.getByRole('link', { name: /designer/i }))
    
    // Load financial report template
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await user.click(screen.getByText(/financial statement template/i))
    
    // Verify template loaded
    expect(screen.getByText(/balance sheet/i)).toBeInTheDocument()
    expect(screen.getByText(/income statement/i)).toBeInTheDocument()
    
    // Connect data source
    await user.click(screen.getByRole('button', { name: /connect data/i }))
    await user.selectOptions(screen.getByLabelText(/data source type/i), 'csv')
    
    // Upload CSV file
    const fileInput = screen.getByLabelText(/upload file/i)
    const csvFile = new File(['Name,Revenue,Expenses\nQ1,100000,75000'], 'financial-data.csv', {
      type: 'text/csv'
    })
    await user.upload(fileInput, csvFile)
    
    // Verify data preview
    expect(screen.getByText(/q1/i)).toBeInTheDocument()
    expect(screen.getByText(/100000/i)).toBeInTheDocument()
    
    // Bind data to components
    const revenueField = screen.getByTestId('data-field-revenue')
    const revenueComponent = screen.getByTestId('component-revenue-total')
    await user.drag(revenueField, revenueComponent)
    
    // Generate PDF
    await user.click(screen.getByRole('button', { name: /generate pdf/i }))
    
    // Verify PDF generation
    await waitFor(() => {
      expect(screen.getByText(/pdf generated successfully/i)).toBeInTheDocument()
    }, { timeout: 10000 })
    
    // Verify download link
    const downloadLink = screen.getByRole('link', { name: /download pdf/i })
    expect(downloadLink).toHaveAttribute('href', expect.stringContaining('.pdf'))
  })

  test('Tech support workflow: create template → configure components → save', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Start with blank canvas
    expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    
    // Add page header
    const headerComponent = screen.getByTestId('palette-page-header')
    const canvas = screen.getByTestId('design-canvas')
    await user.drag(headerComponent, canvas, { targetPosition: { x: 100, y: 50 } })
    
    // Configure header properties
    await user.click(screen.getByTestId('component-page-header-1'))
    const headerText = screen.getByLabelText(/header text/i)
    await user.clear(headerText)
    await user.type(headerText, 'Monthly Financial Report')
    
    // Add table component
    const tableComponent = screen.getByTestId('palette-table')
    await user.drag(tableComponent, canvas, { targetPosition: { x: 100, y: 200 } })
    
    // Configure table properties
    await user.click(screen.getByTestId('component-table-1'))
    const columnCount = screen.getByLabelText(/column count/i)
    await user.clear(columnCount)
    await user.type(columnCount, '4')
    
    // Add footer with page numbers
    const footerComponent = screen.getByTestId('palette-page-footer')
    await user.drag(footerComponent, canvas, { targetPosition: { x: 100, y: 700 } })
    
    // Save template
    await user.click(screen.getByRole('button', { name: /save template/i }))
    const templateName = screen.getByLabelText(/template name/i)
    await user.type(templateName, 'Financial Statement Template')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify save success
    expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
  })
})
```

#### 4.1.2 Properties Panel ↔ Canvas Integration
```typescript
describe('Properties Panel Integration', () => {
  test('property changes update canvas immediately', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add text component
    const textComponent = screen.getByTestId('palette-text')
    const canvas = screen.getByTestId('design-canvas')
    await user.drag(textComponent, canvas)
    
    // Select component and verify properties panel
    await user.click(screen.getByTestId('component-text-1'))
    expect(screen.getByDisplayValue('Sample Text')).toBeInTheDocument()
    
    // Change text content
    const contentInput = screen.getByLabelText(/content/i)
    await user.clear(contentInput)
    await user.type(contentInput, 'Updated Text')
    
    // Verify canvas updates immediately
    expect(screen.getByTestId('component-text-1')).toHaveTextContent('Updated Text')
    
    // Change font size
    const fontSizeInput = screen.getByLabelText(/font size/i)
    await user.clear(fontSizeInput)
    await user.type(fontSizeInput, '18')
    
    // Verify style update on canvas
    const canvasComponent = screen.getByTestId('component-text-1')
    expect(canvasComponent).toHaveStyle('font-size: 18px')
  })

  test('undo/redo works with property changes', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add and select component
    const textComponent = screen.getByTestId('palette-text')
    const canvas = screen.getByTestId('design-canvas')
    await user.drag(textComponent, canvas)
    await user.click(screen.getByTestId('component-text-1'))
    
    // Change property
    const contentInput = screen.getByLabelText(/content/i)
    const originalText = contentInput.value
    await user.clear(contentInput)
    await user.type(contentInput, 'Modified Text')
    
    // Undo
    await user.keyboard('{Control>}z{/Control}')
    expect(screen.getByTestId('component-text-1')).toHaveTextContent(originalText)
    expect(screen.getByDisplayValue(originalText)).toBeInTheDocument()
    
    // Redo
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}')
    expect(screen.getByTestId('component-text-1')).toHaveTextContent('Modified Text')
    expect(screen.getByDisplayValue('Modified Text')).toBeInTheDocument()
  })
})
```

#### 4.1.3 Data Source Integration Testing
```typescript
describe('Data Source Integration', () => {
  beforeEach(() => {
    // Setup MSW handlers for API testing
    server.use(
      rest.post('/api/data-sources/connect', (req, res, ctx) => {
        return res(ctx.json({ success: true, connectionId: 'test-123' }))
      }),
      rest.get('/api/data-sources/preview', (req, res, ctx) => {
        return res(ctx.json({
          columns: ['Name', 'Age', 'City'],
          rows: [['John Doe', 30, 'New York'], ['Jane Smith', 25, 'Los Angeles']],
          totalRows: 2
        }))
      })
    )
  })

  test('connects to SQL database and previews data', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Open data source dialog
    await user.click(screen.getByRole('button', { name: /connect data source/i }))
    
    // Configure SQL connection
    await user.selectOptions(screen.getByLabelText(/source type/i), 'sql')
    await user.type(screen.getByLabelText(/host/i), 'localhost')
    await user.type(screen.getByLabelText(/database/i), 'testdb')
    await user.type(screen.getByLabelText(/username/i), 'testuser')
    await user.type(screen.getByLabelText(/password/i), 'testpass')
    
    // Test connection
    await user.click(screen.getByRole('button', { name: /test connection/i }))
    
    // Verify connection success
    await waitFor(() => {
      expect(screen.getByText(/connection successful/i)).toBeInTheDocument()
    })
    
    // Enter query
    const queryTextarea = screen.getByLabelText(/sql query/i)
    await user.type(queryTextarea, 'SELECT * FROM users LIMIT 100')
    
    // Preview data
    await user.click(screen.getByRole('button', { name: /preview data/i }))
    
    // Verify data preview
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
    
    // Save data source
    await user.click(screen.getByRole('button', { name: /save data source/i }))
    
    // Verify data appears in preview panel
    expect(screen.getByRole('region', { name: /data preview/i })).toHaveTextContent('John Doe')
  })

  test('handles CSV file upload and parsing', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Upload CSV file
    await user.click(screen.getByRole('button', { name: /connect data source/i }))
    await user.selectOptions(screen.getByLabelText(/source type/i), 'csv')
    
    const fileInput = screen.getByLabelText(/upload csv file/i)
    const csvContent = `Product,Price,Category
Laptop,999.99,Electronics
Mouse,29.99,Electronics
Desk,299.99,Furniture`
    
    const csvFile = new File([csvContent], 'products.csv', { type: 'text/csv' })
    await user.upload(fileInput, csvFile)
    
    // Verify parsing and preview
    await waitFor(() => {
      expect(screen.getByText('Laptop')).toBeInTheDocument()
      expect(screen.getByText('999.99')).toBeInTheDocument()
      expect(screen.getByText('Electronics')).toBeInTheDocument()
    })
    
    // Verify column detection
    expect(screen.getByText('Product')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
  })
})
```

### 4.2 Template Management Integration

#### 4.2.1 Save/Load Template Operations
```typescript
describe('Template Management', () => {
  test('saves complex template with all component types', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Create complex template
    const canvas = screen.getByTestId('design-canvas')
    
    // Add various components
    await user.drag(screen.getByTestId('palette-page-header'), canvas)
    await user.drag(screen.getByTestId('palette-text'), canvas)
    await user.drag(screen.getByTestId('palette-table'), canvas)
    await user.drag(screen.getByTestId('palette-chart'), canvas)
    await user.drag(screen.getByTestId('palette-page-footer'), canvas)
    
    // Configure components
    await user.click(screen.getByTestId('component-text-1'))
    await user.clear(screen.getByLabelText(/content/i))
    await user.type(screen.getByLabelText(/content/i), 'Custom Report Title')
    
    // Save template
    await user.click(screen.getByRole('button', { name: /save template/i }))
    await user.type(screen.getByLabelText(/template name/i), 'Complex Report Template')
    await user.type(screen.getByLabelText(/description/i), 'Multi-section report with charts and tables')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Verify save
    expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
    
    // Clear canvas
    await user.click(screen.getByRole('button', { name: /new report/i }))
    expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    
    // Load saved template
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await user.click(screen.getByText('Complex Report Template'))
    
    // Verify all components restored
    expect(screen.getByTestId('component-page-header-1')).toBeInTheDocument()
    expect(screen.getByTestId('component-text-1')).toBeInTheDocument()
    expect(screen.getByTestId('component-table-1')).toBeInTheDocument()
    expect(screen.getByTestId('component-chart-1')).toBeInTheDocument()
    expect(screen.getByTestId('component-page-footer-1')).toBeInTheDocument()
    
    // Verify component properties restored
    await user.click(screen.getByTestId('component-text-1'))
    expect(screen.getByDisplayValue('Custom Report Title')).toBeInTheDocument()
  })

  test('handles template import/export', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Export template as JSON
    await user.drag(screen.getByTestId('palette-text'), screen.getByTestId('design-canvas'))
    await user.click(screen.getByRole('button', { name: /export template/i }))
    
    // Mock download
    const downloadLink = screen.getByRole('link', { name: /download json/i })
    expect(downloadLink).toHaveAttribute('download', expect.stringContaining('.json'))
    
    // Import template
    await user.click(screen.getByRole('button', { name: /import template/i }))
    const fileInput = screen.getByLabelText(/select json file/i)
    
    const templateData = {
      name: 'Imported Template',
      components: [
        { id: 'text-1', type: 'text', x: 100, y: 100, properties: { content: 'Imported Text' } }
      ]
    }
    
    const jsonFile = new File([JSON.stringify(templateData)], 'template.json', {
      type: 'application/json'
    })
    await user.upload(fileInput, jsonFile)
    
    // Verify import
    expect(screen.getByText('Imported Text')).toBeInTheDocument()
  })
})
```

---

## 5. User Acceptance Testing (UAT) Specifications

### 5.1 Business User Scenarios

#### 5.1.1 Finance Team Success Criteria
```typescript
// UAT Test Suite for Finance Team Workflow
describe('Finance Team UAT', () => {
  test('UAT-F1: Generate monthly financial statement in under 5 clicks', async () => {
    const user = userEvent.setup()
    const startTime = performance.now()
    
    render(<App />)
    
    // Click 1: Navigate to designer
    await user.click(screen.getByRole('link', { name: /reports/i }))
    
    // Click 2: Load financial template
    await user.click(screen.getByText(/financial statement template/i))
    
    // Click 3: Connect to data source (pre-configured)
    await user.click(screen.getByRole('button', { name: /use latest data/i }))
    
    // Click 4: Generate report
    await user.click(screen.getByRole('button', { name: /generate pdf/i }))
    
    // Click 5: Download report
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument()
    })
    await user.click(screen.getByRole('button', { name: /download pdf/i }))
    
    const endTime = performance.now()
    const totalTime = (endTime - startTime) / 1000
    
    // Success criteria
    expect(totalTime).toBeLessThan(30) // Under 30 seconds total
    expect(screen.getByText(/report generated successfully/i)).toBeInTheDocument()
    
    // Verify PDF contains expected sections
    const downloadedBlob = await getDownloadedFile()
    const pdfText = await extractPDFText(downloadedBlob)
    expect(pdfText).toContain('Balance Sheet')
    expect(pdfText).toContain('Income Statement')
    expect(pdfText).toContain('Cash Flow')
  })

  test('UAT-F2: Customize existing template without technical knowledge', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Load existing template
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await user.click(screen.getByText(/quarterly report template/i))
    
    // Modify company logo (visual task)
    await user.click(screen.getByTestId('component-logo-1'))
    await user.click(screen.getByRole('button', { name: /change image/i }))
    
    const logoInput = screen.getByLabelText(/upload new logo/i)
    const logoFile = new File(['fake-logo-data'], 'company-logo.png', { type: 'image/png' })
    await user.upload(logoInput, logoFile)
    
    // Modify header text
    await user.click(screen.getByTestId('component-header-1'))
    const headerInput = screen.getByLabelText(/header text/i)
    await user.clear(headerInput)
    await user.type(headerInput, 'Q4 2024 Financial Report')
    
    // Verify changes visible
    expect(screen.getByText('Q4 2024 Financial Report')).toBeInTheDocument()
    
    // Save modified template
    await user.click(screen.getByRole('button', { name: /save as new template/i }))
    await user.type(screen.getByLabelText(/template name/i), 'Q4 2024 Custom Report')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
  })
})
```

#### 5.1.2 Tech Support Team Success Criteria
```typescript
describe('Tech Support UAT', () => {
  test('UAT-T1: Create new template from scratch in under 1 hour', async () => {
    const user = userEvent.setup()
    const startTime = performance.now()
    
    render(<ReportDesigner />)
    
    // Start with blank canvas
    expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    
    // Create comprehensive template structure
    const canvas = screen.getByTestId('design-canvas')
    
    // Add page header with company branding
    await user.drag(screen.getByTestId('palette-page-header'), canvas)
    await user.click(screen.getByTestId('component-page-header-1'))
    await user.type(screen.getByLabelText(/header text/i), 'Company Annual Report')
    
    // Add main content sections
    await user.drag(screen.getByTestId('palette-heading'), canvas)
    await user.drag(screen.getByTestId('palette-text'), canvas)
    await user.drag(screen.getByTestId('palette-table'), canvas)
    await user.drag(screen.getByTestId('palette-chart'), canvas)
    
    // Configure table for financial data
    await user.click(screen.getByTestId('component-table-1'))
    await user.click(screen.getByRole('tab', { name: /data/i }))
    await user.type(screen.getByLabelText(/table title/i), 'Revenue Breakdown')
    
    // Add page footer with page numbers
    await user.drag(screen.getByTestId('palette-page-footer'), canvas)
    await user.click(screen.getByTestId('component-page-footer-1'))
    await user.check(screen.getByLabelText(/include page numbers/i))
    
    // Configure data binding placeholders
    await user.click(screen.getByTestId('component-table-1'))
    await user.click(screen.getByRole('button', { name: /configure data mapping/i }))
    await user.type(screen.getByLabelText(/data source/i), '{{annual_revenue_data}}')
    
    // Test template with sample data
    await user.click(screen.getByRole('button', { name: /preview with sample data/i }))
    expect(screen.getByText(/preview mode/i)).toBeInTheDocument()
    
    // Save template
    await user.click(screen.getByRole('button', { name: /save template/i }))
    await user.type(screen.getByLabelText(/template name/i), 'Annual Report Template')
    await user.type(screen.getByLabelText(/description/i), 'Comprehensive annual report with financial tables and charts')
    await user.selectOptions(screen.getByLabelText(/category/i), 'Financial Reports')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    const endTime = performance.now()
    const totalTime = (endTime - startTime) / (1000 * 60) // Convert to minutes
    
    // Success criteria
    expect(totalTime).toBeLessThan(60) // Under 1 hour
    expect(screen.getByText(/template saved successfully/i)).toBeInTheDocument()
    
    // Verify template complexity
    const components = screen.getAllByTestId(/component-/)
    expect(components.length).toBeGreaterThanOrEqual(5) // Multiple sections
  })

  test('UAT-T2: Setup data source connections for various systems', async () => {
    const user = userEvent.setup()
    render(<DataSourceManager />)
    
    // Test SQL Server connection
    await user.click(screen.getByRole('button', { name: /add data source/i }))
    await user.selectOptions(screen.getByLabelText(/source type/i), 'sql-server')
    await user.type(screen.getByLabelText(/server/i), 'prod-sql.company.com')
    await user.type(screen.getByLabelText(/database/i), 'FinancialDB')
    await user.type(screen.getByLabelText(/username/i), 'report_user')
    await user.type(screen.getByLabelText(/password/i), 'secure_password')
    
    await user.click(screen.getByRole('button', { name: /test connection/i }))
    await waitFor(() => {
      expect(screen.getByText(/connection successful/i)).toBeInTheDocument()
    })
    
    // Save SQL connection
    await user.type(screen.getByLabelText(/connection name/i), 'Production Financial DB')
    await user.click(screen.getByRole('button', { name: /save connection/i }))
    
    // Test API connection
    await user.click(screen.getByRole('button', { name: /add data source/i }))
    await user.selectOptions(screen.getByLabelText(/source type/i), 'rest-api')
    await user.type(screen.getByLabelText(/api url/i), 'https://api.company.com/reports/data')
    await user.selectOptions(screen.getByLabelText(/authentication/i), 'bearer-token')
    await user.type(screen.getByLabelText(/token/i), 'eyJhbGciOiJIUzI1NiIs...')
    
    await user.click(screen.getByRole('button', { name: /test api/i }))
    await waitFor(() => {
      expect(screen.getByText(/api response successful/i)).toBeInTheDocument()
    })
    
    // Verify both connections available
    expect(screen.getByText('Production Financial DB')).toBeInTheDocument()
    expect(screen.getByText(/api\.company\.com/i)).toBeInTheDocument()
  })
})
```

### 5.2 Performance Benchmarks

#### 5.2.1 Speed Requirements Testing
```typescript
describe('Performance Benchmarks', () => {
  test('PERF-1: Application loads in under 2 seconds', async () => {
    const startTime = performance.now()
    
    render(<App />)
    
    // Wait for main components to load
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
    
    const loadTime = (performance.now() - startTime) / 1000
    expect(loadTime).toBeLessThan(2.0) // Under 2 seconds
  })

  test('PERF-2: PDF generation completes in under 5 seconds for 10-page report', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Load complex 10-page template
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await user.click(screen.getByText(/annual report template/i })) // Complex template
    
    // Connect large dataset
    await user.click(screen.getByRole('button', { name: /connect data/i }))
    await user.selectOptions(screen.getByLabelText(/data source/i), 'large-financial-dataset')
    
    // Start PDF generation
    const startTime = performance.now()
    await user.click(screen.getByRole('button', { name: /generate pdf/i }))
    
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByText(/pdf generated successfully/i)).toBeInTheDocument()
    }, { timeout: 15000 })
    
    const generationTime = (performance.now() - startTime) / 1000
    expect(generationTime).toBeLessThan(5.0) // Under 5 seconds
    
    // Verify PDF size and quality
    const downloadLink = screen.getByRole('link', { name: /download pdf/i })
    const pdfBlob = await fetch(downloadLink.href).then(r => r.blob())
    expect(pdfBlob.size).toBeGreaterThan(100000) // Substantial file size
    expect(pdfBlob.size).toBeLessThan(10000000)  // But not excessive
  })

  test('PERF-3: Real-time property updates under 100ms', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add component
    await user.drag(screen.getByTestId('palette-text'), screen.getByTestId('design-canvas'))
    await user.click(screen.getByTestId('component-text-1'))
    
    // Measure property update speed
    const updates = []
    const contentInput = screen.getByLabelText(/content/i)
    
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now()
      
      await user.clear(contentInput)
      await user.type(contentInput, `Test ${i}`)
      
      // Wait for visual update
      await waitFor(() => {
        expect(screen.getByTestId('component-text-1')).toHaveTextContent(`Test ${i}`)
      })
      
      const updateTime = performance.now() - startTime
      updates.push(updateTime)
    }
    
    const averageUpdateTime = updates.reduce((a, b) => a + b) / updates.length
    expect(averageUpdateTime).toBeLessThan(100) // Under 100ms average
  })
})
```

#### 5.2.2 Scalability Testing
```typescript
describe('Scalability Tests', () => {
  test('SCALE-1: Handles 100+ components on canvas', async () => {
    const components = Array.from({ length: 100 }, (_, i) => ({
      id: `component-${i}`,
      type: i % 4 === 0 ? 'text' : i % 4 === 1 ? 'table' : i % 4 === 2 ? 'chart' : 'image',
      x: (i % 10) * 80,
      y: Math.floor(i / 10) * 60,
      properties: { content: `Component ${i}` }
    }))
    
    const startTime = performance.now()
    render(<DesignCanvas components={components} />)
    const renderTime = performance.now() - startTime
    
    expect(renderTime).toBeLessThan(2000) // Under 2 seconds
    expect(screen.getByTestId('component-component-0')).toBeInTheDocument()
    expect(screen.getByTestId('component-component-99')).toBeInTheDocument()
  })

  test('SCALE-2: Processes large datasets (1000+ rows)', async () => {
    const largeDataset = {
      columns: ['ID', 'Name', 'Department', 'Salary', 'Start Date'],
      rows: Array.from({ length: 1000 }, (_, i) => [
        i + 1,
        `Employee ${i + 1}`,
        `Dept ${(i % 10) + 1}`,
        Math.floor(Math.random() * 100000) + 30000,
        new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28))
      ])
    }
    
    const startTime = performance.now()
    render(<DataPreviewPanel data={largeDataset} />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Employee 1')).toBeInTheDocument()
    })
    
    const loadTime = performance.now() - startTime
    expect(loadTime).toBeLessThan(1000) // Under 1 second
    
    // Verify pagination working
    expect(screen.getByText(/showing 1-50 of 1000/i)).toBeInTheDocument()
    
    // Test search performance
    const searchStart = performance.now()
    const searchInput = screen.getByLabelText(/search/i)
    await userEvent.type(searchInput, 'Employee 500')
    
    await waitFor(() => {
      expect(screen.getByText('Employee 500')).toBeInTheDocument()
    })
    
    const searchTime = performance.now() - searchStart
    expect(searchTime).toBeLessThan(500) // Under 500ms search
  })
})
```

---

## 6. Regression Testing Framework

### 6.1 Critical Path Testing

#### 6.1.1 Golden Path Scenarios
```typescript
describe('Critical Path Regression Tests', () => {
  // These tests must NEVER fail in any release
  test('CRITICAL-1: Basic drag-and-drop functionality', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Verify palette loads
    expect(screen.getByTestId('component-palette')).toBeInTheDocument()
    
    // Verify drag and drop works
    const textComponent = screen.getByTestId('palette-text')
    const canvas = screen.getByTestId('design-canvas')
    
    await user.drag(textComponent, canvas)
    
    // Component should appear on canvas
    expect(screen.getByTestId(/component-text-/)).toBeInTheDocument()
    
    // Should be selectable
    await user.click(screen.getByTestId(/component-text-/))
    expect(screen.getByTestId(/component-text-/)).toHaveClass('selected')
    
    // Properties panel should activate
    expect(screen.getByText(/text properties/i)).toBeInTheDocument()
  })

  test('CRITICAL-2: Template save and load cycle', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add components
    await user.drag(screen.getByTestId('palette-text'), screen.getByTestId('design-canvas'))
    await user.drag(screen.getByTestId('palette-table'), screen.getByTestId('design-canvas'))
    
    // Configure component
    await user.click(screen.getByTestId(/component-text-/))
    await user.clear(screen.getByLabelText(/content/i))
    await user.type(screen.getByLabelText(/content/i), 'Regression Test Text')
    
    // Save template
    await user.click(screen.getByRole('button', { name: /save template/i }))
    await user.type(screen.getByLabelText(/template name/i), 'Regression Test Template')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    // Clear canvas
    await user.click(screen.getByRole('button', { name: /new report/i }))
    expect(screen.getByText(/no components on canvas/i)).toBeInTheDocument()
    
    // Load template
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await user.click(screen.getByText('Regression Test Template'))
    
    // Verify components restored
    expect(screen.getByText('Regression Test Text')).toBeInTheDocument()
    expect(screen.getByTestId(/component-text-/)).toBeInTheDocument()
    expect(screen.getByTestId(/component-table-/)).toBeInTheDocument()
  })

  test('CRITICAL-3: PDF generation with basic template', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Create simple report
    await user.drag(screen.getByTestId('palette-text'), screen.getByTestId('design-canvas'))
    await user.click(screen.getByTestId(/component-text-/))
    await user.clear(screen.getByLabelText(/content/i))
    await user.type(screen.getByLabelText(/content/i), 'PDF Generation Test')
    
    // Generate PDF
    await user.click(screen.getByRole('button', { name: /generate pdf/i }))
    
    // Should complete without errors
    await waitFor(() => {
      expect(screen.getByText(/pdf generated successfully/i)).toBeInTheDocument()
    }, { timeout: 10000 })
    
    // Download link should be available
    expect(screen.getByRole('link', { name: /download pdf/i })).toBeInTheDocument()
  })
})
```

#### 6.1.2 Data Integrity Tests
```typescript
describe('Data Integrity Regression Tests', () => {
  test('INTEGRITY-1: Component properties persist through operations', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Add and configure component
    await user.drag(screen.getByTestId('palette-text'), screen.getByTestId('design-canvas'))
    await user.click(screen.getByTestId(/component-text-/))
    
    // Set multiple properties
    await user.clear(screen.getByLabelText(/content/i))
    await user.type(screen.getByLabelText(/content/i), 'Integrity Test')
    await user.clear(screen.getByLabelText(/font size/i))
    await user.type(screen.getByLabelText(/font size/i), '18')
    await user.selectOptions(screen.getByLabelText(/font weight/i), 'bold')
    
    // Perform various operations
    await user.click(screen.getByTestId('design-canvas')) // Deselect
    await user.click(screen.getByTestId(/component-text-/)) // Reselect
    
    // Verify properties maintained
    expect(screen.getByDisplayValue('Integrity Test')).toBeInTheDocument()
    expect(screen.getByDisplayValue('18')).toBeInTheDocument()
    expect(screen.getByDisplayValue('bold')).toBeInTheDocument()
    
    // Test undo/redo preserves properties
    await user.keyboard('{Control>}z{/Control}') // Undo font weight
    expect(screen.getByDisplayValue('normal')).toBeInTheDocument()
    
    await user.keyboard('{Control>}{Shift>}z{/Shift}{/Control}') // Redo
    expect(screen.getByDisplayValue('bold')).toBeInTheDocument()
  })

  test('INTEGRITY-2: Data binding survives template operations', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    // Setup data source
    await user.click(screen.getByRole('button', { name: /connect data source/i }))
    const csvFile = new File(['Name,Value\nTest,123'], 'test.csv', { type: 'text/csv' })
    await user.upload(screen.getByLabelText(/upload csv/i), csvFile)
    
    // Add table and bind data
    await user.drag(screen.getByTestId('palette-table'), screen.getByTestId('design-canvas'))
    await user.click(screen.getByTestId(/component-table-/))
    await user.click(screen.getByRole('tab', { name: /data/i }))
    await user.selectOptions(screen.getByLabelText(/data source/i), 'test.csv')
    
    // Save and reload template
    await user.click(screen.getByRole('button', { name: /save template/i }))
    await user.type(screen.getByLabelText(/template name/i), 'Data Binding Test')
    await user.click(screen.getByRole('button', { name: /save/i }))
    
    await user.click(screen.getByRole('button', { name: /new report/i }))
    await user.click(screen.getByRole('button', { name: /load template/i }))
    await user.click(screen.getByText('Data Binding Test'))
    
    // Verify data binding preserved
    await user.click(screen.getByTestId(/component-table-/))
    await user.click(screen.getByRole('tab', { name: /data/i }))
    expect(screen.getByDisplayValue('test.csv')).toBeInTheDocument()
    
    // Verify data preview still works
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('123')).toBeInTheDocument()
  })
})
```

### 6.2 Cross-Browser Compatibility

#### 6.2.1 Browser-Specific Tests
```typescript
describe('Cross-Browser Compatibility', () => {
  const browsers = ['chromium', 'firefox', 'webkit']
  
  browsers.forEach(browserName => {
    describe(`${browserName} compatibility`, () => {
      test(`drag and drop works correctly in ${browserName}`, async () => {
        // Playwright test for each browser
        const browser = await playwright[browserName].launch()
        const page = await browser.newPage()
        
        await page.goto('http://localhost:3000/designer')
        
        // Test drag and drop
        const textComponent = page.locator('[data-testid="palette-text"]')
        const canvas = page.locator('[data-testid="design-canvas"]')
        
        await textComponent.dragTo(canvas, {
          targetPosition: { x: 100, y: 100 }
        })
        
        // Verify component added
        await expect(page.locator('[data-testid^="component-text-"]')).toBeVisible()
        
        await browser.close()
      })

      test(`PDF generation works in ${browserName}`, async () => {
        const browser = await playwright[browserName].launch()
        const page = await browser.newPage()
        
        await page.goto('http://localhost:3000/designer')
        
        // Add simple content
        await page.locator('[data-testid="palette-text"]').dragTo(
          page.locator('[data-testid="design-canvas"]')
        )
        
        // Generate PDF
        await page.click('text=Generate PDF')
        
        // Wait for download
        const downloadPromise = page.waitForEvent('download')
        await page.click('text=Download PDF')
        const download = await downloadPromise
        
        // Verify PDF file
        expect(download.suggestedFilename()).toMatch(/\.pdf$/)
        
        await browser.close()
      })
    })
  })
})
```

### 6.3 Performance Regression Detection

#### 6.3.1 Performance Benchmarks
```typescript
describe('Performance Regression Tests', () => {
  test('monitors component rendering performance', async () => {
    const componentCounts = [10, 50, 100, 200]
    const benchmarks = []
    
    for (const count of componentCounts) {
      const components = Array.from({ length: count }, (_, i) => ({
        id: `component-${i}`,
        type: 'text',
        x: (i % 10) * 80,
        y: Math.floor(i / 10) * 60,
        properties: { content: `Component ${i}` }
      }))
      
      const startTime = performance.now()
      render(<DesignCanvas components={components} />)
      const renderTime = performance.now() - startTime
      
      benchmarks.push({ count, time: renderTime })
      
      // Performance should scale linearly, not exponentially
      if (count > 10) {
        const previousBenchmark = benchmarks[benchmarks.length - 2]
        const scalingFactor = renderTime / previousBenchmark.time
        const componentFactor = count / previousBenchmark.count
        
        // Scaling should be roughly proportional (within 2x factor)
        expect(scalingFactor).toBeLessThan(componentFactor * 2)
      }
    }
    
    // Log performance data for trend analysis
    console.log('Performance benchmarks:', benchmarks)
  })

  test('tracks memory usage over time', async () => {
    const user = userEvent.setup()
    render(<ReportDesigner />)
    
    const memorySnapshots = []
    
    // Baseline memory
    memorySnapshots.push(performance.memory?.usedJSHeapSize || 0)
    
    // Add many components
    for (let i = 0; i < 50; i++) {
      await user.drag(screen.getByTestId('palette-text'), screen.getByTestId('design-canvas'))
      
      if (i % 10 === 0) {
        memorySnapshots.push(performance.memory?.usedJSHeapSize || 0)
      }
    }
    
    // Delete all components
    await user.keyboard('{Control>}a{/Control}')
    await user.keyboard('{Delete}')
    
    // Force garbage collection (if available)
    if (global.gc) {
      global.gc()
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for cleanup
    memorySnapshots.push(performance.memory?.usedJSHeapSize || 0)
    
    // Memory should not grow excessively
    const baselineMemory = memorySnapshots[0]
    const finalMemory = memorySnapshots[memorySnapshots.length - 1]
    const memoryGrowth = finalMemory - baselineMemory
    
    // Memory growth should be reasonable (less than 50MB for test)
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024)
  })
})
```

---

## 7. Testing Infrastructure Setup

### 7.1 Jest Configuration

#### 7.1.1 Jest Setup File
```typescript
// jest.config.js
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
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testTimeout: 10000,
}

// jest.setup.js
import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Enable API mocking
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
  }),
}))

// Mock canvas operations
global.HTMLCanvasElement.prototype.getContext = jest.fn()
```

#### 7.1.2 MSW API Mocking
```typescript
// mocks/server.js
import { setupServer } from 'msw/node'
import { rest } from 'msw'

export const server = setupServer(
  // Template operations
  rest.post('/api/templates', (req, res, ctx) => {
    return res(ctx.json({ id: 'template-123', success: true }))
  }),
  
  rest.get('/api/templates', (req, res, ctx) => {
    return res(ctx.json([
      { id: '1', name: 'Financial Statement Template', category: 'Finance' },
      { id: '2', name: 'Quarterly Report Template', category: 'Reports' },
    ]))
  }),
  
  // Data source operations
  rest.post('/api/data-sources/test-connection', (req, res, ctx) => {
    return res(ctx.json({ success: true, message: 'Connection successful' }))
  }),
  
  rest.post('/api/data-sources/preview', (req, res, ctx) => {
    return res(ctx.json({
      columns: ['Name', 'Value', 'Category'],
      rows: [
        ['Sample Item 1', '100', 'Type A'],
        ['Sample Item 2', '200', 'Type B'],
      ],
      totalRows: 2,
    }))
  }),
  
  // PDF generation
  rest.post('/api/generate-pdf', (req, res, ctx) => {
    return res(
      ctx.set('Content-Type', 'application/pdf'),
      ctx.body(new ArrayBuffer(1000)) // Mock PDF data
    )
  }),
)
```

### 7.2 Playwright Configuration

#### 7.2.1 Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
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
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
})
```

#### 7.2.2 Accessibility Testing Setup
```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('designer page meets WCAG standards', async ({ page }) => {
    await page.goto('/designer')
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('keyboard navigation works throughout app', async ({ page }) => {
    await page.goto('/designer')
    
    // Tab through main navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveText(/component palette/i)
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveAttribute('data-testid', 'design-canvas')
    
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toHaveText(/properties/i)
  })

  test('screen reader announcements work correctly', async ({ page }) => {
    await page.goto('/designer')
    
    // Add component and verify announcement
    await page.locator('[data-testid="palette-text"]').click()
    
    const announcement = await page.locator('[aria-live="polite"]').textContent()
    expect(announcement).toContain('Text component added to canvas')
  })
})
```

### 7.3 CI/CD Integration

#### 7.3.1 GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit -- --coverage
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm run test:performance
      
      - name: Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
```

#### 7.3.2 Performance Monitoring
```json
// package.json scripts
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=__tests__",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:performance": "jest --testPathPattern=performance",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lighthouse": "lighthouse http://localhost:3000 --output=json --output-path=./lighthouse-results.json",
    "bundle-analyze": "npx next-bundle-analyzer",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 8. Test Data Management

### 8.1 Test Fixtures

#### 8.1.1 Component Test Data
```typescript
// fixtures/components.ts
export const testComponents = {
  textComponent: {
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
  },
  
  tableComponent: {
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
  },
  
  chartComponent: {
    id: 'chart-1',
    type: 'chart',
    name: 'Chart Component 1',
    x: 500,
    y: 200,
    width: 300,
    height: 200,
    properties: {
      chartType: 'bar',
      title: 'Sample Chart',
      dataSource: null,
      xAxis: null,
      yAxis: null,
    },
  },
}

export const complexTemplate = {
  name: 'Complex Financial Report',
  description: 'Multi-section financial report with tables and charts',
  components: [
    testComponents.textComponent,
    testComponents.tableComponent,
    testComponents.chartComponent,
    {
      id: 'header-1',
      type: 'page-header',
      name: 'Page Header',
      x: 0,
      y: 0,
      width: 800,
      height: 60,
      properties: {
        content: 'Financial Report Q4 2024',
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#f8f9fa',
      },
    },
  ],
}
```

#### 8.1.2 Sample Data Sources
```typescript
// fixtures/dataSources.ts
export const sampleDataSources = {
  csvData: {
    name: 'Sales Data Q4',
    type: 'csv',
    content: `Month,Revenue,Expenses,Profit
October,125000,95000,30000
November,135000,98000,37000
December,155000,105000,50000`,
    columns: ['Month', 'Revenue', 'Expenses', 'Profit'],
    rowCount: 3,
  },
  
  financialData: {
    name: 'Financial Statements',
    type: 'json',
    data: [
      { account: 'Cash', amount: 150000, category: 'Assets' },
      { account: 'Accounts Receivable', amount: 85000, category: 'Assets' },
      { account: 'Inventory', amount: 120000, category: 'Assets' },
      { account: 'Accounts Payable', amount: 45000, category: 'Liabilities' },
      { account: 'Revenue', amount: 500000, category: 'Income' },
      { account: 'Expenses', amount: 350000, category: 'Expenses' },
    ],
  },
  
  largeDataset: {
    name: 'Large Employee Dataset',
    type: 'generated',
    generateRows: (count: number) => Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Employee ${i + 1}`,
      department: `Dept ${(i % 10) + 1}`,
      salary: Math.floor(Math.random() * 100000) + 30000,
      startDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)),
    })),
  },
}
```

### 8.2 Performance Test Data

#### 8.2.1 Stress Test Scenarios
```typescript
// fixtures/performanceData.ts
export const performanceTestScenarios = {
  // Large component stress test
  manyComponents: {
    name: 'Many Components Test',
    componentCount: 200,
    generateComponents: (count: number) => Array.from({ length: count }, (_, i) => ({
      id: `component-${i}`,
      type: ['text', 'table', 'chart', 'image'][i % 4],
      x: (i % 20) * 40,
      y: Math.floor(i / 20) * 40,
      width: 150,
      height: 80,
      properties: {
        content: `Component ${i}`,
        fontSize: 12,
      },
    })),
  },
  
  // Large dataset stress test
  bigDataTable: {
    name: 'Large Dataset Test',
    rowCount: 10000,
    columnCount: 20,
    generateData: (rows: number, cols: number) => ({
      columns: Array.from({ length: cols }, (_, i) => `Column ${i + 1}`),
      rows: Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) =>
          `Cell ${rowIndex + 1}-${colIndex + 1}`
        )
      ),
    }),
  },
  
  // Complex template with nested structures
  complexTemplate: {
    name: 'Complex Nested Template',
    sections: 10,
    componentsPerSection: 15,
    generateTemplate: (sections: number, componentsPerSection: number) => {
      const components = []
      for (let s = 0; s < sections; s++) {
        for (let c = 0; c < componentsPerSection; c++) {
          components.push({
            id: `section-${s}-component-${c}`,
            type: ['text', 'table', 'chart'][c % 3],
            x: (c % 5) * 100,
            y: s * 200 + (Math.floor(c / 5) * 50),
            width: 120,
            height: 40,
            properties: {
              content: `Section ${s} Component ${c}`,
              section: s,
            },
          })
        }
      }
      return components
    },
  },
}
```

---

## 9. Quality Gates and Success Metrics

### 9.1 Code Coverage Requirements

#### 9.1.1 Coverage Thresholds
```typescript
// jest.config.js coverage requirements
const coverageThreshold = {
  global: {
    branches: 70,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  
  // Critical components require higher coverage
  './components/designer/': {
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  
  './components/designer/canvas/': {
    branches: 90,
    functions: 95,
    lines: 95,
    statements: 95,
  },
  
  // Utility functions must be fully tested
  './lib/': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
}
```

#### 9.1.2 Quality Metrics Dashboard
```typescript
// Quality metrics collection
interface QualityMetrics {
  testCoverage: {
    lines: number
    branches: number
    functions: number
    statements: number
  }
  
  performanceBenchmarks: {
    loadTime: number
    pdfGenerationTime: number
    componentRenderTime: number
    propertyUpdateTime: number
  }
  
  userAcceptanceTests: {
    financeTeamWorkflow: boolean
    techSupportWorkflow: boolean
    performanceRequirements: boolean
    accessibilityCompliance: boolean
  }
  
  regressionTests: {
    criticalPathTests: number // passed/total
    crossBrowserTests: number // passed/total
    dataIntegrityTests: number // passed/total
  }
  
  codeQuality: {
    eslintErrors: number
    typescriptErrors: number
    deadCodePercentage: number
    duplicateCodePercentage: number
  }
}

// Automated quality gate validation
function validateQualityGates(metrics: QualityMetrics): boolean {
  const requirements = {
    minimumCoverage: 80,
    maxLoadTime: 2000,
    maxPdfGenerationTime: 5000,
    maxPropertyUpdateTime: 100,
    criticalTestsPassRate: 100,
    maxEslintErrors: 0,
    maxTypescriptErrors: 0,
  }
  
  return (
    metrics.testCoverage.lines >= requirements.minimumCoverage &&
    metrics.performanceBenchmarks.loadTime <= requirements.maxLoadTime &&
    metrics.performanceBenchmarks.pdfGenerationTime <= requirements.maxPdfGenerationTime &&
    metrics.performanceBenchmarks.propertyUpdateTime <= requirements.maxPropertyUpdateTime &&
    (metrics.regressionTests.criticalPathTests / 100) * 100 === requirements.criticalTestsPassRate &&
    metrics.codeQuality.eslintErrors <= requirements.maxEslintErrors &&
    metrics.codeQuality.typescriptErrors <= requirements.maxTypescriptErrors
  )
}
```

### 9.2 Performance Benchmarks

#### 9.2.1 Acceptance Criteria
```typescript
// Performance acceptance criteria from project brief
const performanceRequirements = {
  // Application loading
  pageLoadTime: 2000, // ms
  initialRender: 1000, // ms
  
  // User interactions
  componentDrop: 200, // ms from drop to render
  propertyUpdate: 100, // ms from input to visual update
  selectionChange: 50, // ms
  
  // Data operations
  csvParsing: 1000, // ms for 10MB file
  dataPreview: 500, // ms for 1000 rows
  templateSave: 1000, // ms
  templateLoad: 2000, // ms
  
  // Report generation
  pdfGeneration10Pages: 5000, // ms
  pdfGeneration100Pages: 30000, // ms
  
  // Memory constraints
  maxMemoryUsage: 512 * 1024 * 1024, // 512MB
  memoryLeakThreshold: 50 * 1024 * 1024, // 50MB growth per hour
  
  // Scalability
  maxComponents: 500, // components on canvas
  maxDataRows: 50000, // rows in data preview
  concurrentUsers: 1000, // simultaneous users
}

// Automated performance validation
async function validatePerformance(): Promise<boolean> {
  const results = await runPerformanceTests()
  
  return Object.entries(performanceRequirements).every(([metric, threshold]) => {
    const actual = results[metric]
    const passed = actual <= threshold
    
    if (!passed) {
      console.error(`Performance requirement failed: ${metric} = ${actual}ms (max: ${threshold}ms)`)
    }
    
    return passed
  })
}
```

### 9.3 Accessibility Compliance

#### 9.3.1 WCAG 2.1 AA Requirements
```typescript
// Accessibility testing configuration
const accessibilityRequirements = {
  wcagLevel: 'AA',
  standards: ['wcag2a', 'wcag2aa'],
  
  // Specific requirements for report designer
  keyboardNavigation: {
    allInteractiveElements: true,
    logicalTabOrder: true,
    visibleFocusIndicators: true,
    noKeyboardTraps: true,
  },
  
  colorContrast: {
    normalText: 4.5, // 4.5:1 ratio
    largeText: 3.0, // 3:1 ratio
    uiComponents: 3.0, // 3:1 ratio
  },
  
  screenReader: {
    meaningfulLabels: true,
    landmarkRegions: true,
    headingStructure: true,
    liveRegions: true,
  },
  
  visualDesign: {
    textResize: 200, // 200% zoom support
    colorIndependence: true, // info not conveyed by color alone
    motionReduction: true, // respect prefers-reduced-motion
  },
}

// Automated accessibility validation
async function validateAccessibility(page: Page): Promise<boolean> {
  const axeResults = await new AxeBuilder({ page })
    .withTags(accessibilityRequirements.standards)
    .analyze()
  
  // Check for violations
  if (axeResults.violations.length > 0) {
    console.error('Accessibility violations found:', axeResults.violations)
    return false
  }
  
  // Test keyboard navigation
  const keyboardTest = await testKeyboardNavigation(page)
  if (!keyboardTest.passed) {
    console.error('Keyboard navigation test failed:', keyboardTest.errors)
    return false
  }
  
  // Test screen reader compatibility
  const screenReaderTest = await testScreenReaderCompatibility(page)
  if (!screenReaderTest.passed) {
    console.error('Screen reader test failed:', screenReaderTest.errors)
    return false
  }
  
  return true
}
```

---

## 10. Continuous Improvement

### 10.1 Test Analytics and Reporting

#### 10.1.1 Test Results Dashboard
```typescript
// Automated test reporting
interface TestReport {
  timestamp: Date
  buildId: string
  branch: string
  
  summary: {
    totalTests: number
    passed: number
    failed: number
    skipped: number
    duration: number
  }
  
  coverage: {
    lines: number
    branches: number
    functions: number
    statements: number
  }
  
  performance: {
    loadTime: number
    pdfGeneration: number
    memoryUsage: number
  }
  
  accessibility: {
    violations: number
    score: number
  }
  
  regressions: {
    newFailures: string[]
    fixedTests: string[]
  }
}

// Generate comprehensive test report
function generateTestReport(results: TestResults): TestReport {
  return {
    timestamp: new Date(),
    buildId: process.env.BUILD_ID || 'local',
    branch: process.env.BRANCH || 'main',
    
    summary: {
      totalTests: results.numTotalTests,
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      skipped: results.numSkippedTests,
      duration: results.testDuration,
    },
    
    coverage: results.coverageMap.getCoverageSummary(),
    performance: results.performanceBenchmarks,
    accessibility: results.accessibilityResults,
    regressions: results.regressionAnalysis,
  }
}
```

### 10.2 Test Maintenance Strategy

#### 10.2.1 Test Health Monitoring
```typescript
// Monitor test suite health over time
interface TestHealthMetrics {
  flakyTests: string[] // Tests that fail intermittently
  slowTests: string[] // Tests taking longer than threshold
  obsoleteTests: string[] // Tests covering removed features
  lowValueTests: string[] // Tests with minimal coverage impact
  
  maintenanceActions: {
    testsToUpdate: string[]
    testsToRemove: string[]
    coverageGaps: string[]
  }
}

// Automated test health analysis
function analyzeTestHealth(testHistory: TestResult[]): TestHealthMetrics {
  const flakyThreshold = 0.95 // 95% pass rate
  const slowThreshold = 5000 // 5 seconds
  
  return {
    flakyTests: findFlakyTests(testHistory, flakyThreshold),
    slowTests: findSlowTests(testHistory, slowThreshold),
    obsoleteTests: findObsoleteTests(testHistory),
    lowValueTests: findLowValueTests(testHistory),
    
    maintenanceActions: {
      testsToUpdate: findOutdatedTests(testHistory),
      testsToRemove: findRedundantTests(testHistory),
      coverageGaps: findCoverageGaps(testHistory),
    },
  }
}
```

---

## 11. Conclusion

This comprehensive test specification provides a robust testing framework for the ReportBuilder application that ensures:

### 11.1 Quality Assurance
- **80%+ unit test coverage** for critical components
- **100% integration test coverage** for user workflows
- **Complete UAT validation** of business requirements
- **Zero-tolerance regression testing** for critical paths

### 11.2 Performance Validation
- **Sub-2-second load times** validated automatically
- **PDF generation benchmarks** ensuring <5s for 10-page reports
- **Real-time interaction testing** with <100ms update times
- **Scalability testing** supporting 1000+ concurrent users

### 11.3 Accessibility Compliance
- **WCAG 2.1 AA compliance** validated with automated tools
- **Keyboard navigation testing** for complete accessibility
- **Screen reader compatibility** ensuring inclusive design
- **Color contrast validation** meeting standards

### 11.4 Continuous Quality
- **Automated CI/CD integration** preventing regressions
- **Cross-browser compatibility** ensuring consistent experience
- **Performance monitoring** detecting degradation early
- **Test health analytics** maintaining suite effectiveness

### 11.5 Business Value Validation
- **Finance team workflow** completing in <5 clicks
- **Tech support efficiency** creating templates in <1 hour
- **MVP success criteria** validated through automated UAT
- **Production readiness** ensured through comprehensive testing

The testing framework scales with the application, providing confidence in releases while maintaining development velocity. All tests are designed to be maintainable, reliable, and closely aligned with real-world usage patterns.

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Analyze current application structure and identify testing requirements", "status": "completed"}, {"id": "2", "content": "Create unit testing specifications for core components", "status": "completed"}, {"id": "3", "content": "Design integration testing framework for workflows", "status": "completed"}, {"id": "4", "content": "Define UAT specifications for complete user journeys", "status": "completed"}, {"id": "5", "content": "Create regression testing framework and CI/CD integration", "status": "completed"}, {"id": "6", "content": "Setup testing infrastructure recommendations", "status": "completed"}]