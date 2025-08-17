'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  RefreshCw, 
  Bug, 
  FileX, 
  Database,
  Link,
  Download,
  Send,
  Home,
  MessageSquare
} from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
}

export class WorkflowErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = []

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Workflow Error Boundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })

    // Call external error handler if provided
    this.props.onError?.(error, errorInfo)

    // Log error details for debugging
    this.logError(error, errorInfo)
  }

  componentWillUnmount() {
    // Clear any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    }

    // In a real app, send this to your error tracking service
    console.error('Error Details:', errorDetails)
    
    // Store error locally for potential retry
    try {
      localStorage.setItem(`workflow-error-${this.state.errorId}`, JSON.stringify(errorDetails))
    } catch (e) {
      console.warn('Could not store error details in localStorage:', e)
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state
    const maxRetries = 3
    
    if (retryCount >= maxRetries) {
      console.warn('Maximum retry attempts reached')
      return
    }

    this.setState({
      retryCount: retryCount + 1
    })

    // Exponential backoff: 1s, 2s, 4s
    const retryDelay = Math.pow(2, retryCount) * 1000

    const timeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      })
    }, retryDelay)

    this.retryTimeouts.push(timeout)
  }

  private handleReset = () => {
    // Clear all timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout))
    this.retryTimeouts = []

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
  }

  private getErrorCategory = (error: Error): {
    category: string
    icon: React.ComponentType<{ className?: string }>
    description: string
    recovery: string[]
  } => {
    const message = error.message.toLowerCase()
    
    if (message.includes('template') || message.includes('component')) {
      return {
        category: 'Template Error',
        icon: FileX,
        description: 'Issue with template loading or component configuration',
        recovery: [
          'Try selecting a different template',
          'Check if template components are properly configured',
          'Clear browser cache and reload'
        ]
      }
    }
    
    if (message.includes('data') || message.includes('source') || message.includes('binding')) {
      return {
        category: 'Data Error',
        icon: Database,
        description: 'Issue with data source connection or field mapping',
        recovery: [
          'Verify data source is accessible',
          'Check field mappings are correct',
          'Try reconnecting to data source'
        ]
      }
    }
    
    if (message.includes('mapping') || message.includes('field')) {
      return {
        category: 'Mapping Error',
        icon: Link,
        description: 'Issue with field mapping configuration',
        recovery: [
          'Reset field mappings and try auto-mapping',
          'Manually verify each field mapping',
          'Check data source column names'
        ]
      }
    }
    
    if (message.includes('pdf') || message.includes('export') || message.includes('generation')) {
      return {
        category: 'Export Error',
        icon: Download,
        description: 'Issue with PDF generation or export process',
        recovery: [
          'Try reducing PDF quality settings',
          'Check if browser supports PDF generation',
          'Verify template preview loads correctly'
        ]
      }
    }
    
    if (message.includes('delivery') || message.includes('email') || message.includes('schedule')) {
      return {
        category: 'Delivery Error',
        icon: Send,
        description: 'Issue with report delivery or scheduling',
        recovery: [
          'Check email settings and permissions',
          'Verify delivery method is configured',
          'Try downloading instead of emailing'
        ]
      }
    }
    
    return {
      category: 'System Error',
      icon: Bug,
      description: 'Unexpected system error occurred',
      recovery: [
        'Refresh the page and try again',
        'Clear browser cache and cookies',
        'Try using a different browser'
      ]
    }
  }

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId, retryCount } = this.state
      const errorCategory = this.getErrorCategory(error!)
      const Icon = errorCategory.icon
      const maxRetries = 3

      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Icon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-red-900">
                    {errorCategory.category}
                  </CardTitle>
                  <CardDescription>
                    {errorCategory.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Message */}
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error?.message}
                </AlertDescription>
              </Alert>

              {/* Error ID and Retry Status */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Error ID:</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {errorId}
                  </Badge>
                </div>
                {retryCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Retry attempts:</span>
                    <Badge variant="secondary">
                      {retryCount}/{maxRetries}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Recovery Suggestions */}
              <div>
                <h4 className="font-medium mb-3">Recovery Suggestions:</h4>
                <ul className="space-y-2">
                  {errorCategory.recovery.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Details (Collapsible) */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  Technical Details
                </summary>
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="space-y-2 text-xs font-mono">
                    <div>
                      <span className="font-medium">Message:</span> {error?.message}
                    </div>
                    {error?.stack && (
                      <div>
                        <span className="font-medium">Stack:</span>
                        <pre className="mt-1 whitespace-pre-wrap break-all">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {errorInfo?.componentStack && (
                      <div>
                        <span className="font-medium">Component Stack:</span>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </details>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={this.handleRetry}
                  disabled={retryCount >= maxRetries}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {retryCount >= maxRetries ? 'Max Retries Reached' : 'Retry'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Reset Workflow
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>

                <Button 
                  variant="outline"
                  onClick={() => {
                    const errorReport = {
                      errorId,
                      message: error?.message,
                      category: errorCategory.category,
                      timestamp: new Date().toISOString(),
                      userAgent: navigator.userAgent,
                      url: window.location.href
                    }
                    
                    const subject = `ReportBuilder Error Report - ${errorCategory.category}`
                    const body = `Error ID: ${errorId}\n\nDescription: ${errorCategory.description}\n\nError Message: ${error?.message}\n\nPlease describe what you were doing when this error occurred:\n\n`
                    
                    window.open(`mailto:support@reportbuilder.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
                  }}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Report Issue
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-xs text-muted-foreground border-t pt-4">
                <p>
                  If this problem persists, please report it using the error ID above. 
                  Your workflow progress has been automatically saved and can be restored after fixing the issue.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional error boundary for hooks
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const handleError = React.useCallback((error: Error) => {
    console.error('Workflow error handled:', error)
    setError(error)
  }, [])

  React.useEffect(() => {
    if (error) {
      // Log error for monitoring
      console.error('Error handled by useErrorHandler:', error)
    }
  }, [error])

  return {
    error,
    hasError: !!error,
    resetError,
    handleError
  }
}

// Specific workflow error types
export class WorkflowError extends Error {
  constructor(
    message: string,
    public category: string,
    public recoverable: boolean = true,
    public retryable: boolean = true
  ) {
    super(message)
    this.name = 'WorkflowError'
  }
}

export class TemplateError extends WorkflowError {
  constructor(message: string, public templateId?: string) {
    super(message, 'template', true, false)
    this.name = 'TemplateError'
  }
}

export class DataSourceError extends WorkflowError {
  constructor(message: string, public sourceId?: string) {
    super(message, 'data_source', true, true)
    this.name = 'DataSourceError'
  }
}

export class MappingError extends WorkflowError {
  constructor(message: string, public componentId?: string, public fieldName?: string) {
    super(message, 'mapping', true, false)
    this.name = 'MappingError'
  }
}

export class PDFGenerationError extends WorkflowError {
  constructor(message: string, public options?: unknown) {
    super(message, 'pdf_generation', true, true)
    this.name = 'PDFGenerationError'
  }
}

export class DeliveryError extends WorkflowError {
  constructor(message: string, public deliveryMethod?: string) {
    super(message, 'delivery', true, true)
    this.name = 'DeliveryError'
  }
}