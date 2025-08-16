'use client';

import { PropertyConfig } from '@/types/property-config';
import { PageFooterProperties } from './page-footer-component';

export const PAGE_FOOTER_PROPERTY_CONFIG: PropertyConfig<PageFooterProperties> = {
  groups: [
    {
      title: 'Content',
      defaultExpanded: true,
      properties: [
        {
          key: 'contentTemplate',
          type: 'textarea',
          label: 'Footer Content',
          description: 'Footer content with merge field support (use {page}, {totalPages}, {date})'
        },
        {
          key: 'height',
          type: 'number',
          label: 'Height',
          suffix: 'px',
          min: 20,
          max: 120,
          description: 'Fixed footer height'
        },
        {
          key: 'showOnPages',
          type: 'select',
          label: 'Show On Pages',
          options: [
            { value: 'all', label: 'All Pages' },
            { value: 'first', label: 'First Page Only' },
            { value: 'last', label: 'Last Page Only' },
            { value: 'except-last', label: 'All Except Last' }
          ],
          description: 'Which pages to display footer'
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
          description: 'Footer background color'
        },
        {
          key: 'borderTop',
          type: 'boolean',
          label: 'Show Top Border',
          description: 'Optional border above footer'
        },
        {
          key: 'borderColor',
          type: 'color',
          label: 'Border Color',
          description: 'Color of the top border'
        }
      ]
    }
  ]
};