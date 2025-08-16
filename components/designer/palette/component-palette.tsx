'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Type,
  Table,
  BarChart3,
  Image,
  Square,
  QrCode,
  Minus,
  Container,
  Circle,
  Gauge,
  Calculator,
  Database,
  FileText,
  AlignLeft,
  AlignRight,
  Tag,
  BarChart2,
  Hash,
  Calendar
} from 'lucide-react'
import { DraggableComponent } from './draggable-component'

export interface ComponentType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: string
  popular?: boolean
}

const componentLibrary: ComponentType[] = [
  // Layout Components
  {
    id: 'page-header',
    name: 'Page Header',
    description: 'Repeating header content for report pages',
    icon: <AlignLeft className="h-4 w-4" />,
    category: 'Layout'
  },
  {
    id: 'page-footer',
    name: 'Page Footer',
    description: 'Repeating footer with page numbers and metadata',
    icon: <AlignRight className="h-4 w-4" />,
    category: 'Layout'
  },
  {
    id: 'line-divider',
    name: 'Line Divider',
    description: 'Visual separator for layout organization',
    icon: <Minus className="h-4 w-4" />,
    category: 'Layout'
  },
  {
    id: 'page-element',
    name: 'Page Element',
    description: 'Dynamic metadata (page numbers, dates)',
    icon: <Hash className="h-4 w-4" />,
    category: 'Layout'
  },
  {
    id: 'container',
    name: 'Container',
    description: 'Group and organize other components',
    icon: <Container className="h-4 w-4" />,
    category: 'Layout'
  },
  {
    id: 'spacer',
    name: 'Spacer',
    description: 'Add space between components',
    icon: <Minus className="h-4 w-4" />,
    category: 'Layout'
  },

  // Text Components
  {
    id: 'text-label',
    name: 'Text Label',
    description: 'Static text display with font controls',
    icon: <Type className="h-4 w-4" />,
    category: 'Text',
    popular: true
  },
  {
    id: 'heading',
    name: 'Heading',
    description: 'Hierarchical heading component (H1-H6)',
    icon: <AlignLeft className="h-4 w-4" />,
    category: 'Text'
  },

  // Data Components
  {
    id: 'data-field',
    name: 'Data Field',
    description: 'Dynamic data binding with format options',
    icon: <Database className="h-4 w-4" />,
    category: 'Data',
    popular: true
  },
  {
    id: 'table',
    name: 'Table',
    description: 'Tabular data display with column configuration',
    icon: <Table className="h-4 w-4" />,
    category: 'Data',
    popular: true
  },
  {
    id: 'chart',
    name: 'Chart',
    description: 'Data visualization charts',
    icon: <BarChart3 className="h-4 w-4" />,
    category: 'Data',
    popular: true
  },
  {
    id: 'formula',
    name: 'Formula',
    description: 'Calculated field with expression evaluation',
    icon: <Calculator className="h-4 w-4" />,
    category: 'Data'
  },
  {
    id: 'group-banner',
    name: 'Group Banner',
    description: 'Section header for data grouping',
    icon: <Tag className="h-4 w-4" />,
    category: 'Data'
  },
  {
    id: 'group-footer',
    name: 'Group Footer',
    description: 'Summary calculations for data groups',
    icon: <BarChart2 className="h-4 w-4" />,
    category: 'Data'
  },

  // Media Components
  {
    id: 'image',
    name: 'Image',
    description: 'Static or dynamic images',
    icon: <Image className="h-4 w-4" />,
    category: 'Media'
  },
  {
    id: 'qrcode',
    name: 'QR Code',
    description: 'Generate QR codes',
    icon: <QrCode className="h-4 w-4" />,
    category: 'Media'
  },

  // Shapes
  {
    id: 'rectangle',
    name: 'Rectangle',
    description: 'Basic rectangle shape',
    icon: <Square className="h-4 w-4" />,
    category: 'Shapes'
  },
  {
    id: 'circle',
    name: 'Circle',
    description: 'Basic circle shape',
    icon: <Circle className="h-4 w-4" />,
    category: 'Shapes'
  },

  // Controls
  {
    id: 'gauge',
    name: 'Gauge',
    description: 'Progress and KPI display',
    icon: <Gauge className="h-4 w-4" />,
    category: 'Controls'
  }
]

const categories = ['All', 'Layout', 'Text', 'Data', 'Media', 'Shapes', 'Controls']

export function ComponentPalette() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredComponents = componentLibrary.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularComponents = componentLibrary.filter(component => component.popular)

  return (
    <div className="w-full h-full border-r bg-muted/40">
      <div className="flex flex-col h-full">
        {/* Fixed Header Section */}
        <div className="p-4 space-y-4 flex-shrink-0 border-b">
          {/* Header */}
          <div>
            <h2 className="text-lg font-semibold">Components</h2>
            <p className="text-sm text-muted-foreground">Drag components to the canvas</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 py-1 text-xs rounded ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Components Section */}
        <ScrollArea className="flex-1 h-0">
          <div className="p-4 space-y-6 pb-4">
          {/* Popular Components (when no search/filter) */}
          {!searchTerm && selectedCategory === 'All' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Popular</h3>
                <Badge variant="secondary" className="text-xs">
                  {popularComponents.length}
                </Badge>
              </div>
              <div className="grid gap-2">
                {popularComponents.map(component => (
                  <DraggableComponent key={component.id} component={component} />
                ))}
              </div>
            </div>
          )}

          {/* All Components by Category */}
          {categories
            .filter(cat => cat !== 'All')
            .filter(cat => selectedCategory === 'All' || selectedCategory === cat)
            .map(category => {
              const categoryComponents = filteredComponents.filter(
                comp => comp.category === category
              )
              
              if (categoryComponents.length === 0) return null

              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryComponents.length}
                    </Badge>
                  </div>
                  <div className="grid gap-2">
                    {categoryComponents.map(component => (
                      <DraggableComponent key={component.id} component={component} />
                    ))}
                  </div>
                </div>
              )
            })}

          {/* No Results */}
          {filteredComponents.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No components found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filter
              </p>
            </div>
          )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}