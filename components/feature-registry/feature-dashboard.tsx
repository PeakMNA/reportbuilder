/**
 * Feature Registry Dashboard
 * 
 * Central dashboard for tracking all registered features and their status.
 * Provides overview, filtering, and management capabilities.
 */

'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  BarChart3,
  FileText,
  Eye
} from 'lucide-react'
import { useFeatureRegistryStore } from '@/lib/stores/feature-registry-store'
import { FeatureStatusBadge, getStatusPriority, statusNeedsAttention } from './feature-status-badge'
import { FeatureRegistrationForm } from './feature-registration-form'
import { PopulateRegistry } from './populate-registry'
import type { FeatureStatus, FeatureType, FeaturePriority, FeatureCategory } from '@/types/feature-registry'

export function FeatureDashboard() {
  const {
    features,
    filters,
    stats,
    setFilters,
    selectFeature,
    selectedFeatureId,
    getFilteredFeatures
  } = useFeatureRegistryStore()
  
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const filteredFeatures = useMemo(() => {
    return getFilteredFeatures().sort((a, b) => {
      // Sort by status priority, then by update date
      const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status)
      if (statusDiff !== 0) return statusDiff
      
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [getFilteredFeatures])
  
  const featuresNeedingAttention = useMemo(() => {
    return Object.values(features).filter(feature => statusNeedsAttention(feature.status))
  }, [features])
  
  const handleSearchChange = (query: string) => {
    setFilters({ searchQuery: query })
  }
  
  const handleStatusFilter = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = status === 'all' 
      ? [] 
      : currentStatuses.includes(status as FeatureStatus)
        ? currentStatuses.filter(s => s !== status)
        : [...currentStatuses, status as FeatureStatus]
    
    setFilters({ status: newStatuses })
  }
  
  const handleTypeFilter = (type: string) => {
    const currentTypes = filters.type || []
    const newTypes = type === 'all'
      ? []
      : currentTypes.includes(type as FeatureType)
        ? currentTypes.filter(t => t !== type)
        : [...currentTypes, type as FeatureType]
    
    setFilters({ type: newTypes })
  }
  
  const handleCategoryFilter = (category: string) => {
    const currentCategories = filters.category || []
    const newCategories = category === 'all'
      ? []
      : currentCategories.includes(category as FeatureCategory)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category as FeatureCategory]
    
    setFilters({ category: newCategories })
  }
  
  const clearFilters = () => {
    setFilters({
      status: [],
      type: [],
      priority: [],
      category: [],
      assignee: [],
      tags: [],
      searchQuery: ''
    })
  }

  if (showRegistrationForm) {
    return (
      <div className="container mx-auto p-6">
        <FeatureRegistrationForm
          onSuccess={(featureId) => {
            setShowRegistrationForm(false)
            selectFeature(featureId)
            setActiveTab('features')
          }}
          onCancel={() => setShowRegistrationForm(false)}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Registry</h1>
          <p className="text-muted-foreground">
            Track and manage all features to prevent UI/functionality gaps
          </p>
        </div>
        <Button onClick={() => setShowRegistrationForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Register Feature
        </Button>
      </div>
      
      {/* Attention Alerts */}
      {featuresNeedingAttention.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-amber-800">
                {featuresNeedingAttention.length} Feature{featuresNeedingAttention.length !== 1 ? 's' : ''} Need Attention
              </CardTitle>
            </div>
            <CardDescription className="text-amber-700">
              Features with UI-only implementations or blocked status require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {featuresNeedingAttention.slice(0, 3).map(feature => (
                <div key={feature.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <FeatureStatusBadge status={feature.status} size="sm" />
                    <span className="font-medium">{feature.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      selectFeature(feature.id)
                      setActiveTab('features')
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {featuresNeedingAttention.length > 3 && (
                <p className="text-sm text-amber-700 text-center pt-2">
                  And {featuresNeedingAttention.length - 3} more...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Total Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFeatures}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedFeatures}</div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalFeatures > 0 ? Math.round(stats.completionRate) : 0}% complete
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">UI Only ⚠️</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">{stats.uiOnlyFeatures}</div>
                <div className="text-sm text-muted-foreground">Need backend work</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.blockedFeatures}</div>
                <div className="text-sm text-muted-foreground">Require attention</div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Feature completion progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Overall Completion</span>
                    <span>{Math.round(stats.completionRate)}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>
                
                {stats.averageImplementationTime > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Average implementation time: {Math.round(stats.averageImplementationTime)} hours
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search features..."
                      value={filters.searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value="all" onValueChange={handleStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="ui_only">UI Only ⚠️</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="functional">Functional</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value="all" onValueChange={handleTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
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
                  <Label>Category</Label>
                  <Select value="all" onValueChange={handleCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
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
                  <Label>&nbsp;</Label>
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Active Filters */}
              {(filters.status.length > 0 || filters.type.length > 0 || filters.category.length > 0 || filters.searchQuery) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {filters.status.map(status => (
                    <Badge 
                      key={status} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleStatusFilter(status)}
                    >
                      Status: {status} ×
                    </Badge>
                  ))}
                  {filters.type.map(type => (
                    <Badge 
                      key={type} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleTypeFilter(type)}
                    >
                      Type: {type} ×
                    </Badge>
                  ))}
                  {filters.category.map(category => (
                    <Badge 
                      key={category} 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleCategoryFilter(category)}
                    >
                      Category: {category.replace('-', ' ')} ×
                    </Badge>
                  ))}
                  {filters.searchQuery && (
                    <Badge 
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleSearchChange('')}
                    >
                      Search: &ldquo;{filters.searchQuery}&rdquo; ×
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Features List */}
          <div className="space-y-4">
            {filteredFeatures.length === 0 ? (
              Object.keys(features).length === 0 ? (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">Feature Registry is Empty</h3>
                        <p className="text-muted-foreground">
                          Get started by populating the registry with existing features, or register your first feature manually.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  <PopulateRegistry />
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No features found</h3>
                      <p className="text-muted-foreground">
                        No features match your current filters. Try adjusting your search criteria.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            ) : (
              filteredFeatures.map(feature => (
                <Card 
                  key={feature.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedFeatureId === feature.id ? 'ring-2 ring-blue-500' : ''
                  } ${statusNeedsAttention(feature.status) ? 'border-amber-200' : ''}`}
                  onClick={() => selectFeature(feature.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{feature.name}</h3>
                          <FeatureStatusBadge status={feature.status} size="sm" />
                          <Badge variant="outline" className="text-xs">
                            {feature.type}
                          </Badge>
                          {feature.category && (
                            <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                              {feature.category.replace('-', ' ')}
                            </Badge>
                          )}
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              feature.priority === 'critical' ? 'border-red-200 text-red-700' :
                              feature.priority === 'high' ? 'border-orange-200 text-orange-700' :
                              feature.priority === 'medium' ? 'border-blue-200 text-blue-700' :
                              'border-gray-200 text-gray-700'
                            }`}
                          >
                            {feature.priority}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-3">
                          {feature.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {feature.assignee && (
                            <span>👤 {feature.assignee}</span>
                          )}
                          <span>⏱️ {feature.estimatedHours}h estimated</span>
                          {feature.actualHours && (
                            <span>✅ {feature.actualHours}h actual</span>
                          )}
                          <span>📅 Updated {new Date(feature.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        {feature.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {feature.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {statusNeedsAttention(feature.status) && (
                        <AlertTriangle className="h-5 w-5 text-amber-500 ml-4" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Feature Analytics
              </CardTitle>
              <CardDescription>
                Insights and trends from your feature registry
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p>Analytics dashboard coming soon</p>
                <p className="text-sm">Will include completion trends, time tracking, and bottleneck analysis</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}