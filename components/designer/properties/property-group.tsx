'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface PropertyGroupProps {
  title: string
  children: React.ReactNode
  defaultExpanded?: boolean
  collapsible?: boolean
  icon?: React.ReactNode
}

export function PropertyGroup({ 
  title, 
  children, 
  defaultExpanded = true, 
  collapsible = true,
  icon 
}: PropertyGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-sm">
      <CardHeader 
        className={`pb-3 ${collapsible ? 'cursor-pointer hover:bg-muted/50' : ''} transition-colors`}
        onClick={handleToggle}
      >
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xs">{icon}</span>}
            {title}
          </div>
          {collapsible && (
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 hover:bg-transparent">
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent 
          className="pt-0 space-y-3 animate-in slide-in-from-top-1 duration-200"
        >
          {children}
        </CardContent>
      )}
    </Card>
  )
}