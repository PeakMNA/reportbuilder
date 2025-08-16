'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Download, 
  FileText, 
  Settings, 
  Loader2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PDFExportProps {
  canvasRef: React.RefObject<HTMLDivElement>
  reportTitle?: string
}

interface PDFOptions {
  format: 'a4' | 'letter' | 'a3' | 'legal'
  orientation: 'portrait' | 'landscape' 
  quality: 'standard' | 'high' | 'print'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  includeMetadata: boolean
  filename: string
  title: string
  author: string
  subject: string
}

export function PDFExport({ canvasRef, reportTitle = 'Report' }: PDFExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [exportError, setExportError] = useState<string | null>(null)
  
  const [options, setOptions] = useState<PDFOptions>({
    format: 'a4',
    orientation: 'portrait',
    quality: 'high',
    margins: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    },
    includeMetadata: true,
    filename: `${reportTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
    title: reportTitle,
    author: 'ReportBuilder',
    subject: 'Generated Report'
  })

  const getPageDimensions = (format: string, orientation: string) => {
    const dimensions = {
      a4: { width: 210, height: 297 },
      letter: { width: 216, height: 279 }, 
      a3: { width: 297, height: 420 },
      legal: { width: 216, height: 356 }
    }[format] || dimensions.a4

    return orientation === 'landscape' 
      ? { width: dimensions.height, height: dimensions.width }
      : dimensions
  }

  const getQualitySettings = (quality: string) => {
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

  const exportToPDF = async () => {
    if (!canvasRef.current) {
      setExportError('Canvas not found')
      setExportStatus('error')
      return
    }

    setIsExporting(true)
    setExportStatus('idle')
    setExportError(null)

    try {
      // Find the actual canvas element (A4 page with white background)
      const canvasElement = canvasRef.current.querySelector('[data-canvas="true"]') as HTMLElement
      if (!canvasElement) {
        setExportError('Canvas element not found')
        setExportStatus('error')
        setIsExporting(false)
        return
      }

      // Temporarily remove any selection highlights for clean export
      const selectedElements = canvasElement.querySelectorAll('[class*="border-primary"]')
      const originalClasses: string[] = []
      
      selectedElements.forEach((el, index) => {
        originalClasses[index] = el.className
        el.className = el.className
          .replace(/border-primary[^\s]*|ring-primary[^\s]*|shadow-lg/g, '')
          .replace(/\s+/g, ' ')
          .trim()
      })

      // Capture the canvas as image with high quality
      const qualitySettings = getQualitySettings(options.quality)
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

      // Get page dimensions
      const pageDimensions = getPageDimensions(options.format, options.orientation)
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: options.orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: options.format,
        compress: true,
        precision: 16
      })

      // Add metadata if enabled
      if (options.includeMetadata) {
        pdf.setProperties({
          title: options.title,
          subject: options.subject,
          author: options.author,
          creator: 'ReportBuilder',
          producer: 'ReportBuilder PDF Export'
        })
      }

      // Calculate image dimensions to fit page with margins
      const pageWidth = pageDimensions.width - options.margins.left - options.margins.right
      const pageHeight = pageDimensions.height - options.margins.top - options.margins.bottom
      
      const imageWidth = canvas.width
      const imageHeight = canvas.height
      const imageRatio = imageWidth / imageHeight
      const pageRatio = pageWidth / pageHeight

      let finalWidth, finalHeight

      if (imageRatio > pageRatio) {
        // Image is wider relative to page
        finalWidth = pageWidth
        finalHeight = pageWidth / imageRatio
      } else {
        // Image is taller relative to page  
        finalHeight = pageHeight
        finalWidth = pageHeight * imageRatio
      }

      // Center the image on the page
      const xOffset = options.margins.left + (pageWidth - finalWidth) / 2
      const yOffset = options.margins.top + (pageHeight - finalHeight) / 2

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png', options.quality === 'print' ? 1.0 : 0.95)
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

      // Add footer with generation info if metadata is enabled
      if (options.includeMetadata) {
        pdf.setFontSize(8)
        pdf.setTextColor(128, 128, 128)
        pdf.text(
          `Generated by ReportBuilder on ${new Date().toLocaleString()}`,
          options.margins.left,
          pageDimensions.height - options.margins.bottom / 2,
          { maxWidth: pageWidth }
        )
      }

      // Save the PDF
      pdf.save(options.filename)
      
      setExportStatus('success')
      
      // Auto-close dialog after successful export
      setTimeout(() => {
        setIsOpen(false)
        setExportStatus('idle')
      }, 2000)

    } catch (error) {
      console.error('PDF export failed:', error)
      setExportError(error instanceof Error ? error.message : 'Unknown error occurred')
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const updateOptions = (key: keyof PDFOptions, value: string | boolean | number | PDFOptions['margins'] | PDFOptions['format'] | PDFOptions['orientation'] | PDFOptions['quality']) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  const updateMargins = (side: keyof PDFOptions['margins'], value: number) => {
    setOptions(prev => ({
      ...prev,
      margins: { ...prev.margins, [side]: value }
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export to PDF
          </DialogTitle>
          <DialogDescription>
            Configure your PDF export settings for optimal output quality.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Export Status */}
          {exportStatus !== 'idle' && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {exportStatus === 'success' && (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        PDF exported successfully!
                      </span>
                    </>
                  )}
                  {exportStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <div>
                        <div className="text-sm font-medium text-red-700">Export failed</div>
                        {exportError && (
                          <div className="text-xs text-red-600 mt-1">{exportError}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Page Format */}
            <div className="space-y-2">
              <Label>Page Format</Label>
              <Select value={options.format} onValueChange={(value) => updateOptions('format', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                  <SelectItem value="letter">Letter (8.5 × 11 in)</SelectItem>
                  <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                  <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orientation */}
            <div className="space-y-2">
              <Label>Orientation</Label>
              <Select value={options.orientation} onValueChange={(value) => updateOptions('orientation', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <Label>Export Quality</Label>
            <Select value={options.quality} onValueChange={(value) => updateOptions('quality', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <div className="flex items-center justify-between w-full">
                    <span>Standard</span>
                    <Badge variant="outline" className="ml-2">Fast</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center justify-between w-full">
                    <span>High</span>
                    <Badge variant="outline" className="ml-2">Recommended</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="print">
                  <div className="flex items-center justify-between w-full">
                    <span>Print Quality</span>
                    <Badge variant="outline" className="ml-2">Slow</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Margins */}
          <div className="space-y-3">
            <Label>Margins (mm)</Label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Top</Label>
                <Input
                  type="number"
                  value={options.margins.top}
                  onChange={(e) => updateMargins('top', parseInt(e.target.value) || 20)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Right</Label>
                <Input
                  type="number"
                  value={options.margins.right}
                  onChange={(e) => updateMargins('right', parseInt(e.target.value) || 20)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bottom</Label>
                <Input
                  type="number"
                  value={options.margins.bottom}
                  onChange={(e) => updateMargins('bottom', parseInt(e.target.value) || 20)}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Left</Label>
                <Input
                  type="number"
                  value={options.margins.left}
                  onChange={(e) => updateMargins('left', parseInt(e.target.value) || 20)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Filename */}
          <div className="space-y-2">
            <Label>Filename</Label>
            <Input
              value={options.filename}
              onChange={(e) => updateOptions('filename', e.target.value)}
              placeholder="report.pdf"
            />
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) => updateOptions('includeMetadata', checked)}
              />
              <Label htmlFor="metadata">Include PDF Metadata</Label>
            </div>
            
            {options.includeMetadata && (
              <div className="grid gap-3 pl-6 border-l-2 border-muted">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Title</Label>
                    <Input
                      value={options.title}
                      onChange={(e) => updateOptions('title', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Author</Label>
                    <Input
                      value={options.author}
                      onChange={(e) => updateOptions('author', e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Subject</Label>
                  <Textarea
                    value={options.subject}
                    onChange={(e) => updateOptions('subject', e.target.value)}
                    className="text-xs resize-none"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={exportToPDF}
              disabled={isExporting}
              className="min-w-[120px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}