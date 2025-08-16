'use client';

import { PropertyConfig } from '@/types/property-config';
import { GroupFooterProperties } from './group-footer-component';

export const GROUP_FOOTER_PROPERTY_CONFIG: PropertyConfig<GroupFooterProperties> = {
  groups: [
    {
      title: 'Data',
      defaultExpanded: true,
      properties: [
        {
          key: 'summaryType',
          type: 'select',
          label: 'Summary Type',
          options: [
            { value: 'sum', label: 'Sum' },
            { value: 'count', label: 'Count' },
            { value: 'average', label: 'Average' },
            { value: 'none', label: 'None (Custom)' }
          ],
          description: 'Type of calculation to perform'
        },
        {
          key: 'groupField',
          type: 'select',
          label: 'Group Field',
          options: [], // Linked to group banner
          description: 'Data field being summarized'
        },
        {
          key: 'contentTemplate',
          type: 'text',
          label: 'Footer Text',
          description: 'Footer text with calculation placeholders (use {summary})'
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
          key: 'showBorder',
          type: 'boolean',
          label: 'Show Border',
          description: 'Optional border styling'
        }
      ]
    }
  ]
};