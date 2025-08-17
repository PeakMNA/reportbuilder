'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  Database, 
  Link, 
  Eye, 
  Download,
  Send,
  ArrowRight,
  ArrowLeft,
  Zap,
  Target,
  Timer
} from 'lucide-react'
import { useWorkflow, WorkflowStep } from './workflow-orchestrator'
import { cn } from '@/lib/utils'

const STEP_CONFIG: Record<WorkflowStep, {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  estimatedTime: number
}> = {
  template_selection: {
    icon: FileText,
    title: 'Select Template',
    description: 'Choose or create a report template',
    estimatedTime: 5000
  },
  data_source_setup: {
    icon: Database,
    title: 'Connect Data',
    description: 'Select and configure your data source',
    estimatedTime: 3000
  },
  field_mapping: {
    icon: Link,
    title: 'Map Fields',
    description: 'Connect template components to data fields',
    estimatedTime: 8000
  },
  preview_validation: {
    icon: Eye,
    title: 'Preview & Validate',
    description: 'Review your report with live data',
    estimatedTime: 5000
  },
  pdf_generation: {
    icon: Download,
    title: 'Generate PDF',
    description: 'Configure and create your PDF report',
    estimatedTime: 7000
  },
  delivery: {
    icon: Send,
    title: 'Deliver Report',
    description: 'Download, email, or schedule your report',
    estimatedTime: 2000
  }
}

interface WorkflowStepperProps {
  className?: string
}

export function WorkflowStepper({ className }: WorkflowStepperProps) {
  const workflow = useWorkflow()
  const [showDetails, setShowDetails] = useState(true)

  const getStepStatus = (step: WorkflowStep): 'completed' | 'current' | 'upcoming' | 'blocked' => {
    if (workflow.state.completedSteps.includes(step)) return 'completed'
    if (workflow.state.currentStep === step) return 'current'
    if (workflow.canProceed(step)) return 'upcoming'
    return 'blocked'
  }

  const getStepTime = (step: WorkflowStep): number => {
    return workflow.metrics.stepTimes[step] || 0
  }

  const formatTime = (milliseconds: number): string => {
    if (milliseconds < 1000) return `${milliseconds}ms`
    const seconds = Math.floor(milliseconds / 1000)
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getPerformanceColor = (actualTime: number, estimatedTime: number): string => {
    const ratio = actualTime / estimatedTime
    if (ratio <= 0.8) return 'text-green-600'
    if (ratio <= 1.2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Workflow Progress
              </CardTitle>
              <CardDescription>
                Complete your report in under 30 seconds
              </CardDescription>
            </div>
            <Badge variant={workflow.metrics.performance === 'excellent' ? 'default' : 
                          workflow.metrics.performance === 'good' ? 'secondary' :
                          workflow.metrics.performance === 'acceptable' ? 'outline' : 'destructive'}>
              {workflow.metrics.performance}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{workflow.getProgress()}%</span>
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
              <div className="font-medium">
                {formatTime(workflow.metrics.totalTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Target className="h-3 w-3" />
                Target
              </div>
              <div className="font-medium">
                {formatTime(workflow.metrics.targetTime)}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Zap className="h-3 w-3" />
                Remaining
              </div>
              <div className="font-medium">
                {formatTime(workflow.getEstimatedTimeRemaining())}
              </div>
            </div>
          </div>

          {/* Performance Alert */}
          {workflow.metrics.totalTime > workflow.metrics.targetTime && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Workflow is taking longer than the 30-second target. 
                Consider using faster options or simpler templates.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {workflow.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{workflow.error}</AlertDescription>
        </Alert>
      )}

      {/* Step Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Workflow Steps</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(STEP_CONFIG).map(([stepKey, config], index) => {
              const step = stepKey as WorkflowStep
              const status = getStepStatus(step)
              const stepTime = getStepTime(step)
              const Icon = config.icon

              return (
                <div key={step} className="relative">
                  {/* Connector Line */}
                  {index < Object.keys(STEP_CONFIG).length - 1 && (
                    <div className="absolute left-4 top-8 w-px h-6 bg-border" />
                  )}

                  <div 
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      status === 'current' && 'bg-primary/5 border-primary',
                      status === 'completed' && 'bg-green-50 border-green-200',
                      status === 'blocked' && 'bg-muted/50 border-muted',
                      workflow.canProceed(step) && status !== 'current' && 'cursor-pointer hover:bg-muted/50'
                    )}
                    onClick={() => workflow.canProceed(step) && workflow.goToStep(step)}
                  >
                    {/* Step Icon */}
                    <div className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2',
                      status === 'completed' && 'bg-green-100 border-green-300 text-green-700',
                      status === 'current' && 'bg-primary border-primary text-primary-foreground',
                      status === 'upcoming' && 'bg-background border-muted-foreground text-muted-foreground',
                      status === 'blocked' && 'bg-muted border-muted text-muted-foreground'
                    )}>
                      {status === 'completed' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : status === 'current' && workflow.isProcessing ? (
                        <Clock className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          'font-medium',
                          status === 'blocked' && 'text-muted-foreground'
                        )}>
                          {config.title}
                        </h4>
                        {status === 'current' && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                        {status === 'completed' && stepTime > 0 && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-xs',
                              getPerformanceColor(stepTime, config.estimatedTime)
                            )}
                          >
                            {formatTime(stepTime)}
                          </Badge>
                        )}
                      </div>
                      
                      <p className={cn(
                        'text-sm',
                        status === 'blocked' ? 'text-muted-foreground' : 'text-muted-foreground'
                      )}>
                        {config.description}
                      </p>

                      {/* Step Details */}
                      {showDetails && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Est. {formatTime(config.estimatedTime)}</span>
                            {status === 'completed' && stepTime > 0 && (
                              <span className={getPerformanceColor(stepTime, config.estimatedTime)}>
                                Actual: {formatTime(stepTime)}
                                {stepTime <= config.estimatedTime * 0.8 && ' (Fast!)'}
                                {stepTime > config.estimatedTime * 1.2 && ' (Slow)'}
                              </span>
                            )}
                            {status === 'blocked' && (
                              <span className="text-orange-600">Requires previous steps</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Action */}
                    {status === 'current' && (
                      <div className="flex items-center gap-2">
                        {workflow.canProceed(step) && (
                          <Button size="sm" disabled={workflow.isProcessing}>
                            {workflow.isProcessing ? (
                              <>
                                <Clock className="mr-2 h-3 w-3 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                Continue
                                <ArrowRight className="ml-2 h-3 w-3" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 mt-4 border-t">
            <Button 
              variant="outline" 
              onClick={workflow.previousStep}
              disabled={workflow.state.currentStep === Object.keys(STEP_CONFIG)[0]}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={workflow.resetWorkflow}
              >
                Reset
              </Button>
              
              <Button 
                onClick={workflow.nextStep}
                disabled={!workflow.canProceed(workflow.state.currentStep) || workflow.isProcessing}
              >
                Next Step
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}