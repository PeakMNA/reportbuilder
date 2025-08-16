'use client';

import { PropertyConfig } from '@/types/property-config';
import { LineDividerProperties } from './line-divider-component';

export const LINE_DIVIDER_PROPERTY_CONFIG: PropertyConfig<LineDividerProperties> = {
  groups: [
    {
      title: 'Layout',
      defaultExpanded: true,
      properties: [
        {
          key: 'orientation',
          type: 'select',
          label: 'Orientation',
          options: [
            { value: 'horizontal', label: 'Horizontal' },
            { value: 'vertical', label: 'Vertical' }
          ],
          description: 'Line direction'
        },
        {
          key: 'length',
          type: 'text',
          label: 'Length',
          description: 'Line length (number in px or "100%" for full width/height)'
        },
        {
          key: 'thickness',
          type: 'number',
          label: 'Thickness',
          suffix: 'px',
          min: 1,
          max: 20,
          description: 'Line width in pixels'
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      properties: [
        {
          key: 'lineStyle',
          type: 'select',
          label: 'Line Style',
          options: [
            { value: 'solid', label: 'Solid' },
            { value: 'dashed', label: 'Dashed' },
            { value: 'dotted', label: 'Dotted' }
          ],
          description: 'Line pattern appearance'
        },
        {
          key: 'color',
          type: 'color',
          label: 'Line Color',
          description: 'Line color'
        }
      ]
    }
  ]
};