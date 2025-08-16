/**
 * PropertyValidator - Comprehensive validation system for component properties
 * Enforces property count limits, type validation, and custom business rules
 */

import { 
  PropertyConfig, 
  PropertyDefinition,
  ValidationResult, 
  ValidationRule,
  PropertyConfigValidation 
} from '@/types/property-config';

export class PropertyValidator implements PropertyConfigValidation {
  private static instance: PropertyValidator;
  
  // Singleton pattern for consistent validation across the app
  public static getInstance(): PropertyValidator {
    if (!PropertyValidator.instance) {
      PropertyValidator.instance = new PropertyValidator();
    }
    return PropertyValidator.instance;
  }

  /**
   * Validates that the component has 3-7 properties (80/20 rule enforcement)
   */
  validatePropertyCount(config: PropertyConfig): ValidationResult {
    const allProperties = config.groups.flatMap(group => group.properties);
    const propertyCount = allProperties.length;
    
    const errors: ValidationResult['errors'] = [];
    
    // Enforce 3-7 property limit based on 80/20 rule
    if (propertyCount < 3) {
      errors.push({
        message: `Component has ${propertyCount} properties but needs at least 3 for proper functionality`,
        severity: 'error'
      });
    }
    
    if (propertyCount > 7) {
      errors.push({
        message: `Component has ${propertyCount} properties but should have maximum 7 (80/20 rule). Consider grouping or removing less essential properties.`,
        severity: 'warning'
      });
    }

    // Check custom validation rules from config
    if (config.validation?.minProperties && propertyCount < config.validation.minProperties) {
      errors.push({
        message: `Component requires at least ${config.validation.minProperties} properties, but has ${propertyCount}`,
        severity: 'error'
      });
    }

    if (config.validation?.maxProperties && propertyCount > config.validation.maxProperties) {
      errors.push({
        message: `Component should not exceed ${config.validation.maxProperties} properties, but has ${propertyCount}`,
        severity: 'error'
      });
    }

    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  }

  /**
   * Validates property types match expected types and constraints
   */
  validatePropertyTypes(config: PropertyConfig, values: Record<string, any>): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const allProperties = config.groups.flatMap(group => group.properties);

