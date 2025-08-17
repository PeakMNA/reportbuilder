'use client';

import { ComponentType } from '@/types/component';

export interface PageFooterProperties {
  // Core Properties
  contentTemplate: string;
  height: number;
  showOnPages: 'all' | 'first' | 'last' | 'except-last';
  
  // Style Properties
  backgroundColor: string;
  borderTop: boolean;
  borderColor: string;
}

export const DEFAULT_PAGE_FOOTER_PROPERTIES: PageFooterProperties = {
  contentTemplate: 'Page {page} of {totalPages}',
  height: 40,
  showOnPages: 'all',
  backgroundColor: 'transparent',
  borderTop: false,
  borderColor: '#e5e7eb'
};

interface PageFooterComponentProps {
  id: string;
  properties: PageFooterProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<PageFooterProperties>) => void;
  className?: string;
}

export function PageFooterComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: PageFooterComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const footerStyle = {
    height: `${properties.height}px`,
    backgroundColor: properties.backgroundColor === 'transparent' ? 'transparent' : properties.backgroundColor,
    borderTop: properties.borderTop ? `1px solid ${properties.borderColor}` : 'none'
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
      style={footerStyle}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-700">
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

export const PAGE_FOOTER_COMPONENT_TYPE: ComponentType = {
  id: 'page-footer',
  name: 'Page Footer',
  description: 'Repeating footer content with page numbers and metadata',
  category: 'Layout',
  icon: 'Footer',
  defaultProperties: DEFAULT_PAGE_FOOTER_PROPERTIES as unknown as Record<string, unknown>
};