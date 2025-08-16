'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  Copy,
  Trash,
  Edit,
  MoveUp,
  MoveDown,
  Type,
  Table,
  Container,
  Minus,
  QrCode,
  Gauge
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
  onDelete: (id: string) => void
}

export function ReportComponent({
  component,
  selected,
  onSelect,
  onUpdate,
  onDelete,
}: ReportComponentProps) {
  const { getComponentData, getBinding } = useDataBinding()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const componentRef = useRef<HTMLDivElement>(null)
  const gridSize = 19 // Match the grid size from canvas

  // Get bound data for this component
  const binding = getBinding(component.id)
  const boundData = getComponentData(component.id)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    onSelect()
    
    setIsDragging(true)
    setDragStart({
      x: event.clientX - component.x,
      y: event.clientY - component.y,
    })
  }

  const handleResizeStart = (event: React.MouseEvent, direction: string) => {
    event.preventDefault()
    event.stopPropagation()
    
    onSelect()
    
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
  }

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (isDragging) {
      // Calculate new position
      const newX = Math.max(0, event.clientX - dragStart.x)
      const newY = Math.max(0, event.clientY - dragStart.y)
      
      // Snap to grid
      const snappedX = Math.round(newX / gridSize) * gridSize
      const snappedY = Math.round(newY / gridSize) * gridSize
      
      onUpdate(component.id, { x: snappedX, y: snappedY })
    }
    
    if (isResizing && resizeDirection) {
      const deltaX = event.clientX - dragStart.x
      const deltaY = event.clientY - dragStart.y
      
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
  }, [isDragging, isResizing, resizeDirection, dragStart, initialSize, component.id, component.x, component.y, onUpdate, gridSize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeDirection(null)
  }, [])

  // Add and cleanup mouse event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

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
                    borderBottomStyle: borderStyle,
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
            properties={component.properties as ChartProperties}
            width={component.width}
            height={component.height}
            selected={selected}
            onClick={onSelect}
          />
        )
      
      case 'image':
        // Handle data binding for image source
        const imageProperties = { ...component.properties } as ImageProperties
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
        const headingProperties = { ...component.properties } as HeadingProperties
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
            properties={component.properties as RectangleProperties}
            width={component.width}
            height={component.height}
            selected={selected}
            onClick={onSelect}
          />
        )
      
      case 'circle':
        return (
          <CircleComponent 
            properties={component.properties as CircleProperties}
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
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={componentRef}
          className={`absolute border-2 transition-all cursor-move ${
            selected 
              ? 'border-primary shadow-lg ring-2 ring-primary/20' 
              : 'border-transparent hover:border-primary/50'
          } ${isDragging ? 'z-50 shadow-2xl' : 'z-10'}`}
          style={{
            left: component.x,
            top: component.y,
            width: component.width,
            height: component.height,
          }}
          onMouseDown={handleMouseDown}
        >
          <Card className="h-full cursor-move">
            <div className="h-full">
              {renderComponentContent()}
            </div>
          </Card>

          {/* Selection handles */}
          {selected && (
            <>
              {/* Corner resize handles */}
              <div 
                className="absolute -top-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-nw-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
              />
              <div 
                className="absolute -top-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-ne-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
              />
              <div 
                className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-sw-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
              />
              <div 
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-se-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'se')}
              />
              
              {/* Edge resize handles */}
              <div 
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-n-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'n')}
              />
              <div 
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-s-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 's')}
              />
              <div 
                className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-w-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'w')}
              />
              <div 
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary border-2 border-white rounded-sm cursor-e-resize hover:bg-primary/80 transition-colors" 
                onMouseDown={(e) => handleResizeStart(e, 'e')}
              />
            </>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem onClick={() => console.log('Edit', component.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={() => console.log('Copy', component.id)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => console.log('Bring forward', component.id)}>
          <MoveUp className="mr-2 h-4 w-4" />
          Bring Forward
        </ContextMenuItem>
        <ContextMenuItem onClick={() => console.log('Send backward', component.id)}>
          <MoveDown className="mr-2 h-4 w-4" />
          Send Backward
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem 
          onClick={() => onDelete(component.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}