/**
 * Enhanced Component Registry - Central registration system for all report components
 * Now powered by PropertyConfigRegistry with validation and optimization
 */

import { ComponentType, PropertyConfig } from '@/types/component';
import { propertyConfigRegistry } from '@/lib/property-config-registry';
import { ValidationResult } from '@/types/property-config';

// Import all components and their configurations
import { 
  TEXT_LABEL_COMPONENT_TYPE, 
  TEXT_LABEL_PROPERTY_CONFIG,
  type TextLabelProperties 
} from './text-label';

import { 
  DATA_FIELD_COMPONENT_TYPE, 
  DATA_FIELD_PROPERTY_CONFIG,
  type DataFieldProperties 
} from './data-field';

import { 
  PAGE_HEADER_COMPONENT_TYPE, 
  PAGE_HEADER_PROPERTY_CONFIG,
  type PageHeaderProperties 
} from './page-header';

import { 
  PAGE_FOOTER_COMPONENT_TYPE, 
  PAGE_FOOTER_PROPERTY_CONFIG,
  type PageFooterProperties 
} from './page-footer';

import { 
  GROUP_BANNER_COMPONENT_TYPE, 
  GROUP_BANNER_PROPERTY_CONFIG,
  type GroupBannerProperties 
} from './group-banner';

import { 
  GROUP_FOOTER_COMPONENT_TYPE, 
  GROUP_FOOTER_PROPERTY_CONFIG,
  type GroupFooterProperties 
} from './group-footer';

import { 
  QR_CODE_COMPONENT_TYPE, 
  QR_CODE_PROPERTY_CONFIG,
  type QrCodeProperties 
} from './qr-code';

import { 
  TABLE_COMPONENT_TYPE, 
  TABLE_PROPERTY_CONFIG,
  type TableProperties 
} from './table';

import { 
  FORMULA_COMPONENT_TYPE, 
  FORMULA_PROPERTY_CONFIG,
  type FormulaProperties 
} from './formula';

import { 
  LINE_DIVIDER_COMPONENT_TYPE, 
  LINE_DIVIDER_PROPERTY_CONFIG,
  type LineDividerProperties 
} from './line-divider';

import { 
  PAGE_ELEMENT_COMPONENT_TYPE, 
  PAGE_ELEMENT_PROPERTY_CONFIG,
  type PageElementProperties 
} from './page-element';

// Phase 2 Migration: New Lean Architecture Components
import { 
  IMAGE_COMPONENT_TYPE, 
  IMAGE_PROPERTY_CONFIG,
  type ImageProperties 
} from './image';

import { 
  CHART_COMPONENT_TYPE, 
  CHART_PROPERTY_CONFIG,
  type ChartProperties 
} from './chart';

import { 
  HEADING_COMPONENT_TYPE, 
  HEADING_PROPERTY_CONFIG,
  type HeadingProperties 
} from './heading';

import { 
  RECTANGLE_COMPONENT_TYPE, 
  RECTANGLE_PROPERTY_CONFIG,
  type RectangleProperties 
} from './rectangle';

import { 
  CIRCLE_COMPONENT_TYPE, 
  CIRCLE_PROPERTY_CONFIG,
  type CircleProperties 
} from './circle';

// Registry of all available component types
export const COMPONENT_TYPES: ComponentType[] = [
  // Phase 1: Core Components (Priority)
  TEXT_LABEL_COMPONENT_TYPE,
  DATA_FIELD_COMPONENT_TYPE,
  TABLE_COMPONENT_TYPE,
  
  // Phase 2: Page Layout Components
  PAGE_HEADER_COMPONENT_TYPE,
  PAGE_FOOTER_COMPONENT_TYPE,
  LINE_DIVIDER_COMPONENT_TYPE,
  
  // Phase 2 Migration: Lean Architecture Components
  IMAGE_COMPONENT_TYPE,
  CHART_COMPONENT_TYPE,
  HEADING_COMPONENT_TYPE,
  RECTANGLE_COMPONENT_TYPE,
  CIRCLE_COMPONENT_TYPE,
  
  // Phase 3: Advanced Components
  GROUP_BANNER_COMPONENT_TYPE,
  GROUP_FOOTER_COMPONENT_TYPE,
  QR_CODE_COMPONENT_TYPE,
  FORMULA_COMPONENT_TYPE,
  
  // Phase 4: Page Elements
  PAGE_ELEMENT_COMPONENT_TYPE
];

// Component categories for palette organization
export const COMPONENT_CATEGORIES = {
  Text: ['text-label', 'heading'],
  Data: ['data-field', 'table', 'chart', 'group-footer', 'formula'],
  Layout: ['page-header', 'page-footer', 'group-banner', 'line-divider', 'page-element'],
  Media: ['image', 'qr-code'],
  Shapes: ['rectangle', 'circle']
} as const;

/**
 * Initialize the Enhanced Property Registry
 * Registers all component property configurations with validation
 */
