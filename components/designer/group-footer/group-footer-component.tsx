'use client';

import { ComponentType } from '@/types/component';

export interface GroupFooterProperties {
  // Core Properties
  summaryType: 'sum' | 'count' | 'average' | 'none';
  groupField: string | null;
  contentTemplate: string;
  
  // Style Properties
  backgroundColor: string;
  showBorder: boolean;
}

export const DEFAULT_GROUP_FOOTER_PROPERTIES: GroupFooterProperties = {
  summaryType: 'sum',
  groupField: null,
  contentTemplate: 'Total: {summary}',
  backgroundColor: '#f1f3f4',
  showBorder: true
};

interface GroupFooterComponentProps {
  id: string;
  properties: GroupFooterProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<GroupFooterProperties>) => void;
  className?: string;
}

export function GroupFooterComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: GroupFooterComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const footerStyle = {
    backgroundColor: properties.backgroundColor,
    border: properties.showBorder ? '1px solid #dee2e6' : 'none'
  };

  const displayText = properties.contentTemplate.replace('{summary}', 
    properties.summaryType !== 'none' ? `Sample ${properties.summaryType}` : ''
  );

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 transition-colors p-3
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-300'
        }
        ${className}
      `}
      style={footerStyle}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">
          🧮 {displayText}
        </span>
        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
          {properties.summaryType} summary
        </span>
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const GROUP_FOOTER_COMPONENT_TYPE: ComponentType = {
  id: 'group-footer',
  name: 'Group Footer',
  description: 'Summary calculations at group end',
  category: 'Data',
  icon: 'Calculator',
  defaultProperties: DEFAULT_GROUP_FOOTER_PROPERTIES as unknown as Record<string, unknown>
};