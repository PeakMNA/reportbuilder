'use client';

import { ComponentType } from '@/types/component';
import { useDataBinding } from '../data-binding/data-binding-context';
import { useEffect, useMemo } from 'react';

export interface DataFieldProperties {
  // Data Properties (2)
  dataSource: string | null;
  conditionalFormatting: string; // Simple rule builder for color/style rules
  
  // Format Properties (1)
  formatType: 'text' | 'date' | 'number' | 'currency';
  
  // Style Properties (3)
  fontSize: number;
  color: string;
  autoFit: boolean;
}

export const DEFAULT_DATA_FIELD_PROPERTIES: DataFieldProperties = {
  dataSource: null,
  conditionalFormatting: '',
  formatType: 'text',
  fontSize: 14,
  color: '#000000',
  autoFit: true
};

interface DataFieldComponentProps {
  id: string;
  properties: DataFieldProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<DataFieldProperties>) => void;
  className?: string;
  dataValue?: unknown; // Actual data value from data source
}

export function DataFieldComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = '',
  dataValue
}: DataFieldComponentProps) {
  const { getComponentData, getBinding, dataSources, addBinding, updateBinding } = useDataBinding();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };
  
  // Auto-create or update data binding when dataSource changes
  useEffect(() => {
    if (!properties.dataSource) return;
    
    const [dataSourceId, fieldName] = properties.dataSource.split('.');
    if (!dataSourceId || !fieldName) return;
    
    const existingBinding = getBinding(id);
    const bindingData = {
      componentId: id,
      dataSourceId,
      fieldMappings: { dataSource: fieldName },
      filters: [],
      sorting: []
    };
    
    if (existingBinding) {
      updateBinding(id, bindingData);
    } else {
      addBinding(bindingData);
    }
  }, [id, properties.dataSource, getBinding, addBinding, updateBinding]);
  
  // Get actual data from data binding system
  const actualDataValue = useMemo(() => {
    if (dataValue !== undefined) return dataValue;
    
    if (!properties.dataSource) return null;
    
    const binding = getBinding(id);
    if (!binding) {
      // If no binding yet, try to extract data directly from data source
      const [dataSourceId, fieldName] = properties.dataSource.split('.');
      const dataSource = dataSources.find(ds => ds.id === dataSourceId);
      if (dataSource?.data?.[0]) {
        return dataSource.data[0][fieldName] || null;
      }
      return null;
    }
    
    const data = getComponentData(id);
    if (!data || data.length === 0) return null;
    
    // For data field, we typically show the first row's value
    // In a real report, this would be bound to the current record context
    const fieldMapping = binding.fieldMappings.dataSource;
    return data[0]?.[fieldMapping] || null;
  }, [dataValue, properties.dataSource, id, getBinding, getComponentData, dataSources]);
  
  // Apply conditional formatting
  const getConditionalColor = (value: unknown): string => {
    if (!properties.conditionalFormatting || !properties.conditionalFormatting.trim()) {
      return properties.color;
    }
    
    try {
      // Safe evaluation of conditional formatting expression
      const result = new Function('value', `return ${properties.conditionalFormatting}`)(value);
      return typeof result === 'string' ? result : properties.color;
    } catch {
      // If expression fails, use default color
      return properties.color;
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '[No Data]';
    
    switch (properties.formatType) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(Number(value) || 0);
      
      case 'number':
        return new Intl.NumberFormat('en-US').format(Number(value) || 0);
      
      case 'date':
        try {
          return new Date(value as string | number | Date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch {
          return String(value);
        }
      
      default:
        return String(value);
    }
  };

  const getDisplayValue = () => {
    if (actualDataValue !== null) {
      return formatValue(actualDataValue);
    }
    
    if (!properties.dataSource) {
      return '[No Data Source]';
    }
    
    // Sample data for preview based on format type
    const sampleData = {
      text: 'Sample Text',
      date: new Date().toISOString(),
      number: 1234.56,
      currency: 1234.56
    };
    
    return formatValue(sampleData[properties.formatType]);
  };

  const displayValue = getDisplayValue();
  const conditionalColor = getConditionalColor(actualDataValue);
  
  const textStyle = {
    fontSize: `${properties.fontSize}px`,
    color: conditionalColor,
    width: properties.autoFit ? 'auto' : '100%',
    height: properties.autoFit ? 'auto' : '100%'
  };

  const hasData = actualDataValue !== null && actualDataValue !== undefined;
  const isConnected = properties.dataSource && hasData;
  const hasConditionalFormatting = properties.conditionalFormatting && properties.conditionalFormatting.trim();
  
  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 transition-colors p-2 rounded
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-300'
        }
        ${!properties.dataSource 
          ? 'border-dashed border-orange-300 bg-orange-50' 
          : isConnected 
            ? 'border-solid border-green-200 bg-green-50'
            : 'border-solid border-yellow-200 bg-yellow-50'
        }
        ${className}
      `}
      style={properties.autoFit ? {} : { minWidth: '120px', minHeight: '30px' }}
    >
      <span
        className={`block ${
          !properties.dataSource 
            ? 'text-orange-600' 
            : isConnected 
              ? 'text-gray-900' 
              : 'text-yellow-700'
        }`}
        style={textStyle}
      >
        {displayValue}
      </span>
      
      {/* Status indicators */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {/* Data connection indicator */}
        {properties.dataSource && (
          <div 
            className={`w-3 h-3 rounded-full border border-white ${
              isConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            title={isConnected 
              ? `Connected: ${properties.dataSource}` 
              : `Configured: ${properties.dataSource} (no data)`
            } 
          />
        )}
        
        {/* Conditional formatting indicator */}
        {hasConditionalFormatting && (
          <div 
            className="w-3 h-3 bg-purple-500 rounded-full border border-white"
            title="Conditional formatting enabled" 
          />
        )}
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500 rounded" />
      )}
    </div>
  );
}

export const DATA_FIELD_COMPONENT_TYPE: ComponentType = {
  id: 'data-field',
  name: 'Data Field',
  description: 'Dynamic content from data sources with formatting',
  category: 'Data',
  icon: 'Database',
  defaultProperties: DEFAULT_DATA_FIELD_PROPERTIES as unknown as Record<string, unknown>
};