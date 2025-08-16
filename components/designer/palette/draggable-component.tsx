'use client'

import { useDraggable } from '@dnd-kit/core'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ComponentType } from './component-palette'

interface DraggableComponentProps {
  component: ComponentType
}

export function DraggableComponent({ component }: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: component.id,
    data: {
      type: 'component',
      component,
    },
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-102 ${
        isDragging ? 'opacity-30 shadow-2xl scale-110 rotate-2 z-10' : ''
      }`}
    >
      <div className={`p-3 space-y-2 ${isDragging ? 'animate-pulse' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary ${
            isDragging ? 'bg-primary/20 scale-110' : ''
          }`}>
            {component.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`text-sm font-medium truncate ${
                isDragging ? 'font-semibold' : ''
              }`}>{component.name}</h4>
              {component.popular && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Popular
                </Badge>
              )}
            </div>
            <p className={`text-xs text-muted-foreground truncate ${
              isDragging ? 'text-muted-foreground/80' : ''
            }`}>
              {component.description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}