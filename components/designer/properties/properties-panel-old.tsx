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
      case 'table': return '📊'
      case 'chart': return '📈'
      case 'image': return '🖼️'
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
              {component.type === 'text-label' && (() => {
                const propertyConfig = getPropertyConfig('text-label')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}

              {component.type === 'table' && (() => {
                const propertyConfig = getPropertyConfig('table')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}

              {component.type === 'text' && (
                <PropertyInput
                  label="Text Content"
                  type="textarea"
                  value={component.properties.content as string}
                  onChange={(value) => onPropertyUpdate('properties.content', value)}
                  placeholder="Enter your text here..."
                />
              )}

              {/* Phase 2 Migration: New Component Core Properties */}
              {component.type === 'image' && (() => {
                const propertyConfig = getPropertyConfig('image')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}

              {component.type === 'chart' && (() => {
                const propertyConfig = getPropertyConfig('chart')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}

              {component.type === 'heading' && (() => {
                const propertyConfig = getPropertyConfig('heading')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}

              {component.type === 'rectangle' && (() => {
                const propertyConfig = getPropertyConfig('rectangle')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}

              {component.type === 'circle' && (() => {
                const propertyConfig = getPropertyConfig('circle')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="core"
                  />
                ) : null
              })()}
            </PropertyGroup>

            {/* Style Properties - Collapsible */}
            <PropertyGroup 
              title="Style Properties" 
              defaultExpanded={false}
              icon={<Palette className="h-3 w-3" />}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Visual appearance</span>
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
              {component.type === 'text-label' && (() => {
                const propertyConfig = getPropertyConfig('text-label')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {component.type === 'table' && (() => {
                const propertyConfig = getPropertyConfig('table')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {component.type === 'text' && (
                <>
                  <PropertyInput
                    label="Font Size"
                    type="number"
                    value={component.properties.fontSize as number}
                    onChange={(value) => onPropertyUpdate('properties.fontSize', value)}
                    suffix="px"
                    min={8}
                    max={72}
                  />
                  <PropertyInput
                    label="Font Weight"
                    type="select"
                    value={component.properties.fontWeight as string}
                    onChange={(value) => onPropertyUpdate('properties.fontWeight', value)}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'bold', label: 'Bold' },
                      { value: '100', label: 'Thin' },
                      { value: '300', label: 'Light' },
                      { value: '500', label: 'Medium' },
                      { value: '600', label: 'Semibold' },
                      { value: '700', label: 'Bold' },
                      { value: '900', label: 'Black' },
                    ]}
                  />
                  <PropertyInput
                    label="Color"
                    type="color"
                    value={component.properties.color as string}
                    onChange={(value) => onPropertyUpdate('properties.color', value)}
                  />
                  <PropertyInput
                    label="Text Align"
                    type="select"
                    value={component.properties.alignment as string}
                    onChange={(value) => onPropertyUpdate('properties.alignment', value)}
                    options={[
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' },
                      { value: 'justify', label: 'Justify' },
                    ]}
                  />
                </>
              )}

              {/* Phase 2 Migration: New Component Style Properties */}
              {component.type === 'image' && (() => {
                const propertyConfig = getPropertyConfig('image')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {component.type === 'chart' && (() => {
                const propertyConfig = getPropertyConfig('chart')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {component.type === 'heading' && (() => {
                const propertyConfig = getPropertyConfig('heading')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {component.type === 'rectangle' && (() => {
                const propertyConfig = getPropertyConfig('rectangle')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {component.type === 'circle' && (() => {
                const propertyConfig = getPropertyConfig('circle')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="style"
                  />
                ) : null
              })()}

              {/* Common style properties */}
              <PropertyInput
                label="Background Color"
                type="color"
                value={component.properties.backgroundColor as string || "#ffffff"}
                onChange={(value) => onPropertyUpdate('properties.backgroundColor', value)}
              />
              <PropertyInput
                label="Border Width"
                type="number"
                value={component.properties.borderWidth as number || 0}
                onChange={(value) => onPropertyUpdate('properties.borderWidth', value)}
                suffix="px"
                min={0}
                max={10}
              />
              <PropertyInput
                label="Border Color"
                type="color"
                value={component.properties.borderColor as string || "#000000"}
                onChange={(value) => onPropertyUpdate('properties.borderColor', value)}
              />
            </PropertyGroup>

            {/* Data Properties - Collapsible */}
            <PropertyGroup 
              title="Data Properties" 
              defaultExpanded={false}
              icon={<Database className="h-3 w-3" />}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">Data binding & behavior</span>
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
                  // In a real app, this would trigger data updates
                }}
              />

              {/* Component-specific data properties */}
              {component.type === 'text-label' && (() => {
                const propertyConfig = getPropertyConfig('text-label')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="data"
                  />
                ) : null
              })()}

              {/* Phase 2 Migration: Chart Data Properties */}
              {component.type === 'chart' && (() => {
                const propertyConfig = getPropertyConfig('chart')
                return propertyConfig ? (
                  <PropertyConfigRenderer
                    config={propertyConfig}
                    values={component.properties}
                    onValueChange={(key, value) => onPropertyUpdate(`properties.${key}`, value)}
                    categoryFilter="data"
                  />
                ) : null
              })()}

              {/* Visibility & Behavior */}
              <div className="space-y-3 border-t pt-3 mt-3">
                <h4 className="text-sm font-medium">Visibility & Behavior</h4>
                <PropertyInput
                  label="Visible"
                  type="checkbox"
                  value={component.properties.visible as boolean ?? true}
                  onChange={(value) => onPropertyUpdate('properties.visible', value)}
                />
                <PropertyInput
                  label="Print Only"
                  type="checkbox"
                  value={component.properties.printOnly as boolean ?? false}
                  onChange={(value) => onPropertyUpdate('properties.printOnly', value)}
                />
                <PropertyInput
                  label="Page Break Before"
                  type="checkbox"
                  value={component.properties.pageBreakBefore as boolean ?? false}
                  onChange={(value) => onPropertyUpdate('properties.pageBreakBefore', value)}
                />
                <PropertyInput
                  label="Page Break After"
                  type="checkbox"
                  value={component.properties.pageBreakAfter as boolean ?? false}
                  onChange={(value) => onPropertyUpdate('properties.pageBreakAfter', value)}
                />
                <PropertyInput
                  label="Show When"
                  type="textarea"
                  value={component.properties.showCondition as string || ""}
                  onChange={(value) => onPropertyUpdate('properties.showCondition', value)}
                  placeholder="e.g., data.total > 1000"
                />
                <div className="text-xs text-muted-foreground">
                  Use JavaScript expressions to conditionally show this component
                </div>
              </div>
            </PropertyGroup>

          </div>
        </div>
      </ScrollArea>
    </div>
  )
}