    for (const property of allProperties) {
      const value = values[property.key];
      
      // Skip validation for undefined values (handled by required validation)
      if (value === undefined || value === null) continue;

      const typeError = this.validatePropertyType(property, value);
      if (typeError) {
        errors.push({
          propertyKey: property.key,
          message: `Property "${property.label}": ${typeError}`,
          severity: 'error'
        });
      }

      // Validate custom validation rules
      if (property.validationRules) {
        for (const rule of property.validationRules) {
          const ruleError = this.validateRule(rule, value, property.label);
          if (ruleError) {
            errors.push({
              propertyKey: property.key,
              message: ruleError,
              severity: 'error'
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates that all required properties are present
   */
  validateRequiredProperties(config: PropertyConfig, values: Record<string, any>): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const allProperties = config.groups.flatMap(group => group.properties);
    
    // Check properties marked as required
    const requiredProperties = allProperties.filter(prop => prop.required);
    for (const property of requiredProperties) {
      const value = values[property.key];
      if (value === undefined || value === null || value === '') {
        errors.push({
          propertyKey: property.key,
          message: `Required property "${property.label}" is missing`,
          severity: 'error'
        });
      }
    }

    // Check validation rules for required properties
    if (config.validation?.requiredProperties) {
      for (const requiredKey of config.validation.requiredProperties) {
        const value = values[requiredKey];
        if (value === undefined || value === null || value === '') {
          const property = allProperties.find(p => p.key === requiredKey);
          const label = property?.label || requiredKey;
          errors.push({
            propertyKey: requiredKey,
            message: `Required property "${label}" is missing`,
            severity: 'error'
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates custom business rules defined in the configuration
   */
  validateCustomRules(config: PropertyConfig, values: Record<string, any>): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    if (config.validation?.customValidators) {
      for (const customValidator of config.validation.customValidators) {
        try {
          const result = customValidator.validator(values);
          if (result !== true) {
            const message = typeof result === 'string' 
              ? result 
              : (customValidator.message || `Custom validation "${customValidator.name}" failed`);
            
            errors.push({
              message: `Custom Rule "${customValidator.name}": ${message}`,
              severity: 'error'
            });
          }
        } catch (error) {
          errors.push({
            message: `Custom validation "${customValidator.name}" threw an error: ${error}`,
            severity: 'error'
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Runs complete validation suite on a property configuration
   */
  validateComplete(config: PropertyConfig, values: Record<string, any>): ValidationResult {
    const results = [
      this.validatePropertyCount(config),
      this.validatePropertyTypes(config, values),
      this.validateRequiredProperties(config, values),
      this.validateCustomRules(config, values)
    ];

    const allErrors = results.flatMap(result => result.errors);
    const hasErrors = results.some(result => !result.valid);

    return {
      valid: !hasErrors,
      errors: allErrors
    };
  }

  /**
   * Validates a single property against its type constraints
   */
  private validatePropertyType(property: PropertyDefinition, value: any): string | null {
    switch (property.type) {
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `Expected number, got ${typeof value}`;
        }
        if (property.min !== undefined && value < property.min) {
          return `Value ${value} is below minimum ${property.min}`;
        }
        if (property.max !== undefined && value > property.max) {
          return `Value ${value} is above maximum ${property.max}`;
        }
        break;

      case 'text':
      case 'textarea':
        if (typeof value !== 'string') {
          return `Expected string, got ${typeof value}`;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          return `Expected boolean, got ${typeof value}`;
        }
        break;

      case 'color':
        if (typeof value !== 'string') {
          return `Expected color string, got ${typeof value}`;
        }
        // Basic hex color validation
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
          return `Invalid color format. Expected hex format like #FF0000`;
        }
        break;

      case 'select':
        if (!property.options) {
          return `Select property must have options defined`;
        }
        const validValues = property.options.map(opt => opt.value);
        if (!validValues.includes(value)) {
          return `Invalid selection. Must be one of: ${validValues.join(', ')}`;
        }
        break;
    }

    return null;
  }

  /**
   * Validates a single validation rule
   */
  private validateRule(rule: ValidationRule, value: any, propertyLabel: string): string | null {
    switch (rule.type) {
      case 'required':
        if (value === undefined || value === null || value === '') {
          return rule.message || `${propertyLabel} is required`;
        }
        break;

      case 'min':
        if (typeof value === 'number' && value < rule.value) {
          return rule.message || `${propertyLabel} must be at least ${rule.value}`;
        }
        if (typeof value === 'string' && value.length < rule.value) {
          return rule.message || `${propertyLabel} must be at least ${rule.value} characters`;
        }
        break;

      case 'max':
        if (typeof value === 'number' && value > rule.value) {
          return rule.message || `${propertyLabel} must be at most ${rule.value}`;
        }
        if (typeof value === 'string' && value.length > rule.value) {
          return rule.message || `${propertyLabel} must be at most ${rule.value} characters`;
        }
        break;

      case 'pattern':
        if (typeof value === 'string' && rule.value instanceof RegExp) {
          if (!rule.value.test(value)) {
            return rule.message || `${propertyLabel} format is invalid`;
          }
        }
        break;

      case 'enum':
        if (Array.isArray(rule.value) && !rule.value.includes(value)) {
          return rule.message || `${propertyLabel} must be one of: ${rule.value.join(', ')}`;
        }
        break;

      case 'custom':
        if (rule.validator) {
          try {
            const result = rule.validator(value);
            if (result !== true) {
              return typeof result === 'string' ? result : (rule.message || `${propertyLabel} validation failed`);
            }
          } catch (error) {
            return `${propertyLabel} validation error: ${error}`;
          }
        }
        break;
    }

    return null;
  }

  /**
   * Gets default values from property configuration
   */
  getDefaultValues(config: PropertyConfig): Record<string, any> {
    const defaults: Record<string, any> = {};
    
    // Apply config-level defaults first
    if (config.defaults) {
      Object.assign(defaults, config.defaults);
    }

    // Apply property-level defaults
    const allProperties = config.groups.flatMap(group => group.properties);
    for (const property of allProperties) {
      if (property.defaultValue !== undefined) {
        defaults[property.key] = property.defaultValue;
      }
    }

    return defaults;
  }

  /**
   * Provides property count recommendations based on component type
   */
  getPropertyCountRecommendation(componentType: string): { ideal: number; max: number; reasoning: string } {
    // Core components should be lean (80/20 rule)
    const coreComponents = ['text-label', 'data-field', 'line-divider'];
    
    if (coreComponents.includes(componentType)) {
      return {
        ideal: 4,
        max: 5,
        reasoning: 'Core components should focus on essential functionality with minimal configuration'
      };
    }

    // Layout components can have more properties
    const layoutComponents = ['page-header', 'page-footer', 'group-banner'];
    if (layoutComponents.includes(componentType)) {
      return {
        ideal: 6,
        max: 7,
        reasoning: 'Layout components need styling and positioning options but should remain manageable'
      };
    }

    // Default recommendation
    return {
      ideal: 5,
      max: 7,
      reasoning: 'Standard components should balance functionality with usability (80/20 rule)'
    };
  }
}

// Export singleton instance for easy access
export const propertyValidator = PropertyValidator.getInstance();