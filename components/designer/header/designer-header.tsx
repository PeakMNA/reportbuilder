'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Save,
  FileText,
  FolderOpen,
  Download,
  Play,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  User,
  Settings,
  Grid3X3,
  Database,
  Workflow
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { PDFExport } from '../export/pdf-export'
import { TemplateManager } from '../templates/template-manager'
import { CommandSystemHook } from '../commands/command-system'

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

interface DesignerHeaderProps {
  onToggleDataPreview: () => void
  showDataPreview: boolean
  showWorkflow?: boolean
  onToggleWorkflow?: () => void
  canvasRef?: React.RefObject<HTMLDivElement>
  reportTitle?: string
  currentComponents?: Component[]
  onLoadTemplate?: (components: Component[]) => void
  commandSystem?: CommandSystemHook
  onNewReport?: () => void
  onSaveReport?: () => void
  onZoomChange?: (level: number) => void
  hasUnsavedChanges?: boolean
}

export function DesignerHeader({ 
  onToggleDataPreview, 
  showDataPreview,
  showWorkflow = false,
  onToggleWorkflow,
  canvasRef, 
  reportTitle = 'Report',
  currentComponents = [],
  onLoadTemplate,
  commandSystem,
  onNewReport,
  onSaveReport,
  onZoomChange,
  hasUnsavedChanges = false
}: DesignerHeaderProps) {
  const [zoomLevel, setZoomLevel] = useState(100)

  const applyZoom = (level: number) => {
    const canvas = document.querySelector('[data-canvas="true"]') as HTMLElement
    if (canvas) {
      canvas.style.transform = `scale(${level / 100})`
      canvas.style.transformOrigin = 'top center'
    }
    setZoomLevel(level)
    onZoomChange?.(level)
  }

  const handleZoomIn = () => applyZoom(Math.min(zoomLevel + 25, 400))
  const handleZoomOut = () => applyZoom(Math.max(zoomLevel - 25, 25))
  const handleZoomReset = () => applyZoom(100)

  const handleNewReport = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Creating a new report will lose these changes. Continue?'
      )
      if (!confirmed) return
    }
    
    onNewReport?.()
  }

  const handleSaveReport = () => {
    if (currentComponents.length === 0) {
      alert('No components to save. Add some components to your report first.')
      return
    }
    
    onSaveReport?.()
  }

  return (
    <header className="flex h-16 items-center border-b bg-background px-4">
      <div className="flex items-center space-x-4">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <FileText className="h-4 w-4" />
          </div>
          <span className="font-semibold">ReportBuilder</span>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* File Operations */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={handleNewReport}>
            <FileText className="mr-2 h-4 w-4" />
            New
          </Button>
          <TemplateManager 
            currentComponents={currentComponents}
            onLoadTemplate={(template) => onLoadTemplate?.(template.components)}
            reportTitle={reportTitle}
          />
          <Button variant="ghost" size="sm" className="relative" onClick={handleSaveReport}>
            <Save className="mr-2 h-4 w-4" />
            Save
            {hasUnsavedChanges && (
              <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-orange-500" />
            )}
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Canvas Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={!commandSystem?.canUndo}
            onClick={() => commandSystem?.undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={!commandSystem?.canRedo}
            onClick={() => commandSystem?.redo()}
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-4" />
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomReset}>
              <span className="text-sm font-mono w-12 text-center">{zoomLevel}%</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="sm">
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <Button 
            variant={showWorkflow ? "default" : "outline"} 
            size="sm"
            onClick={onToggleWorkflow}
          >
            <Workflow className="mr-2 h-4 w-4" />
            Workflow
          </Button>
          <Button 
            variant={showDataPreview ? "default" : "outline"} 
            size="sm"
            onClick={onToggleDataPreview}
          >
            <Database className="mr-2 h-4 w-4" />
            Data Preview
          </Button>
        </div>
      </div>

      <div className="ml-auto flex items-center space-x-4">
        {/* Status */}
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Draft</Badge>
          <span className="text-sm text-muted-foreground">Auto-saved 2 min ago</span>
        </div>

        {/* Actions */}
        <Button variant="outline" size="sm">
          <Play className="mr-2 h-4 w-4" />
          Preview
        </Button>
        
        {canvasRef ? (
          <PDFExport 
            canvasRef={canvasRef} 
            reportTitle={reportTitle}
          />
        ) : (
          <Button size="sm" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}