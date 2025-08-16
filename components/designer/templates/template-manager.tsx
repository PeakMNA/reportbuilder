'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Save,
  FileText,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  MoreVertical,
  Copy,
  Calendar,
  User,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export interface ReportTemplate {
  id: string
  name: string
  description: string
  components: Component[]
  metadata: {
    createdAt: string
    updatedAt: string
    author: string
    version: string
    tags: string[]
    thumbnail?: string
    category?: string
  }
}

export interface Component {
  id: string
  type: string
  name: string
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, string | number | boolean | string[] | null>
}

interface TemplateManagerProps {
  currentComponents: Component[]
  onLoadTemplate: (template: ReportTemplate) => void
  onSaveSuccess?: () => void
  reportTitle?: string
}

export function TemplateManager({ 
  currentComponents, 
  onLoadTemplate, 
  onSaveSuccess,
  reportTitle = 'Untitled Report'
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Save template form state
  const [templateName, setTemplateName] = useState('')
  const [templateDescription, setTemplateDescription] = useState('')
  const [templateCategory, setTemplateCategory] = useState('')
  const [templateTags, setTemplateTags] = useState('')

  // Load templates on mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = () => {
    setIsLoading(true)
    try {
      const savedTemplates = localStorage.getItem('reportbuilder_templates')
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates)
        setTemplates(parsedTemplates)
      } else {
        // Initialize with sample templates
        const sampleTemplates: ReportTemplate[] = [
          {
            id: 'sample-invoice',
            name: 'Invoice Template',
            description: 'Standard business invoice template with company header, customer details, and itemized billing',
            components: [],
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              author: 'System',
              version: '1.0.0',
              tags: ['business', 'invoice', 'billing'],
              category: 'Business',
              thumbnail: ''
            }
          },
          {
            id: 'sample-report',
            name: 'Monthly Report',
            description: 'Comprehensive monthly business report with charts and data tables',
            components: [],
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              author: 'System',
              version: '1.0.0',
              tags: ['report', 'monthly', 'analytics'],
              category: 'Analytics',
              thumbnail: ''
            }
          }
        ]
        setTemplates(sampleTemplates)
        localStorage.setItem('reportbuilder_templates', JSON.stringify(sampleTemplates))
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setSaveError('Template name is required')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const newTemplate: ReportTemplate = {
        id: `template-${Date.now()}`,
        name: templateName.trim(),
        description: templateDescription.trim(),
        components: JSON.parse(JSON.stringify(currentComponents)), // Deep copy
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: 'User', // TODO: Get from auth context
          version: '1.0.0',
          tags: templateTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          category: templateCategory.trim() || 'Custom',
          thumbnail: '' // TODO: Generate thumbnail
        }
      }

      const updatedTemplates = [...templates, newTemplate]
      setTemplates(updatedTemplates)
      localStorage.setItem('reportbuilder_templates', JSON.stringify(updatedTemplates))

      setSaveSuccess(true)
      onSaveSuccess?.()

      // Reset form
      setTemplateName('')
      setTemplateDescription('')
      setTemplateCategory('')
      setTemplateTags('')

      // Close dialog after success
      setTimeout(() => {
        setSaveDialogOpen(false)
        setSaveSuccess(false)
      }, 1500)

    } catch (error) {
      console.error('Failed to save template:', error)
      setSaveError('Failed to save template. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteTemplate = (templateId: string) => {
    try {
      const updatedTemplates = templates.filter(t => t.id !== templateId)
      setTemplates(updatedTemplates)
      localStorage.setItem('reportbuilder_templates', JSON.stringify(updatedTemplates))
      setDeleteDialogOpen(null)
    } catch (error) {
      console.error('Failed to delete template:', error)
    }
  }

  const exportTemplate = (template: ReportTemplate) => {
    try {
      const dataStr = JSON.stringify(template, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    } catch (error) {
      console.error('Failed to export template:', error)
    }
  }

  const importTemplate = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const template = JSON.parse(e.target?.result as string) as ReportTemplate
            // Validate template structure
            if (!template.id || !template.name || !template.components) {
              throw new Error('Invalid template format')
            }
            
            // Generate new ID to avoid conflicts
            template.id = `template-${Date.now()}`
            template.metadata.updatedAt = new Date().toISOString()
            
            const updatedTemplates = [...templates, template]
            setTemplates(updatedTemplates)
            localStorage.setItem('reportbuilder_templates', JSON.stringify(updatedTemplates))
          } catch (error) {
            console.error('Failed to import template:', error)
            alert('Failed to import template. Please check the file format.')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const getTemplatePreview = (template: ReportTemplate) => {
    const componentCount = template.components.length
    const componentTypes = [...new Set(template.components.map(c => c.type))]
    return `${componentCount} components (${componentTypes.slice(0, 3).join(', ')}${componentTypes.length > 3 ? '...' : ''})`
  }

  return (
    <>
      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setTemplateName(reportTitle)}>
            <Save className="mr-2 h-4 w-4" />
            Save Template
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save your current report design as a reusable template.
            </DialogDescription>
          </DialogHeader>

          {saveSuccess ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Template saved successfully!</span>
            </div>
          ) : (
            <div className="space-y-4">
              {saveError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{saveError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Template Name *</Label>
                <Input
                  id="name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="My Report Template"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of this template..."
                  rows={3}
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    placeholder="Business, Reports, etc."
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={templateTags}
                    onChange={(e) => setTemplateTags(e.target.value)}
                    placeholder="invoice, monthly, chart"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          )}

          {!saveSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={saveTemplate} disabled={isSaving || !templateName.trim()}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Template
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Template Library</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={importTemplate}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Choose from your saved templates or create a new report from scratch.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center p-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Templates Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Save your first template to get started with reusable report designs.
                </p>
                <Button onClick={() => {
                  setLoadDialogOpen(false)
                  setSaveDialogOpen(true)
                }}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Current as Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1 line-clamp-2">
                            {template.description || 'No description'}
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onLoadTemplate(template)}>
                              <FolderOpen className="mr-2 h-4 w-4" />
                              Load Template
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportTemplate(template)}>
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              // Create a copy
                              const copy = { ...template, id: `template-${Date.now()}`, name: `${template.name} (Copy)` }
                              const updatedTemplates = [...templates, copy]
                              setTemplates(updatedTemplates)
                              localStorage.setItem('reportbuilder_templates', JSON.stringify(updatedTemplates))
                            }}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => setDeleteDialogOpen(template.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                          {getTemplatePreview(template)}
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {template.metadata.category && (
                            <Badge variant="secondary" className="text-xs">
                              {template.metadata.category}
                            </Badge>
                          )}
                          {template.metadata.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {template.metadata.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.metadata.tags.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(template.metadata.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {template.metadata.author}
                          </div>
                        </div>

                        <Button 
                          className="w-full" 
                          size="sm"
                          onClick={() => {
                            onLoadTemplate(template)
                            setLoadDialogOpen(false)
                          }}
                        >
                          Use This Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen !== null} onOpenChange={() => setDeleteDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialogOpen && deleteTemplate(deleteDialogOpen)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}