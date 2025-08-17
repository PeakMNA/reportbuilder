'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Database,
  Plus,
  RefreshCw,
  Settings,
  FileSpreadsheet,
  Server,
  Globe,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import { DataSourceManager } from '../data-sources/data-source-manager'
import { useDataBinding, type DataSource as DataSourceType } from '../data-binding/data-binding-context'

interface DataSource {
  id: string
  name: string
  type: 'csv' | 'database' | 'api'
  status: 'connected' | 'error' | 'disconnected'
  rowCount?: number
  lastUpdated?: string
}

interface DataColumn {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  nullable: boolean
}

interface DataRow {
  [key: string]: string | number | boolean | null
}

export function DataPreviewPanel() {
  const { dataSources, addDataSource, refreshDataSource } = useDataBinding()
  const [selectedDataSource, setSelectedDataSource] = useState<string | null>(
    dataSources.length > 0 ? dataSources[0].id : null
  )
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showDataSourceManager, setShowDataSourceManager] = useState(false)

  const handleDataSourceAdd = (newDataSource: DataSourceType) => {
    addDataSource(newDataSource)
    setSelectedDataSource(newDataSource.id)
  }

  const handleRefresh = async () => {
    if (!selectedDataSource) return
    
    setIsRefreshing(true)
    try {
      await refreshDataSource(selectedDataSource)
    } catch (error) {
      console.error('Failed to refresh data source:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const mockColumns: DataColumn[] = [
    { name: 'id', type: 'number', nullable: false },
    { name: 'customer_name', type: 'string', nullable: false },
    { name: 'product', type: 'string', nullable: false },
    { name: 'quantity', type: 'number', nullable: false },
    { name: 'price', type: 'number', nullable: false },
    { name: 'order_date', type: 'date', nullable: false },
    { name: 'status', type: 'string', nullable: true }
  ]

  const mockData: DataRow[] = [
    { id: 1, customer_name: 'Acme Corp', product: 'Widget A', quantity: 100, price: 25.99, order_date: '2024-01-15', status: 'Delivered' },
    { id: 2, customer_name: 'Beta Industries', product: 'Widget B', quantity: 250, price: 15.50, order_date: '2024-01-16', status: 'Processing' },
    { id: 3, customer_name: 'Gamma Solutions', product: 'Widget A', quantity: 75, price: 25.99, order_date: '2024-01-16', status: 'Shipped' },
    { id: 4, customer_name: 'Delta Corp', product: 'Widget C', quantity: 150, price: 35.00, order_date: '2024-01-17', status: 'Delivered' },
    { id: 5, customer_name: 'Echo Systems', product: 'Widget B', quantity: 300, price: 15.50, order_date: '2024-01-17', status: 'Processing' }
  ]

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case 'csv': return <FileSpreadsheet className="h-4 w-4" />
      case 'database': return <Server className="h-4 w-4" />
      case 'api': return <Globe className="h-4 w-4" />
      default: return <Database className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const currentDataSource = dataSources.find(ds => ds.id === selectedDataSource)
  
  // Get columns and data from the current data source
  const getColumnsFromDataSource = (dataSource: DataSource): DataColumn[] => {
    if ((dataSource as unknown as Record<string, unknown>).columns && (dataSource as unknown as Record<string, unknown>).data && ((dataSource as unknown as Record<string, unknown>).data as unknown[]).length > 0) {
      return ((dataSource as unknown as Record<string, unknown>).columns as string[]).map(col => ({
        name: col,
        type: typeof ((dataSource as unknown as Record<string, unknown>).data as Record<string, unknown>[])[0][col] === 'number' ? 'number' : 
              typeof ((dataSource as unknown as Record<string, unknown>).data as Record<string, unknown>[])[0][col] === 'boolean' ? 'boolean' :
              col.toLowerCase().includes('date') ? 'date' : 'string',
        nullable: true
      }))
    }
    return mockColumns
  }

  const getDataFromDataSource = (dataSource: DataSource): DataRow[] => {
    return ((dataSource as unknown as Record<string, unknown>).data as DataRow[])?.slice(0, 100) || mockData
  }

  if (!selectedDataSource || !currentDataSource) {
    return (
      <div className="h-full border-t bg-muted/20">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data Preview</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDataSourceManager(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Connect Data
            </Button>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Database className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">No Data Source Connected</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Connect a data source to preview your data and bind it to report components.
                </p>
              </div>
              <Button onClick={() => setShowDataSourceManager(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Data Source
              </Button>
            </div>
          </div>
        </div>

        {/* Data Source Manager */}
        <DataSourceManager
          isOpen={showDataSourceManager}
          onClose={() => setShowDataSourceManager(false)}
          onDataSourceAdd={handleDataSourceAdd}
        />
      </div>
    )
  }

  return (
    <div className="h-full border-t bg-muted/20">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2 bg-background">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Data Preview</span>
            <div className="flex items-center gap-2">
              {getDataSourceIcon(currentDataSource.type)}
              <span className="text-sm">{currentDataSource.name}</span>
              {getStatusBadge(currentDataSource.status)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Data Source Info */}
        <div className="px-4 py-2 border-b bg-background/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{currentDataSource.rowCount?.toLocaleString()} rows</span>
            <span>Updated {currentDataSource.lastUpdated}</span>
          </div>
        </div>

        {/* Data Table */}
        <ScrollArea className="flex-1">
          <div className="min-w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background border-b">
                <TableRow>
                  {getColumnsFromDataSource(currentDataSource as unknown as DataSource).map((column) => (
                    <TableHead key={column.name} className="font-medium">
                      <div className="flex items-center gap-1">
                        <span>{column.name}</span>
                        <Badge variant="outline" className="text-xs px-1">
                          {column.type}
                        </Badge>
                        {column.nullable && (
                          <span className="text-xs text-muted-foreground">?</span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {getDataFromDataSource(currentDataSource as unknown as DataSource).map((row, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    {getColumnsFromDataSource(currentDataSource as unknown as DataSource).map((column) => (
                      <TableCell key={column.name} className="font-mono text-xs">
                        {row[column.name]?.toString() || (
                          <span className="text-muted-foreground italic">null</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t px-4 py-2 bg-background">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing first 100 rows</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                View All
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                Export Sample
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Manager */}
      <DataSourceManager
        isOpen={showDataSourceManager}
        onClose={() => setShowDataSourceManager(false)}
        onDataSourceAdd={handleDataSourceAdd}
      />
    </div>
  )
}