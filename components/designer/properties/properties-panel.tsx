'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Settings,
  Palette,
  Database,
  HelpCircle,
  RotateCcw
} from 'lucide-react'
import { PropertyGroup } from './property-group'
import { PropertyInput } from './property-input'
import { PropertyConfigRenderer } from './property-config-renderer'
import { DataBindingPanel } from '../data-binding/data-binding-panel'
import { getPropertyConfig } from '../component-registry'
import { smartDefaults } from '@/lib/smart-defaults'

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

interface PropertiesPanelProps {
  selectedComponent: string | null
  componentData: Component | null
  onPropertyUpdate: (property: string, value: string | number | boolean | string[] | null) => void
}

export function PropertiesPanel({ selectedComponent, componentData, onPropertyUpdate }: PropertiesPanelProps) {
  const component = componentData

  if (!selectedComponent || !component) {
    return (
      <div className="h-full border-l bg-background">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Properties</h2>
          <p className="text-sm text-muted-foreground">No component selected</p>
        </div>
        <div className="flex h-full items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Settings className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Select a Component</h3>
              <p className="text-sm text-muted-foreground">
                Click on a component in the canvas to edit its properties
              </p>
            </div>
            <Button variant="outline" size="sm">
              <HelpCircle className="mr-2 h-4 w-4" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝'
      case 'text-label': return '📝'
      case 'data-field': return '📊'
      case 'table': return '📊'
      case 'chart': return '📈'
      case 'image': return '🖼️'
      case 'qr-code': return '📱'
      case 'formula': return '🧮'
      case 'heading': return '📝'
      case 'rectangle': return '🔳'
      case 'circle': return '⭕'
      case 'container': return '📦'
      default: return '🔧'
    }
  }

  const handleResetToDefaults = (category: 'core' | 'style' | 'data') => {
    const defaults = smartDefaults.getComponentDefaults(component.type)
    const categoryDefaults = defaults[category]
    
    Object.entries(categoryDefaults).forEach(([key, value]) => {
      if (key === 'x' || key === 'y' || key === 'width' || key === 'height') {
        onPropertyUpdate(key, value)
      } else {
        onPropertyUpdate(`properties.${key}`, value)
      }
    })
  }

  // Get property config for this component
  const propertyConfig = getPropertyConfig(component.type)

  return (
    <div className="h-full border-l bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Properties</h2>
          <Badge variant="outline">{component.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Configure the selected component
        </p>
      </div>

      <ScrollArea className="flex-1 h-full">
        <div className="p-4 space-y-4">
          {/* Component Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-lg">{getComponentIcon(component.type)}</span>
                {component.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-muted-foreground">
                ID: {component.id}
              </div>
            </CardContent>
          </Card>

          {/* Property Tabs */}
          <Tabs defaultValue="core" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="core" className="text-xs">
                <Settings className="mr-1 h-3 w-3" />
                Core
              </TabsTrigger>
              <TabsTrigger value="style" className="text-xs">
                <Palette className="mr-1 h-3 w-3" />
                Style
              </TabsTrigger>
              <TabsTrigger value="data" className="text-xs">
                <Database className="mr-1 h-3 w-3" />
                Data
              </TabsTrigger>
            </TabsList>

            {/* Core Properties Tab */}
            <TabsContent value="core" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Core Properties</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => handleResetToDefaults('core')}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Layout Properties */}
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Layout</h4>
                <div className="grid grid-cols-2 gap-2">
                  <PropertyInput
                    label="X Position"
                    type="number"
                    value={component.x}
                    onChange={(value) => onPropertyUpdate('x', value)}
                    suffix="px"
                  />
                  <PropertyInput
                    label="Y Position"
                    type="number"
                    value={component.y}
                    onChange={(value) => onPropertyUpdate('y', value)}
                    suffix="px"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <PropertyInput
                    label="Width"
                    type="number"
                    value={component.width}
                    onChange={(value) => onPropertyUpdate('width', value)}
                    suffix="px"
                  />
                  <PropertyInput
                    label="Height"
                    type="number"
                    value={component.height}
                    onChange={(value) => onPropertyUpdate('height', value)}
                    suffix="px"
                  />
                </div>
              </div>

              {/* Component-specific core properties */}
              {propertyConfig && (
                <div className="space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Component</h4>
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                </div>
              )}
            </TabsContent>

            {/* Style Properties Tab */}
            <TabsContent value="style" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Style Properties</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => handleResetToDefaults('style')}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Component-specific style properties */}
              {propertyConfig && (
                <PropertyConfigRenderer
                  config={propertyConfig}
                  values={component.properties}
                  onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                  categoryFilter="style"
                />
              )}
            </TabsContent>

            {/* Data Properties Tab */}
            <TabsContent value="data" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Data & Behavior</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 text-xs"
                  onClick={() => handleResetToDefaults('data')}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>

              {/* Data Binding Panel */}
              <DataBindingPanel 
                component={component}
                onBindingChange={() => {
                  // Force re-render to update component with new data
                }}
              />

              {/* Component-specific data properties */}
              {propertyConfig && (
                <PropertyConfigRenderer
                  config={propertyConfig}
                  values={component.properties}
                  onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                  categoryFilter="data"
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  )
}