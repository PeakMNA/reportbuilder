'use client';

import { PropertyConfig } from '@/types/property-config';
import { GroupBannerProperties } from './group-banner-component';

export const GROUP_BANNER_PROPERTY_CONFIG: PropertyConfig<GroupBannerProperties> = {
  groups: [
    {
      title: 'Content',
      defaultExpanded: true,
      properties: [
        {
          key: 'bannerText',
          type: 'text',
          label: 'Banner Text',
          description: 'Template for banner text with merge fields (use {groupValue})'
        },
        {
          key: 'groupByField',
          type: 'select',
          label: 'Group By Field',
          options: [], // Will be populated from available data fields
          description: 'Data field that triggers grouping'
        },
        {
          key: 'autoFitHeight',
          type: 'boolean',
          label: 'Auto-fit Height',
          description: 'Auto-resize to fit content'
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
          description: 'Banner background color'
        },
        {
          key: 'fontWeight',
          type: 'select',
          label: 'Font Weight',
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'bold', label: 'Bold' }
          ],
          description: 'Text weight for emphasis'
        },
        {
          key: 'showDivider',
          type: 'boolean',
          label: 'Show Divider',
          description: 'Visual separator line below banner'
        }
      ]
    }
  ]
};