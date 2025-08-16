/**
 * Feature Status Badge
 * 
 * Visual indicator for feature implementation status with appropriate styling.
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, XCircle, PlayCircle, TestTube, Package } from 'lucide-react'
import type { FeatureStatus } from '@/types/feature-registry'

interface FeatureStatusBadgeProps {
  status: FeatureStatus
  showIcon?: boolean
  size?: 'sm' | 'default' | 'lg'
}

const statusConfig: Record<FeatureStatus, {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline'
  icon: React.ComponentType<{ className?: string }>
  className?: string
}> = {
  planned: {
    label: 'Planned',
    variant: 'outline',
    icon: Clock,
    className: 'border-blue-200 text-blue-700 bg-blue-50'
  },
  ui_only: {
    label: 'UI Only ⚠️',
    variant: 'destructive',
    icon: AlertTriangle,
    className: 'border-amber-200 text-amber-800 bg-amber-50'
  },
  in_progress: {
    label: 'In Progress',
    variant: 'default',
    icon: PlayCircle,
    className: 'border-indigo-200 text-indigo-700 bg-indigo-50'
  },
  functional: {
    label: 'Functional',
    variant: 'secondary',
    icon: Package,
    className: 'border-purple-200 text-purple-700 bg-purple-50'
  },
  testing: {
    label: 'Testing',
    variant: 'secondary',
    icon: TestTube,
    className: 'border-orange-200 text-orange-700 bg-orange-50'
  },
  complete: {
    label: 'Complete',
    variant: 'default',
    icon: CheckCircle,
    className: 'border-green-200 text-green-700 bg-green-50'
  },
  blocked: {
    label: 'Blocked',
    variant: 'destructive',
    icon: XCircle,
    className: 'border-red-200 text-red-700 bg-red-50'
  }
}

export function FeatureStatusBadge({ 
  status, 
  showIcon = true, 
  size = 'default' 
}: FeatureStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }
  
  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} inline-flex items-center gap-1.5`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  )
}

// Helper function for status priority (for sorting)
export function getStatusPriority(status: FeatureStatus): number {
  const priorities: Record<FeatureStatus, number> = {
    blocked: 0,      // Highest priority (needs attention)
    ui_only: 1,      // Critical gap
    in_progress: 2,  // Active work
    testing: 3,      // Near completion
    functional: 4,   // Ready for testing
    planned: 5,      // Not started
    complete: 6      // Lowest priority (done)
  }
  
  return priorities[status]
}

// Helper function to check if status needs attention
export function statusNeedsAttention(status: FeatureStatus): boolean {
  return status === 'ui_only' || status === 'blocked'
}