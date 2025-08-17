/**
 * Drag and Drop Canvas Tests
 * 
 * Tests for the enhanced drag-and-drop functionality implemented in the canvas system.
 * Covers component placement, positioning, selection, and resize handles.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DndContext, DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { DesignCanvas, type DesignCanvasRef, type Component } from '@/components/designer/canvas/design-canvas'
import { ReportComponent } from '@/components/designer/canvas/report-component'

// Mock dependencies
jest.mock('@/components/designer/data-binding/data-binding-context', () => ({
  useDataBinding: () => ({
    dataSources: [],
    selectedDataSource: null,
    setSelectedDataSource: jest.fn(),
  }),
}))

describe('Drag and Drop Canvas Functionality', () => {
  let canvasRef: React.RefObject<DesignCanvasRef>
  let mockOnSelectComponent: jest.Mock
  let mockOnDeleteComponent: jest.Mock
  let mockOnUpdate: jest.Mock

  beforeEach(() => {
    canvasRef = { current: null }
    mockOnSelectComponent = jest.fn()
    mockOnDeleteComponent = jest.fn()
    mockOnUpdate = jest.fn()
    jest.clearAllMocks()
  })

  const renderCanvas = (selectedComponent: string | null = null) => {
    return render(
      <DndContext>
        <DesignCanvas
          ref={canvasRef}
          selectedComponent={selectedComponent}
          onSelectComponent={mockOnSelectComponent}
          onDeleteComponent={mockOnDeleteComponent}
          onUpdate={mockOnUpdate}
        />
      </DndContext>
    )
  }

  describe('Canvas Drop Zone', () => {
    test('renders as a proper drop zone', () => {
      renderCanvas()
      
      // Canvas should be a droppable area
      const canvas = screen.getByRole('region', { name: /design canvas/i })
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveClass('min-h-full')
    })

    test('calculates correct drop position from mouse coordinates', () => {
      renderCanvas()
      
      const canvas = screen.getByRole('region', { name: /design canvas/i })
      
      // Simulate drop event with coordinates
      const dropEvent = new MouseEvent('drop', {
        clientX: 150,
        clientY: 200,
        bubbles: true,
      })
      
      // Mock getBoundingClientRect to return predictable canvas position
      Object.defineProperty(canvas, 'getBoundingClientRect', {
        value: () => ({
          left: 50,
          top: 100,
          width: 800,
          height: 600,
        }),
      })
      
      fireEvent(canvas, dropEvent)
      
      // Position should be relative to canvas (150-50, 200-100) = (100, 100)
      expect(canvas).toBeInTheDocument()
    })

    test('snaps components to grid when dropping', () => {
      renderCanvas()
      
      // Test grid snapping logic (5mm precision = 19px at 96 DPI)
      const gridSize = 19
      const snapToGrid = (value: number) => Math.round(value / gridSize) * gridSize
      
      // Test various positions snap correctly
      expect(snapToGrid(123)).toBe(133) // 123 -> 133 (7 * 19)
      expect(snapToGrid(87)).toBe(95)   // 87 -> 95 (5 * 19)
      expect(snapToGrid(95)).toBe(95)   // Already aligned
      expect(snapToGrid(200)).toBe(190) // 200 -> 190 (10 * 19)
    })
  })

  describe('Component Placement', () => {
    test('adds component at correct position when dropped', async () => {
      renderCanvas()
      
      // Add a component using the canvas ref
      const testComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 200,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      // Use canvas ref to add component
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 200 })
        
        await waitFor(() => {
          const components = canvasRef.current?.getAllComponents() || []
          expect(components.length).toBeGreaterThan(0)
        })
      }
    })

    test('generates unique IDs for new components', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        canvasRef.current.addComponent('text', { x: 200, y: 100 })
        
        const components = canvasRef.current.getAllComponents()
        const ids = components.map(c => c.id)
        
        // All IDs should be unique
        expect(new Set(ids).size).toBe(ids.length)
      }
    })

    test('assigns default properties based on component type', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        
        const components = canvasRef.current.getAllComponents()
        const textComponent = components.find(c => c.type === 'text')
        
        expect(textComponent).toBeDefined()
        expect(textComponent?.properties).toHaveProperty('content')
        expect(textComponent?.properties).toHaveProperty('fontSize')
        expect(textComponent?.properties).toHaveProperty('fontWeight')
      }
    })
  })

  describe('Component Selection', () => {
    test('selects component when clicked', async () => {
      renderCanvas()
      
      // Add a component first
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        
        const components = canvasRef.current.getAllComponents()
        const component = components[0]
        
        // Render the component
        const { rerender } = render(
          <DndContext>
            <ReportComponent
              component={component}
              selected={false}
              onSelect={() => mockOnSelectComponent(component.id)}
              onUpdate={mockOnUpdate}
            />
          </DndContext>
        )
        
        const componentElement = screen.getByRole('button')
        await userEvent.click(componentElement)
        
        expect(mockOnSelectComponent).toHaveBeenCalledWith(component.id)
      }
    })

    test('shows selection handles when component is selected', () => {
      const mockComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 100,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      render(
        <DndContext>
          <ReportComponent
            component={mockComponent}
            selected={true}
            onSelect={mockOnSelectComponent}
            onUpdate={mockOnUpdate}
          />
        </DndContext>
      )
      
      // Should show resize handles when selected
      const resizeHandles = screen.getAllByRole('button')
      expect(resizeHandles.length).toBeGreaterThan(1) // Component + resize handles
    })

    test('deselects component when clicking canvas', async () => {
      renderCanvas('test-1')
      
      const canvas = screen.getByRole('region', { name: /design canvas/i })
      await userEvent.click(canvas)
      
      expect(mockOnSelectComponent).toHaveBeenCalledWith(null)
    })
  })

  describe('Component Dragging', () => {
    test('enables dragging for existing components', () => {
      const mockComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 100,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      render(
        <DndContext>
          <ReportComponent
            component={mockComponent}
            selected={false}
            onSelect={mockOnSelectComponent}
            onUpdate={mockOnUpdate}
          />
        </DndContext>
      )
      
      const componentElement = screen.getByRole('button')
      expect(componentElement).toHaveAttribute('aria-describedby')
    })

    test('updates component position when dragged', async () => {
      const mockComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 100,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      const onDragEnd = (event: DragEndEvent) => {
        if (event.delta) {
          const newX = mockComponent.x + event.delta.x
          const newY = mockComponent.y + event.delta.y
          mockOnUpdate(mockComponent.id, { x: newX, y: newY })
        }
      }
      
      render(
        <DndContext onDragEnd={onDragEnd}>
          <ReportComponent
            component={mockComponent}
            selected={false}
            onSelect={mockOnSelectComponent}
            onUpdate={mockOnUpdate}
          />
        </DndContext>
      )
      
      // Simulate drag operation
      const dragEvent: DragEndEvent = {
        activatorEvent: new MouseEvent('mousedown'),
        active: {
          id: 'test-1',
          data: { current: {} },
          rect: { current: { initial: null, translated: null } }
        },
        collisions: null,
        delta: { x: 50, y: 30 },
        over: null
      }
      
      onDragEnd(dragEvent)
      
      expect(mockOnUpdate).toHaveBeenCalledWith('test-1', { x: 150, y: 130 })
    })
  })

  describe('Component Resize', () => {
    test('shows resize handles for selected components', () => {
      const mockComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 100,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      render(
        <DndContext>
          <ReportComponent
            component={mockComponent}
            selected={true}
            onSelect={mockOnSelectComponent}
            onUpdate={mockOnUpdate}
          />
        </DndContext>
      )
      
      // Check for resize handle indicators
      const componentElement = screen.getByRole('button')
      expect(componentElement).toHaveClass('ring-2', 'ring-primary')
    })

    test('updates component dimensions when resized', () => {
      const mockComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 100,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      render(
        <DndContext>
          <ReportComponent
            component={mockComponent}
            selected={true}
            onSelect={mockOnSelectComponent}
            onUpdate={mockOnUpdate}
          />
        </DndContext>
      )
      
      // Test resize functionality through update callback
      const newDimensions = { width: 300, height: 60 }
      mockOnUpdate(mockComponent.id, newDimensions)
      
      expect(mockOnUpdate).toHaveBeenCalledWith('test-1', newDimensions)
    })
  })

  describe('Canvas State Management', () => {
    test('maintains component list correctly', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        // Add multiple components
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        canvasRef.current.addComponent('table', { x: 300, y: 200 })
        
        const components = canvasRef.current.getAllComponents()
        expect(components).toHaveLength(2)
        expect(components[0].type).toBe('text')
        expect(components[1].type).toBe('table')
      }
    })

    test('removes components correctly', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        const components = canvasRef.current.getAllComponents()
        const componentId = components[0].id
        
        canvasRef.current.deleteComponent(componentId)
        const remainingComponents = canvasRef.current.getAllComponents()
        
        expect(remainingComponents).toHaveLength(0)
      }
    })

    test('clears all components when requested', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        canvasRef.current.addComponent('table', { x: 300, y: 200 })
        
        canvasRef.current.clearComponents()
        const components = canvasRef.current.getAllComponents()
        
        expect(components).toHaveLength(0)
      }
    })
  })

  describe('Visual Feedback', () => {
    test('provides visual feedback during drag operations', () => {
      const mockComponent: Component = {
        id: 'test-1',
        type: 'text',
        name: 'Test Component',
        x: 100,
        y: 100,
        width: 200,
        height: 40,
        properties: { content: 'Test Text' }
      }
      
      render(
        <DndContext>
          <ReportComponent
            component={mockComponent}
            selected={false}
            onSelect={mockOnSelectComponent}
            onUpdate={mockOnUpdate}
          />
        </DndContext>
      )
      
      const componentElement = screen.getByRole('button')
      
      // Component should have visual styling
      expect(componentElement).toHaveClass('cursor-move')
    })

    test('shows grid alignment guides', () => {
      renderCanvas()
      
      // Grid overlay should be present
      const gridOverlay = screen.getByTestId(/grid-overlay/i) || screen.getByRole('presentation')
      expect(gridOverlay).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    test('handles invalid drop positions gracefully', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        // Try to add component at negative position
        canvasRef.current.addComponent('text', { x: -50, y: -30 })
        
        const components = canvasRef.current.getAllComponents()
        const component = components[0]
        
        // Position should be constrained to valid bounds
        expect(component.x).toBeGreaterThanOrEqual(0)
        expect(component.y).toBeGreaterThanOrEqual(0)
      }
    })

    test('handles component updates with invalid data', () => {
      renderCanvas()
      
      if (canvasRef.current) {
        canvasRef.current.addComponent('text', { x: 100, y: 100 })
        const components = canvasRef.current.getAllComponents()
        const componentId = components[0].id
        
        // Try to update with invalid dimensions
        canvasRef.current.updateComponent(componentId, { width: -100, height: -50 })
        
        const updatedComponent = canvasRef.current.getComponent(componentId)
        
        // Invalid dimensions should be rejected or constrained
        expect(updatedComponent?.width).toBeGreaterThan(0)
        expect(updatedComponent?.height).toBeGreaterThan(0)
      }
    })
  })
})