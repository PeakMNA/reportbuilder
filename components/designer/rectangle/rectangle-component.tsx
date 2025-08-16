/**
 * Rectangle Component - Basic geometric shape for layouts
 * Part of Phase 2 Migration - Legacy to Lean Architecture
 * 
 * Migrated from legacy system to PropertyConfig framework
 * Property count optimized from 4+ to 5 essential properties
 */

import { ComponentType } from '@/types/component';
import { Square } from 'lucide-react';

export interface RectangleProperties {
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export const RECTANGLE_COMPONENT_TYPE: ComponentType = {
  id: 'rectangle',
  name: 'Rectangle',
  category: 'Shapes',
  description: 'Basic rectangle shape for layouts and design elements',
  icon: <Square className="h-4 w-4" />,
  defaultWidth: 150,
  defaultHeight: 100,
  minWidth: 50,
  minHeight: 30,
  maxWidth: 400,
  maxHeight: 300,
  previewImageUrl: '/previews/rectangle-preview.png'
};

export function RectangleComponent({ 
  properties,
  width,
  height,
  selected,
  onClick 
}: {
  properties: RectangleProperties;
  width: number;
  height: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { backgroundColor, borderColor, borderWidth, borderRadius } = properties;

  return (
    <div 
      className={`
        h-full flex items-center justify-center cursor-pointer
        ${selected ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: backgroundColor || '#f3f4f6',
        borderWidth: `${borderWidth || 1}px`,
        borderColor: borderColor || '#d1d5db',
        borderStyle: 'solid',
        borderRadius: `${borderRadius || 4}px`
      }}
      onClick={onClick}
    >
      <div className="text-center opacity-60">
        <Square className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
        <span className="text-xs text-muted-foreground">Rectangle</span>
      </div>
    </div>
  );
}