'use client'

import { useState, useRef, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Plus,
  FileText,
  Database,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { GridOverlay } from './grid-overlay'
import { ReportComponent } from './report-component'

interface DesignCanvasProps {
  selectedComponent: string | null
  onSelectComponent: (id: string | null) => void
  onDeleteComponent?: (id: string) => void
  updateTrigger?: number // Force re-render trigger
}

export interface DesignCanvasRef {
  addComponent: (type: string, position: { x: number; y: number }) => void
  getComponent: (id: string) => Component | null
  updateComponent: (id: string, updates: Partial<Component>) => void
  getAllComponents: () => Component[]
  loadComponents: (components: Component[]) => void
  clearComponents: () => void
  deleteComponent: (id: string) => void
  forceUpdate: () => void // Force visual update
}

export interface Component {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, string | number | boolean | string[] | null>
}

export const DesignCanvas = forwardRef<DesignCanvasRef, DesignCanvasProps>(
  ({ selectedComponent, onSelectComponent, onDeleteComponent, updateTrigger }, ref) => {
  const [components, setComponents] = useState<Component[]>([])
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null)
  const [showSnapIndicator, setShowSnapIndicator] = useState(false)
  const [forceRenderKey, setForceRenderKey] = useState(0)
  const canvasRef = useRef<HTMLDivElement>(null)

  const {
    isOver,
    setNodeRef: setDroppableRef,
  } = useDroppable({
    id: 'canvas',
    data: {
      type: 'canvas',
    },
  })

  // Track mouse position for snap indicators
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (isOver && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const mouseX = event.clientX - canvasRect.left
        const mouseY = event.clientY - canvasRect.top
        
        // Calculate snap position (same logic as getDropPosition)
        const gridSize = 19
        const zoomLevel = parseFloat(canvasRef.current.style.transform.match(/scale\(([^)]+)\)/)?.[1] || '1')
        const adjustedX = mouseX / zoomLevel
        const adjustedY = mouseY / zoomLevel
        const snappedX = Math.round(adjustedX / gridSize) * gridSize
        const snappedY = Math.round(adjustedY / gridSize) * gridSize
        
        setDragPosition({ x: Math.max(0, snappedX), y: Math.max(0, snappedY) })
        setShowSnapIndicator(true)
      }
    }

    const handleMouseLeave = () => {
      setShowSnapIndicator(false)
      setDragPosition(null)
    }

    if (isOver) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (!isOver) {
        setShowSnapIndicator(false)
        setDragPosition(null)
      }
    }
  }, [isOver])

  const handleCanvasClick = (event: React.MouseEvent) => {
    // If clicking on the canvas background, deselect all components
    if (event.target === event.currentTarget) {
      onSelectComponent(null)
    }
  }

  const updateComponent = useCallback((id: string, updates: Partial<Component>) => {
    setComponents(prev =>
      prev.map(comp => comp.id === id ? { ...comp, ...updates } : comp)
    )
    // Force re-render to ensure visual update
    setForceRenderKey(prev => prev + 1)
  }, [])

  const forceUpdate = useCallback(() => {
    setForceRenderKey(prev => prev + 1)
  }, [])

  const addComponent = useCallback((type: string, position: { x: number; y: number }) => {
    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${components.length + 1}`,
      x: position.x,
      y: position.y,
      width: type === 'text' ? 200 : type === 'table' ? 300 : 150,
      height: type === 'text' ? 40 : type === 'table' ? 200 : 100,
      properties: getDefaultProperties(type),
    }

    setComponents(prev => [...prev, newComponent])
    onSelectComponent(newComponent.id)
  }, [components.length, onSelectComponent])

  const loadComponents = useCallback((newComponents: Component[]) => {
    setComponents(newComponents)
    onSelectComponent(null)
  }, [onSelectComponent])

  const clearComponents = useCallback(() => {
    setComponents([])
    onSelectComponent(null)
  }, [onSelectComponent])

  const deleteComponent = useCallback((id: string) => {
    if (onDeleteComponent) {
      // Use the parent's delete handler (with command system)
      onDeleteComponent(id)
    } else {
      // Fallback to direct deletion
      setComponents(prev => prev.filter(comp => comp.id !== id))
      if (selectedComponent === id) {
        onSelectComponent(null)
      }
    }
  }, [onDeleteComponent, selectedComponent, onSelectComponent])

  // Force re-render when updateTrigger changes
  useEffect(() => {
    if (updateTrigger !== undefined) {
      setForceRenderKey(prev => prev + 1)
    }
  }, [updateTrigger])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    addComponent: (type: string, position: { x: number; y: number }) => {
      addComponent(type, position)
    },
    getComponent: (id: string) => {
      return components.find(comp => comp.id === id) || null
    },
    updateComponent: (id: string, updates: Partial<Component>) => {
      updateComponent(id, updates)
    },
    getAllComponents: () => {
      return [...components]
    },
    loadComponents: (newComponents: Component[]) => {
      loadComponents(newComponents)
    },
    clearComponents: () => {
      clearComponents()
    },
    deleteComponent: (id: string) => {
      deleteComponent(id)
    },
    forceUpdate: () => {
      forceUpdate()
    }
  }), [addComponent, components, updateComponent, loadComponents, clearComponents, deleteComponent, forceUpdate])

  const getDefaultProperties = (type: string): Record<string, string | number | boolean | string[] | null> => {
    switch (type) {
      // Layout Components
      case 'container':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          borderColor: '#000000',
          padding: 10
        }
      case 'spacer':
        return {
          height: 20,
          backgroundColor: 'transparent'
        }
      
      // Text Components
      case 'text':
        return {
          content: 'Sample Text',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#000000',
          alignment: 'left'
        }
      case 'heading':
        return {
          content: 'Heading',
          level: 'h2',
          autoFit: true,
          fontSize: 24,
          fontWeight: 'bold',
          color: '#000000'
        }
      
      // Data Components
      case 'table':
        return {
          columns: ['Column 1', 'Column 2', 'Column 3'],
          rows: 5,
          showHeader: true,
          borderStyle: 'solid'
        }
      case 'chart':
        return {
          chartType: 'bar',
          dataSource: null,
          title: 'Chart Title',
          width: 300,
          height: 200,
          colorScheme: '#3b82f6',
          xField: null
        }
      
      // Media Components
      case 'image':
        return {
          src: null,
          alt: 'Image',
          fit: 'cover',
          width: 200,
          height: 150,
          borderRadius: 0
        }
      case 'qrcode':
        return {
          value: 'https://example.com',
          size: 100,
          backgroundColor: '#ffffff',
          foregroundColor: '#000000'
        }
      
      // Shape Components
      case 'rectangle':
        return {
          width: 150,
          height: 100,
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 1,
          borderRadius: 4
        }
      case 'circle':
        return {
          size: 100,
          backgroundColor: '#f3f4f6',
          borderColor: '#d1d5db',
          borderWidth: 1
        }
      
      // Control Components
      case 'gauge':
        return {
          value: 75,
          min: 0,
          max: 100,
          title: 'Progress',
          color: '#3b82f6'
        }
      
      default:
        return {
          backgroundColor: 'transparent'
        }
    }
  }

  // Empty state when no components
  if (components.length === 0) {
    return (
      <div 
        ref={setDroppableRef}
        data-canvas="true"
        className="relative h-full bg-canvas-bg overflow-hidden"
        onClick={handleCanvasClick}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="w-96 p-8 text-center">
            <div className="space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Start Building Your Report</h3>
                <p className="text-sm text-muted-foreground">
                  Drag components from the palette to begin designing your report
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Choose Template
                </Button>
                <Button variant="outline" className="w-full">
                  <Database className="mr-2 h-4 w-4" />
                  Connect Data Source
                </Button>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Drop overlay when dragging */}
        {isOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/60 flex items-center justify-center animate-pulse">
            <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium shadow-lg animate-bounce">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-foreground rounded-full animate-ping"></div>
                Drop component here
                <div className="w-2 h-2 bg-primary-foreground rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative h-full bg-canvas-bg overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-background border rounded-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoomLevel(prev => Math.max(prev - 25, 25))}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-mono px-2 min-w-[50px] text-center">
          {zoomLevel}%
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoomLevel(prev => Math.min(prev + 25, 400))}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-full w-full">
        <div className="p-8 min-h-full flex justify-center">
          <div
            ref={(node) => {
              canvasRef.current = node
              setDroppableRef(node)
            }}
            data-canvas="true"
            className="relative bg-white shadow-lg"
            style={{
              width: '210mm',
              minHeight: '297mm', // A4 size
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
            onClick={handleCanvasClick}
          >
            {/* Grid Overlay */}
            {showGrid && (
              <GridOverlay 
                isDragging={isOver}
                showSnapIndicator={showSnapIndicator}
                snapPosition={dragPosition}
              />
            )}

            {/* Components - key includes forceRenderKey to ensure re-render */}
            {components.map(component => (
              <ReportComponent
                key={`${component.id}-${forceRenderKey}`}
                component={component}
                selected={selectedComponent === component.id}
                onSelect={() => onSelectComponent(component.id)}
                onUpdate={updateComponent}
                onDelete={deleteComponent}
              />
            ))}

            {/* Drop overlay when dragging */}
            {isOver && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary/60 pointer-events-none animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5"></div>
                {/* Corner indicators */}
                <div className="absolute top-2 left-2 w-4 h-4 border-2 border-primary bg-primary/20 animate-pulse"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-2 border-primary bg-primary/20 animate-pulse"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-primary bg-primary/20 animate-pulse"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-primary bg-primary/20 animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
})

DesignCanvas.displayName = 'DesignCanvas'