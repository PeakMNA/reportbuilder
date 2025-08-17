'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Database, 
  ArrowRight, 
  Link, 
  Unlink,
  Type,
  Hash,
  Calendar,
  ToggleLeft
} from 'lucide-react'

interface DataField {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  sample?: unknown
}

interface ComponentProperty {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  label: string
  required?: boolean
}

interface FieldMapperProps {
  dataFields: DataField[]
  componentProperties: ComponentProperty[]
  bindings: Record<string, string>
  onBindingChange: (property: string, field: string | null) => void
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'string': return <Type className="h-3 w-3" />
    case 'number': return <Hash className="h-3 w-3" />
    case 'date': return <Calendar className="h-3 w-3" />
    case 'boolean': return <ToggleLeft className="h-3 w-3" />
    default: return <Type className="h-3 w-3" />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'string': return 'border-blue-200 bg-blue-50 text-blue-700'
    case 'number': return 'border-green-200 bg-green-50 text-green-700'
    case 'date': return 'border-purple-200 bg-purple-50 text-purple-700'
    case 'boolean': return 'border-orange-200 bg-orange-50 text-orange-700'
    default: return 'border-gray-200 bg-gray-50 text-gray-700'
  }
}

export function FieldMapper({ 
  dataFields, 
  componentProperties, 
  bindings, 
  onBindingChange 
}: FieldMapperProps) {
  const [draggedField, setDraggedField] = useState<DataField | null>(null)
  const [dragOverProperty, setDragOverProperty] = useState<string | null>(null)

  const handleDragStart = (field: DataField) => {
    setDraggedField(field)
  }

  const handleDragEnd = () => {
    setDraggedField(null)
    setDragOverProperty(null)
  }

  const handleDrop = (property: ComponentProperty, field: DataField) => {
    // Type compatibility check
    const isCompatible = 
      property.type === field.type || 
      property.type === 'string' || // String can accept any type
      (property.type === 'number' && field.type === 'string') // Numbers can be parsed from strings

    if (isCompatible) {
      onBindingChange(property.name, field.name)
    }
  }

  const handleRemoveBinding = (property: string) => {
    onBindingChange(property, null)
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-64">
      {/* Data Fields (Left Side) */}
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Available Data Fields</span>
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {dataFields.map((field) => (
                <div
                  key={field.name}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onDragEnd={handleDragEnd}
                  className={`
                    p-2 rounded border cursor-grab active:cursor-grabbing
                    hover:shadow-sm transition-all duration-150
                    ${getTypeColor(field.type)}
                    ${draggedField?.name === field.name ? 'opacity-50 scale-95' : ''}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {getTypeIcon(field.type)}
                    <span className="text-xs font-medium">{field.name}</span>
                  </div>
                  {field.sample != null && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Sample: {String(field.sample as string | number).substring(0, 20)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Component Properties (Right Side) */}
      <Card className="border-dashed">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <Link className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Component Properties</span>
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {componentProperties.map((property) => {
                const boundField = bindings[property.name]
                const boundFieldData = dataFields.find(f => f.name === boundField)
                
                return (
                  <div
                    key={property.name}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragOverProperty(property.name)
                    }}
                    onDragLeave={() => setDragOverProperty(null)}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (draggedField) {
                        handleDrop(property, draggedField)
                      }
                      setDragOverProperty(null)
                    }}
                    className={`
                      p-2 rounded border transition-all duration-150
                      ${dragOverProperty === property.name 
                        ? 'border-primary bg-primary/10 border-dashed' 
                        : 'border-muted-foreground/25'
                      }
                      ${boundField ? 'bg-green-50 border-green-200' : 'bg-muted/20'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(property.type)}
                        <span className="text-xs font-medium">{property.label}</span>
                        {property.required && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                      {boundField && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveBinding(property.name)}
                          className="h-5 w-5 p-0"
                        >
                          <Unlink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {boundField ? (
                      <div className="mt-1 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-green-600" />
                        <Badge variant="outline" className="text-xs">
                          {boundField}
                        </Badge>
                        {boundFieldData && (
                          <Badge variant="secondary" className="text-xs">
                            {boundFieldData.type}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {dragOverProperty === property.name 
                          ? 'Drop data field here' 
                          : 'Drag a data field here'
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}