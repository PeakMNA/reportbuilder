'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface DataSource {
  id: string
  name: string
  type: 'csv' | 'api' | 'database'
  status: 'connected' | 'error' | 'connecting'
  lastUpdated: string
  rowCount?: number
  columns?: string[]
  data?: Record<string, unknown>[]
  config?: Record<string, unknown>
}

export interface DataBinding {
  componentId: string
  dataSourceId: string
  fieldMappings: Record<string, string> // component property -> data field
  filters?: DataFilter[]
  sorting?: DataSort[]
}

export interface DataFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between' | 'in'
  value: unknown
}

export interface DataSort {
  field: string
  direction: 'asc' | 'desc'
}

interface DataBindingContextType {
  // Data Sources
  dataSources: DataSource[]
  addDataSource: (dataSource: DataSource) => void
  removeDataSource: (id: string) => void
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  getDataSource: (id: string) => DataSource | undefined
  
  // Data Bindings
  bindings: DataBinding[]
  addBinding: (binding: DataBinding) => void
  removeBinding: (componentId: string) => void
  updateBinding: (componentId: string, updates: Partial<DataBinding>) => void
  getBinding: (componentId: string) => DataBinding | undefined
  
  // Data Operations
  getComponentData: (componentId: string) => Record<string, unknown>[] | null
  refreshDataSource: (dataSourceId: string) => Promise<void>
  
  // Current Context Data for formulas
  currentData?: Record<string, unknown>
  selectedDataSource?: DataSource
}

export const DataBindingContext = createContext<DataBindingContextType | undefined>(undefined)

export function DataBindingProvider({ children }: { children: ReactNode }) {
  const [dataSources, setDataSources] = useState<DataSource[]>([
    {
      id: 'csv1',
      name: 'Sales Data.csv',
      type: 'csv',
      status: 'connected',
      lastUpdated: '2 minutes ago',
      rowCount: 1248,
      columns: ['id', 'customer_name', 'product', 'quantity', 'price', 'order_date', 'status'],
      data: [
        { id: 1, customer_name: 'Acme Corp', product: 'Widget A', quantity: 100, price: 25.99, order_date: '2024-01-15', status: 'Delivered' },
        { id: 2, customer_name: 'Beta Industries', product: 'Widget B', quantity: 250, price: 15.50, order_date: '2024-01-16', status: 'Processing' },
        { id: 3, customer_name: 'Gamma Solutions', product: 'Widget A', quantity: 75, price: 25.99, order_date: '2024-01-16', status: 'Shipped' },
        { id: 4, customer_name: 'Delta Corp', product: 'Widget C', quantity: 150, price: 35.00, order_date: '2024-01-17', status: 'Delivered' },
        { id: 5, customer_name: 'Echo Systems', product: 'Widget B', quantity: 300, price: 15.50, order_date: '2024-01-17', status: 'Processing' }
      ]
    }
  ])
  
  const [bindings, setBindings] = useState<DataBinding[]>([])

  // Data Source Operations
  const addDataSource = (dataSource: DataSource) => {
    setDataSources(prev => [...prev, dataSource])
  }

  const removeDataSource = (id: string) => {
    setDataSources(prev => prev.filter(ds => ds.id !== id))
    // Remove any bindings that reference this data source
    setBindings(prev => prev.filter(binding => binding.dataSourceId !== id))
  }

  const updateDataSource = (id: string, updates: Partial<DataSource>) => {
    setDataSources(prev => prev.map(ds => 
      ds.id === id ? { ...ds, ...updates } : ds
    ))
  }

  const getDataSource = (id: string) => {
    return dataSources.find(ds => ds.id === id)
  }

  // Data Binding Operations
  const addBinding = (binding: DataBinding) => {
    setBindings(prev => {
      // Remove existing binding for this component if it exists
      const filtered = prev.filter(b => b.componentId !== binding.componentId)
      return [...filtered, binding]
    })
  }

  const removeBinding = (componentId: string) => {
    setBindings(prev => prev.filter(b => b.componentId !== componentId))
  }

  const updateBinding = (componentId: string, updates: Partial<DataBinding>) => {
    setBindings(prev => prev.map(binding =>
      binding.componentId === componentId 
        ? { ...binding, ...updates }
        : binding
    ))
  }

  const getBinding = (componentId: string) => {
    return bindings.find(b => b.componentId === componentId)
  }

  // Data Operations
  const getComponentData = (componentId: string): Record<string, unknown>[] | null => {
    const binding = getBinding(componentId)
    if (!binding) return null

    const dataSource = getDataSource(binding.dataSourceId)
    if (!dataSource || !dataSource.data) return null

    let data = [...dataSource.data]

    // Apply filters
    if (binding.filters && binding.filters.length > 0) {
      data = data.filter(row => {
        return binding.filters!.every(filter => {
          const value = row[filter.field]
          switch (filter.operator) {
            case 'equals':
              return value === filter.value
            case 'contains':
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
            case 'greater_than':
              return Number(value) > Number(filter.value)
            case 'less_than':
              return Number(value) < Number(filter.value)
            case 'in':
              return Array.isArray(filter.value) && filter.value.includes(value)
            default:
              return true
          }
        })
      })
    }

    // Apply sorting
    if (binding.sorting && binding.sorting.length > 0) {
      data.sort((a, b) => {
        for (const sort of binding.sorting!) {
          const aValue = a[sort.field]
          const bValue = b[sort.field]
          
          let comparison = 0
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue
          } else {
            comparison = String(aValue).localeCompare(String(bValue))
          }
          
          if (comparison !== 0) {
            return sort.direction === 'desc' ? -comparison : comparison
          }
        }
        return 0
      })
    }

    return data
  }

  const refreshDataSource = async (dataSourceId: string) => {
    const dataSource = getDataSource(dataSourceId)
    if (!dataSource) return

    // Update status to connecting
    updateDataSource(dataSourceId, { status: 'connecting' })

    try {
      // Simulate refresh logic - in a real app, this would re-fetch data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateDataSource(dataSourceId, { 
        status: 'connected',
        lastUpdated: 'just now'
      })
    } catch (error) {
      updateDataSource(dataSourceId, { status: 'error' })
    }
  }

  const value: DataBindingContextType = {
    // Data Sources
    dataSources,
    addDataSource,
    removeDataSource,
    updateDataSource,
    getDataSource,
    
    // Data Bindings
    bindings,
    addBinding,
    removeBinding,
    updateBinding,
    getBinding,
    
    // Data Operations
    getComponentData,
    refreshDataSource,
    
    // Current Context Data for formulas
    currentData: dataSources[0]?.data?.[0] || {},
    selectedDataSource: dataSources[0]
  }

  return (
    <DataBindingContext.Provider value={value}>
      {children}
    </DataBindingContext.Provider>
  )
}

export function useDataBinding() {
  const context = useContext(DataBindingContext)
  if (context === undefined) {
    throw new Error('useDataBinding must be used within a DataBindingProvider')
  }
  return context
}