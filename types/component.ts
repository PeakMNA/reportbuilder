// Component type definitions for the report designer

export interface ComponentType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  defaultProperties?: Record<string, unknown>;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  previewImageUrl?: string;
}

// Re-export PropertyConfig for compatibility
export type { PropertyConfig } from './property-config';