function initializePropertyRegistry(): void {
  console.log('🚀 Initializing Enhanced Property Configuration Registry...');

  // Bulk register all property configurations with their categories
  propertyConfigRegistry.bulkRegister([
    // Core Components (Text Category)
    { 
      id: 'text-label', 
      config: TEXT_LABEL_PROPERTY_CONFIG,
      category: 'Text'
    },
    
    // Data Components
    { 
      id: 'data-field', 
      config: DATA_FIELD_PROPERTY_CONFIG,
      category: 'Data'
    },
    { 
      id: 'table', 
      config: TABLE_PROPERTY_CONFIG,
      category: 'Data'
    },
    { 
      id: 'formula', 
      config: FORMULA_PROPERTY_CONFIG,
      category: 'Data'
    },
    { 
      id: 'group-footer', 
      config: GROUP_FOOTER_PROPERTY_CONFIG,
      category: 'Data'
    },
    
    // Layout Components
    { 
      id: 'page-header', 
      config: PAGE_HEADER_PROPERTY_CONFIG,
      category: 'Layout'
    },
    { 
      id: 'page-footer', 
      config: PAGE_FOOTER_PROPERTY_CONFIG,
      category: 'Layout'
    },
    { 
      id: 'group-banner', 
      config: GROUP_BANNER_PROPERTY_CONFIG,
      category: 'Layout'
    },
    { 
      id: 'line-divider', 
      config: LINE_DIVIDER_PROPERTY_CONFIG,
      category: 'Layout'
    },
    { 
      id: 'page-element', 
      config: PAGE_ELEMENT_PROPERTY_CONFIG,
      category: 'Layout'
    },
    
    // Phase 2 Migration: Lean Architecture Components
    { 
      id: 'image', 
      config: IMAGE_PROPERTY_CONFIG,
      category: 'Media'
    },
    { 
      id: 'chart', 
      config: CHART_PROPERTY_CONFIG,
      category: 'Data'
    },
    { 
      id: 'heading', 
      config: HEADING_PROPERTY_CONFIG,
      category: 'Text'
    },
    { 
      id: 'rectangle', 
      config: RECTANGLE_PROPERTY_CONFIG,
      category: 'Shapes'
    },
    { 
      id: 'circle', 
      config: CIRCLE_PROPERTY_CONFIG,
      category: 'Shapes'
    },
    
    // Media Components
    { 
      id: 'qr-code', 
      config: QR_CODE_PROPERTY_CONFIG,
      category: 'Media'
    }
  ]);

  // Check for optimization opportunities
  const optimizationNeeded = propertyConfigRegistry.getComponentsNeedingOptimization();
  if (optimizationNeeded.length > 0) {
    console.warn('⚡ Components needing property optimization:');
    optimizationNeeded.forEach(({ componentId, issueType, recommendation }) => {
      console.warn(`  - ${componentId} (${issueType}): ${recommendation}`);
    });
  }
}

// Initialize the registry immediately
initializePropertyRegistry();

// Enhanced helper functions powered by the new registry
export const getComponentType = (componentId: string): ComponentType | undefined => {
  return COMPONENT_TYPES.find(type => type.id === componentId);
};

/**
 * Get property configuration with enhanced validation and error handling
 */
export const getPropertyConfig = (componentId: string): PropertyConfig | undefined => {
  const config = propertyConfigRegistry.getConfig(componentId);
  
  if (!config) {
    console.warn(`⚠️ Property config not found for component: ${componentId}`);
    return undefined;
  }

  return config;
};

/**
 * Get default property values for a component
 */
export const getDefaultProperties = (componentId: string): Record<string, unknown> => {
  return propertyConfigRegistry.getDefaultValues(componentId);
};

/**
 * Validate component properties using the enhanced validation system
 */
export const validateComponentProperties = (componentId: string, values: Record<string, unknown>): ValidationResult => {
  return propertyConfigRegistry.validateComponent(componentId, values);
};

/**
 * Get components by category using the registry
 */
export const getComponentsByCategory = (category: string): ComponentType[] => {
  const categoryIds = COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES] || [];
  return categoryIds.map(id => getComponentType(id)).filter(Boolean) as ComponentType[];
};

/**
 * Get all available categories
 */
export const getAllCategories = (): string[] => {
  return Object.keys(COMPONENT_CATEGORIES);
};

/**
 * Get registry statistics for dashboard/debugging
 */
export const getRegistryStatistics = () => {
  return propertyConfigRegistry.getRegistryStats();
};

/**
 * Development helper: Log current registry state
 */
export const logRegistryState = () => {
  if (process.env.NODE_ENV === 'development') {
    propertyConfigRegistry.logRegistryStats();
    
    const stats = getRegistryStatistics();
    console.log('📈 Component Framework Health Check:', {
      componentsInCompliance: stats.totalComponents - stats.componentsWithValidationIssues.length,
      averagePropertiesPerComponent: stats.averagePropertiesPerComponent,
      recommendedRange: '3-7 properties per component (80/20 rule)'
    });
  }
};

// Development logging
if (process.env.NODE_ENV === 'development') {
  // Delay logging to ensure all initialization is complete
  setTimeout(logRegistryState, 100);
}

// Export the registry for external access
export { propertyConfigRegistry };

// Type exports for use in other parts of the application
export type {
  TextLabelProperties,
  DataFieldProperties,
  TableProperties,
  PageHeaderProperties,
  PageFooterProperties,
  GroupBannerProperties,
  GroupFooterProperties,
  QrCodeProperties,
  FormulaProperties,
  LineDividerProperties,
  PageElementProperties
};