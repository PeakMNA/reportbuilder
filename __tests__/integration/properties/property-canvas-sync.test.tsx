import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportDesigner } from '@/components/designer/report-designer'
import { DndContext } from '@dnd-kit/core'

// Mock canvas methods
const mockCanvasRef = {
  current: {
    getAllComponents: jest.fn(() => []),
    getComponent: jest.fn(),
    updateComponent: jest.fn(),
    addComponent: jest.fn(),
    deleteComponent: jest.fn(),
  }
}

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useRef: () => mockCanvasRef,
}))

describe('Property Canvas Synchronization', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockCanvasRef.current.getComponent.mockReturnValue({
      id: 'text-1',
      type: 'text',
      name: 'Text Component',
      x: 100,
      y: 100,
      width: 200,
      height: 40,
      properties: {
        content: 'Sample Text',
        fontSize: 14,
        fontWeight: 'normal',
        color: '#000000',
        alignment: 'left'
      }
    })
  })

  it('should update canvas when text content property changes', async () => {
    render(<ReportDesigner />)
    
    // Simulate component selection
    const component = mockCanvasRef.current.getComponent('text-1')
    
    // Find text input in properties panel
    const textInput = screen.getByLabelText(/content/i)
    
    // Change text content
    await user.clear(textInput)
    await user.type(textInput, 'Updated Text')
    
    // Verify canvas update was called
    await waitFor(() => {
      expect(mockCanvasRef.current.updateComponent).toHaveBeenCalledWith(
        'text-1',
        expect.objectContaining({
          properties: expect.objectContaining({
            content: 'Updated Text'
          })
        })
      )
    })
  })

  it('should update canvas when font size changes', async () => {
    render(<ReportDesigner />)
    
    const fontSizeInput = screen.getByLabelText(/font size/i)
    
    await user.clear(fontSizeInput)
    await user.type(fontSizeInput, '18')
    
    await waitFor(() => {
      expect(mockCanvasRef.current.updateComponent).toHaveBeenCalledWith(
        'text-1',
        expect.objectContaining({
          properties: expect.objectContaining({
            fontSize: 18
          })
        })
      )
    })
  })

  it('should update canvas when color changes', async () => {
    render(<ReportDesigner />)
    
    const colorInput = screen.getByLabelText(/color/i)
    
    fireEvent.change(colorInput, { target: { value: '#ff0000' } })
    
    await waitFor(() => {
      expect(mockCanvasRef.current.updateComponent).toHaveBeenCalledWith(
        'text-1',
        expect.objectContaining({
          properties: expect.objectContaining({
            color: '#ff0000'
          })
        })
      )
    })
  })

  it('should debounce rapid property changes', async () => {
    render(<ReportDesigner />)
    
    const textInput = screen.getByLabelText(/content/i)
    
    // Type rapidly
    await user.type(textInput, 'abc')
    
    // Should only call update once after debounce period
    await waitFor(() => {
      expect(mockCanvasRef.current.updateComponent).toHaveBeenCalledTimes(1)
    }, { timeout: 1000 })
  })

  it('should handle property validation errors gracefully', async () => {
    render(<ReportDesigner />)
    
    const fontSizeInput = screen.getByLabelText(/font size/i)
    
    // Enter invalid font size
    await user.clear(fontSizeInput)
    await user.type(fontSizeInput, '-10')
    
    // Should show error and not update canvas
    await waitFor(() => {
      expect(screen.getByText(/invalid font size/i)).toBeInTheDocument()
      expect(mockCanvasRef.current.updateComponent).not.toHaveBeenCalled()
    })
  })

  it('should synchronize selection state between canvas and properties', async () => {
    render(<ReportDesigner />)
    
    // Simulate canvas component selection
    fireEvent.click(screen.getByTestId('canvas-component-text-1'))
    
    // Verify properties panel shows selected component
    await waitFor(() => {
      expect(screen.getByDisplayValue('Sample Text')).toBeInTheDocument()
      expect(screen.getByDisplayValue('14')).toBeInTheDocument()
    })
  })

  it('should clear properties panel when no component selected', async () => {
    render(<ReportDesigner />)
    
    // Initially select a component
    fireEvent.click(screen.getByTestId('canvas-component-text-1'))
    
    // Then click on empty canvas area
    fireEvent.click(screen.getByTestId('canvas-background'))
    
    // Verify properties panel is cleared
    await waitFor(() => {
      expect(screen.getByText(/no component selected/i)).toBeInTheDocument()
    })
  })
})