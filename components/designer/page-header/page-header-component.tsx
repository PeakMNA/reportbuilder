'use client';

import { ComponentType } from '@/types/component';

export interface PageHeaderProperties {
  // Core Properties
  contentTemplate: string;
  height: number;
  showOnPages: 'all' | 'first' | 'last' | 'except-first';
  
  // Style Properties
  backgroundColor: string;
  borderBottom: boolean;
  borderColor: string;
}

export const DEFAULT_PAGE_HEADER_PROPERTIES: PageHeaderProperties = {
  contentTemplate: 'Report Header',
  height: 60,
  showOnPages: 'all',
  backgroundColor: 'transparent',
  borderBottom: false,
  borderColor: '#e5e7eb'
};

interface PageHeaderComponentProps {
  id: string;
  properties: PageHeaderProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<PageHeaderProperties>) => void;
  className?: string;
}

export function PageHeaderComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: PageHeaderComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const headerStyle = {
    height: `${properties.height}px`,
    backgroundColor: properties.backgroundColor === 'transparent' ? 'transparent' : properties.backgroundColor,
    borderBottom: properties.borderBottom ? `1px solid ${properties.borderColor}` : 'none'
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
      style={headerStyle}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">
          📄 {properties.contentTemplate}
        </span>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {properties.showOnPages}
        </span>
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const PAGE_HEADER_COMPONENT_TYPE: ComponentType = {
  id: 'page-header',
  name: 'Page Header',
  description: 'Repeating header content for professional reports',
  category: 'Layout',
  icon: 'Header',
  defaultProperties: DEFAULT_PAGE_HEADER_PROPERTIES
};