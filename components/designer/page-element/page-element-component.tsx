'use client';

import { ComponentType } from '@/types/component';

export interface PageElementProperties {
  // Core Properties
  elementType: 'page-number' | 'total-pages' | 'current-date' | 'custom';
  format: string;
  autoFit: boolean;
  
  // Style Properties
  fontSize: number;
  color: string;
}

export const DEFAULT_PAGE_ELEMENT_PROPERTIES: PageElementProperties = {
  elementType: 'page-number',
  format: 'Page {page}',
  autoFit: true,
  fontSize: 12,
  color: '#666666'
};

interface PageElementComponentProps {
  id: string;
  properties: PageElementProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<PageElementProperties>) => void;
  className?: string;
}

export function PageElementComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: PageElementComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const getDisplayValue = () => {
    switch (properties.elementType) {
      case 'page-number':
        return properties.format.replace('{page}', '1');
      case 'total-pages':
        return properties.format.replace('{totalPages}', '5');
      case 'current-date':
        return new Date().toLocaleDateString();
      case 'custom':
        return properties.format;
      default:
        return 'Page Element';
    }
  };

  const textStyle = {
    fontSize: `${properties.fontSize}px`,
    color: properties.color,
    width: properties.autoFit ? 'auto' : '100%',
    height: properties.autoFit ? 'auto' : '100%'
  };

  const getElementIcon = () => {
    switch (properties.elementType) {
      case 'page-number':
        return '📄';
      case 'total-pages':
        return '📚';
      case 'current-date':
        return '📅';
      default:
        return '📝';
    }
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
      style={properties.autoFit ? {} : { minWidth: '80px', minHeight: '30px' }}
    >
      <div className="flex items-center space-x-2">
        <span>{getElementIcon()}</span>
        <span style={textStyle}>
          {getDisplayValue()}
        </span>
      </div>
      
      {/* Element type indicator */}
      <div className="absolute -top-1 -right-1 text-xs bg-indigo-500 text-white px-1 rounded">
        {properties.elementType.split('-')[0]}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const PAGE_ELEMENT_COMPONENT_TYPE: ComponentType = {
  id: 'page-element',
  name: 'Page Element',
  description: 'Dynamic page metadata like page numbers and dates',
  category: 'Layout',
  icon: 'Hash',
  defaultProperties: DEFAULT_PAGE_ELEMENT_PROPERTIES as unknown as Record<string, unknown>
};