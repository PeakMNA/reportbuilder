// Property configuration types for component property panels

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'enum' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface PropertyDefinition {
  key: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'color' | 'textarea';
  label: string;
  description?: string;
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  helpText?: string;
  usageExample?: string;
  constraints?: string;
  bestPractice?: string;
  required?: boolean;
  validationRules?: ValidationRule[];
  defaultValue?: any;
}

export interface PropertyGroup {
  title: string;
  defaultExpanded: boolean;
  properties: PropertyDefinition[];
  collapsible?: boolean;
  category?: 'core' | 'style' | 'data';
}

export interface ValidationRules {
  minProperties?: number;
  maxProperties?: number;
  requiredProperties?: string[];
  customValidators?: Array<{
    name: string;
    validator: (properties: Record<string, any>) => boolean | string;
    message?: string;
  }>;
}

export interface PropertyConfig<T = Record<string, any>> {
  groups: PropertyGroup[];
  validation?: ValidationRules;
  defaults?: Partial<T>;
  metadata?: {
    version: string;
    description?: string;
    category?: string;
    priority?: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    propertyKey?: string;
    groupTitle?: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export interface PropertyConfigValidation {
  validatePropertyCount(config: PropertyConfig): ValidationResult;
  validatePropertyTypes(config: PropertyConfig, values: Record<string, any>): ValidationResult;
  validateRequiredProperties(config: PropertyConfig, values: Record<string, any>): ValidationResult;
  validateCustomRules(config: PropertyConfig, values: Record<string, any>): ValidationResult;
  validateComplete(config: PropertyConfig, values: Record<string, any>): ValidationResult;
}