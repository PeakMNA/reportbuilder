'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Database,
  Link,
  Unlink,
  Settings,
  SortAsc,
  SortDesc,
  Plus,
  Trash2,
  Eye,
  RefreshCw
} from 'lucide-react'
import { useDataBinding, DataBinding, DataFilter, DataSort } from './data-binding-context'
import { Component } from '../canvas/design-canvas'
import { FieldMapper } from './field-mapper'

interface DataBindingPanelProps {
  component: Component | null
  onBindingChange?: () => void
}

// Helper function to get component properties based on component type
const getComponentProperties = (component: Component) => {
  const baseProperties = [
    { name: 'id', type: 'string' as const, label: 'ID', required: false }
  ]

  switch (component.type) {
    case 'text':
      return [
        ...baseProperties,
        { name: 'content', type: 'string' as const, label: 'Text Content', required: true },
        { name: 'color', type: 'string' as const, label: 'Text Color', required: false }
      ]
    case 'heading':
      return [
        ...baseProperties,
        { name: 'content', type: 'string' as const, label: 'Heading Text', required: true },
        { name: 'level', type: 'number' as const, label: 'Heading Level', required: false }
      ]
    case 'image':
      return [
        ...baseProperties,
        { name: 'src', type: 'string' as const, label: 'Image URL', required: true },
        { name: 'alt', type: 'string' as const, label: 'Alt Text', required: false }
      ]
    case 'table':
      return [
        ...baseProperties,
        { name: 'dataSource', type: 'string' as const, label: 'Data Source', required: true },
        { name: 'columns', type: 'string' as const, label: 'Column Configuration', required: false }
      ]
    case 'chart':
      return [
        ...baseProperties,
        { name: 'xField', type: 'string' as const, label: 'X-Axis Field', required: true },
        { name: 'yField', type: 'number' as const, label: 'Y-Axis Field', required: true },
        { name: 'chartType', type: 'string' as const, label: 'Chart Type', required: false }
      ]
    case 'button':
      return [
        ...baseProperties,
        { name: 'label', type: 'string' as const, label: 'Button Text', required: true },
        { name: 'action', type: 'string' as const, label: 'Action', required: false }
      ]
    case 'input':
      return [
        ...baseProperties,
        { name: 'placeholder', type: 'string' as const, label: 'Placeholder', required: false },
        { name: 'defaultValue', type: 'string' as const, label: 'Default Value', required: false }
      ]
    default:
      return baseProperties
  }
}

