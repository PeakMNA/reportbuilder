'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Workflow,
  FileText,
  Database,
  Link,
  Eye,
  Download,
  Send,
  ArrowRight,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react'
import { WorkflowOrchestrator, useWorkflow } from './workflow-orchestrator'
import { WorkflowErrorBoundary } from './error-boundary'
import { WorkflowStepper } from './workflow-stepper'
import { FieldMappingWizard } from './field-mapping-wizard'
import { PerformanceMonitor } from './performance-monitor'
import { WorkflowPipeline } from './workflow-pipeline'
import { useDataBinding } from '../data-binding/data-binding-context'
import { TemplateService } from '@/lib/templates/template-service'
import { ReportTemplate } from '@/types/template'
import { cn } from '@/lib/utils'

interface Component {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, string | number | boolean | string[] | null>
  dataBinding?: {
    sourceType: 'static' | 'dynamic'
    source?: string
    field?: string
  }
}

interface WorkflowManagerProps {
  canvasRef?: React.RefObject<HTMLDivElement>
  components: Component[]
  onComponentUpdate?: (id: string, updates: Partial<Component>) => void
  onLoadTemplate?: (components: Component[]) => void
  reportTitle?: string
  className?: string
}

// Internal workflow content component
function WorkflowContent({ 
  canvasRef, 
  components, 
  onComponentUpdate, 
  onLoadTemplate,
  reportTitle 
}: Omit<WorkflowManagerProps, 'className'>) {
  const workflow = useWorkflow()
  const dataBinding = useDataBinding()
  const [activeTab, setActiveTab] = useState('workflow')
  
  // Initialize workflow pipeline
  const workflowPipeline = WorkflowPipeline({ 
    canvasRef: canvasRef || { current: null }, 
    components, 
    onComponentUpdate 
  })

  // Handle template selection
  const handleTemplateSelect = useCallback(async (template: ReportTemplate) => {
    try {
      await workflow.loadTemplate(template)
      if (onLoadTemplate) {
        onLoadTemplate(template.components)
      }
    } catch (error) {
      console.error('Failed to load template:', error)
    }
  }, [workflow, onLoadTemplate])

  // Handle data source connection
  const handleDataSourceConnect = useCallback(async (dataSourceId: string) => {
    try {
      await workflow.connectDataSource(dataSourceId)
    } catch (error) {
      console.error('Failed to connect data source:', error)
    }
  }, [workflow])

  // Handle PDF generation
  const handlePDFGeneration = useCallback(async () => {
    try {
      if (workflowPipeline.generateWorkflowPDF) {
        await workflowPipeline.generateWorkflowPDF()
        await workflow.generatePDF({
          format: 'a4',
          orientation: 'portrait',
          quality: 'high',
          includeMetadata: true,
          filename: `${reportTitle || 'report'}-${new Date().toISOString().split('T')[0]}.pdf`
        })
      }
    } catch (error) {
      console.error('PDF generation failed:', error)
    }
  }, [workflowPipeline, workflow, reportTitle])

  // Get step status for UI
  const getStepStatus = (step: string) => {
    const currentStep = workflow.state.currentStep
    const completedSteps = workflow.state.completedSteps
    
    if (completedSteps.includes(step as unknown)) return 'completed'
    if (currentStep === step) return 'current'
    return 'pending'
  }

  // Step components based on current workflow step
  const renderStepContent = () => {
    switch (workflow.state.currentStep) {
      case 'template_selection':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mx-auto">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Select a Template</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from our professional templates or create a custom design
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => {
                    // This would open template gallery
                    // For demo, we'll simulate template selection
                    const mockTemplate: ReportTemplate = {
                      id: 'template-1',
                      name: 'Sales Report Template',
                      description: 'Professional sales report template',
                      category: 'sales',
                      components: components.map(c => ({
                        ...c,
                        dataBinding: c.type === 'text' ? { sourceType: 'dynamic' as const, field: 'name' } : undefined
                      })),
                      metadata: {
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        version: '1.0.0',
                        author: 'System',
                        isBuiltIn: true
                      },
                      validation: {
                        requiredDataSources: ['sales_data'],
                        requiredFields: { sales_data: ['name', 'amount', 'date'] },
                        maxComponents: 50
                      }
                    }
                    handleTemplateSelect(mockTemplate)
                  }}>
                    Use Current Design
                  </Button>
                  <Button variant="outline">
                    Browse Templates
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'data_source_setup':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mx-auto">
                    <Database className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mt-4">Connect Data Source</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a data source to populate your report
                  </p>
                </div>
                
                <div className="space-y-2">
                  {dataBinding.dataSources.map(source => (
                    <Card key={source.id} className="cursor-pointer hover:bg-muted/50" 
                          onClick={() => handleDataSourceConnect(source.id)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{source.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {source.type} • {source.rowCount} rows • {source.columns?.length} columns
                            </p>
                          </div>
                          <Badge variant={source.status === 'connected' ? 'default' : 'secondary'}>
                            {source.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'field_mapping':
        return <FieldMappingWizard />

      case 'preview_validation':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mx-auto">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Preview & Validate</h3>
                  <p className="text-sm text-muted-foreground">
                    Review your report with live data before generating PDF
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={workflow.generatePreview} disabled={workflow.isProcessing}>
                    {workflow.isProcessing ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Generate Preview
                      </>
                    )}
                  </Button>
                </div>
                {workflow.state.validationStatus && (
                  <div className="mt-4 p-4 bg-muted rounded-lg text-left">
                    <h4 className="font-medium mb-2">Validation Results</h4>
                    <div className="space-y-1 text-sm">
                      <p>✅ {workflow.state.validationStatus.componentCount} components configured</p>
                      <p>✅ {workflow.state.validationStatus.dataBindingCount} data bindings active</p>
                      <p>⏱️ Estimated PDF generation: {Math.round(workflow.state.validationStatus.estimatedPdfTime / 1000)}s</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'pdf_generation':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mx-auto">
                  <Download className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Generate PDF</h3>
                  <p className="text-sm text-muted-foreground">
                    Create your professional PDF report
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handlePDFGeneration} disabled={workflow.isProcessing}>
                    {workflow.isProcessing ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Generate PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      case 'delivery':
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mx-auto">
                  <Send className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Delivery Options</h3>
                  <p className="text-sm text-muted-foreground">
                    Download, email, or schedule your report
                  </p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => workflow.deliverReport({ method: 'download' })}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Workflow Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            <h2 className="font-semibold">Workflow Manager</h2>
            <Badge variant="outline">
              Step {['template_selection', 'data_source_setup', 'field_mapping', 'preview_validation', 'pdf_generation', 'delivery'].indexOf(workflow.state.currentStep) + 1} of 6
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={
              workflow.metrics.performance === 'excellent' ? 'default' :
              workflow.metrics.performance === 'good' ? 'secondary' :
              'outline'
            }>
              {workflow.metrics.performance}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {Math.round(workflow.metrics.totalTime / 1000)}s / 30s
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="mapping" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Mapping
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="steps" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Steps
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="workflow" className="p-4 space-y-4">
              {renderStepContent()}
            </TabsContent>

            <TabsContent value="mapping" className="p-4">
              <FieldMappingWizard />
            </TabsContent>

            <TabsContent value="monitor" className="p-4">
              <PerformanceMonitor showDetailed={true} />
            </TabsContent>

            <TabsContent value="steps" className="p-4">
              <WorkflowStepper />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

// Main workflow manager component with error boundary
export function WorkflowManager({ 
  canvasRef, 
  components, 
  onComponentUpdate, 
  onLoadTemplate,
  reportTitle,
  className 
}: WorkflowManagerProps) {
  return (
    <div className={cn('h-full', className)}>
      <WorkflowErrorBoundary>
        <WorkflowOrchestrator>
          <WorkflowContent
            canvasRef={canvasRef}
            components={components}
            onComponentUpdate={onComponentUpdate}
            onLoadTemplate={onLoadTemplate}
            reportTitle={reportTitle}
          />
        </WorkflowOrchestrator>
      </WorkflowErrorBoundary>
    </div>
  )
}