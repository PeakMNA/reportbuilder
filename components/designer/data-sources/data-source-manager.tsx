'use client'

import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  FileSpreadsheet,
  Server,
  Globe,
  Check,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react'

interface DataSource {
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

interface DataSourceManagerProps {
  isOpen: boolean
  onClose: () => void
  onDataSourceAdd: (dataSource: DataSource) => void
}

export function DataSourceManager({ isOpen, onClose, onDataSourceAdd }: DataSourceManagerProps) {
  const [activeTab, setActiveTab] = useState('csv')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSV Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvPreview, setCsvPreview] = useState<Record<string, unknown>[] | null>(null)

  // API Connection State
  const [apiConfig, setApiConfig] = useState({
    name: '',
    url: '',
    method: 'GET' as 'GET' | 'POST',
    headers: '',
    body: ''
  })

  // Database Connection State
  const [dbConfig, setDbConfig] = useState({
    name: '',
    type: 'mysql' as 'mysql' | 'postgresql' | 'sqlite',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    query: 'SELECT * FROM table_name LIMIT 100'
  })

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setIsProcessing(true)
    setCsvFile(file)

    try {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      let data: Record<string, unknown>[] = []

      if (isExcel) {
        // Handle Excel files
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
        
        // Convert array format to object format
        if (data.length > 0) {
          const headers = data[0] as string[]
          data = data.slice(1).map(row => {
            const rowObj: Record<string, unknown> = {}
            headers.forEach((header, index) => {
              rowObj[header] = (row as unknown[])[index] || null
            })
            return rowObj
          }).filter(row => Object.values(row).some(val => val !== null && val !== ''))
        }
      } else {
        // Handle CSV files with Papa Parse
        const text = await file.text()
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value, field) => {
            // Auto-detect data types
            if (value === '' || value === 'null' || value === 'NULL') return null
            if (!isNaN(Number(value)) && value !== '') return Number(value)
            if (value === 'true' || value === 'false') return value === 'true'
            return value.trim()
          }
        })
        
        if (result.errors.length > 0) {
          throw new Error(`CSV parsing error: ${result.errors[0].message}`)
        }
        
        data = result.data as Record<string, unknown>[]
      }

      if (data.length === 0) {
        throw new Error('File contains no data')
      }

      // Show preview (first 5 rows)
      setCsvPreview(data.slice(0, 5))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file')
      setCsvFile(null)
      setCsvPreview(null)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleCsvSubmit = async () => {
    if (!csvFile || !csvPreview) return

    setIsProcessing(true)
    try {
      // Process the entire file (not just preview)
      await new Promise(resolve => setTimeout(resolve, 1000))

      const isExcel = csvFile.name.endsWith('.xlsx') || csvFile.name.endsWith('.xls')
      let allData: Record<string, unknown>[] = []

      if (isExcel) {
        // Re-process Excel file for full data
        const arrayBuffer = await csvFile.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][]
        
        if (rawData.length > 0) {
          const headers = rawData[0] as string[]
          allData = rawData.slice(1).map(row => {
            const rowObj: Record<string, unknown> = {}
            headers.forEach((header, index) => {
              const value = (row as unknown[])[index]
              rowObj[header] = value !== undefined && value !== '' ? value : null
            })
            return rowObj
          }).filter(row => Object.values(row).some(val => val !== null && val !== ''))
        }
      } else {
        // Re-process CSV file for full data
        const text = await csvFile.text()
        const result = Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value, field) => {
            if (value === '' || value === 'null' || value === 'NULL') return null
            if (!isNaN(Number(value)) && value !== '') return Number(value)
            if (value === 'true' || value === 'false') return value === 'true'
            return value.trim()
          }
        })
        
        allData = result.data as Record<string, unknown>[]
      }

      const headers = Object.keys(allData[0] || {})
      const newDataSource: DataSource = {
        id: `${isExcel ? 'excel' : 'csv'}-${Date.now()}`,
        name: csvFile.name,
        type: 'csv',
        status: 'connected',
        lastUpdated: 'just now',
        rowCount: allData.length,
        columns: headers,
        data: allData
      }

      onDataSourceAdd(newDataSource)
      onClose()
      
      // Reset form
      setCsvFile(null)
      setCsvPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError('Failed to process file')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleApiTest = async () => {
    if (!apiConfig.url) return

    setIsProcessing(true)
    setError(null)

    try {
      let headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      // Parse custom headers if provided
      if (apiConfig.headers.trim()) {
        try {
          const customHeaders = JSON.parse(apiConfig.headers)
          headers = { ...headers, ...customHeaders }
        } catch (e) {
          throw new Error('Invalid JSON format in headers')
        }
      }

      const requestOptions: RequestInit = {
        method: apiConfig.method,
        headers,
        mode: 'cors', // Handle CORS explicitly
      }

      if (apiConfig.method === 'POST' && apiConfig.body.trim()) {
        requestOptions.body = apiConfig.body
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(apiConfig.url, {
        ...requestOptions,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`)
      }

      const contentType = response.headers.get('content-type')
      let data: unknown

      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else if (contentType?.includes('text/')) {
        data = await response.text()
      } else {
        data = await response.blob()
      }

      // Handle different data formats
      let processedData: Record<string, unknown>[]
      let columns: string[] = []

      if (Array.isArray(data)) {
        processedData = data.slice(0, 1000) // Limit to 1000 rows for performance
        columns = data.length > 0 ? Object.keys(data[0]) : []
      } else if (typeof data === 'object' && data !== null) {
        processedData = [data as Record<string, unknown>]
        columns = Object.keys(data as Record<string, unknown>)
      } else {
        processedData = [{ value: data }]
        columns = ['value']
      }
      
      const newDataSource: DataSource = {
        id: `api-${Date.now()}`,
        name: apiConfig.name || 'API Data Source',
        type: 'api',
        status: 'connected',
        lastUpdated: 'just now',
        rowCount: processedData.length,
        columns,
        data: processedData,
        config: { ...apiConfig, lastFetch: new Date().toISOString() }
      }

      onDataSourceAdd(newDataSource)
      onClose()
      
      // Reset form
      setApiConfig({
        name: '',
        url: '',
        method: 'GET',
        headers: '',
        body: ''
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out after 10 seconds')
        } else if (err.message.includes('CORS')) {
          setError('CORS error: API does not allow cross-origin requests. Try using a CORS proxy or configure the API server.')
        } else if (err.message.includes('Failed to fetch')) {
          setError('Network error: Check the URL and your internet connection')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to connect to API')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDatabaseTest = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // In a real app, you'd test the database connection through your backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful connection with mock data
      const mockData = [
        { id: 1, name: 'Sample Record 1', value: 100 },
        { id: 2, name: 'Sample Record 2', value: 200 }
      ]

      const newDataSource: DataSource = {
        id: `db-${Date.now()}`,
        name: dbConfig.name || `${dbConfig.type.toUpperCase()} Database`,
        type: 'database',
        status: 'connected',
        lastUpdated: 'just now',
        rowCount: 1000, // This would come from your actual query
        columns: Object.keys(mockData[0] || {}),
        data: mockData,
        config: dbConfig
      }

      onDataSourceAdd(newDataSource)
      onClose()
    } catch (err) {
      setError('Failed to connect to database')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            Connect your data to create dynamic reports
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV/Excel
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              REST API
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* CSV Upload Tab */}
          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload CSV File</CardTitle>
                <CardDescription>
                  Upload a CSV file to use as your data source
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="csv-file">Select File</Label>
                  <Input
                    ref={fileInputRef}
                    id="csv-file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={isProcessing}
                  />
                </div>

                {csvFile && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <span className="font-medium">{csvFile.name}</span>
                      <Badge variant="outline">{(csvFile.size / 1024).toFixed(1)} KB</Badge>
                    </div>
                    
                    {csvPreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Preview (first 5 rows):</p>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border rounded">
                            <thead>
                              <tr className="bg-muted">
                                {Object.keys(csvPreview[0] || {}).map(header => (
                                  <th key={header} className="border p-2 text-left font-medium">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {csvPreview.map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row).map((value: unknown, i) => (
                                    <td key={i} className="border p-2">
                                      {value?.toString() || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleCsvSubmit}
                  disabled={!csvFile || !csvPreview || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Add Data Source</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">REST API Connection</CardTitle>
                <CardDescription>
                  Connect to a REST API endpoint for live data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="api-name">Connection Name</Label>
                  <Input
                    id="api-name"
                    value={apiConfig.name}
                    onChange={(e) => setApiConfig({...apiConfig, name: e.target.value})}
                    placeholder="My API Data"
                  />
                </div>

                <div>
                  <Label htmlFor="api-url">API Endpoint URL</Label>
                  <Input
                    id="api-url"
                    value={apiConfig.url}
                    onChange={(e) => setApiConfig({...apiConfig, url: e.target.value})}
                    placeholder="https://api.example.com/data"
                  />
                </div>

                <div>
                  <Label htmlFor="api-method">HTTP Method</Label>
                  <Select
                    value={apiConfig.method}
                    onValueChange={(value: 'GET' | 'POST') => setApiConfig({...apiConfig, method: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="api-headers">Headers (JSON)</Label>
                  <Textarea
                    id="api-headers"
                    value={apiConfig.headers}
                    onChange={(e) => setApiConfig({...apiConfig, headers: e.target.value})}
                    placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                    className="font-mono text-sm"
                  />
                </div>

                {apiConfig.method === 'POST' && (
                  <div>
                    <Label htmlFor="api-body">Request Body</Label>
                    <Textarea
                      id="api-body"
                      value={apiConfig.body}
                      onChange={(e) => setApiConfig({...apiConfig, body: e.target.value})}
                      placeholder='{"query": "data"}'
                      className="font-mono text-sm"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleApiTest}
                  disabled={!apiConfig.url || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing Connection...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Test & Add Connection</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Database Connection</CardTitle>
                <CardDescription>
                  Connect to a database for structured data access
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="db-name">Connection Name</Label>
                  <Input
                    id="db-name"
                    value={dbConfig.name}
                    onChange={(e) => setDbConfig({...dbConfig, name: e.target.value})}
                    placeholder="Production Database"
                  />
                </div>

                <div>
                  <Label htmlFor="db-type">Database Type</Label>
                  <Select
                    value={dbConfig.type}
                    onValueChange={(value: 'mysql' | 'postgresql' | 'sqlite') => setDbConfig({...dbConfig, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="db-host">Host</Label>
                    <Input
                      id="db-host"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig({...dbConfig, host: e.target.value})}
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <Label htmlFor="db-port">Port</Label>
                    <Input
                      id="db-port"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig({...dbConfig, port: e.target.value})}
                      placeholder="3306"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="db-database">Database Name</Label>
                  <Input
                    id="db-database"
                    value={dbConfig.database}
                    onChange={(e) => setDbConfig({...dbConfig, database: e.target.value})}
                    placeholder="my_database"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="db-username">Username</Label>
                    <Input
                      id="db-username"
                      value={dbConfig.username}
                      onChange={(e) => setDbConfig({...dbConfig, username: e.target.value})}
                      placeholder="username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="db-password">Password</Label>
                    <Input
                      id="db-password"
                      type="password"
                      value={dbConfig.password}
                      onChange={(e) => setDbConfig({...dbConfig, password: e.target.value})}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="db-query">SQL Query</Label>
                  <Textarea
                    id="db-query"
                    value={dbConfig.query}
                    onChange={(e) => setDbConfig({...dbConfig, query: e.target.value})}
                    className="font-mono text-sm"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleDatabaseTest}
                  disabled={!dbConfig.host || !dbConfig.database || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing Connection...</>
                  ) : (
                    <><Check className="mr-2 h-4 w-4" /> Test & Add Connection</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}