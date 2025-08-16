'use client';

import { ComponentType } from '@/types/component';

export interface LineDividerProperties {
  // Core Properties
  orientation: 'horizontal' | 'vertical';
  length: number | '100%';
  thickness: number;
  
  // Style Properties
  lineStyle: 'solid' | 'dashed' | 'dotted';
  color: string;
}

export const DEFAULT_LINE_DIVIDER_PROPERTIES: LineDividerProperties = {
  orientation: 'horizontal',
  length: '100%',
  thickness: 1,
  lineStyle: 'solid',
  color: '#d1d5db'
};

interface LineDividerComponentProps {
  id: string;
  properties: LineDividerProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<LineDividerProperties>) => void;
  className?: string;
}

export function LineDividerComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: LineDividerComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const isHorizontal = properties.orientation === 'horizontal';
  
  const lineStyle = {
    width: isHorizontal ? (typeof properties.length === 'number' ? `${properties.length}px` : properties.length) : `${properties.thickness}px`,
    height: isHorizontal ? `${properties.thickness}px` : (typeof properties.length === 'number' ? `${properties.length}px` : properties.length),
    backgroundColor: properties.lineStyle === 'solid' ? properties.color : 'transparent',
    borderStyle: properties.lineStyle !== 'solid' ? properties.lineStyle : 'none',
    borderWidth: properties.lineStyle !== 'solid' ? `${properties.thickness}px` : '0',
    borderColor: properties.color
  };

  const containerStyle = {
    width: isHorizontal ? (typeof properties.length === 'number' ? `${properties.length}px` : properties.length) : `${properties.thickness + 8}px`,
    height: isHorizontal ? `${properties.thickness + 8}px` : (typeof properties.length === 'number' ? `${properties.length}px` : properties.length),
    minWidth: isHorizontal ? '50px' : '8px',
    minHeight: isHorizontal ? '8px' : '50px'
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 transition-colors flex items-center justify-center
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-300'
        }
        ${className}
      `}
      style={containerStyle}
    >
      <div style={lineStyle} />
      
      {/* Orientation indicator */}
      <div className="absolute -top-2 -right-2 text-xs bg-gray-500 text-white px-1 rounded">
        {properties.orientation === 'horizontal' ? '↔️' : '↕️'}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const LINE_DIVIDER_COMPONENT_TYPE: ComponentType = {
  id: 'line-divider',
  name: 'Line Divider',
  description: 'Visual separator lines for report organization',
  category: 'Layout',
  icon: 'Minus',
  defaultProperties: DEFAULT_LINE_DIVIDER_PROPERTIES
};