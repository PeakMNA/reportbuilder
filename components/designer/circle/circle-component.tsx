/**
 * Circle Component - Basic circular shape for design elements
 * Part of Phase 2 Migration - Legacy to Lean Architecture
 * 
 * Migrated from legacy system to PropertyConfig framework
 * Property count optimized from 3+ to 5 essential properties
 */

import { ComponentType } from '@/types/component';
import { Circle as CircleIcon } from 'lucide-react';

export interface CircleProperties {
  size: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

export const CIRCLE_COMPONENT_TYPE: ComponentType = {
  id: 'circle',
  name: 'Circle',
  category: 'Shapes',
  description: 'Basic circular shape for design elements and indicators',
  icon: 'CircleIcon',
  defaultWidth: 100,
  defaultHeight: 100,
  minWidth: 40,
  minHeight: 40,
  maxWidth: 200,
  maxHeight: 200,
  previewImageUrl: '/previews/circle-preview.png'
};

export function CircleComponent({ 
  properties,
  width,
  height,
  selected,
  onClick 
}: {
  properties: CircleProperties;
  width: number;
  height: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { size, backgroundColor, borderColor, borderWidth } = properties;
  const circleSize = Math.min(width, height, size); // Ensure it fits and stays circular

  return (
    <div 
      className={`
        h-full flex items-center justify-center cursor-pointer
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      onClick={onClick}
    >
      <div 
        className="flex items-center justify-center rounded-full"
        style={{
          width: `${circleSize}px`,
          height: `${circleSize}px`,
          backgroundColor: backgroundColor || '#f3f4f6',
          borderWidth: `${borderWidth || 1}px`,
          borderColor: borderColor || '#d1d5db',
          borderStyle: 'solid'
        }}
      >
        <div className="text-center opacity-60">
          <CircleIcon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Circle</span>
        </div>
      </div>
    </div>
  );
}