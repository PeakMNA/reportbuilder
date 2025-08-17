'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useDataBinding } from '../data-binding/data-binding-context'
import { TemplateService } from '@/lib/templates/template-service'
import { ReportTemplate } from '@/types/template'

// Workflow Steps
export type WorkflowStep = 
  | 'template_selection'
  | 'data_source_setup'
  | 'field_mapping'
  | 'preview_validation'
  | 'pdf_generation'
  | 'delivery'

export interface WorkflowState {
  currentStep: WorkflowStep
  completedSteps: WorkflowStep[]
  template: ReportTemplate | null
  dataSourceId: string | null
  fieldMappings: Record<string, string>
  validationStatus: ValidationStatus | null
  pdfOptions: PDFGenerationOptions | null
  deliveryOptions: DeliveryOptions | null
}

export interface ValidationStatus {
  isValid: boolean
  errors: string[]
  warnings: string[]
  componentCount: number
  dataBindingCount: number
  estimatedPdfTime: number
}

export interface PDFGenerationOptions {
  format: 'a4' | 'letter' | 'a3' | 'legal'
  orientation: 'portrait' | 'landscape'
  quality: 'standard' | 'high' | 'print'
  includeMetadata: boolean
  filename: string
}

export interface DeliveryOptions {
  method: 'download' | 'email' | 'schedule'
  email?: string
  schedule?: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly'
    time: string
    endDate?: string
  }
}

export interface WorkflowMetrics {
  startTime: number
  stepTimes: Record<WorkflowStep, number>
  totalTime: number
  targetTime: 30000 // 30 seconds
  performance: 'excellent' | 'good' | 'acceptable' | 'slow'
}

interface WorkflowContextType {
  // State
  state: WorkflowState
  metrics: WorkflowMetrics
  isProcessing: boolean
  error: string | null
  
  // Navigation
  goToStep: (step: WorkflowStep) => void
  nextStep: () => void
  previousStep: () => void
  canProceed: (step: WorkflowStep) => boolean
  
  // Template Operations
  loadTemplate: (template: ReportTemplate) => Promise<void>
  createNewReport: () => void
  
  // Data Operations
  connectDataSource: (dataSourceId: string) => Promise<void>
  mapFields: (mappings: Record<string, string>) => void
  validateWorkflow: () => Promise<ValidationStatus>
  
  // Generation Operations
  generatePreview: () => Promise<void>
  generatePDF: (options: PDFGenerationOptions) => Promise<void>
  deliverReport: (options: DeliveryOptions) => Promise<void>
  
  // Performance
  getProgress: () => number
  getEstimatedTimeRemaining: () => number
  resetWorkflow: () => void
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined)

const WORKFLOW_STEPS: WorkflowStep[] = [
  'template_selection',
  'data_source_setup', 
  'field_mapping',
  'preview_validation',
  'pdf_generation',
  'delivery'
]

const STEP_REQUIREMENTS: Record<WorkflowStep, (state: WorkflowState) => boolean> = {
  template_selection: () => true,
  data_source_setup: (state) => !!state.template,
  field_mapping: (state) => !!state.template && !!state.dataSourceId,
  preview_validation: (state) => !!state.template && !!state.dataSourceId && Object.keys(state.fieldMappings).length > 0,
  pdf_generation: (state) => !!state.validationStatus?.isValid,
  delivery: (state) => !!state.pdfOptions
}

