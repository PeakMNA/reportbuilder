/**
 * Feature Registration Form
 * 
 * Form component for registering new features in the system.
 * Implements mandatory feature registration to prevent UI/functionality gaps.
 */

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Plus, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useFeatureRegistryStore } from '@/lib/stores/feature-registry-store'
import type { 
  FeatureType, 
  FeaturePriority, 
  FeatureComplexity, 
  FeatureStatus,
  FeatureCategory,
  FeatureTemplate,
  FEATURE_TEMPLATES 
} from '@/types/feature-registry'

interface FeatureRegistrationFormProps {
  onSuccess?: (featureId: string) => void
  onCancel?: () => void
  template?: FeatureTemplate
}

export function FeatureRegistrationForm({ 
  onSuccess, 
  onCancel, 
  template 
}: FeatureRegistrationFormProps) {
  const registerFeature = useFeatureRegistryStore(state => state.registerFeature)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: (template?.type || 'component') as FeatureType,
    category: 'infrastructure' as FeatureCategory,
    status: 'planned' as FeatureStatus,
    priority: 'medium' as FeaturePriority,
    complexity: (template?.suggestedComplexity || 'moderate') as FeatureComplexity,
    estimatedHours: template?.estimatedHours || 4,
    assignee: '',
    tags: template?.suggestedTags || [],
    filePaths: []
  })
  
  const [requirements, setRequirements] = useState({
    functional: template?.defaultRequirements?.functional || [''],
    ui: template?.defaultRequirements?.ui || [''],
    api: template?.defaultRequirements?.api || [''],
    testing: template?.defaultRequirements?.testing || [''],
    dependencies: [''],
    successCriteria: ['']
  })
  
  const [newTag, setNewTag] = useState('')
  const [newFilePath, setNewFilePath] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRequirementChange = (section: keyof typeof requirements, index: number, value: string) => {
    setRequirements(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => i === index ? value : item)
    }))
  }

  const addRequirement = (section: keyof typeof requirements) => {
    setRequirements(prev => ({
      ...prev,
      [section]: [...prev[section], '']
    }))
  }

  const removeRequirement = (section: keyof typeof requirements, index: number) => {
    setRequirements(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const addFilePath = () => {
    if (newFilePath.trim() && !formData.filePaths.includes(newFilePath.trim())) {
      setFormData(prev => ({
        ...prev,
        filePaths: [...prev.filePaths, newFilePath.trim()]
      }))
      setNewFilePath('')
    }
  }

  const removeFilePath = (path: string) => {
    setFormData(prev => ({
      ...prev,
      filePaths: prev.filePaths.filter(p => p !== path)
    }))
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    
    if (!formData.name.trim()) {
      errors.push('Feature name is required')
    }
    
    if (!formData.description.trim()) {
      errors.push('Feature description is required')
    }
    
    if (formData.estimatedHours <= 0) {
      errors.push('Estimated hours must be greater than 0')
    }
    
    const hasValidRequirements = Object.values(requirements).some(section => 
      section.some(item => item.trim())
    )
    
    if (!hasValidRequirements) {
      errors.push('At least one requirement must be specified')
    }
    
    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors([])
    
    try {
      // Clean up requirements (remove empty entries)
      const cleanedRequirements = Object.fromEntries(
        Object.entries(requirements).map(([key, values]) => [
          key,
          values.filter(item => item.trim())
        ])
      )
      
      const featureId = registerFeature({
        ...formData,
        requirements: cleanedRequirements,
        documentation: {},
        validation: {
          hasFunctionalBackend: false,
          hasCompleteUI: false,
          hasTestCoverage: false,
          hasDocumentation: false,
          passesAcceptanceCriteria: false,
          lastValidated: new Date(),
          validationNotes: ''
        },
        notes: []
      })
      
      onSuccess?.(featureId)
    } catch (error) {
      setErrors(['Failed to register feature. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Register New Feature</CardTitle>
        <CardDescription>
          Register a new feature to prevent UI/functionality gaps and ensure proper tracking.
          {template && (
            <Badge variant="outline" className="ml-2">
              Using {template.name} template
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Feature Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Text/Label Component"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                placeholder="Developer name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Detailed description of what this feature does..."
              rows={3}
            />
          </div>
          
          {/* Classification */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="workflow">Workflow</SelectItem>
                  <SelectItem value="integration">Integration</SelectItem>
                  <SelectItem value="utility">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core-functionality">Core Functionality</SelectItem>
                  <SelectItem value="data-integration">Data Integration</SelectItem>
                  <SelectItem value="export-output">Export & Output</SelectItem>
                  <SelectItem value="user-experience">User Experience</SelectItem>
                  <SelectItem value="report-components">Report Components</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="ui_only">UI Only ⚠️</SelectItem>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexity</Label>
              <Select value={formData.complexity} onValueChange={(value) => handleInputChange('complexity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="complex">Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.estimatedHours}
              onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value))}
            />
          </div>
          
          {/* Requirements */}
          <div className="space-y-4">
            <Label>Requirements</Label>
            
            {Object.entries(requirements).map(([section, items]) => (
              <div key={section} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="capitalize">{section.replace(/([A-Z])/g, ' $1')}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addRequirement(section as keyof typeof requirements)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => handleRequirementChange(
                          section as keyof typeof requirements, 
                          index, 
                          e.target.value
                        )}
                        placeholder={`${section} requirement...`}
                      />
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRequirement(section as keyof typeof requirements, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag} <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
          
          {/* File Paths */}
          <div className="space-y-2">
            <Label>Associated Files</Label>
            <div className="flex gap-2">
              <Input
                value={newFilePath}
                onChange={(e) => setNewFilePath(e.target.value)}
                placeholder="File path..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFilePath())}
              />
              <Button type="button" variant="outline" onClick={addFilePath}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {formData.filePaths.map(path => (
                <div key={path} className="flex items-center justify-between p-2 bg-muted rounded">
                  <code className="text-sm">{path}</code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilePath(path)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Feature'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}