export function DataBindingPanel({ component, onBindingChange }: DataBindingPanelProps) {
  const { 
    dataSources, 
    addBinding, 
    removeBinding, 
    updateBinding, 
    getBinding,
    getComponentData,
    refreshDataSource 
  } = useDataBinding()
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null)

  if (!component) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Select a component to configure data binding
      </div>
    )
  }

  const currentBinding = getBinding(component.id)
  const boundDataSource = currentBinding ? dataSources.find(ds => ds.id === currentBinding.dataSourceId) : null
  const componentData = getComponentData(component.id)

  const handleBindToDataSource = (dataSourceId: string) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId)
    if (!dataSource) return

    // Smart initial field mappings based on component type
    const fieldMappings: Record<string, string> = {}
    
    if (component.type === 'text' && dataSource.columns && dataSource.columns.length > 0) {
      // Smart mapping for text: prefer name, title, description fields
      const textFields = dataSource.columns.filter(col => 
        col.toLowerCase().includes('name') || 
        col.toLowerCase().includes('title') || 
        col.toLowerCase().includes('description') ||
        col.toLowerCase().includes('text')
      )
      fieldMappings.content = textFields[0] || dataSource.columns[0]
    } else if (component.type === 'table' && dataSource.columns) {
      // For tables, map first 5 columns by default
      dataSource.columns.slice(0, 5).forEach(col => {
        fieldMappings[col] = col
      })
    } else if (component.type === 'chart' && dataSource.columns && dataSource.columns.length >= 2) {
      // Smart mapping for charts: prefer numeric fields for Y-axis
      const numericFields = dataSource.columns.filter(col => 
        col.toLowerCase().includes('value') || 
        col.toLowerCase().includes('amount') || 
        col.toLowerCase().includes('count') ||
        col.toLowerCase().includes('price') ||
        col.toLowerCase().includes('total')
      )
      const labelFields = dataSource.columns.filter(col => 
        col.toLowerCase().includes('name') || 
        col.toLowerCase().includes('label') ||
        col.toLowerCase().includes('category') ||
        col.toLowerCase().includes('date')
      )
      
      fieldMappings.xField = labelFields[0] || dataSource.columns[0]
      fieldMappings.yField = numericFields[0] || dataSource.columns[1] || dataSource.columns[0]
    } else if (component.type === 'heading' && dataSource.columns && dataSource.columns.length > 0) {
      // For headings, prefer title/name fields
      const titleFields = dataSource.columns.filter(col => 
        col.toLowerCase().includes('title') || 
        col.toLowerCase().includes('name') ||
        col.toLowerCase().includes('heading')
      )
      fieldMappings.content = titleFields[0] || dataSource.columns[0]
    } else if (component.type === 'image' && dataSource.columns && dataSource.columns.length > 0) {
      // For images, look for URL fields
      const imageFields = dataSource.columns.filter(col => 
        col.toLowerCase().includes('url') || 
        col.toLowerCase().includes('image') ||
        col.toLowerCase().includes('photo') ||
        col.toLowerCase().includes('picture')
      )
      fieldMappings.src = imageFields[0] || dataSource.columns[0]
    }

    const newBinding: DataBinding = {
      componentId: component.id,
      dataSourceId,
      fieldMappings,
      filters: [],
      sorting: []
    }

    addBinding(newBinding)
    onBindingChange?.()
  }

  const handleUnbind = () => {
    removeBinding(component.id)
    onBindingChange?.()
  }

  const handleFieldMappingChange = (componentProperty: string, dataField: string) => {
    if (!currentBinding) return

    const updatedMappings = {
      ...currentBinding.fieldMappings,
      [componentProperty]: dataField
    }

    updateBinding(component.id, { fieldMappings: updatedMappings })
    onBindingChange?.()
  }

  const handleRefreshDataSource = async (dataSourceId: string) => {
    setIsRefreshing(dataSourceId)
    await refreshDataSource(dataSourceId)
    setIsRefreshing(null)
    onBindingChange?.()
  }

  const addFilter = () => {
    if (!currentBinding || !boundDataSource?.columns) return

    const newFilter: DataFilter = {
      field: boundDataSource.columns[0],
      operator: 'equals',
      value: ''
    }

    updateBinding(component.id, {
      filters: [...(currentBinding.filters || []), newFilter]
    })
  }

  const removeFilter = (index: number) => {
    if (!currentBinding) return

    const updatedFilters = currentBinding.filters?.filter((_, i) => i !== index) || []
    updateBinding(component.id, { filters: updatedFilters })
  }

  const updateFilter = (index: number, updates: Partial<DataFilter>) => {
    if (!currentBinding) return

    const updatedFilters = currentBinding.filters?.map((filter, i) => 
      i === index ? { ...filter, ...updates } : filter
    ) || []
    
    updateBinding(component.id, { filters: updatedFilters })
  }

  const addSort = () => {
    if (!currentBinding || !boundDataSource?.columns) return

    const newSort: DataSort = {
      field: boundDataSource.columns[0],
      direction: 'asc'
    }

    updateBinding(component.id, {
      sorting: [...(currentBinding.sorting || []), newSort]
    })
  }

  const removeSort = (index: number) => {
    if (!currentBinding) return

    const updatedSorting = currentBinding.sorting?.filter((_, i) => i !== index) || []
    updateBinding(component.id, { sorting: updatedSorting })
  }

  const updateSort = (index: number, updates: Partial<DataSort>) => {
    if (!currentBinding) return

    const updatedSorting = currentBinding.sorting?.map((sort, i) => 
      i === index ? { ...sort, ...updates } : sort
    ) || []
    
    updateBinding(component.id, { sorting: updatedSorting })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <Database className="h-4 w-4" />
        <span className="font-medium">Data Binding</span>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 pr-4">
          {currentBinding ? (
            <Card className="flex-1 flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-green-600" />
                    Bound to Data
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleUnbind}>
                    <Unlink className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 flex-1 overflow-hidden flex flex-col">
                {/* Fixed content at top */}
                <div className="space-y-3 flex-shrink-0">
                  <div>
                    <Label className="text-xs text-muted-foreground">Data Source</Label>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{boundDataSource?.type}</Badge>
                        <span className="text-sm">{boundDataSource?.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => boundDataSource && handleRefreshDataSource(boundDataSource.id)}
                        disabled={isRefreshing === boundDataSource?.id}
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing === boundDataSource?.id ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  {/* Visual Field Mapping Interface */}
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      Field Mappings
                      <Badge variant="secondary" className="text-xs px-1">
                        {Object.keys(currentBinding.fieldMappings).length}
                      </Badge>
                    </Label>
                    <div className="mt-2">
                      <FieldMapper
                        dataFields={boundDataSource?.columns?.map(col => {
                          const sampleValue = componentData?.[0]?.[col]
                          return {
                            name: col,
                            type: typeof sampleValue === 'number' ? 'number' : 
                                  typeof sampleValue === 'boolean' ? 'boolean' :
                                  col.toLowerCase().includes('date') ? 'date' : 'string',
                            sample: sampleValue
                          }
                        }) || []}
                        componentProperties={getComponentProperties(component)}
                        bindings={currentBinding.fieldMappings}
                        onBindingChange={(property, field) => {
                          if (field) {
                            handleFieldMappingChange(property, field)
                          } else {
                            // Remove binding
                            const updatedMappings = { ...currentBinding.fieldMappings }
                            delete updatedMappings[property]
                            updateBinding(component.id, { fieldMappings: updatedMappings })
                            onBindingChange?.()
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Enhanced Data Preview */}
                  {componentData && componentData.length > 0 && (
                    <div>
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        Live Data Preview
                        <Badge variant="secondary" className="text-xs px-1">
                          {componentData.length} rows
                        </Badge>
                      </Label>
                      <div className="mt-2 border rounded overflow-hidden">
                        <div className="bg-muted/30 p-2 border-b">
                          <div className="text-xs text-muted-foreground">
                            First 3 rows • Updated {boundDataSource?.lastUpdated}
                          </div>
                        </div>
                        <div className="max-h-32 overflow-auto">
                          {componentData.slice(0, 3).map((row, index) => (
                            <div key={index} className="border-b last:border-b-0">
                              {Object.entries(currentBinding.fieldMappings).map(([componentProperty, dataField]) => {
                                const value = row[dataField]
                                const displayValue = value === null || value === undefined ? 
                                  'null' :
                                  String(value).length > 30 ? 
                                    String(value).slice(0, 30) + '...' : 
                                    String(value)
                                
                                return (
                                  <div key={`${index}-${componentProperty}`} className="flex items-center p-2 text-xs">
                                    <div className="w-16 text-muted-foreground truncate mr-2">
                                      {componentProperty}:
                                    </div>
                                    <div className="flex-1 font-mono">
                                      {value === null || value === undefined ? (
                                        <span className="text-muted-foreground italic">null</span>
                                      ) : (
                                        displayValue
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Data Quality Insights */}
                  {componentData && boundDataSource && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Data Quality</Label>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                          <div className="text-green-700 font-medium">Complete</div>
                          <div className="text-green-600">
                            {Object.values(currentBinding.fieldMappings).filter(field => 
                              componentData.some(row => row[field] !== null && row[field] !== undefined)
                            ).length} / {Object.keys(currentBinding.fieldMappings).length} fields
                          </div>
                        </div>
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                          <div className="text-blue-700 font-medium">Source</div>
                          <div className="text-blue-600">{boundDataSource.type.toUpperCase()}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced Settings Toggle */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                    className="w-full justify-start"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced Settings
                  </Button>
                </div>

                {/* Scrollable advanced settings */}
                {showAdvancedSettings && (
                  <ScrollArea className="flex-1 border-t pt-2">
                    <div className="space-y-4 pr-3">
                      {/* Filters */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Filters</Label>
                          <Button variant="ghost" size="sm" onClick={addFilter}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {currentBinding.filters?.map((filter, index) => (
                            <div key={index} className="grid grid-cols-4 gap-1 items-center">
                              <Select value={filter.field} onValueChange={(value) => updateFilter(index, { field: value })}>
                                <SelectTrigger className="h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {boundDataSource?.columns?.map(column => (
                                    <SelectItem key={column} value={column}>{column}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select value={filter.operator} onValueChange={(value) => updateFilter(index, { operator: value as 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in' })}>
                                <SelectTrigger className="h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">=</SelectItem>
                                  <SelectItem value="contains">contains</SelectItem>
                                  <SelectItem value="greater_than">&gt;</SelectItem>
                                  <SelectItem value="less_than">&lt;</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                value={String(filter.value)}
                                onChange={(e) => updateFilter(index, { value: e.target.value })}
                                className="h-6 text-xs"
                                placeholder="Value"
                              />
                              <Button variant="ghost" size="sm" onClick={() => removeFilter(index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sorting */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-xs text-muted-foreground">Sorting</Label>
                          <Button variant="ghost" size="sm" onClick={addSort}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {currentBinding.sorting?.map((sort, index) => (
                            <div key={index} className="grid grid-cols-3 gap-1 items-center">
                              <Select value={sort.field} onValueChange={(value) => updateSort(index, { field: value })}>
                                <SelectTrigger className="h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {boundDataSource?.columns?.map(column => (
                                    <SelectItem key={column} value={column}>{column}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => updateSort(index, { direction: sort.direction === 'asc' ? 'desc' : 'asc' })}
                                className="h-6 text-xs"
                              >
                                {sort.direction === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
                                {sort.direction}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => removeSort(index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          ) : (
            /* No Binding - Show Data Source Selection */
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Unlink className="h-4 w-4 text-muted-foreground" />
                  No Data Binding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dataSources.length > 0 ? (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground">Connect to Data Source</Label>
                    <div className="space-y-2">
                      {dataSources.map(dataSource => (
                        <div key={dataSource.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{dataSource.type}</Badge>
                            <span className="text-sm">{dataSource.name}</span>
                            <Badge 
                              variant={dataSource.status === 'connected' ? 'default' : 'secondary'}
                              className="text-xs bg-green-500"
                            >
                              {dataSource.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Data Preview: {dataSource.name}</DialogTitle>
                                  <DialogDescription>
                                    {dataSource.rowCount} rows • {dataSource.columns?.length} columns
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="max-h-64 overflow-auto">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b">
                                        {dataSource.columns?.slice(0, 5).map(column => (
                                          <th key={column} className="p-2 text-left">{column}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {dataSource.data?.slice(0, 10).map((row, index) => (
                                        <tr key={index} className="border-b">
                                          {dataSource.columns?.slice(0, 5).map(column => (
                                            <td key={column} className="p-2">{String(row[column] || '')}</td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleBindToDataSource(dataSource.id)}
                            >
                              <Link className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    No data sources available. Add a data source first.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}