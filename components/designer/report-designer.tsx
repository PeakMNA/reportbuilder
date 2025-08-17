'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from '@dnd-kit/core'
import { MouseSensor, TouchSensor } from '@dnd-kit/core'
import { snapCenterToCursor } from '@dnd-kit/modifiers'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { DesignerHeader } from './header/designer-header'
import { ComponentPalette } from './palette/component-palette'
import { DesignCanvasClean as DesignCanvas, DesignCanvasRef } from './canvas/design-canvas-clean'
import { PropertiesPanel } from './properties/properties-panel'
import { DataPreviewPanel } from './data-preview/data-preview-panel'
import { ClientWrapper } from './client-wrapper'
import { DataBindingProvider } from './data-binding/data-binding-context'
import { WorkflowManager } from './workflow/workflow-manager'
import { 
  useCommandSystem, 
  useUndoRedoShortcuts,
  AddComponentCommand,
  UpdateComponentCommand,
  DeleteComponentCommand,
  type CommandSystemHook 
} from './commands/command-system'

interface Component {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, string | number | boolean | string[] | null>
}

export function ReportDesigner() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [showDataPreview, setShowDataPreview] = useState(true)
  const [showWorkflow, setShowWorkflow] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedComponent, setDraggedComponent] = useState<{ type: string; component: { id: string; name: string; description: string; icon: ReactNode; popular?: boolean } } | null>(null)
  const [selectedComponentData, setSelectedComponentData] = useState<Component | null>(null)
  const canvasRef = useRef<DesignCanvasRef>(null)
  const canvasElementRef = useRef<HTMLDivElement>(null)
  const [currentComponents, setCurrentComponents] = useState<Component[]>([])
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [reportTitle, setReportTitle] = useState('Untitled Report')
  const [zoomLevel, setZoomLevel] = useState(100)
  
  // Initialize command system
  const commandSystem = useCommandSystem({
    maxHistorySize: 50,
    enablePersistence: true,
    persistenceKey: 'reportbuilder_undo_redo'
  })
  

  // Enable keyboard shortcuts for undo/redo
  useUndoRedoShortcuts(commandSystem)

  // Sync current components with canvas (moved here to avoid hoisting issues)
  const updateCurrentComponents = useCallback(() => {
    if (canvasRef.current) {
      const allComponents = canvasRef.current.getAllComponents()
      setCurrentComponents(allComponents)
    }
  }, [])

  // Delete component function (moved here to avoid hoisting issues)
  const deleteComponentWithCommand = useCallback((componentId: string) => {
    if (!canvasRef.current) return

    const component = canvasRef.current.getComponent(componentId)
    if (!component) return

    const command = new DeleteComponentCommand(
      component,
      (id) => {
        if (canvasRef.current) {
          canvasRef.current.deleteComponent(id)
          if (selectedComponent === id) {
            setSelectedComponent(null)
          }
          updateCurrentComponents()
        }
      },
      (restoredComponent) => {
        if (canvasRef.current) {
          canvasRef.current.addComponent(restoredComponent.type, { x: restoredComponent.x, y: restoredComponent.y })
          updateCurrentComponents()
        }
      }
    )

    commandSystem.executeCommand(command)
  }, [canvasRef, selectedComponent, commandSystem, updateCurrentComponents])

  // Add Delete key handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedComponent) {
          event.preventDefault()
          deleteComponentWithCommand(selectedComponent)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedComponent, deleteComponentWithCommand])


  // Update selected component data when selection changes
  const updateSelectedComponentData = useCallback(() => {
    if (!selectedComponent || !canvasRef.current) {
      setSelectedComponentData(null)
      return
    }
    const componentData = canvasRef.current.getComponent(selectedComponent)
    setSelectedComponentData(componentData)
  }, [selectedComponent])

  // Force canvas visual update
  const forceCanvasUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1)
  }, [])

  // Command-aware canvas operations
  const addComponentWithCommand = useCallback((type: string, position: { x: number; y: number }) => {
    if (!canvasRef.current) return

    const newComponent: Component = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${currentComponents.length + 1}`,
      x: position.x,
      y: position.y,
      width: type === 'text' ? 200 : type === 'table' ? 300 : 150,
      height: type === 'text' ? 40 : type === 'table' ? 200 : 100,
      properties: getDefaultProperties(type),
    }

    const command = new AddComponentCommand(
      newComponent,
      (component) => {
        if (canvasRef.current) {
          // Create a temporary component for the canvas to add
          const tempComponent = { ...component }
          canvasRef.current.addComponent(tempComponent.type, { x: tempComponent.x, y: tempComponent.y })
          setSelectedComponent(tempComponent.id)
          updateCurrentComponents()
        }
      },
      (componentId) => {
        if (canvasRef.current) {
          canvasRef.current.deleteComponent(componentId)
          setSelectedComponent(null)
          updateCurrentComponents()
        }
      }
    )

    commandSystem.executeCommand(command)
  }, [currentComponents.length, commandSystem, updateCurrentComponents])

  const updateComponentWithCommand = useCallback((id: string, newData: Partial<Component>) => {
    console.log('🔧 updateComponentWithCommand called:', { id, newData, timestamp: Date.now() })
    
    if (!canvasRef.current) {
      console.log('❌ updateComponentWithCommand: canvasRef.current is null')
      return
    }

    const currentComponent = canvasRef.current.getComponent(id)
    if (!currentComponent) {
      console.log('❌ updateComponentWithCommand: component not found:', id)
      return
    }

    console.log('✅ updateComponentWithCommand: found component:', currentComponent)

    // Create old data for undo
    const oldData: Partial<Component> = {}
    Object.keys(newData).forEach(key => {
      oldData[key as keyof Component] = currentComponent[key as keyof Component]
    })

    const command = new UpdateComponentCommand(
      id,
      oldData,
      newData,
      (componentId, data) => {
        console.log('🎯 updateComponentWithCommand executing command:', { componentId, data })
        if (canvasRef.current) {
          canvasRef.current.updateComponent(componentId, data)
          updateSelectedComponentData()
          updateCurrentComponents()
          forceCanvasUpdate() // Force visual update
          console.log('✅ updateComponentWithCommand command executed successfully')
        } else {
          console.log('❌ updateComponentWithCommand command execution: canvasRef.current is null')
        }
      }
    )

    console.log('🚀 updateComponentWithCommand executing command via commandSystem')
    commandSystem.executeCommand(command)
  }, [commandSystem, updateCurrentComponents, updateSelectedComponentData, forceCanvasUpdate])

  // Get default properties function (moved from canvas)
  const getDefaultProperties = (type: string): Record<string, string | number | boolean | string[] | null> => {
    switch (type) {
      case 'text':
        return { content: 'Sample Text', fontSize: 14, fontWeight: 'normal', color: '#000000', alignment: 'left' }
      case 'heading':
        return { content: 'Heading', fontSize: 24, fontWeight: 'bold', color: '#000000', alignment: 'left', level: 1 }
      case 'table':
        return { columns: ['Column 1', 'Column 2', 'Column 3'], rows: 5, showHeader: true, borderStyle: 'solid' }
      case 'chart':
        return { chartType: 'bar', dataSource: null, xAxis: null, yAxis: null, title: 'Chart Title' }
      case 'image':
        return { src: null, alt: 'Image', objectFit: 'cover', borderRadius: 0 }
      case 'container':
        return { backgroundColor: 'transparent', borderWidth: 0, borderColor: '#000000', padding: 10 }
      case 'rectangle':
        return { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4 }
      case 'circle':
        return { backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db' }
      default:
        return { backgroundColor: 'transparent' }
    }
  }

  // Configure drag sensors with minimal constraints for testing
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1, // Minimal distance for immediate activation
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 1, // Minimal distance for immediate activation
      },
    })
  )

  // Handle template loading
  const handleLoadTemplate = useCallback((templateComponents: Component[]) => {
    if (!canvasRef.current) return
    
    // Load template components into canvas (this will clear existing components)
    canvasRef.current.loadComponents(templateComponents)
    setSelectedComponent(null)
    updateCurrentComponents()
    setHasUnsavedChanges(false)
  }, [updateCurrentComponents])

  // Handle new report creation
  const handleNewReport = useCallback(() => {
    if (!canvasRef.current) return
    
    // Clear canvas and reset state
    canvasRef.current.clearComponents()
    setSelectedComponent(null)
    setCurrentComponents([])
    
    // Clear command history safely
    if (commandSystem && typeof commandSystem.clearHistory === 'function') {
      commandSystem.clearHistory()
    } else {
      console.error('CommandSystem clearHistory method not available:', commandSystem)
    }
    
    setReportTitle('Untitled Report')
    setHasUnsavedChanges(false)
  }, [commandSystem])

  // Handle save report (opens template save dialog)
  const handleSaveReport = useCallback(() => {
    // This will be handled by the TemplateManager's save functionality
    // For now, we'll just mark as saved
    setHasUnsavedChanges(false)
  }, [])

  // Handle zoom changes
  const handleZoomChange = useCallback((level: number) => {
    setZoomLevel(level)
  }, [])

  // Update selected component data when selection changes
  useEffect(() => {
    updateSelectedComponentData()
    updateCurrentComponents()
  }, [selectedComponent, updateSelectedComponentData, updateCurrentComponents])

  // Track unsaved changes
  useEffect(() => {
    if (currentComponents.length > 0) {
      setHasUnsavedChanges(true)
    }
  }, [currentComponents])

  // Handle property updates from properties panel with immediate visual feedback
  const handlePropertyUpdate = useCallback((property: string, value: string | number | boolean | string[] | null) => {
    if (!selectedComponent || !canvasRef.current) return

    try {
      // Validate property value
      if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
        console.warn(`Invalid numeric value for property ${property}:`, value)
        return
      }

      // Handle nested property updates (like properties.content)
      if (property.startsWith('properties.')) {
        const propName = property.substring(11) // Remove 'properties.' prefix
        const currentComponent = canvasRef.current.getComponent(selectedComponent)
        if (currentComponent) {
          const updatedProperties = {
            ...currentComponent.properties,
            [propName]: value
          }
          
          // Update component through command system
          updateComponentWithCommand(selectedComponent, { properties: updatedProperties })
          
          // Force immediate visual update
          forceCanvasUpdate()
          
          // Update selected component data immediately for properties panel
          setSelectedComponentData(prev => 
            prev ? { ...prev, properties: updatedProperties } : null
          )
        }
      } else {
        // Handle direct component property updates (like x, y, width, height)
        const updateData = { [property]: value }
        
        // Update component through command system
        updateComponentWithCommand(selectedComponent, updateData)
        
        // Force immediate visual update
        forceCanvasUpdate()
        
        // Update selected component data immediately for properties panel
        setSelectedComponentData(prev => 
          prev ? { ...prev, [property]: value } : null
        )
      }
    } catch (error) {
      console.error('Error updating component property:', error)
    }
  }, [selectedComponent, updateComponentWithCommand, forceCanvasUpdate])

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = event.active.id as string
    const dragData = event.active.data.current
    
    console.log('DND Drag started:', { activeId, dragData })
    
    // Handle palette component drags
    if (dragData && dragData.type === 'component') {
      console.log('✅ DND handling palette component drag')
      setActiveId(activeId)
      setDraggedComponent(dragData as { type: string; component: { id: string; name: string; description: string; icon: ReactNode; popular?: boolean } } | null)
      return
    }
    
    // Handle canvas component drags
    if (dragData && dragData.type === 'canvas-component') {
      console.log('✅ DND handling canvas component drag:', activeId)
      setActiveId(activeId)
      setDraggedComponent(null) // No visual drag overlay for canvas components
      return
    }
    
    console.log('⛔ Ignoring drag - unknown type')
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    const dragData = active.data.current
    
    console.log('DND Drag ended:', { activeId: active.id, over: over?.id, dragData })
    
    setActiveId(null)
    setDraggedComponent(null)
    
    // Handle palette component drop
    if (over && over.id === 'canvas' && dragData && dragData.type === 'component') {
      console.log('✅ DND handling palette component drop')
      // Calculate drop position
      const dropPosition = getDropPosition(event)
      
      // Add component to canvas using command system
      if (dropPosition && dragData.component) {
        addComponentWithCommand(dragData.component.id, dropPosition)
      }
      return
    }
    
    // Handle canvas component drag end
    if (dragData && dragData.type === 'canvas-component') {
      console.log('✅ DND canvas component drag ended - handled by component itself')
      // The component itself handles the position update via onDragEnd prop
      return
    }
  }

  // Calculate drop position relative to canvas, accounting for zoom and scroll
  const getDropPosition = (event: DragEndEvent): { x: number; y: number } | null => {
    // Find the actual A4 canvas element (the white paper area)
    const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement
    if (!canvasElement) {
      console.warn('Canvas element not found for drop position')
      return null
    }

    const canvasRect = canvasElement.getBoundingClientRect()
    const zoomLevel = parseFloat(canvasElement.style.transform.match(/scale\\(([^)]+)\\)/)?.[1] || '1')
    
    // Get mouse position from the over event which is more reliable for drop positioning
    let mouseX = 0
    let mouseY = 0
    
    // Try to get the current mouse position from event.delta or use pointer coordinates
    if (event.delta) {
      // Get the activator position and add delta
      const activatorEvent = event.activatorEvent as MouseEvent
      if (activatorEvent) {
        mouseX = activatorEvent.clientX + event.delta.x
        mouseY = activatorEvent.clientY + event.delta.y
      }
    } else if (event.activatorEvent) {
      // Fallback to activator event
      const activatorEvent = event.activatorEvent as MouseEvent
      mouseX = activatorEvent.clientX
      mouseY = activatorEvent.clientY
    } else {
      // Last resort: generate a position that's not X=0
      const existingComponents = canvasRef.current?.getAllComponents() || []
      const offsetX = (existingComponents.length % 5) * 160 // Spread components horizontally
      const offsetY = Math.floor(existingComponents.length / 5) * 120 // Stack rows
      return { 
        x: Math.min(offsetX, 600), 
        y: Math.min(offsetY, 800) 
      }
    }

    // Calculate position relative to the canvas
    const dropX = mouseX - canvasRect.left
    const dropY = mouseY - canvasRect.top
    
    // Adjust for zoom level (the canvas is scaled)
    const adjustedX = dropX / zoomLevel
    const adjustedY = dropY / zoomLevel
    
    // Snap to 5mm grid (approximately 19px at 96 DPI)
    const gridSize = 19
    const snappedX = Math.round(adjustedX / gridSize) * gridSize
    const snappedY = Math.round(adjustedY / gridSize) * gridSize
    
    // Ensure position is within canvas bounds and not negative
    // A4 dimensions: 210mm × 297mm ≈ 794px × 1123px at 96 DPI
    const canvasWidth = 794
    const canvasHeight = 1123
    const componentWidth = 150
    const componentHeight = 100
    
    const finalPosition = { 
      x: Math.max(38, Math.min(snappedX, canvasWidth - componentWidth)), // Start at least 38px from left
      y: Math.max(38, Math.min(snappedY, canvasHeight - componentHeight)) // Start at least 38px from top
    }
    
    console.log('Drop position calculation:', {
      mousePos: { mouseX, mouseY },
      canvasRect: { left: canvasRect.left, top: canvasRect.top },
      dropRelative: { dropX, dropY },
      adjusted: { adjustedX, adjustedY },
      final: finalPosition
    })
    
    return finalPosition
  }

  return (
    <DataBindingProvider>
      <ClientWrapper 
        fallback={
          <div className="flex h-screen flex-col bg-background">
            <DesignerHeader 
              onToggleDataPreview={() => setShowDataPreview(!showDataPreview)}
              showDataPreview={showDataPreview}
              reportTitle={reportTitle}
              currentComponents={[]}
              hasUnsavedChanges={false}
            />
            <div className="flex-1 overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <div className="h-full border-r bg-muted/40 p-4">
                    <div>
                      <h2 className="text-lg font-semibold">Components</h2>
                      <p className="text-sm text-muted-foreground">Loading components...</p>
                    </div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={55} minSize={40}>
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">Loading designer...</div>
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                  <div className="h-full border-l bg-background p-4">
                    <h2 className="text-lg font-semibold">Properties</h2>
                    <p className="text-sm text-muted-foreground">Loading properties...</p>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        }
      >
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            console.log('🔍 DND Event captured:', event.active.id, event.active.data.current)
            console.log('🔍 DND Event sensors:', sensors)
            console.log('🔍 DND Event full:', event)
            handleDragStart(event)
          }} 
          onDragEnd={(event) => {
            console.log('🔍 DND End captured:', event.active.id)
            handleDragEnd(event)
          }}
        >
          <div className="flex h-screen flex-col bg-background">
            {/* Header Navigation */}
            <DesignerHeader 
              onToggleDataPreview={() => setShowDataPreview(!showDataPreview)}
              showDataPreview={showDataPreview}
              showWorkflow={showWorkflow}
              onToggleWorkflow={() => setShowWorkflow(!showWorkflow)}
              canvasRef={canvasElementRef}
              reportTitle={reportTitle}
              currentComponents={currentComponents}
              onLoadTemplate={handleLoadTemplate}
              commandSystem={commandSystem}
              onNewReport={handleNewReport}
              onSaveReport={handleSaveReport}
              onZoomChange={handleZoomChange}
              hasUnsavedChanges={hasUnsavedChanges}
            />

            {/* Main Layout */}
            <div className="flex-1 overflow-hidden">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                {/* Component Palette */}
                <ResizablePanel defaultSize={showWorkflow ? 18 : 20} minSize={15} maxSize={30}>
                  <div data-testid="component-palette">
                    <ComponentPalette />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Center Panel Group (Canvas + Data Preview) */}
                <ResizablePanel defaultSize={showWorkflow ? 37 : 55} minSize={30}>
                  <ResizablePanelGroup direction="vertical" className="h-full">
                    {/* Design Canvas */}
                    <ResizablePanel defaultSize={showDataPreview ? 75 : 100} minSize={50}>
                      <div ref={canvasElementRef} data-testid="design-canvas">
                        <DesignCanvas 
                          ref={canvasRef}
                          selectedComponent={selectedComponent}
                          onSelectComponent={setSelectedComponent}
                          onDeleteComponent={deleteComponentWithCommand}
                          onDragEnd={(id, oldPos, newPos) => {
                            console.log('🎯 ReportDesigner onDragEnd START:', { id, oldPos, newPos, timestamp: Date.now() })
                            // Only create command if position actually changed
                            if (oldPos.x !== newPos.x || oldPos.y !== newPos.y) {
                              console.log('🎯 ReportDesigner calling updateComponentWithCommand:', { id, newPos })
                              updateComponentWithCommand(id, newPos)
                            } else {
                              console.log('🎯 ReportDesigner onDragEnd: No position change, skipping command')
                            }
                            console.log('🎯 ReportDesigner onDragEnd COMPLETE:', { id, timestamp: Date.now() })
                          }}
                          updateTrigger={updateTrigger}
                          zoomLevel={zoomLevel}
                          onZoomChange={handleZoomChange}
                        />
                      </div>
                    </ResizablePanel>

                    {/* Data Preview Panel */}
                    {showDataPreview && (
                      <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                          <DataPreviewPanel />
                        </ResizablePanel>
                      </>
                    )}
                  </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Workflow Panel */}
                {showWorkflow && (
                  <>
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
                      <WorkflowManager 
                        canvasRef={canvasElementRef}
                        components={currentComponents}
                        onComponentUpdate={updateComponentWithCommand}
                        onLoadTemplate={handleLoadTemplate}
                        reportTitle={reportTitle}
                      />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                  </>
                )}

                {/* Properties Panel */}
                <ResizablePanel defaultSize={showWorkflow ? 20 : 25} minSize={15} maxSize={35}>
                  <div data-testid="properties-panel">
                    <PropertiesPanel 
                      selectedComponent={selectedComponent}
                      componentData={selectedComponentData}
                      onPropertyUpdate={handlePropertyUpdate}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>

            {/* Drag Overlay */}
            <DragOverlay
              style={{
                zIndex: 9999,
                pointerEvents: 'none'
              }}
              dropAnimation={null}
              adjustScale={false}
              modifiers={[snapCenterToCursor]}
            >
              {activeId && draggedComponent?.component ? (
                <div className="bg-white border-2 border-primary rounded-lg shadow-lg p-2 opacity-90 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/20 text-primary">
                      {draggedComponent.component.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{draggedComponent.component.name}</span>
                  </div>
                </div>
              ) : (
                activeId && (
                  <div className="bg-primary text-primary-foreground px-2 py-1 rounded shadow-lg text-sm font-medium">
                    {activeId}
                  </div>
                )
              )}
            </DragOverlay>
          </div>
        </DndContext>
      </ClientWrapper>
    </DataBindingProvider>
  )
}