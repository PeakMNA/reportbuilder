'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import {
  Type,
  Table,
  Container,
  Minus,
  QrCode,
  Gauge,
  GripVertical
} from 'lucide-react'
import { useDataBinding } from '../data-binding/data-binding-context'

// Import new migrated components
import { ImageComponent, type ImageProperties } from '../image'
import { ChartComponent, type ChartProperties } from '../chart' 
import { HeadingComponent, type HeadingProperties } from '../heading'
import { RectangleComponent, type RectangleProperties } from '../rectangle'
import { CircleComponent, type CircleProperties } from '../circle'

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

interface ReportComponentProps {
  component: Component
  selected: boolean
  onSelect: () => void
  onUpdate: (id: string, updates: Partial<Component>) => void
  onDragEnd?: (id: string, oldPosition: { x: number; y: number }, newPosition: { x: number; y: number }) => void
  onDelete: (id: string) => void
  zoomLevel?: number // Optional zoom level prop
}

export function ReportComponent({
  component,
  selected,
  onSelect,
  onUpdate,
  onDragEnd,
  onDelete: _onDelete,
  zoomLevel = 100,
}: ReportComponentProps) {
  const { getComponentData, getBinding } = useDataBinding()
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const componentRef = useRef<HTMLDivElement>(null)
  const activePointerIdRef = useRef<number | null>(null)
  const gridSize = 19 // Match the grid size from canvas
  
  // Use @dnd-kit's useDraggable hook for better drag handling
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: component.id,
    data: {
      type: 'canvas-component',
      component
    },
    disabled: isResizing // Disable dragging while resizing
  })
  
  // Refs for resize handles
  const resizeHandleRefs = useRef<{
    nw: HTMLDivElement | null
    ne: HTMLDivElement | null
    sw: HTMLDivElement | null
    se: HTMLDivElement | null
    n: HTMLDivElement | null
    s: HTMLDivElement | null
    w: HTMLDivElement | null
    e: HTMLDivElement | null
  }>({
    nw: null, ne: null, sw: null, se: null,
    n: null, s: null, w: null, e: null
  })

  // Get bound data for this component
  const binding = getBinding(component.id)
  const boundData = getComponentData(component.id)

  // Apply transform from @dnd-kit when dragging
  const style = {
    left: `${component.x}px`,
    top: `${component.y}px`,
    width: `${component.width}px`,
    height: `${component.height}px`,
    transform: CSS.Transform.toString(transform),
    zIndex: isDragging ? 50 : selected ? 20 : 10,
    userSelect: 'none' as const,
    touchAction: 'none' as const,
    pointerEvents: 'auto' as const,
  }
  
  // Handle drag end from @dnd-kit
  useEffect(() => {
    if (!isDragging && transform && onDragEnd) {
      // Calculate new position from transform
      const deltaX = transform.x || 0
      const deltaY = transform.y || 0
      
      // Snap to grid
      const newX = Math.max(0, Math.round((component.x + deltaX) / gridSize) * gridSize)
      const newY = Math.max(0, Math.round((component.y + deltaY) / gridSize) * gridSize)
      
      if (newX !== component.x || newY !== component.y) {
        console.log('🎯 @dnd-kit drag ended, calling onDragEnd:', { 
          componentId: component.id,
          oldPos: { x: component.x, y: component.y },
          newPos: { x: newX, y: newY },
          delta: { x: deltaX, y: deltaY }
        })
        
        onDragEnd(component.id, { x: component.x, y: component.y }, { x: newX, y: newY })
      }
    }
  }, [isDragging, transform, component.x, component.y, component.id, onDragEnd, gridSize])

  console.log('🔍 ReportComponent render:', { 
    id: component.id, 
    position: { x: component.x, y: component.y },
    isDragging, 
    isResizing, 
    selected,
    transform,
    listenersAttached: !!listeners,
    attributesAttached: !!attributes,
    timestamp: Date.now()
  })

  // Handle component selection without interfering with @dnd-kit drag
  const handleComponentClick = (event: React.MouseEvent) => {
    // Don't interfere if clicking on resize handles
    const target = event.target as HTMLElement
    if (target.classList.contains('resize-handle')) {
      return
    }
    
    // Select the component
    onSelect()
  }

  const handleResizeStart = useCallback((event: React.PointerEvent | React.MouseEvent, direction: string) => {
    try {
      console.log('🔄 Resize start for component:', component.id, 'Direction:', direction)
      
      // CRITICAL: Stop all propagation immediately to prevent dnd-kit interference
      event.preventDefault()
      event.stopPropagation()
      
      onSelect()

      // Capture pointer when available
      if ('pointerId' in event) {
        activePointerIdRef.current = (event as React.PointerEvent).pointerId
        try {
          if (componentRef.current && componentRef.current.setPointerCapture) {
            componentRef.current.setPointerCapture((event as React.PointerEvent).pointerId)
            console.log('✅ Pointer capture set for resize:', (event as React.PointerEvent).pointerId)
          }
        } catch (error) {
          console.warn('⚠️ Failed to set pointer capture for resize:', error)
        }
      }
      
      setIsResizing(true)
      setResizeDirection(direction)
      setDragStart({
        x: event.clientX,
        y: event.clientY,
      })
      setInitialSize({
        width: component.width,
        height: component.height,
      })
      
      console.log('📏 Resize initialized:', { 
        direction, 
        initialSize: { width: component.width, height: component.height },
        clientPos: { x: event.clientX, y: event.clientY }
      })
    } catch (error) {
      console.error('Error in handleResizeStart:', error)
    }
  }, [component.id, component.width, component.height, onSelect])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    try {
      if (isResizing && resizeDirection) {
        // Adjust delta for zoom (using passed zoomLevel prop)
        const zoomFactor = zoomLevel / 100
        const deltaX = (event.clientX - dragStart.x) / zoomFactor
        const deltaY = (event.clientY - dragStart.y) / zoomFactor
        
        let newWidth = initialSize.width
        let newHeight = initialSize.height
        let newX = component.x
        let newY = component.y
        
        // Calculate new dimensions based on resize direction
        switch (resizeDirection) {
          case 'nw': // Northwest
            newWidth = Math.max(50, initialSize.width - deltaX)
            newHeight = Math.max(30, initialSize.height - deltaY)
            newX = component.x + (initialSize.width - newWidth)
            newY = component.y + (initialSize.height - newHeight)
            break
          case 'ne': // Northeast
            newWidth = Math.max(50, initialSize.width + deltaX)
            newHeight = Math.max(30, initialSize.height - deltaY)
            newY = component.y + (initialSize.height - newHeight)
            break
          case 'sw': // Southwest
            newWidth = Math.max(50, initialSize.width - deltaX)
            newHeight = Math.max(30, initialSize.height + deltaY)
            newX = component.x + (initialSize.width - newWidth)
            break
          case 'se': // Southeast
            newWidth = Math.max(50, initialSize.width + deltaX)
            newHeight = Math.max(30, initialSize.height + deltaY)
            break
          case 'n': // North
            newHeight = Math.max(30, initialSize.height - deltaY)
            newY = component.y + (initialSize.height - newHeight)
            break
          case 's': // South
            newHeight = Math.max(30, initialSize.height + deltaY)
            break
          case 'w': // West
            newWidth = Math.max(50, initialSize.width - deltaX)
            newX = component.x + (initialSize.width - newWidth)
            break
          case 'e': // East
            newWidth = Math.max(50, initialSize.width + deltaX)
            break
        }
        
        // Snap dimensions to grid
        const snappedWidth = Math.round(newWidth / gridSize) * gridSize
        const snappedHeight = Math.round(newHeight / gridSize) * gridSize
        const snappedX = Math.round(newX / gridSize) * gridSize
        const snappedY = Math.round(newY / gridSize) * gridSize
        
        onUpdate(component.id, {
          x: snappedX,
          y: snappedY,
          width: Math.max(gridSize * 2, snappedWidth), // Minimum 2 grid units
          height: Math.max(gridSize, snappedHeight), // Minimum 1 grid unit
        })
      }
    } catch (error) {
      console.error('Error in resize handling:', error)
    }
  }, [isResizing, resizeDirection, dragStart, initialSize, component.id, component.x, component.y, onUpdate, gridSize, zoomLevel])

  const handleMouseUp = useCallback((event: MouseEvent | PointerEvent) => {
    console.log('🛑 Mouse up - ending resize for:', component.id, 'Was resizing:', isResizing, 'Event:', event.type)
    
    // Release pointer capture
    if (activePointerIdRef.current != null) {
      try {
        if (componentRef.current && componentRef.current.releasePointerCapture) {
          componentRef.current.releasePointerCapture(activePointerIdRef.current)
          console.log('🔓 Pointer capture released:', activePointerIdRef.current)
        }
      } catch (error) {
        console.warn('⚠️ Failed to release pointer capture:', error)
      }
      activePointerIdRef.current = null
    }

    setIsResizing(false)
    setResizeDirection(null)
  }, [component.id, isResizing])


  // Add native event listeners to resize handles using refs
  useEffect(() => {
    if (!selected) return // Only attach when selected
    
    const handles = resizeHandleRefs.current
    const listeners: Array<{ element: HTMLDivElement; direction: string; listener: (e: PointerEvent) => void }> = []

    Object.entries(handles).forEach(([direction, element]) => {
      if (element) {
        const nativeResizeHandler = (event: PointerEvent) => {
          console.log('🎯 NATIVE Resize Handle PointerDown:', direction, event.type)
          
          // Convert to React-like event for existing handler
          const syntheticEvent = {
            button: event.button,
            clientX: event.clientX,
            clientY: event.clientY,
            pageX: event.pageX,
            pageY: event.pageY,
            pointerId: event.pointerId,
            target: event.target,
            currentTarget: element,
            preventDefault: () => event.preventDefault(),
            stopPropagation: () => event.stopPropagation(),
            nativeEvent: event,
          } as unknown as React.PointerEvent

          // Call our existing resize handler
          handleResizeStart(syntheticEvent, direction)
        }

        console.log('🔧 Attaching native resize listener to:', direction, 'handle')
        element.addEventListener('pointerdown', nativeResizeHandler, { passive: false })
        listeners.push({ element, direction, listener: nativeResizeHandler })
      }
    })

    return () => {
      listeners.forEach(({ element, direction, listener }) => {
        console.log('🗑️ Removing native resize listener from:', direction, 'handle')
        element.removeEventListener('pointerdown', listener)
      })
    }
  }, [selected, handleResizeStart]) // Re-attach when selection changes

  // Add and cleanup mouse event listeners for resize only
  useEffect(() => {
    if (isResizing) {
      console.log('📎 Adding global mouse listeners for resize:', component.id)
      
      // Prefer pointer events on the component when we have capture
      const target: EventTarget = activePointerIdRef.current != null && componentRef.current ? componentRef.current : document
      const moveType = activePointerIdRef.current != null ? 'pointermove' : 'mousemove'
      const upType = activePointerIdRef.current != null ? 'pointerup' : 'mouseup'

      const moveHandler = (e: Event) => handleMouseMove(e as MouseEvent)
      const upHandler = (e: Event) => handleMouseUp(e as MouseEvent | PointerEvent)

      target.addEventListener(moveType, moveHandler, { passive: false })
      target.addEventListener(upType, upHandler, { passive: false })
      
      return () => {
        console.log('🗑️ Removing global mouse listeners for:', component.id)
        target.removeEventListener(moveType, moveHandler)
        target.removeEventListener(upType, upHandler)
      }
    }
  }, [isResizing, component.id, handleMouseMove, handleMouseUp])

  const renderComponentContent = () => {
    switch (component.type) {
      case 'text':
        // Get dynamic content from bound data if available
        let textContent = component.properties.content || 'Sample Text'
        if (binding && boundData && boundData.length > 0) {
          const fieldMapping = binding.fieldMappings['content']
          if (fieldMapping && boundData[0][fieldMapping]) {
            textContent = String(boundData[0][fieldMapping])
          }
        }
        
        return (
          <div className="h-full flex items-center justify-start p-2">
            <Type className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <div className="flex-1" style={{
              fontSize: `${component.properties.fontSize || 14}px`,
              fontWeight: (component.properties.fontWeight as string) || 'normal',
              color: (component.properties.color as string) || '#000000',
              textAlign: (component.properties.alignment as 'left' | 'center' | 'right' | 'justify') || 'left'
            }}>
              {textContent}
            </div>
            {binding && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Data Bound" />
              </div>
            )}
          </div>
        )
      
      case 'table':
        // Use bound data for table if available
        const tableData = boundData || []
        let columns = (component.properties.columns as string[]) || ['Column 1', 'Column 2', 'Column 3']
        
        if (binding && boundData && boundData.length > 0) {
          // Use the mapped columns from the field mappings
          const mappedColumns = Object.keys(binding.fieldMappings)
          if (mappedColumns.length > 0) {
            columns = mappedColumns
          }
        }
        
        const rows = (component.properties.rows as number) || 5
        const showHeader = component.properties.showHeader ?? true
        const borderStyle = (component.properties.borderStyle as string) || 'solid'
        const backgroundColor = (component.properties.backgroundColor as string) || '#ffffff'
        const headerBackgroundColor = (component.properties.headerBackgroundColor as string) || '#f8f9fa'
        
        return (
          <div className="h-full p-2 relative">
            <div className="flex items-center mb-2">
              <Table className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">Data Table</span>
              {binding && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Data Bound" />
                </div>
              )}
            </div>
            <div 
              className="rounded overflow-hidden text-xs"
              style={{
                borderStyle: borderStyle,
                borderWidth: borderStyle === 'none' ? '0' : '1px',
                borderColor: '#d1d5db',
                backgroundColor: backgroundColor
              }}
            >
              {showHeader && (
                <div 
                  className="p-1 flex"
                  style={{ 
                    backgroundColor: headerBackgroundColor,
                    borderBottomStyle: borderStyle as React.CSSProperties['borderBottomStyle'],
                    borderBottomWidth: borderStyle === 'none' ? '0' : '1px',
                    borderBottomColor: '#d1d5db'
                  }}
                >
                  {columns.map((col: string, i: number) => (
                    <div key={i} className="flex-1 px-1 truncate font-medium">{col}</div>
                  ))}
                </div>
              )}
              <div className="space-y-px overflow-auto" style={{ maxHeight: `${Math.max(80, rows * 24 + 16)}px` }}>
                {tableData.length > 0 ? (
                  tableData.slice(0, rows).map((row, i) => (
                    <div key={i} className="flex p-1 hover:bg-muted/50">
                      {columns.map((col: string, j: number) => (
                        <div key={j} className="flex-1 px-1 truncate">
                          {String(row[binding?.fieldMappings[col] || col] || '')}
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex p-1">
                      {columns.map((_: string, j: number) => (
                        <div key={j} className="flex-1 px-1 text-muted-foreground">
                          Data {i + 1}.{j + 1}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )
      
      case 'chart':
        return (
          <ChartComponent 
            properties={component.properties as unknown as ChartProperties}
            width={component.width}
            height={component.height}
            selected={selected}
            onClick={onSelect}
          />
        )
      
      case 'image':
        // Handle data binding for image source
        const imageProperties = { ...component.properties } as unknown as ImageProperties
        if (binding && boundData && boundData.length > 0) {
          const fieldMapping = binding.fieldMappings['src']
          if (fieldMapping && boundData[0][fieldMapping]) {
            imageProperties.src = String(boundData[0][fieldMapping])
          }
        }
        
        return (
          <div className="relative h-full">
            <ImageComponent 
              properties={imageProperties}
              width={component.width}
              height={component.height}
              selected={selected}
              onClick={onSelect}
            />
            {binding && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Data Bound" />
              </div>
            )}
          </div>
        )
      
      case 'heading':
        // Handle data binding for heading content
        const headingProperties = { ...component.properties } as unknown as HeadingProperties
        if (binding && boundData && boundData.length > 0) {
          const fieldMapping = binding.fieldMappings['content']
          if (fieldMapping && boundData[0][fieldMapping]) {
            headingProperties.content = String(boundData[0][fieldMapping])
          }
        }
        
        return (
          <div className="relative h-full">
            <HeadingComponent 
              properties={headingProperties}
              width={component.width}
              height={component.height}
              selected={selected}
              onClick={onSelect}
            />
            {binding && (
              <div className="absolute -top-1 -right-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Data Bound" />
              </div>
            )}
          </div>
        )
      
      case 'container':
        return (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
            <div className="text-center">
              <Container className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Container</span>
            </div>
          </div>
        )
      
      case 'spacer':
        return (
          <div className="h-full flex items-center justify-center border border-dashed border-muted-foreground/50">
            <div className="text-center">
              <Minus className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">Spacer</span>
            </div>
          </div>
        )
      
      case 'qrcode':
        return (
          <div className="h-full flex flex-col items-center justify-center p-2">
            <QrCode className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-xs text-muted-foreground text-center">
              QR Code
            </span>
            <div className="mt-2 w-16 h-16 border-2 border-muted-foreground/30 flex items-center justify-center">
              <div className="grid grid-cols-4 gap-px">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 h-1 ${
                      Math.random() > 0.5 ? 'bg-foreground' : 'bg-background'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'rectangle':
        return (
          <RectangleComponent 
            properties={component.properties as unknown as RectangleProperties}
            width={component.width}
            height={component.height}
            selected={selected}
            onClick={onSelect}
          />
        )
      
      case 'circle':
        return (
          <CircleComponent 
            properties={component.properties as unknown as CircleProperties}
            width={component.width}
            height={component.height}
            selected={selected}
            onClick={onSelect}
          />
        )
      
      case 'gauge':
        return (
          <div className="h-full flex flex-col items-center justify-center p-2">
            <Gauge className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-sm font-medium mb-1">
              {component.properties.title || 'Progress'}
            </span>
            <div className="relative w-16 h-8 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{
                  width: `${component.properties.value || 75}%`,
                  backgroundColor: (component.properties.color as string) || '#3b82f6'
                }}
              />
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              {component.properties.value || 75}%
            </span>
          </div>
        )
      
      default:
        return (
          <div className="h-full flex items-center justify-center">
            <span className="text-sm text-muted-foreground">{component.type}</span>
          </div>
        )
    }
  }

  return (
    <div
      ref={(node) => {
        componentRef.current = node
        setNodeRef(node)
      }}
      data-canvas-component="true"
      data-component-id={component.id}
      className={`component absolute border-2 ${
        selected 
          ? 'border-primary shadow-lg ring-2 ring-primary/20' 
          : 'border-transparent hover:border-primary/50'
      } ${isDragging || isResizing ? '' : 'transition-all'}`}
      style={style}
      onClick={handleComponentClick}
    >
      <Card className="h-full w-full">
        {/* Drag handle for @dnd-kit - only show when selected */}
        {selected && !isResizing && (
          <div 
            ref={setActivatorNodeRef}
            className="absolute -top-1 -left-1 w-6 h-6 bg-primary border border-white rounded-sm cursor-grab flex items-center justify-center shadow-sm hover:bg-primary/80 transition-colors z-10"
            {...attributes}
            {...listeners}
            title="Drag to move component"
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="h-3 w-3 text-white" />
          </div>
        )}
        
        <div className="h-full w-full">
          {renderComponentContent()}
        </div>
      </Card>

      {/* Selection handles */}
      {selected && (
        <>
          {/* Corner resize handles - Using refs with native event listeners */}
          <div 
            ref={(el) => { resizeHandleRefs.current.nw = el }}
            className="resize-handle absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-nw-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="nw"
          />
          <div 
            ref={(el) => { resizeHandleRefs.current.ne = el }}
            className="resize-handle absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-ne-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="ne"
          />
          <div 
            ref={(el) => { resizeHandleRefs.current.sw = el }}
            className="resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-sw-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="sw"
          />
          <div 
            ref={(el) => { resizeHandleRefs.current.se = el }}
            className="resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-se-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="se"
          />
          
          {/* Edge resize handles - Using refs with native event listeners */}
          <div 
            ref={(el) => { resizeHandleRefs.current.n = el }}
            className="resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-n-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="n"
          />
          <div 
            ref={(el) => { resizeHandleRefs.current.s = el }}
            className="resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-s-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="s"
          />
          <div 
            ref={(el) => { resizeHandleRefs.current.w = el }}
            className="resize-handle absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-w-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="w"
          />
          <div 
            ref={(el) => { resizeHandleRefs.current.e = el }}
            className="resize-handle absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-e-resize hover:bg-primary/80 transition-colors"
            data-resize-direction="e"
          />
        </>
      )}
    </div>
  )
}