'use client';

import { ComponentType } from '@/types/component';
import { useEffect, useRef, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';
import { useDataBinding } from '../data-binding/data-binding-context';

export interface QrCodeProperties {
  // Content Properties (3)
  data: string;
  size: number;
  errorCorrection: 'Low' | 'Medium' | 'High';
  
  // Style Properties (2)
  foregroundColor: string;
  backgroundColor: string;
  
  // Data Binding (optional)
  dataSource?: string | null;
}

export const DEFAULT_QR_CODE_PROPERTIES: QrCodeProperties = {
  data: 'https://example.com',
  size: 100,
  errorCorrection: 'Medium',
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  dataSource: null
};

// Helper function to detect QR code data format for better user experience
const detectQrDataFormat = (data: string): string => {
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return 'url';
  }
  if (data.startsWith('mailto:')) {
    return 'email';
  }
  if (data.startsWith('tel:')) {
    return 'phone';
  }
  if (data.startsWith('WIFI:')) {
    return 'wifi';
  }
  if (data.startsWith('BEGIN:VCARD')) {
    return 'vcard';
  }
  if (data.startsWith('geo:')) {
    return 'location';
  }
  return 'text';
};

interface QrCodeComponentProps {
  id: string;
  properties: QrCodeProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<QrCodeProperties>) => void;
  className?: string;
}

export function QrCodeComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate: _onUpdate,
  className = ''
}: QrCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      fieldMappings: { data: fieldName },
      filters: [],
      sorting: []
    };
    
    if (existingBinding) {
      updateBinding(id, bindingData);
    } else {
      addBinding(bindingData);
    }
  }, [id, properties.dataSource, getBinding, addBinding, updateBinding]);

  // Get actual data from data binding system or use static data
  const actualQrData = useMemo(() => {
    if (properties.dataSource) {
      const binding = getBinding(id);
      if (!binding) {
        // If no binding yet, try to extract data directly from data source
        const [dataSourceId, fieldName] = properties.dataSource.split('.');
        const dataSource = dataSources.find(ds => ds.id === dataSourceId);
        if (dataSource?.data?.[0]) {
          return String(dataSource.data[0][fieldName] || properties.data);
        }
        return properties.data;
      }
      
      const data = getComponentData(id);
      if (data && data.length > 0) {
        const fieldMapping = binding.fieldMappings.data;
        return String(data[0]?.[fieldMapping] || properties.data);
      }
    }
    return properties.data;
  }, [properties.data, properties.dataSource, id, getBinding, getComponentData, dataSources]);

  const generateQRCode = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Map error correction levels to qrcode library values
      const errorCorrectionLevels = {
        'Low': 'L' as const,
        'Medium': 'M' as const,
        'High': 'H' as const
      };

      // Configure QR code options
      const options = {
        errorCorrectionLevel: errorCorrectionLevels[properties.errorCorrection],
        type: 'image/png' as const,
        width: properties.size,
        height: properties.size,
        color: {
          dark: properties.foregroundColor,
          light: properties.backgroundColor
        },
        margin: 1,
        scale: 1
      };

      // Validate data length (QR codes have limits based on error correction)
      const maxDataLength = getMaxDataLength(properties.errorCorrection);
      if (actualQrData.length > maxDataLength) {
        // Show truncated data warning
        console.warn(`QR code data truncated: ${actualQrData.length} characters exceeds limit of ${maxDataLength}`);
      }

      // Generate QR code to canvas
      await QRCode.toCanvas(canvas, actualQrData, options);
      
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      // Show error indicator on canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = properties.backgroundColor;
        ctx.fillRect(0, 0, properties.size, properties.size);
        ctx.fillStyle = properties.foregroundColor;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('QR Error', properties.size / 2, properties.size / 2);
      }
    }
  }, [actualQrData, properties.size, properties.errorCorrection, properties.foregroundColor, properties.backgroundColor]);

  const getMaxDataLength = (errorCorrection: string): number => {
    // Approximate character limits for different error correction levels
    switch (errorCorrection) {
      case 'Low': return 2953; // ~7% recovery
      case 'Medium': return 2331; // ~15% recovery  
      case 'High': return 1663; // ~25% recovery
      default: return 2331;
    }
  };

  // Generate QR code when properties or data change
  useEffect(() => {
    if (canvasRef.current) {
      generateQRCode();
    }
  }, [actualQrData, properties.size, properties.errorCorrection, properties.foregroundColor, properties.backgroundColor, generateQRCode]);

  // Status indicators
  const hasDataBinding = properties.dataSource;
  const binding = getBinding(id);
  const isDataConnected = hasDataBinding && binding && getComponentData(id)?.length > 0;
  const qrDataFormat = detectQrDataFormat(actualQrData);

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 transition-colors flex items-center justify-center
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-transparent hover:border-gray-300'
        }
        ${hasDataBinding 
          ? isDataConnected 
            ? 'border-solid border-green-200 bg-green-50'
            : 'border-solid border-yellow-200 bg-yellow-50'
          : 'border-solid border-gray-200'
        }
        ${className}
      `}
      style={{
        width: `${properties.size}px`,
        height: `${properties.size}px`,
        backgroundColor: properties.backgroundColor
      }}
    >
      {/* QR Code Canvas */}
      <canvas
        ref={canvasRef}
        width={properties.size}
        height={properties.size}
        className="block"
        style={{
          width: `${properties.size}px`,
          height: `${properties.size}px`,
        }}
      />
      
      {/* Status indicators */}
      <div className="absolute -top-1 -right-1 flex gap-1">
        {/* Error correction indicator */}
        <div className="text-xs bg-green-500 text-white px-1 rounded">
          {properties.errorCorrection[0]}
        </div>
        
        {/* Data binding indicator */}
        {hasDataBinding && (
          <div 
            className={`w-3 h-3 rounded-full border border-white ${
              isDataConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            title={isDataConnected 
              ? `Connected: ${properties.dataSource}` 
              : `Configured: ${properties.dataSource} (no data)`
            } 
          />
        )}
        
        {/* Format indicator */}
        {qrDataFormat !== 'text' && (
          <div 
            className="text-xs bg-purple-500 text-white px-1 rounded"
            title={`QR Format: ${qrDataFormat}`}
          >
            {qrDataFormat.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Data length indicator for large content */}
      {actualQrData.length > 100 && (
        <div className="absolute -bottom-1 -left-1 text-xs bg-blue-500 text-white px-1 rounded">
          {actualQrData.length}
        </div>
      )}
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
    </div>
  );
}

export const QR_CODE_COMPONENT_TYPE: ComponentType = {
  id: 'qr-code',
  name: 'QR Code',
  description: 'Generate QR codes for URLs and data',
  category: 'Media',
  icon: 'QrCode',
  defaultProperties: DEFAULT_QR_CODE_PROPERTIES
};