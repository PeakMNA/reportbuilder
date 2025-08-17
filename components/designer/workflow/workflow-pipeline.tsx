'use client'

import { useCallback, useRef } from 'react'
import { useWorkflow } from './workflow-orchestrator'
import { useDataBinding } from '../data-binding/data-binding-context'
import { PDFExport } from '../export/pdf-export'
import { ReportTemplate } from '@/types/template'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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

interface WorkflowPipelineProps {
  canvasRef: React.RefObject<HTMLDivElement>
  components: Component[]
  onComponentUpdate?: (id: string, updates: Partial<Component>) => void
}

export function WorkflowPipeline({ 
  canvasRef, 
  components, 
  onComponentUpdate 
}: WorkflowPipelineProps) {
  const workflow = useWorkflow()
  const dataBinding = useDataBinding()
  
  // Create a virtual canvas for PDF generation with data
  const virtualCanvasRef = useRef<HTMLDivElement>(null)

  // Apply data bindings to components
  const applyDataBindings = useCallback((
    templateComponents: Component[],
    dataSourceId: string,
    fieldMappings: Record<string, string>
  ): Component[] => {
    const dataSource = dataBinding.getDataSource(dataSourceId)
    if (!dataSource || !dataSource.data || dataSource.data.length === 0) {
      return templateComponents
    }

    const sampleData = dataSource.data[0] // Use first row for preview

    return templateComponents.map(component => {
      const mappedField = fieldMappings[component.id]
      if (!mappedField || !component.dataBinding) {
        return component
      }

      const fieldValue = sampleData[mappedField]
      if (fieldValue === undefined) {
        return component
      }

      // Apply data based on component type
      const updatedProperties = { ...component.properties }
      
      switch (component.type) {
        case 'text':
        case 'heading':
          updatedProperties.content = String(fieldValue)
          break
        
        case 'table':
          // For tables, get all data and populate
          if (component.dataBinding.sourceType === 'dynamic') {
            const tableData = dataSource.data.map(row => 
              Object.values(row).map(value => String(value))
            )
            updatedProperties.data = tableData
            updatedProperties.columns = dataSource.columns || Object.keys(sampleData)
          }
          break
        
        case 'chart':
          // For charts, prepare data series
          if (component.dataBinding.sourceType === 'dynamic') {
            const chartData = dataSource.data.map(row => ({
              label: String(row[mappedField] || ''),
              value: Number(row[mappedField] || 0)
            }))
            updatedProperties.data = chartData
          }
          break
        
        case 'image':
          // For images, set src if it's a URL
          if (typeof fieldValue === 'string' && fieldValue.startsWith('http')) {
            updatedProperties.src = fieldValue
          }
          break
        
        default:
          updatedProperties.content = String(fieldValue)
      }

      return {
        ...component,
        properties: updatedProperties
      }
    })
  }, [dataBinding])

  // Generate PDF with complete workflow integration
  const generateWorkflowPDF = useCallback(async () => {
    const { state } = workflow
    
    if (!state.template || !state.dataSourceId || !state.pdfOptions) {
      throw new Error('Incomplete workflow state for PDF generation')
    }

    if (!canvasRef.current) {
      throw new Error('Canvas reference not available')
    }

    try {
      // Apply data bindings to template
      const boundComponents = applyDataBindings(
        state.template.components,
        state.dataSourceId,
        state.fieldMappings
      )

      // Update components in the canvas with bound data
      boundComponents.forEach(component => {
        onComponentUpdate?.(component.id, component)
      })

      // Wait for component updates to render
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the actual canvas element
      const canvasElement = canvasRef.current.querySelector('[data-canvas="true"]') as HTMLElement
      if (!canvasElement) {
        throw new Error('Canvas element not found')
      }

      // Remove selection highlights for clean export
      const selectedElements = canvasElement.querySelectorAll('[class*="border-primary"]')
      const originalClasses: string[] = []
      
      selectedElements.forEach((el, index) => {
        originalClasses[index] = el.className
        el.className = el.className
          .replace(/border-primary[^\s]*|ring-primary[^\s]*|shadow-lg/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      })

      // Capture canvas with high quality
      const qualitySettings = getQualitySettings(state.pdfOptions.quality)
      const canvas = await html2canvas(canvasElement, {
        ...qualitySettings,
        width: canvasElement.scrollWidth,
        height: canvasElement.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: canvasElement.scrollWidth,
        windowHeight: canvasElement.scrollHeight
      })

      // Restore original classes
      selectedElements.forEach((el, index) => {
        if (originalClasses[index]) {
          el.className = originalClasses[index]
        }
      })

      // Create PDF with template metadata
      const pdf = new jsPDF({
        orientation: state.pdfOptions.orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: state.pdfOptions.format,
        compress: true,
        precision: 16
      })

      // Add metadata
      if (state.pdfOptions.includeMetadata && state.template) {
        pdf.setProperties({
          title: state.template.name,
          subject: state.template.description || 'Generated Report',
          author: 'ReportBuilder',
          creator: 'ReportBuilder Workflow',
          producer: 'ReportBuilder PDF Pipeline'
        })
      }

      // Calculate dimensions
      const pageDimensions = getPageDimensions(state.pdfOptions.format, state.pdfOptions.orientation)
      const margins = { top: 20, right: 20, bottom: 20, left: 20 }
      
      const pageWidth = pageDimensions.width - margins.left - margins.right
      const pageHeight = pageDimensions.height - margins.top - margins.bottom
      
      const imageWidth = canvas.width
      const imageHeight = canvas.height
      const imageRatio = imageWidth / imageHeight
      const pageRatio = pageWidth / pageHeight

      let finalWidth, finalHeight

      if (imageRatio > pageRatio) {
        finalWidth = pageWidth
        finalHeight = pageWidth / imageRatio
      } else {
        finalHeight = pageHeight
        finalWidth = pageHeight * imageRatio
      }

      // Center the image
      const xOffset = margins.left + (pageWidth - finalWidth) / 2
      const yOffset = margins.top + (pageHeight - finalHeight) / 2

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', state.pdfOptions.quality === 'print' ? 1.0 : 0.95)
      pdf.addImage(
        imgData,
        'PNG',
        xOffset,
        yOffset,
        finalWidth,
        finalHeight,
        undefined,
        'FAST'
      )

      // Add workflow footer with generation info
      if (state.pdfOptions.includeMetadata) {
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        
        const footerText = [
          `Generated by ReportBuilder on ${new Date().toLocaleString()}`,
          `Template: ${state.template.name}`,
          `Data Source: ${dataBinding.getDataSource(state.dataSourceId)?.name || 'Unknown'}`,
          `Components: ${boundComponents.length}, Data Bindings: ${Object.keys(state.fieldMappings).length}`
        ].join(' | ')
        
        pdf.text(
          footerText,
          margins.left,
          pageDimensions.height - margins.bottom / 2,
          { maxWidth: pageWidth }
        )
      }

      // Save the PDF
      pdf.save(state.pdfOptions.filename)
      
      return pdf
    } catch (error) {
      console.error('Workflow PDF generation failed:', error)
      throw error
    }
  }, [workflow, canvasRef, onComponentUpdate, applyDataBindings, dataBinding])

  // Multi-page PDF generation for large datasets
  const generateMultiPagePDF = useCallback(async (
    pageSize: number = 50
  ) => {
    const { state } = workflow
    
    if (!state.template || !state.dataSourceId || !state.pdfOptions) {
      throw new Error('Incomplete workflow state for PDF generation')
    }

    const dataSource = dataBinding.getDataSource(state.dataSourceId)
    if (!dataSource || !dataSource.data) {
      throw new Error('Data source not available')
    }

    const totalPages = Math.ceil(dataSource.data.length / pageSize)
    const pdf = new jsPDF({
      orientation: state.pdfOptions.orientation as 'portrait' | 'landscape',
      unit: 'mm',
      format: state.pdfOptions.format,
      compress: true,
      precision: 16
    })

    // Add metadata
    if (state.pdfOptions.includeMetadata) {
      pdf.setProperties({
        title: `${state.template.name} (${totalPages} pages)`,
        subject: `Multi-page report with ${dataSource.data.length} records`,
        author: 'ReportBuilder',
        creator: 'ReportBuilder Workflow Pipeline',
        producer: 'ReportBuilder Multi-Page Generator'
      })
    }

    for (let page = 0; page < totalPages; page++) {
      const startIndex = page * pageSize
      const endIndex = Math.min(startIndex + pageSize, dataSource.data.length)
      const pageData = dataSource.data.slice(startIndex, endIndex)

      // Apply data for this page
      const pageComponents = state.template.components.map(component => {
        const mappedField = state.fieldMappings[component.id]
        if (!mappedField || !component.dataBinding) {
          return component
        }

        const updatedProperties = { ...component.properties }

        if (component.type === 'table' && component.dataBinding.sourceType === 'dynamic') {
          const tableData = pageData.map(row => 
            Object.values(row).map(value => String(value))
          )
          updatedProperties.data = tableData
          updatedProperties.columns = dataSource.columns || Object.keys(pageData[0] || {})
        }

        return {
          ...component,
          properties: updatedProperties
        }
      })

      // Update components for this page
      pageComponents.forEach(component => {
        onComponentUpdate?.(component.id, component)
      })

      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 200))

      // Capture page
      if (canvasRef.current) {
        const canvasElement = canvasRef.current.querySelector('[data-canvas="true"]') as HTMLElement
        if (canvasElement) {
          const canvas = await html2canvas(canvasElement, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff'
          })

          if (page > 0) {
            pdf.addPage()
          }

          const imgData = canvas.toDataURL('image/png', 0.95)
          pdf.addImage(imgData, 'PNG', 10, 10, 190, 277) // A4 with margins
        }
      }
    }

    // Save multi-page PDF
    const filename = state.pdfOptions.filename.replace('.pdf', `-${totalPages}pages.pdf`)
    pdf.save(filename)
    
    return pdf
  }, [workflow, dataBinding, canvasRef, onComponentUpdate])

  // Batch PDF generation for multiple templates
  const generateBatchPDFs = useCallback(async (
    templates: ReportTemplate[],
    dataSourceId: string,
    options: { 
      separateFiles?: boolean
      pageBreaks?: boolean
      filename?: string
    } = {}
  ) => {
    const { separateFiles = false, pageBreaks = true, filename = 'batch-report.pdf' } = options
    
    if (separateFiles) {
      // Generate separate PDF for each template
      const results = []
      for (const template of templates) {
        await workflow.loadTemplate(template)
        await workflow.connectDataSource(dataSourceId)
        
        // Auto-map fields based on template requirements
        const autoMappings: Record<string, string> = {}
        template.components.forEach(component => {
          if (component.dataBinding?.field && component.dataBinding.sourceType === 'dynamic') {
            autoMappings[component.id] = component.dataBinding.field
          }
        })
        
        workflow.mapFields(autoMappings)
        
        const pdf = await generateWorkflowPDF()
        results.push(pdf)
      }
      return results
    } else {
      // Generate single PDF with all templates
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      })

      let isFirstTemplate = true

      for (const template of templates) {
        if (!isFirstTemplate && pageBreaks) {
          pdf.addPage()
        }
        
        await workflow.loadTemplate(template)
        await workflow.connectDataSource(dataSourceId)
        
        // Auto-map and generate
        const autoMappings: Record<string, string> = {}
        template.components.forEach(component => {
          if (component.dataBinding?.field && component.dataBinding.sourceType === 'dynamic') {
            autoMappings[component.id] = component.dataBinding.field
          }
        })
        
        workflow.mapFields(autoMappings)
        
        // Capture template content
        if (canvasRef.current) {
          const canvasElement = canvasRef.current.querySelector('[data-canvas="true"]') as HTMLElement
          if (canvasElement) {
            const canvas = await html2canvas(canvasElement, {
              scale: 2,
              useCORS: true,
              allowTaint: false,
              backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/png', 0.95)
            pdf.addImage(imgData, 'PNG', 10, 10, 190, 277)
          }
        }
        
        isFirstTemplate = false
      }

      pdf.save(filename)
      return pdf
    }
  }, [workflow, canvasRef, generateWorkflowPDF])

  return {
    generateWorkflowPDF,
    generateMultiPagePDF,
    generateBatchPDFs,
    applyDataBindings
  }
}

// Helper functions
function getQualitySettings(quality: string) {
  switch (quality) {
    case 'standard':
      return { scale: 1, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' }
    case 'high':
      return { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' }
    case 'print':
      return { scale: 3, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' }
    default:
      return { scale: 2, useCORS: true, allowTaint: false, backgroundColor: '#ffffff' }
  }
}

function getPageDimensions(format: string, orientation: string) {
  const dimensions = {
    a4: { width: 210, height: 297 },
    letter: { width: 216, height: 279 },
    a3: { width: 297, height: 420 },
    legal: { width: 216, height: 356 }
  }[format] || { width: 210, height: 297 }

  return orientation === 'landscape'
    ? { width: dimensions.height, height: dimensions.width }
    : dimensions
}