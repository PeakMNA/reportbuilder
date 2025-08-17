/**
 * PropertyConfigRegistry - Central registry for managing component property configurations
 * Provides fast lookups, validation, and extension capabilities for all components
 */

import { PropertyConfig, ValidationResult } from '@/types/property-config';
import { propertyValidator } from './property-validator';

export interface ComponentRegistryEntry {
  id: string;
  config: PropertyConfig;
  metadata: {
    version: string;
    lastUpdated: Date;
    category: string;
    description?: string;
    priority: number;
  };
}

export class PropertyConfigRegistry {
  private static instance: PropertyConfigRegistry;
  private registry = new Map<string, ComponentRegistryEntry>();
  private categoryIndex = new Map<string, string[]>();

  // Singleton pattern for centralized registry
  public static getInstance(): PropertyConfigRegistry {
    if (!PropertyConfigRegistry.instance) {
      PropertyConfigRegistry.instance = new PropertyConfigRegistry();
    }
    return PropertyConfigRegistry.instance;
  }

  /**
   * Register a component's property configuration
   */
  register(componentId: string, config: PropertyConfig, metadata?: Partial<ComponentRegistryEntry['metadata']>): void {
    // Validate the configuration before registration
    const validation = propertyValidator.validatePropertyCount(config);
    
    if (!validation.valid) {
      console.warn(`Component ${componentId} property configuration has validation issues:`, validation.errors);
      
      // Show recommendations for property count
      const recommendation = propertyValidator.getPropertyCountRecommendation(componentId);
      console.warn(`Recommendation for ${componentId}:`, recommendation);
    }

    const entry: ComponentRegistryEntry = {
      id: componentId,
      config,
      metadata: {
        version: metadata?.version || '1.0.0',
        lastUpdated: new Date(),
        category: metadata?.category || 'general',
        description: metadata?.description || config.metadata?.description,
        priority: metadata?.priority || config.metadata?.priority || 0
      }
    };

    this.registry.set(componentId, entry);
    this.updateCategoryIndex(componentId, entry.metadata.category);

    console.log(`✅ Registered component: ${componentId} (${entry.metadata.category})`);
  }

  /**
   * Get property configuration for a component
   */
  getConfig(componentId: string): PropertyConfig | undefined {
    const entry = this.registry.get(componentId);
    return entry?.config;
  }

  /**
   * Get full registry entry for a component
   */
  getEntry(componentId: string): ComponentRegistryEntry | undefined {
    return this.registry.get(componentId);
  }

  /**
   * Get all registered component IDs
   */
  getRegisteredComponents(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: string): ComponentRegistryEntry[] {
    const componentIds = this.categoryIndex.get(category) || [];
    return componentIds
      .map(id => this.registry.get(id))
      .filter(entry => entry !== undefined) as ComponentRegistryEntry[];
  }

  /**
   * Get all available categories
   */
  getCategories(): string[] {
    return Array.from(this.categoryIndex.keys()).sort();
  }

  /**
   * Validate a component's current property values
   */
  validateComponent(componentId: string, values: Record<string, unknown>): ValidationResult {
    const config = this.getConfig(componentId);
    
    if (!config) {
      return {
        valid: false,
        errors: [{
          message: `Component "${componentId}" is not registered in the property config registry`,
          severity: 'error'
        }]
      };
    }

    return propertyValidator.validateComplete(config, values);
  }

  /**
   * Get default property values for a component
   */
  getDefaultValues(componentId: string): Record<string, unknown> {
    const config = this.getConfig(componentId);
    
    if (!config) {
      console.warn(`No config found for component: ${componentId}`);
      return {};
    }

    return propertyValidator.getDefaultValues(config);
  }

