'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Activity,
  Clock,
  Target,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Timer,
  Gauge,
  BarChart3,
  RefreshCw
} from 'lucide-react'
import { useWorkflow, WorkflowStep } from './workflow-orchestrator'
import { cn } from '@/lib/utils'

interface PerformanceMetric {
  name: string
  value: number
  target: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  status: 'excellent' | 'good' | 'warning' | 'critical'
}

interface PerformanceMonitorProps {
  className?: string
  showDetailed?: boolean
}

export function PerformanceMonitor({ className, showDetailed = false }: PerformanceMonitorProps) {
  const workflow = useWorkflow()
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [isMonitoring, setIsMonitoring] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null)

  // Calculate performance metrics
  const calculateMetrics = useCallback((): PerformanceMetric[] => {
    const { metrics: workflowMetrics, state } = workflow
    const currentTime = Date.now()
    const elapsed = currentTime - workflowMetrics.startTime
    const progress = workflow.getProgress()
    const remainingTime = workflow.getEstimatedTimeRemaining()

    // Calculate step performance
    const avgStepTime = Object.values(workflowMetrics.stepTimes).reduce((sum, time) => sum + time, 0) / 
                       Math.max(Object.keys(workflowMetrics.stepTimes).length, 1)

    // Calculate throughput (steps per minute)
    const completedSteps = state.completedSteps.length
    const throughput = completedSteps > 0 ? (completedSteps / (elapsed / 60000)) : 0

    // Template complexity score
    const templateComplexity = state.template 
      ? state.template.components.length + Object.keys(state.fieldMappings).length
      : 0

    // Data processing efficiency
    const dataSource = workflow.state.dataSourceId 
    const dataEfficiency = dataSource 
      ? Math.min(100, (1000 / (templateComplexity + 1)) * 10) 
      : 100

    return [
      {
        name: 'Elapsed Time',
        value: elapsed,
        target: workflowMetrics.targetTime,
        unit: 'ms',
        trend: elapsed > workflowMetrics.targetTime ? 'up' : 'stable',
        status: elapsed < workflowMetrics.targetTime * 0.8 ? 'excellent' :
                elapsed < workflowMetrics.targetTime ? 'good' :
                elapsed < workflowMetrics.targetTime * 1.5 ? 'warning' : 'critical'
      },
      {
        name: 'Progress Rate',
        value: progress,
        target: 100,
        unit: '%',
        trend: progress > 50 ? 'up' : 'stable',
        status: progress > 80 ? 'excellent' :
                progress > 50 ? 'good' :
                progress > 20 ? 'warning' : 'critical'
      },
      {
        name: 'Step Efficiency',
        value: avgStepTime,
        target: 5000, // 5 seconds per step
        unit: 'ms',
        trend: avgStepTime < 3000 ? 'down' : avgStepTime > 8000 ? 'up' : 'stable',
        status: avgStepTime < 3000 ? 'excellent' :
                avgStepTime < 5000 ? 'good' :
                avgStepTime < 8000 ? 'warning' : 'critical'
      },
      {
        name: 'Throughput',
        value: throughput,
        target: 2, // 2 steps per minute
        unit: 'steps/min',
        trend: throughput > 2 ? 'up' : throughput < 1 ? 'down' : 'stable',
        status: throughput > 3 ? 'excellent' :
                throughput > 2 ? 'good' :
                throughput > 1 ? 'warning' : 'critical'
      },
      {
        name: 'Template Complexity',
        value: templateComplexity,
        target: 15, // Optimal complexity
        unit: 'components',
        trend: 'stable',
        status: templateComplexity < 10 ? 'excellent' :
                templateComplexity < 20 ? 'good' :
                templateComplexity < 30 ? 'warning' : 'critical'
      },
      {
        name: 'Data Efficiency',
        value: dataEfficiency,
        target: 90,
        unit: '%',
        trend: dataEfficiency > 85 ? 'up' : dataEfficiency < 70 ? 'down' : 'stable',
        status: dataEfficiency > 90 ? 'excellent' :
                dataEfficiency > 75 ? 'good' :
                dataEfficiency > 60 ? 'warning' : 'critical'
      }
    ]
  }, [workflow])

  // Update metrics periodically
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(() => {
        setMetrics(calculateMetrics())
      }, 1000)
      setRefreshInterval(interval)
      
      // Initial calculation
      setMetrics(calculateMetrics())
      
      return () => clearInterval(interval)
    } else if (refreshInterval) {
      clearInterval(refreshInterval)
      setRefreshInterval(null)
    }
  }, [isMonitoring, calculateMetrics])

  // Format time display
  const formatTime = (milliseconds: number): string => {
    if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Format value based on unit
  const formatValue = (value: number, unit: string): string => {
    switch (unit) {
      case 'ms':
        return formatTime(value)
      case '%':
        return `${Math.round(value)}%`
      case 'steps/min':
        return value.toFixed(1)
      case 'components':
        return Math.round(value).toString()
      default:
        return value.toString()
    }
  }

  // Get status color
  const getStatusColor = (status: PerformanceMetric['status']): string => {
    switch (status) {
      case 'excellent': return 'text-green-600'
      case 'good': return 'text-blue-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
    }
  }

  // Get status badge variant
  const getStatusBadgeVariant = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'excellent': return 'default'
      case 'good': return 'secondary'
      case 'warning': return 'outline'
      case 'critical': return 'destructive'
    }
  }

  // Get trend icon
  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3" />
      case 'down': return <TrendingDown className="h-3 w-3" />
      case 'stable': return <div className="h-3 w-3" />
    }
  }

  // Overall performance score
  const overallScore = metrics.length > 0 
    ? metrics.reduce((sum, metric) => {
        const score = metric.status === 'excellent' ? 100 :
                     metric.status === 'good' ? 75 :
                     metric.status === 'warning' ? 50 : 25
        return sum + score
      }, 0) / metrics.length
    : 0

  const overallStatus = overallScore > 90 ? 'excellent' :
                       overallScore > 75 ? 'good' :
                       overallScore > 50 ? 'warning' : 'critical'

  return (
    <div className={cn('space-y-4', className)}>
      {/* Performance Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Monitor
              </CardTitle>
              <CardDescription>
                Real-time workflow performance tracking
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant(overallStatus)}>
                {Math.round(overallScore)} Score
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                    Monitoring
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-3 w-3" />
                    Start Monitor
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Workflow Progress
              </span>
              <span className="font-medium">{workflow.getProgress()}%</span>
            </div>
            <Progress value={workflow.getProgress()} className="h-2" />
          </div>

          {/* Time Metrics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Timer className="h-3 w-3" />
                Elapsed
              </div>
              <div className={cn(
                'font-medium',
                getStatusColor(metrics.find(m => m.name === 'Elapsed Time')?.status || 'good')
              )}>
                {formatTime(workflow.metrics.totalTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                Remaining
              </div>
              <div className="font-medium">
                {formatTime(workflow.getEstimatedTimeRemaining())}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Gauge className="h-3 w-3" />
                Efficiency
              </div>
              <div className={cn(
                'font-medium',
                getStatusColor(overallStatus)
              )}>
                {workflow.metrics.performance}
              </div>
            </div>
          </div>

          {/* Performance Alerts */}
          {workflow.metrics.totalTime > workflow.metrics.targetTime && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Workflow exceeded 30-second target. Consider simplifying the template or using auto-mapping.
              </AlertDescription>
            </Alert>
          )}

          {overallScore < 50 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Performance is below optimal. Check step efficiency and consider reducing template complexity.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      {showDetailed && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Metrics
            </CardTitle>
            <CardDescription>
              Comprehensive performance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full',
                      metric.status === 'excellent' && 'bg-green-100 text-green-600',
                      metric.status === 'good' && 'bg-blue-100 text-blue-600',
                      metric.status === 'warning' && 'bg-yellow-100 text-yellow-600',
                      metric.status === 'critical' && 'bg-red-100 text-red-600'
                    )}>
                      {metric.status === 'excellent' ? <CheckCircle className="h-4 w-4" /> :
                       metric.status === 'critical' ? <AlertTriangle className="h-4 w-4" /> :
                       <Activity className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium">{metric.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Target: {formatValue(metric.target, metric.unit)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className={cn('font-medium', getStatusColor(metric.status))}>
                        {formatValue(metric.value, metric.unit)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {getTrendIcon(metric.trend)}
                        <span>{metric.trend}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(metric.status)} className="text-xs">
                      {metric.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {workflow.metrics.totalTime > workflow.metrics.targetTime && (
              <p className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                Try using simpler templates or reducing the number of components
              </p>
            )}
            
            {Object.keys(workflow.state.fieldMappings).length > 15 && (
              <p className="flex items-center gap-2 text-blue-600">
                <Activity className="h-3 w-3" />
                Consider grouping related data or using tables for bulk data
              </p>
            )}
            
            {workflow.getProgress() < 50 && workflow.metrics.totalTime > 15000 && (
              <p className="flex items-center gap-2 text-green-600">
                <Zap className="h-3 w-3" />
                Enable auto-mapping to speed up field configuration
              </p>
            )}
            
            <p className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-3 w-3" />
              Optimal workflow time: under 30 seconds with {'"high"'} quality templates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}