'use client';

import { ComponentType } from '@/types/component';

export interface GroupBannerProperties {
  // Core Properties
  bannerText: string;
  groupByField: string | null;
  autoFitHeight: boolean;
  
  // Style Properties
  backgroundColor: string;
  fontWeight: 'normal' | 'bold';
  showDivider: boolean;
}

export const DEFAULT_GROUP_BANNER_PROPERTIES: GroupBannerProperties = {
  bannerText: 'Group: {groupValue}',
  groupByField: null,
  autoFitHeight: true,
  backgroundColor: '#f8f9fa',
  fontWeight: 'bold',
  showDivider: true
};

interface GroupBannerComponentProps {
  id: string;
  properties: GroupBannerProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<GroupBannerProperties>) => void;
  className?: string;
}

export function GroupBannerComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: GroupBannerComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  const bannerStyle = {
    backgroundColor: properties.backgroundColor,
    fontWeight: properties.fontWeight,
    borderBottom: properties.showDivider ? '1px solid #dee2e6' : 'none'
  };

  const displayText = properties.bannerText.replace('{groupValue}', 
    properties.groupByField ? `Sample ${properties.groupByField}` : 'Sample Group'
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
        ${!properties.groupByField ? 'border-dashed border-orange-300' : ''}
        ${className}
      `}
      style={bannerStyle}
    >
      <div className="flex items-center space-x-2">
        <span className="text-sm">
          🏷️ {displayText}
        </span>
        {properties.groupByField && (
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Grouped by: {properties.groupByField}
          </span>
        )}
        {!properties.groupByField && (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            No grouping field
          </span>
        )}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const GROUP_BANNER_COMPONENT_TYPE: ComponentType = {
  id: 'group-banner',
  name: 'Group Banner',
  description: 'Section header for data groupings',
  category: 'Layout',
  icon: 'Flag',
  defaultProperties: DEFAULT_GROUP_BANNER_PROPERTIES
};