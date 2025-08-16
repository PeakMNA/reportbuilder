/**
 * Feature Registry Store
 * 
 * Central state management for the feature registration system.
 * Implements the mandatory feature registration approach to prevent UI/functionality gaps.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  RegisteredFeature,
  FeatureRegistryState,
  FeatureRegistryActions,
  FeatureStatus,
  FeatureType,
  FeaturePriority,
  FeatureCategory,
  FeatureValidation
} from '@/types/feature-registry'

interface FeatureRegistryStore extends FeatureRegistryState, FeatureRegistryActions {}

const initialFilters: FeatureRegistryState['filters'] = {
  status: [],
  type: [],
  priority: [],
  category: [],
  assignee: [],
  tags: [],
  searchQuery: ''
}

const initialStats: FeatureRegistryState['stats'] = {
  totalFeatures: 0,
  completedFeatures: 0,
  uiOnlyFeatures: 0,
  blockedFeatures: 0,
  completionRate: 0,
  averageImplementationTime: 0
}

export const useFeatureRegistryStore = create<FeatureRegistryStore>()(
  persist(
    (set, get) => ({
      // State
      features: {},
      featuresByStatus: {
        planned: [],
        ui_only: [],
        in_progress: [],
        functional: [],
        testing: [],
        complete: [],
        blocked: []
      },
      featuresByType: {
        component: [],
        page: [],
        api: [],
        workflow: [],
        integration: [],
        utility: []
      },
      featuresByPriority: {
        critical: [],
        high: [],
        medium: [],
        low: []
      },
      featuresByCategory: {
        'core-functionality': [],
        'data-integration': [],
        'export-output': [],
        'user-experience': [],
        'report-components': [],
        'infrastructure': []
      },
      selectedFeatureId: null,
      filters: initialFilters,
      stats: initialStats,

      // Actions
      registerFeature: (featureData) => {
        const id = `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        
        const feature: RegisteredFeature = {
          ...featureData,
          id,
          createdAt: now,
          updatedAt: now,
          statusHistory: [{
            status: featureData.status,
            timestamp: now,
            reason: 'Feature registered',
            updatedBy: featureData.assignee || 'system'
          }]
        }

        set((state) => {
          const newFeatures = { ...state.features, [id]: feature }
          
          return {
            features: newFeatures,
            featuresByStatus: updateFeaturesByStatus(newFeatures),
            featuresByType: updateFeaturesByType(newFeatures),
            featuresByPriority: updateFeaturesByPriority(newFeatures),
            featuresByCategory: updateFeaturesByCategory(newFeatures),
            stats: calculateStats(newFeatures)
          }
        })

        return id
      },

      updateFeatureStatus: (id, status, reason, updatedBy) => {
        set((state) => {
          const feature = state.features[id]
          if (!feature) return state

          const updatedFeature = {
            ...feature,
            status,
            updatedAt: new Date(),
            statusHistory: [
              ...feature.statusHistory,
              {
                status,
                timestamp: new Date(),
                reason,
                updatedBy
              }
            ]
          }

          const newFeatures = { ...state.features, [id]: updatedFeature }

          return {
            features: newFeatures,
            featuresByStatus: updateFeaturesByStatus(newFeatures),
            stats: calculateStats(newFeatures)
          }
        })
      },

      updateFeature: (id, updates) => {
        set((state) => {
          const feature = state.features[id]
          if (!feature) return state

          const updatedFeature = {
            ...feature,
            ...updates,
            updatedAt: new Date()
          }

          const newFeatures = { ...state.features, [id]: updatedFeature }

          return {
            features: newFeatures,
            featuresByStatus: updateFeaturesByStatus(newFeatures),
            featuresByType: updateFeaturesByType(newFeatures),
            featuresByPriority: updateFeaturesByPriority(newFeatures),
            featuresByCategory: updateFeaturesByCategory(newFeatures),
            stats: calculateStats(newFeatures)
          }
        })
      },

      deleteFeature: (id) => {
        set((state) => {
          const { [id]: deletedFeature, ...remainingFeatures } = state.features

          return {
            features: remainingFeatures,
            featuresByStatus: updateFeaturesByStatus(remainingFeatures),
            featuresByType: updateFeaturesByType(remainingFeatures),
            featuresByPriority: updateFeaturesByPriority(remainingFeatures),
            selectedFeatureId: state.selectedFeatureId === id ? null : state.selectedFeatureId,
            stats: calculateStats(remainingFeatures)
          }
        })
      },

      validateFeature: (id, validation) => {
        set((state) => {
          const feature = state.features[id]
          if (!feature) return state

          const updatedValidation = {
            ...feature.validation,
            ...validation,
            lastValidated: new Date()
          }

          const updatedFeature = {
            ...feature,
            validation: updatedValidation,
            updatedAt: new Date()
          }

          const newFeatures = { ...state.features, [id]: updatedFeature }

          return {
            features: newFeatures,
            stats: calculateStats(newFeatures)
          }
        })
      },

      addFeatureNote: (id, note) => {
        set((state) => {
          const feature = state.features[id]
          if (!feature) return state

          const updatedFeature = {
            ...feature,
            notes: [...feature.notes, `${new Date().toISOString()}: ${note}`],
            updatedAt: new Date()
          }

          return {
            features: { ...state.features, [id]: updatedFeature }
          }
        })
      },

      updateFeatureFiles: (id, filePaths) => {
        set((state) => {
          const feature = state.features[id]
          if (!feature) return state

          const updatedFeature = {
            ...feature,
            filePaths,
            updatedAt: new Date()
          }

          return {
            features: { ...state.features, [id]: updatedFeature }
          }
        })
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }))
      },

      selectFeature: (id) => {
        set({ selectedFeatureId: id })
      },

      getFeaturesByStatus: (status) => {
        const state = get()
        return state.featuresByStatus[status].map(id => state.features[id])
      },

      getFeaturesByType: (type) => {
        const state = get()
        return state.featuresByType[type].map(id => state.features[id])
      },

      getFeaturesByPriority: (priority) => {
        const state = get()
        return state.featuresByPriority[priority].map(id => state.features[id])
      },

      getFeaturesByCategory: (category) => {
        const state = get()
        return state.featuresByCategory[category].map(id => state.features[id])
      },

      getFilteredFeatures: () => {
        const state = get()
        const { features, filters } = state
        
        return Object.values(features).filter(feature => {
          // Status filter
          if (filters.status.length > 0 && !filters.status.includes(feature.status)) {
            return false
          }
          
          // Type filter
          if (filters.type.length > 0 && !filters.type.includes(feature.type)) {
            return false
          }
          
          // Priority filter
          if (filters.priority.length > 0 && !filters.priority.includes(feature.priority)) {
            return false
          }
          
          // Category filter
          if (filters.category.length > 0) {
            const featureCategory = feature.category || 'infrastructure'
            if (!filters.category.includes(featureCategory)) {
              return false
            }
          }
          
          // Assignee filter
          if (filters.assignee.length > 0 && feature.assignee && !filters.assignee.includes(feature.assignee)) {
            return false
          }
          
          // Tags filter
          if (filters.tags.length > 0 && !filters.tags.some(tag => feature.tags.includes(tag))) {
            return false
          }
          
          // Search query filter
          if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase()
            const searchFields = [
              feature.name,
              feature.description,
              feature.assignee || '',
              ...feature.tags,
              ...feature.notes
            ].join(' ').toLowerCase()
            
            if (!searchFields.includes(query)) {
              return false
            }
          }
          
          return true
        })
      },

      searchFeatures: (query) => {
        const state = get()
        const searchQuery = query.toLowerCase()
        
        return Object.values(state.features).filter(feature => {
          const searchFields = [
            feature.name,
            feature.description,
            feature.assignee || '',
            ...feature.tags,
            ...feature.notes,
            ...feature.requirements.functional,
            ...feature.requirements.ui
          ].join(' ').toLowerCase()
          
          return searchFields.includes(searchQuery)
        })
      },

      getStats: () => get().stats,

      exportRegistry: () => {
        const state = get()
        return JSON.stringify({
          features: state.features,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }, null, 2)
      },

      importRegistry: (data) => {
        try {
          const parsed = JSON.parse(data)
          const importedFeatures = parsed.features || {}
          
          set((state) => {
            const newFeatures = { ...state.features, ...importedFeatures }
            
            return {
              features: newFeatures,
              featuresByStatus: updateFeaturesByStatus(newFeatures),
              featuresByType: updateFeaturesByType(newFeatures),
              featuresByPriority: updateFeaturesByPriority(newFeatures),
              featuresByCategory: updateFeaturesByCategory(newFeatures),
              stats: calculateStats(newFeatures)
            }
          })
        } catch (error) {
          console.error('Failed to import registry data:', error)
          throw new Error('Invalid registry data format')
        }
      }
    }),
    {
      name: 'feature-registry-store',
      version: 1,
      partialize: (state) => ({
        features: state.features,
        filters: state.filters
      })
    }
  )
)

// Helper functions
function updateFeaturesByStatus(features: Record<string, RegisteredFeature>) {
  const byStatus: Record<FeatureStatus, string[]> = {
    planned: [],
    ui_only: [],
    in_progress: [],
    functional: [],
    testing: [],
    complete: [],
    blocked: []
  }

  Object.values(features).forEach(feature => {
    byStatus[feature.status].push(feature.id)
  })

  return byStatus
}

function updateFeaturesByType(features: Record<string, RegisteredFeature>) {
  const byType: Record<FeatureType, string[]> = {
    component: [],
    page: [],
    api: [],
    workflow: [],
    integration: [],
    utility: []
  }

  Object.values(features).forEach(feature => {
    byType[feature.type].push(feature.id)
  })

  return byType
}

function updateFeaturesByPriority(features: Record<string, RegisteredFeature>) {
  const byPriority: Record<FeaturePriority, string[]> = {
    critical: [],
    high: [],
    medium: [],
    low: []
  }

  Object.values(features).forEach(feature => {
    byPriority[feature.priority].push(feature.id)
  })

  return byPriority
}

function updateFeaturesByCategory(features: Record<string, RegisteredFeature>) {
  const byCategory: Record<FeatureCategory, string[]> = {
    'core-functionality': [],
    'data-integration': [],
    'export-output': [],
    'user-experience': [],
    'report-components': [],
    'infrastructure': []
  }

  Object.values(features).forEach(feature => {
    // Default category for features without one
    const category = feature.category || 'infrastructure'
    if (byCategory[category]) {
      byCategory[category].push(feature.id)
    }
  })

  return byCategory
}

function calculateStats(features: Record<string, RegisteredFeature>): FeatureRegistryState['stats'] {
  const featureArray = Object.values(features)
  const totalFeatures = featureArray.length
  
  if (totalFeatures === 0) {
    return {
      totalFeatures: 0,
      completedFeatures: 0,
      uiOnlyFeatures: 0,
      blockedFeatures: 0,
      completionRate: 0,
      averageImplementationTime: 0
    }
  }

  const completedFeatures = featureArray.filter(f => f.status === 'complete').length
  const uiOnlyFeatures = featureArray.filter(f => f.status === 'ui_only').length
  const blockedFeatures = featureArray.filter(f => f.status === 'blocked').length
  
  const completionRate = (completedFeatures / totalFeatures) * 100
  
  const featuresWithActualHours = featureArray.filter(f => f.actualHours && f.actualHours > 0)
  const averageImplementationTime = featuresWithActualHours.length > 0
    ? featuresWithActualHours.reduce((sum, f) => sum + (f.actualHours || 0), 0) / featuresWithActualHours.length
    : 0

  return {
    totalFeatures,
    completedFeatures,
    uiOnlyFeatures,
    blockedFeatures,
    completionRate,
    averageImplementationTime
  }
}

// Selectors for common queries
export const featureRegistrySelectors = {
  getUiOnlyFeatures: () => useFeatureRegistryStore.getState().getFeaturesByStatus('ui_only'),
  getBlockedFeatures: () => useFeatureRegistryStore.getState().getFeaturesByStatus('blocked'),
  getCriticalFeatures: () => useFeatureRegistryStore.getState().getFeaturesByPriority('critical'),
  getInProgressFeatures: () => useFeatureRegistryStore.getState().getFeaturesByStatus('in_progress'),
  
  getFeaturesNeedingAttention: () => {
    const state = useFeatureRegistryStore.getState()
    return [
      ...state.getFeaturesByStatus('ui_only'),
      ...state.getFeaturesByStatus('blocked'),
      ...state.getFeaturesByPriority('critical').filter(f => f.status !== 'complete')
    ]
  },
  
  getOverdueFeatures: () => {
    const state = useFeatureRegistryStore.getState()
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    return Object.values(state.features).filter(feature => {
      return feature.status === 'in_progress' && feature.updatedAt < weekAgo
    })
  }
}