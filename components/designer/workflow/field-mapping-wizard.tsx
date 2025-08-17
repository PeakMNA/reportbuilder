'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Link, 
  Database, 
  FileText, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Eye,
  RotateCcw,
  Wand2
} from 'lucide-react'
import { useWorkflow } from './workflow-orchestrator'
import { useDataBinding } from '../data-binding/data-binding-context'
import { cn } from '@/lib/utils'

interface Component {
  id: string
  type: string
  name: string
  properties: Record<string, unknown>
  dataBinding?: {
    sourceType: 'static' | 'dynamic'
    source?: string
    field?: string
  }
}

interface FieldMappingWizardProps {
  className?: string
}

export function FieldMappingWizard({ className }: FieldMappingWizardProps) {
  const workflow = useWorkflow()
  const dataBinding = useDataBinding()
  
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null)
  const [autoMappingEnabled, setAutoMappingEnabled] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  // Get current template components that need data binding
  const bindableComponents = workflow.state.template?.components.filter(
    component => component.dataBinding?.sourceType === 'dynamic'
  ) || []

  // Get current data source
  const currentDataSource = workflow.state.dataSourceId 
    ? dataBinding.getDataSource(workflow.state.dataSourceId)
    : null

  // Auto-mapping logic
  const performAutoMapping = useCallback(() => {
    if (!currentDataSource?.columns || bindableComponents.length === 0) {
      return
    }

    const autoMappings: Record<string, string> = {}
    
    bindableComponents.forEach(component => {
      // Try to find exact match first
      let matchedField = currentDataSource.columns?.find(
        col => col.toLowerCase() === component.dataBinding?.field?.toLowerCase()
      )

      // Try partial matches
      if (!matchedField && component.dataBinding?.field) {
        matchedField = currentDataSource.columns?.find(
          col => col.toLowerCase().includes(component.dataBinding!.field!.toLowerCase()) ||
                component.dataBinding!.field!.toLowerCase().includes(col.toLowerCase())
        )
      }

      // Try semantic matching based on component type
      if (!matchedField) {
        matchedField = findSemanticMatch(component, currentDataSource.columns || [])
      }

      if (matchedField) {
        autoMappings[component.id] = matchedField
      }
    })

    setMappings(autoMappings)
  }, [currentDataSource, bindableComponents])

  // Semantic matching helper
  const findSemanticMatch = (component: Component, columns: string[]): string | undefined => {
    const componentType = component.type.toLowerCase()
    const componentName = component.name.toLowerCase()
    
    // Type-based matching
    const typeMatches: Record<string, string[]> = {
      text: ['name', 'title', 'description', 'label', 'text', 'content'],
      heading: ['title', 'name', 'header', 'heading'],
      image: ['image', 'photo', 'picture', 'avatar', 'img', 'url'],
      table: ['data', 'rows', 'items', 'records'],
      chart: ['value', 'amount', 'count', 'total', 'sum', 'number']
    }

    const possibleMatches = typeMatches[componentType] || []
    
    // Find column that matches type semantics
    for (const match of possibleMatches) {
      const column = columns.find(col => 
        col.toLowerCase().includes(match) || match.includes(col.toLowerCase())
      )
      if (column) return column
    }

    // Find column that matches component name
    const nameMatch = columns.find(col =>
      col.toLowerCase().includes(componentName) || componentName.includes(col.toLowerCase())
    )
    
    return nameMatch
  }

  // Auto-map when data source or components change
  useEffect(() => {
    if (autoMappingEnabled && currentDataSource && bindableComponents.length > 0) {
      performAutoMapping()
    }
  }, [autoMappingEnabled, currentDataSource, bindableComponents, performAutoMapping])

  // Update workflow when mappings change
  useEffect(() => {
    workflow.mapFields(mappings)
  }, [mappings, workflow])

  // Generate preview data
  const generatePreview = useCallback(() => {
    if (!currentDataSource?.data || currentDataSource.data.length === 0) {
      setPreviewData(null)
      return
    }

    const sampleRow = currentDataSource.data[0]
    const preview: Record<string, unknown> = {}

    Object.entries(mappings).forEach(([componentId, fieldName]) => {
      const component = bindableComponents.find(c => c.id === componentId)
      if (component && sampleRow[fieldName] !== undefined) {
        preview[componentId] = {
          componentName: component.name,
          componentType: component.type,
          fieldName,
          sampleValue: sampleRow[fieldName],
          formattedValue: formatValueForComponent(sampleRow[fieldName], component.type)
        }
      }
    })

    setPreviewData(preview)
  }, [currentDataSource, mappings, bindableComponents])

  // Format value based on component type
  const formatValueForComponent = (value: unknown, componentType: string): string => {
    if (value === null || value === undefined) return ''

    switch (componentType) {
      case 'text':
      case 'heading':
        return String(value)
      
      case 'image':
        return typeof value === 'string' && value.startsWith('http') 
          ? value 
          : 'Invalid URL'
      
      case 'chart':
        return typeof value === 'number' 
          ? value.toLocaleString() 
          : String(value)
      
      default:
        return String(value)
    }
  }

  // Validation
  const getMappingStatus = () => {
    const totalBindable = bindableComponents.length
    const totalMapped = Object.keys(mappings).length
    const validMappings = Object.entries(mappings).filter(([componentId, fieldName]) => {
      return currentDataSource?.columns?.includes(fieldName)
    }).length

    return {
      totalBindable,
      totalMapped,
      validMappings,
      completionRate: totalBindable > 0 ? (validMappings / totalBindable) * 100 : 100,
      isComplete: validMappings === totalBindable && totalBindable > 0
    }
  }

  const status = getMappingStatus()

  if (!workflow.state.template || !workflow.state.dataSourceId) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-muted-foreground">
            <Database className="mx-auto h-8 w-8 mb-2" />
            <p>Please select a template and data source first</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (bindableComponents.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
            <p className="font-medium">No Data Binding Required</p>
            <p className="text-sm text-muted-foreground">
              This template uses only static content
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Field Mapping
              </CardTitle>
              <CardDescription>
                Connect template components to data source fields
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={status.isComplete ? "default" : "secondary"}>
                {status.validMappings}/{status.totalBindable} mapped
              </Badge>
              <Badge variant="outline">
                {Math.round(status.completionRate)}% complete
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Auto-mapping Controls */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-mapping"
                checked={autoMappingEnabled}
                onCheckedChange={setAutoMappingEnabled}
              />
              <Label htmlFor="auto-mapping" className="text-sm">
                Enable automatic field mapping
              </Label>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={performAutoMapping}
                disabled={!currentDataSource?.columns}
              >
                <Wand2 className="mr-2 h-3 w-3" />
                Auto-Map
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMappings({})}
              >
                <RotateCcw className="mr-2 h-3 w-3" />
                Clear All
              </Button>
            </div>
          </div>

          {/* Status Alert */}
          {status.completionRate < 100 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {status.totalBindable - status.validMappings} components still need field mapping.
                Complete all mappings to proceed to preview.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mapping Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Component Mappings</CardTitle>
          <CardDescription>
            Map each component to a field from {currentDataSource?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bindableComponents.map(component => (
              <div
                key={component.id}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                {/* Component Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{component.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {component.type}
                    </Badge>
                  </div>
                  {component.dataBinding?.field && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expected field: {component.dataBinding.field}
                    </p>
                  )}
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground" />

                {/* Field Selection */}
                <div className="w-64">
                  <Select
                    value={mappings[component.id] || ''}
                    onValueChange={(value) =>
                      setMappings(prev => ({ ...prev, [component.id]: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select field..." />
                    </SelectTrigger>
                    <SelectContent>
                      {currentDataSource?.columns?.map(column => (
                        <SelectItem key={column} value={column}>
                          <div className="flex items-center justify-between w-full">
                            <span>{column}</span>
                            {/* Sample data preview */}
                            {currentDataSource.data?.[0]?.[column] && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {String(currentDataSource.data[0][column]).slice(0, 10)}
                                {String(currentDataSource.data[0][column]).length > 10 ? '...' : ''}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="w-6">
                  {mappings[component.id] && currentDataSource?.columns?.includes(mappings[component.id]) ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {status.validMappings > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  Preview how your data will appear in the report
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  generatePreview()
                  setShowPreview(!showPreview)
                }}
              >
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
          </CardHeader>
          {showPreview && (
            <CardContent>
              {previewData ? (
                <div className="space-y-3">
                  {Object.entries(previewData).map(([componentId, data]) => (
                    <div key={componentId} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{data.componentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {data.componentType} ← {data.fieldName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono bg-background px-2 py-1 rounded">
                            {data.formattedValue}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <Button onClick={generatePreview} size="sm">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Preview
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Quick Actions */}
      {status.isComplete && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">All components mapped successfully!</span>
              </div>
              <Button onClick={() => workflow.nextStep()}>
                Continue to Preview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}