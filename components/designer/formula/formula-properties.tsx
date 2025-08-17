'use client';

import { PropertyConfig } from '@/types/property-config';
import { FormulaProperties } from './formula-component';

export const FORMULA_PROPERTY_CONFIG: PropertyConfig<FormulaProperties> = {
  groups: [
    {
      title: 'Formula',
      defaultExpanded: true,
      properties: [
        {
          key: 'expression',
          type: 'textarea',
          label: 'Expression',
          description: 'Mathematical/logical formula to calculate'
        },
        {
          key: 'updateFrequency',
          type: 'select',
          label: 'Update Frequency',
          options: [
            { value: 'on-data-change', label: 'On Data Change' },
            { value: 'manual', label: 'Manual' }
          ],
          description: 'When to recalculate formula'
        }
      ]
    },
    {
      title: 'Format',
      defaultExpanded: false,
      properties: [
        {
          key: 'formatOutput',
          type: 'select',
          label: 'Format Output',
          options: [
            { value: 'text', label: 'Text' },
            { value: 'number', label: 'Number' },
            { value: 'currency', label: 'Currency' },
            { value: 'date', label: 'Date' }
          ],
          description: 'How to display the calculated result'
        }
      ]
    },
    {
      title: 'Style',
      defaultExpanded: false,
      properties: [
        {
          key: 'autoFit',
          type: 'boolean',
          label: 'Auto-fit Size',
          description: 'Auto-resize to fit calculated content'
        },
        {
          key: 'fontSize',
          type: 'number',
          label: 'Font Size',
          suffix: 'px',
          min: 8,
          max: 72,
          description: 'Text size for displaying result'
        },
        {
          key: 'color',
          type: 'color',
          label: 'Text Color',
          description: 'Text color for result'
        }
      ]
    }
  ]
};