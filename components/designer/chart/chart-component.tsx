/**
 * Chart Component - Data visualization with simplified configuration
 * Part of Phase 2 Migration - Legacy to Lean Architecture
 * 
 * Migrated from legacy system to PropertyConfig framework
 * Property count optimized from 5+ to 7 essential properties following 80/20 rule
 */

import { ComponentType } from '@/types/component';
import { BarChart3 } from 'lucide-react';

export interface ChartProperties {
  chartType: 'bar' | 'line' | 'pie';
  dataSource: string | null;
  title: string;
  width: number;
  height: number;
  colorScheme: string;
  xField: string | null;
}

export const CHART_COMPONENT_TYPE: ComponentType = {
  id: 'chart',
  name: 'Chart',
  category: 'Data',
  description: 'Data visualization charts with customizable appearance',
  icon: 'BarChart3',
  defaultProperties: {
    chartType: 'bar',
    title: 'Chart Title',
    colorScheme: '#3b82f6',
    dataSource: null,
    xField: null,
    width: 300,
    height: 200
  },
  defaultWidth: 300,
  defaultHeight: 200,
  minWidth: 200,
  minHeight: 150,
  maxWidth: 600,
  maxHeight: 400,
  previewImageUrl: '/previews/chart-preview.png'
};

export function ChartComponent({ 
  properties,
  width,
  height,
  selected,
  onClick 
}: {
  properties: ChartProperties;
  width: number;
  height: number;
  selected?: boolean;
  onClick?: () => void;
}) {
  const { chartType, title, colorScheme } = properties;

  return (
    <div 
      className={`
        h-full flex flex-col items-center justify-center p-2 border-2 border-dashed
        ${selected ? 'border-primary' : 'border-muted-foreground/30'}
      `}
      onClick={onClick}
    >
      <BarChart3 className="h-8 w-8 text-muted-foreground mb-2" />
      <span className="text-sm text-muted-foreground mb-2">
        {chartType?.toUpperCase() || 'BAR'} Chart
      </span>
      {title && (
        <span className="text-xs font-medium mb-2">{title}</span>
      )}
      
      {/* Chart Preview */}
      <div className="flex items-end space-x-1 mt-2">
        {[40, 60, 30, 80, 50].map((height, i) => (
          <div
            key={i}
            className="w-3"
            style={{ 
              height: `${height * 0.4}px`,
              backgroundColor: colorScheme || '#3b82f6'
            }}
          />
        ))}
      </div>
    </div>
  );
}