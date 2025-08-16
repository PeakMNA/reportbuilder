'use client';

import { ComponentType } from '@/types/component';

/**
 * Table Component Properties - Lean Architecture (6 properties total)
 * Following brainstorming specification: 3 Core + 3 Style properties
 */
export interface TableProperties {
  // Core Properties (3)
  rows: number;              // Default: 5, range: 1-20
  showHeader: boolean;       // Default: true
  columns: string[];         // Default: ['Column 1', 'Column 2', 'Column 3']

  // Style Properties (3)
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';  // Default: 'solid'
  backgroundColor: string;                                // Default: '#ffffff'
  headerBackgroundColor: string;                         // Default: '#f8f9fa'
}

export const TABLE_COMPONENT_TYPE: ComponentType = {
  id: 'table',
  name: 'Table',
  description: 'Tabular data display with customizable rows and columns',
  icon: 'Table',
  category: 'Data',
  version: '2.0.0',
  popular: true
};