  /**
   * Update category index when components are registered
   */
  private updateCategoryIndex(componentId: string, category: string): void {
    // Remove from old category if it exists
    for (const [cat, ids] of this.categoryIndex.entries()) {
      const index = ids.indexOf(componentId);
      if (index > -1) {
        ids.splice(index, 1);
        if (ids.length === 0) {
          this.categoryIndex.delete(cat);
        }
      }
    }

    // Add to new category
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, []);
    }
    this.categoryIndex.get(category)!.push(componentId);
  }

  /**
   * Bulk register components from existing registry
   */
  bulkRegister(components: Array<{ id: string; config: PropertyConfig; category?: string }>): void {
    console.log(`🔄 Bulk registering ${components.length} components...`);
    
    for (const { id, config, category } of components) {
      this.register(id, config, { category });
    }
    
    console.log(`✅ Successfully registered ${components.length} components`);
    this.logRegistryStats();
  }

  /**
   * Get registry statistics
   */
  getRegistryStats(): {
    totalComponents: number;
    categoryCounts: Record<string, number>;
    averagePropertiesPerComponent: number;
    componentsWithValidationIssues: string[];
  } {
    const stats = {
      totalComponents: this.registry.size,
      categoryCounts: {} as Record<string, number>,
      averagePropertiesPerComponent: 0,
      componentsWithValidationIssues: [] as string[]
    };

    let totalProperties = 0;

    // Calculate category counts and property statistics
    for (const [category, ids] of this.categoryIndex.entries()) {
      stats.categoryCounts[category] = ids.length;
    }

    // Calculate average properties and find validation issues
    for (const [componentId, entry] of this.registry.entries()) {
      const propertyCount = entry.config.groups.flatMap(g => g.properties).length;
      totalProperties += propertyCount;

      // Check for validation issues (outside 3-7 range)
      if (propertyCount < 3 || propertyCount > 7) {
        stats.componentsWithValidationIssues.push(componentId);
      }
    }

    if (this.registry.size > 0) {
      stats.averagePropertiesPerComponent = Math.round(totalProperties / this.registry.size * 100) / 100;
    }

    return stats;
  }

  /**
   * Log registry statistics for debugging
   */
  logRegistryStats(): void {
    const stats = this.getRegistryStats();
    console.log('📊 Property Config Registry Statistics:', {
      totalComponents: stats.totalComponents,
      categories: stats.categoryCounts,
      averageProperties: stats.averagePropertiesPerComponent,
      validationIssues: stats.componentsWithValidationIssues
    });

    // Warn about components with validation issues
    if (stats.componentsWithValidationIssues.length > 0) {
      console.warn('⚠️ Components with property count issues (should be 3-7):', 
        stats.componentsWithValidationIssues);
    }
  }

  /**
   * Find components that need property optimization
   */
  getComponentsNeedingOptimization(): Array<{ componentId: string; issueType: string; recommendation: string }> {
    const issues: Array<{ componentId: string; issueType: string; recommendation: string }> = [];

    for (const [componentId, entry] of this.registry.entries()) {
      const propertyCount = entry.config.groups.flatMap(g => g.properties).length;
      const recommendation = propertyValidator.getPropertyCountRecommendation(componentId);

      if (propertyCount < 3) {
        issues.push({
          componentId,
          issueType: 'too-few-properties',
          recommendation: `Add ${3 - propertyCount} more essential properties. ${recommendation.reasoning}`
        });
      } else if (propertyCount > recommendation.max) {
        issues.push({
          componentId,
          issueType: 'too-many-properties', 
          recommendation: `Reduce ${propertyCount - recommendation.max} properties. ${recommendation.reasoning}`
        });
      }
    }

    return issues;
  }

  /**
   * Export registry for debugging or migration
   */
  exportRegistry(): Record<string, ComponentRegistryEntry> {
    const exported: Record<string, ComponentRegistryEntry> = {};
    
    for (const [id, entry] of this.registry.entries()) {
      exported[id] = entry;
    }

    return exported;
  }

  /**
   * Clear the registry (for testing or reset)
   */
  clear(): void {
    this.registry.clear();
    this.categoryIndex.clear();
    console.log('🗑️ Property config registry cleared');
  }
}

// Export singleton instance
export const propertyConfigRegistry = PropertyConfigRegistry.getInstance();