/**
 * Main component exports - Import all report components and their types
 * This serves as the main entry point for the new component architecture
 */

// Re-export all component implementations
export { TextLabelComponent } from '../text-label';
export { DataFieldComponent } from '../data-field';
export { PageHeaderComponent } from '../page-header';
export { PageFooterComponent } from '../page-footer';
export { GroupBannerComponent } from '../group-banner';
export { GroupFooterComponent } from '../group-footer';
export { QrCodeComponent } from '../qr-code';
export { FormulaComponent } from '../formula';
export { LineDividerComponent } from '../line-divider';
export { PageElementComponent } from '../page-element';

// Re-export all property types
export type {
  TextLabelProperties,
  DataFieldProperties,
  PageHeaderProperties,
  PageFooterProperties,
  GroupBannerProperties,
  GroupFooterProperties,
  QrCodeProperties,
  FormulaProperties,
  LineDividerProperties,
  PageElementProperties
} from '../component-registry';

// Re-export registry system
export {
  COMPONENT_TYPES,
  COMPONENT_CATEGORIES,
  getComponentType,
  getPropertyConfig,
  getComponentsByCategory,
  getAllCategories
} from '../component-registry';