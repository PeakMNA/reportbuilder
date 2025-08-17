'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Search,
  Filter,
  FileText,
  MoreVertical,
  Download,
  Copy,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
  Database,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { ReportTemplate } from '@/types/template'
import { TemplateService } from '@/lib/templates/template-service'

interface TemplateGalleryProps {
  onSelectTemplate?: (template: ReportTemplate) => void
  onPreviewTemplate?: (template: ReportTemplate) => void
  showActions?: boolean
  mode?: 'select' | 'manage'
}

export function TemplateGallery({ 
  onSelectTemplate, 
  onPreviewTemplate,
  showActions = true,
  mode = 'manage'
}: TemplateGalleryProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ReportTemplate[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [showBuiltIn, setShowBuiltIn] = useState(true)
  const [showCustom, setShowCustom] = useState(true)

  // UI states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadTemplates()
    loadCategories()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [templates, searchQuery, selectedCategory, selectedTag, showBuiltIn, showCustom])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      const allTemplates = await TemplateService.getAllTemplates()
      setTemplates(allTemplates)
    } catch (err) {
      setError('Failed to load templates')
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const allCategories = await TemplateService.getTemplateCategories()
      setCategories(allCategories)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }

  const applyFilters = () => {
    let filtered = templates

    // Text search
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(template => template.metadata.tags.includes(selectedTag))
    }

    // Built-in/Custom filter
    if (!showBuiltIn || !showCustom) {
      filtered = filtered.filter(template => {
        if (!showBuiltIn && template.metadata.isBuiltIn) return false
        if (!showCustom && !template.metadata.isBuiltIn) return false
        return true
      })
    }

    setFilteredTemplates(filtered)
  }

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await TemplateService.deleteTemplate(templateId)
      setTemplates(templates.filter(t => t.id !== templateId))
      setDeleteDialogOpen(null)
    } catch (err) {
      setError('Failed to delete template')
      console.error('Failed to delete template:', err)
    }
  }

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const duplicated = await TemplateService.duplicateTemplate(templateId)
      setTemplates([...templates, duplicated])
    } catch (err) {
      setError('Failed to duplicate template')
      console.error('Failed to duplicate template:', err)
    }
  }

  const handleExportTemplate = (template: ReportTemplate) => {
    try {
      const exported = TemplateService.exportTemplate(template)
      const blob = new Blob([exported], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}-template.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export template')
      console.error('Failed to export template:', err)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTemplates()
    await loadCategories()
    setRefreshing(false)
  }

  const getAllTags = () => {
    const allTags = new Set<string>()
    templates.forEach(template => {
      template.metadata.tags.forEach(tag => allTags.add(tag))
    })
    return Array.from(allTags)
  }

  const getTemplatePreview = (template: ReportTemplate) => {
    const componentCount = template.components.length
    const componentTypes = [...new Set(template.components.map(c => c.type))]
    return `${componentCount} components (${componentTypes.slice(0, 3).join(', ')}${componentTypes.length > 3 ? '...' : ''})`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading templates...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Template Gallery</h2>
          <p className="text-muted-foreground">
            Browse and manage report templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge variant="secondary">
            {filteredTemplates.length} of {templates.length} templates
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag */}
            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="All tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tags</SelectItem>
                  {getAllTags().map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showBuiltIn}
                    onChange={(e) => setShowBuiltIn(e.target.checked)}
                  />
                  <span className="text-sm">Built-in</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showCustom}
                    onChange={(e) => setShowCustom(e.target.checked)}
                  />
                  <span className="text-sm">Custom</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {template.name}
                    {template.metadata.isBuiltIn && (
                      <Badge variant="secondary" className="text-xs">
                        Built-in
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                {showActions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onPreviewTemplate && (
                        <DropdownMenuItem onClick={() => onPreviewTemplate(template)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                      )}
                      {onSelectTemplate && (
                        <DropdownMenuItem onClick={() => onSelectTemplate(template)}>
                          <FileText className="mr-2 h-4 w-4" />
                          Use Template
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleExportTemplate(template)}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {!template.metadata.isBuiltIn && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => setDeleteDialogOpen(template.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {getTemplatePreview(template)}
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
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

                {mode === 'select' && onSelectTemplate && (
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center p-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
          <p className="text-muted-foreground">
            {templates.length === 0 
              ? 'No templates available. Create your first template to get started.'
              : 'No templates match your current filters. Try adjusting your search criteria.'
            }
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen !== null} onOpenChange={() => setDeleteDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialogOpen && handleDeleteTemplate(deleteDialogOpen)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}