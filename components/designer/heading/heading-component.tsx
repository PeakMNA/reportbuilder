/**
 * Heading Component - Semantic heading with proper hierarchy
 * Part of Phase 2 Migration - Legacy to Lean Architecture
 * 
 * Migrated from legacy system to PropertyConfig framework
 * Property count optimized from 6+ to 6 essential properties
 */

import { ComponentType } from '@/types/component';
import { Type } from 'lucide-react';

export interface HeadingProperties {
  content: string;
  level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  autoFit: boolean;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
}

export const HEADING_COMPONENT_TYPE: ComponentType = {
  id: 'heading',
  name: 'Heading',
  category: 'Text',
  description: 'Semantic heading with proper hierarchy levels',
  icon: <Type className="h-4 w-4" />,
  defaultWidth: 200,
  defaultHeight: 40,
  minWidth: 100,
  minHeight: 25,
  maxWidth: 600,
  maxHeight: 100,
  previewImageUrl: '/previews/heading-preview.png'
};

export function HeadingComponent({ 
  properties,
  width,
  height,
  selected,
  onClick 
}: {
  properties: HeadingProperties;
  width: number;
  height: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { content, level, fontSize, fontWeight, color, autoFit } = properties;
  const HeadingTag = level || 'h2';

  return (
    <div 
      className={`
        h-full flex items-center justify-start p-2 relative border-2 border-dashed
        ${selected ? 'border-primary' : 'border-transparent'}
        ${autoFit ? 'w-fit' : 'w-full'}
      `}
      onClick={onClick}
    >
      <Type className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
      <HeadingTag 
        className="flex-1 m-0"
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          color: color,
          lineHeight: '1.2',
          margin: 0
        }}
      >
        {content || 'Heading'}
      </HeadingTag>
    </div>
  );
}