export function WorkflowOrchestrator({ children }: { children: ReactNode }) {
  const dataBinding = useDataBinding()
  
  const [state, setState] = useState<WorkflowState>({
    currentStep: 'template_selection',
    completedSteps: [],
    template: null,
    dataSourceId: null,
    fieldMappings: {},
    validationStatus: null,
    pdfOptions: null,
    deliveryOptions: null
  })
  
  const [metrics, setMetrics] = useState<WorkflowMetrics>({
    startTime: Date.now(),
    stepTimes: {} as Record<WorkflowStep, number>,
    totalTime: 0,
    targetTime: 30000,
    performance: 'excellent'
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update metrics when step changes
  useEffect(() => {
    const now = Date.now()
    setMetrics(prev => ({
      ...prev,
      stepTimes: {
        ...prev.stepTimes,
        [state.currentStep]: now - prev.startTime
      },
      totalTime: now - prev.startTime
    }))
  }, [state.currentStep])

  // Calculate performance based on total time
  useEffect(() => {
    const { totalTime, targetTime } = metrics
    let performance: WorkflowMetrics['performance'] = 'excellent'
    
    if (totalTime > targetTime * 2) performance = 'slow'
    else if (totalTime > targetTime * 1.5) performance = 'acceptable'
    else if (totalTime > targetTime) performance = 'good'
    
    setMetrics(prev => ({ ...prev, performance }))
  }, [metrics.totalTime, metrics.targetTime])

  const goToStep = useCallback((step: WorkflowStep) => {
    if (canProceed(step)) {
      setState(prev => ({
        ...prev,
        currentStep: step
      }))
    }
  }, [])

  const nextStep = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)
    const nextStep = WORKFLOW_STEPS[currentIndex + 1]
    
    if (nextStep && canProceed(nextStep)) {
      setState(prev => ({
        ...prev,
        currentStep: nextStep,
        completedSteps: prev.completedSteps.includes(prev.currentStep) 
          ? prev.completedSteps 
          : [...prev.completedSteps, prev.currentStep]
      }))
    }
  }, [state.currentStep])

  const previousStep = useCallback(() => {
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)
    const prevStep = WORKFLOW_STEPS[currentIndex - 1]
    
    if (prevStep) {
      setState(prev => ({
        ...prev,
        currentStep: prevStep
      }))
    }
  }, [state.currentStep])

  const canProceed = useCallback((step: WorkflowStep): boolean => {
    return STEP_REQUIREMENTS[step](state)
  }, [state])

  const loadTemplate = useCallback(async (template: ReportTemplate) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      setState(prev => ({
        ...prev,
        template,
        completedSteps: ['template_selection']
      }))
      
      // Auto-advance to data source setup if template is loaded
      setTimeout(() => goToStep('data_source_setup'), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
    } finally {
      setIsProcessing(false)
    }
  }, [goToStep])

  const createNewReport = useCallback(() => {
    setState({
      currentStep: 'template_selection',
      completedSteps: [],
      template: null,
      dataSourceId: null,
      fieldMappings: {},
      validationStatus: null,
      pdfOptions: null,
      deliveryOptions: null
    })
    
    setMetrics({
      startTime: Date.now(),
      stepTimes: {} as Record<WorkflowStep, number>,
      totalTime: 0,
      targetTime: 30000,
      performance: 'excellent'
    })
    
    setError(null)
  }, [])

  const connectDataSource = useCallback(async (dataSourceId: string) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const dataSource = dataBinding.getDataSource(dataSourceId)
      if (!dataSource) {
        throw new Error('Data source not found')
      }
      
      setState(prev => ({
        ...prev,
        dataSourceId,
        completedSteps: prev.completedSteps.includes('data_source_setup')
          ? prev.completedSteps
          : [...prev.completedSteps, 'data_source_setup']
      }))
      
      // Auto-advance to field mapping
      setTimeout(() => goToStep('field_mapping'), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect data source')
    } finally {
      setIsProcessing(false)
    }
  }, [dataBinding, goToStep])

  const mapFields = useCallback((mappings: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      fieldMappings: mappings,
      completedSteps: prev.completedSteps.includes('field_mapping')
        ? prev.completedSteps
        : [...prev.completedSteps, 'field_mapping']
    }))
    
    // Auto-advance to preview validation if mappings are complete
    if (Object.keys(mappings).length > 0) {
      setTimeout(() => goToStep('preview_validation'), 100)
    }
  }, [goToStep])

  const validateWorkflow = useCallback(async (): Promise<ValidationStatus> => {
    setIsProcessing(true)
    setError(null)
    
    try {
      const { template, dataSourceId, fieldMappings } = state
      
      if (!template || !dataSourceId) {
        throw new Error('Template and data source are required for validation')
      }
      
      const dataSource = dataBinding.getDataSource(dataSourceId)
      if (!dataSource) {
        throw new Error('Data source not found')
      }
      
      const errors: string[] = []
      const warnings: string[] = []
      
      // Validate template components
      let componentCount = 0
      let dataBindingCount = 0
      
      template.components.forEach(component => {
        componentCount++
        
        if (component.dataBinding) {
          dataBindingCount++
          
          // Check if field mapping exists for data-bound components
          const mappedField = fieldMappings[component.id]
          if (!mappedField) {
            errors.push(`Component "${component.name}" requires field mapping`)
          } else if (!dataSource.columns?.includes(mappedField)) {
            errors.push(`Mapped field "${mappedField}" not found in data source`)
          }
        }
      })
      
      // Performance warnings
      if (componentCount > 20) {
        warnings.push('Large number of components may slow PDF generation')
      }
      
      if (dataSource.rowCount && dataSource.rowCount > 1000) {
        warnings.push('Large dataset may impact performance')
      }
      
      // Estimate PDF generation time
      const baseTime = 2000 // 2 seconds base
      const componentTime = componentCount * 100 // 100ms per component
      const dataTime = dataBindingCount * 200 // 200ms per data binding
      const estimatedPdfTime = baseTime + componentTime + dataTime
      
      const validationStatus: ValidationStatus = {
        isValid: errors.length === 0,
        errors,
        warnings,
        componentCount,
        dataBindingCount,
        estimatedPdfTime
      }
      
      setState(prev => ({
        ...prev,
        validationStatus,
        completedSteps: prev.completedSteps.includes('preview_validation')
          ? prev.completedSteps
          : [...prev.completedSteps, 'preview_validation']
      }))
      
      return validationStatus
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Validation failed'
      setError(error)
      throw new Error(error)
    } finally {
      setIsProcessing(false)
    }
  }, [state, dataBinding])

  const generatePreview = useCallback(async () => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Validate first
      const validation = await validateWorkflow()
      
      if (!validation.isValid) {
        throw new Error('Cannot generate preview: validation failed')
      }
      
      // Apply field mappings to template
      if (state.template && state.dataSourceId) {
        const dataSource = dataBinding.getDataSource(state.dataSourceId)
        if (dataSource && dataSource.data) {
          // Apply data to components
          state.template.components.forEach(component => {
            if (component.dataBinding && state.fieldMappings[component.id]) {
              const fieldName = state.fieldMappings[component.id]
              const sampleValue = dataSource.data?.[0]?.[fieldName]
              
              // Update component properties with sample data
              if (component.properties && sampleValue !== undefined) {
                component.properties.content = String(sampleValue)
              }
            }
          })
        }
      }
      
      // Auto-advance to PDF generation if validation passes
      if (validation.isValid) {
        setTimeout(() => goToStep('pdf_generation'), 100)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Preview generation failed')
    } finally {
      setIsProcessing(false)
    }
  }, [validateWorkflow, state.template, state.dataSourceId, state.fieldMappings, dataBinding, goToStep])

  const generatePDF = useCallback(async (options: PDFGenerationOptions) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      setState(prev => ({
        ...prev,
        pdfOptions: options,
        completedSteps: prev.completedSteps.includes('pdf_generation')
          ? prev.completedSteps
          : [...prev.completedSteps, 'pdf_generation']
      }))
      
      // Auto-advance to delivery
      setTimeout(() => goToStep('delivery'), 100)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF generation failed')
    } finally {
      setIsProcessing(false)
    }
  }, [goToStep])

  const deliverReport = useCallback(async (options: DeliveryOptions) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      setState(prev => ({
        ...prev,
        deliveryOptions: options,
        completedSteps: prev.completedSteps.includes('delivery')
          ? prev.completedSteps
          : [...prev.completedSteps, 'delivery']
      }))
      
      // Workflow complete!
      setMetrics(prev => ({
        ...prev,
        totalTime: Date.now() - prev.startTime
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report delivery failed')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const getProgress = useCallback((): number => {
    const currentIndex = WORKFLOW_STEPS.indexOf(state.currentStep)
    const completedCount = state.completedSteps.length
    return Math.round(((completedCount + (currentIndex + 1) * 0.1) / WORKFLOW_STEPS.length) * 100)
  }, [state.currentStep, state.completedSteps])

  const getEstimatedTimeRemaining = useCallback((): number => {
    const { totalTime, targetTime } = metrics
    const progress = getProgress() / 100
    
    if (progress === 0) return targetTime
    
    const estimatedTotal = totalTime / progress
    return Math.max(0, estimatedTotal - totalTime)
  }, [metrics, getProgress])

  const resetWorkflow = useCallback(() => {
    createNewReport()
  }, [createNewReport])

  const value: WorkflowContextType = {
    // State
    state,
    metrics,
    isProcessing,
    error,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    canProceed,
    
    // Template Operations
    loadTemplate,
    createNewReport,
    
    // Data Operations
    connectDataSource,
    mapFields,
    validateWorkflow,
    
    // Generation Operations
    generatePreview,
    generatePDF,
    deliverReport,
    
    // Performance
    getProgress,
    getEstimatedTimeRemaining,
    resetWorkflow
  }

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  )
}

export function useWorkflow() {
  const context = useContext(WorkflowContext)
  if (context === undefined) {
    throw new Error('useWorkflow must be used within a WorkflowOrchestrator')
  }
  return context
}