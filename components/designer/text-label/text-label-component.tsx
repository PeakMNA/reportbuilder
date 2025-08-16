'use client';

import { ComponentType } from '@/types/component';

export interface TextLabelProperties {
  // Core Properties
  content: string;
  fontSize: number;
  autoFit: boolean;
  
  // Style Properties  
  fontWeight: 'normal' | 'bold';
  color: string;
  alignment: 'left' | 'center' | 'right';
}

export const DEFAULT_TEXT_LABEL_PROPERTIES: TextLabelProperties = {
  content: 'Text Label',
  fontSize: 14,
  autoFit: true,
  fontWeight: 'normal',
  color: '#000000',
  alignment: 'left'
};

interface TextLabelComponentProps {
  id: string;
  properties: TextLabelProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<TextLabelProperties>) => void;
  className?: string;
}

export function TextLabelComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: TextLabelComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const textStyle = {
    fontSize: `${properties.fontSize}px`,
    fontWeight: properties.fontWeight,
    color: properties.color,
    textAlign: properties.alignment as 'left' | 'center' | 'right',
    width: properties.autoFit ? 'auto' : '100%',
    height: properties.autoFit ? 'auto' : '100%'
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 transition-colors p-2
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-300'
        }
        ${className}
      `}
      style={properties.autoFit ? {} : { minWidth: '120px', minHeight: '30px' }}
    >
      <span
        className="block"
        style={textStyle}
      >
        {properties.content || 'Text Label'}
      </span>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const TEXT_LABEL_COMPONENT_TYPE: ComponentType = {
  id: 'text-label',
  name: 'Text Label',
  description: 'Static text display for titles, labels, and fixed content',
  category: 'Text',
  icon: 'Type',
  defaultProperties: DEFAULT_TEXT_LABEL_PROPERTIES
};