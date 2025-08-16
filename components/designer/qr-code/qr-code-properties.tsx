'use client';

import { PropertyConfig } from '@/types/property-config';
import { QrCodeProperties } from './qr-code-component';

export const QR_CODE_PROPERTY_CONFIG: PropertyConfig<QrCodeProperties> = {
  groups: [
    {
      title: 'Content',
      defaultExpanded: true,
      properties: [
        {
          key: 'data',
          type: 'text',
          label: 'Data/URL',
          description: 'Content to encode in QR code (URL, text, vCard, WiFi config, or bind to data field)',
          placeholder: 'https://example.com or bind to data field',
          validation: {
            maxLength: 2953,
            pattern: undefined // Accept any content for flexible QR code usage
          }
        },
        {
          key: 'size',
          type: 'number',
          label: 'Size',
          suffix: 'px',
          min: 50,
          max: 300,
          step: 5,
          description: 'QR code dimensions in pixels (50-300px)',
          validation: {
            min: 50,
            max: 300
          }
        },
        {
          key: 'errorCorrection',
          type: 'select',
          label: 'Error Correction',
          options: [
            { value: 'Low', label: 'Low (~7% recovery)' },
            { value: 'Medium', label: 'Medium (~15% recovery)' },
            { value: 'High', label: 'High (~25% recovery)' }
          ],
          description: 'Error correction level - higher levels allow better readability when damaged but reduce data capacity',
          helpText: 'Medium recommended for most uses. High for outdoor/print applications.'
        },
        {
          key: 'dataSource',
          type: 'text',
          label: 'Data Source (Optional)',
          description: 'Bind to data field for dynamic QR codes (e.g., csv1.product_url)',
          placeholder: 'csv1.field_name',
          validation: {
            pattern: '^[a-zA-Z0-9_]+\\.[a-zA-Z0-9_]+$|^$'
          },
          helpText: 'Format: dataSourceId.fieldName (leave empty for static content)'
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      properties: [
        {
          key: 'foregroundColor',
          type: 'color',
          label: 'Foreground Color',
          description: 'QR code pattern color (typically black)',
          validation: {
            format: 'hex'
          }
        },
        {
          key: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          description: 'QR code background color (typically white)',
          validation: {
            format: 'hex'
          }
        }
      ]
    }
  ],
  dataBinding: {
    supportedProperties: ['data'],
    examples: [
      {
        property: 'data',
        description: 'Bind to data field for dynamic QR codes',
        example: 'product_url, customer_portal_link, tracking_number'
      }
    ]
  }
};