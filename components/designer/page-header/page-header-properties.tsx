'use client';

import { PropertyConfig } from '@/types/property-config';
import { PageHeaderProperties } from './page-header-component';

export const PAGE_HEADER_PROPERTY_CONFIG: PropertyConfig<PageHeaderProperties> = {
  groups: [
    {
      title: 'Content',
      defaultExpanded: true,
      properties: [
        {
          key: 'contentTemplate',
          type: 'textarea',
          label: 'Header Content',
          description: 'Header content with merge field support'
        },
        {
          key: 'height',
          type: 'number',
          label: 'Height',
          suffix: 'px',
          min: 20,
          max: 200,
          description: 'Fixed header height'
        },
        {
          key: 'showOnPages',
          type: 'select',
          label: 'Show On Pages',
          options: [
            { value: 'all', label: 'All Pages' },
            { value: 'first', label: 'First Page Only' },
            { value: 'last', label: 'Last Page Only' },
            { value: 'except-first', label: 'All Except First' }
          ],
          description: 'Which pages to display header'
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      properties: [
        {
          key: 'backgroundColor',
          type: 'color',
          label: 'Background Color',
          description: 'Header background color'
        },
        {
          key: 'borderBottom',
          type: 'boolean',
          label: 'Show Bottom Border',
          description: 'Optional border below header'
        },
        {
          key: 'borderColor',
          type: 'color',
          label: 'Border Color',
          description: 'Color of the bottom border'
        }
      ]
    }
  ]
};