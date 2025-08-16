// Component type definitions for the report designer

export interface ComponentType {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  defaultProperties: Record<string, any>;
}

// Re-export PropertyConfig for compatibility
export type { PropertyConfig } from './property-config';