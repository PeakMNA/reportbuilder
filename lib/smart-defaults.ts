/**
 * SmartDefaults System - Intelligent default value management
 * Implements 80/20 rule: 80% of users use 20% of features
 */

export interface SmartDefaultConfig {
  componentType: string;
  propertyKey: string;
  defaultValue: any;
  commonValues: { value: any; usage: number }[];
  contextualDefaults?: Record<string, any>;
  category: 'core' | 'style' | 'data';
  priority: number; // Higher numbers = more important
}

export interface UserPreferences {
  userId?: string;
  componentPreferences: Record<string, Record<string, any>>;
  lastUsedValues: Record<string, any>;
  preferenceWeights: Record<string, number>;
}

export interface DefaultRecommendation {
  value: any;
  confidence: number; // 0-1
  reason: 'default' | 'common' | 'user_preference' | 'contextual';
  fallbackValue?: any;
}

/**
 * SmartDefaults class provides intelligent default value suggestions
 * based on usage patterns, user preferences, and contextual information
 */
export class SmartDefaults {
  private static instance: SmartDefaults;
  private defaults: Map<string, SmartDefaultConfig> = new Map();
  private userPreferences: UserPreferences = {
    componentPreferences: {},
    lastUsedValues: {},
    preferenceWeights: {}
  };

  // Common default configurations based on industry standards
  private static readonly COMMON_DEFAULTS: SmartDefaultConfig[] = [
    // Text Label defaults
    {
      componentType: 'text-label',
      propertyKey: 'fontSize',
      defaultValue: 14,
      commonValues: [
        { value: 14, usage: 0.45 },
        { value: 16, usage: 0.25 },
        { value: 12, usage: 0.20 },
        { value: 18, usage: 0.10 }
      ],
      contextualDefaults: {
        'header': 18,
        'body': 14,
        'caption': 12
      },
      category: 'style',
      priority: 8
    },
    {
      componentType: 'text-label',
      propertyKey: 'fontWeight',
      defaultValue: 'normal',
      commonValues: [
        { value: 'normal', usage: 0.60 },
        { value: 'bold', usage: 0.30 },
        { value: '600', usage: 0.10 }
      ],
      contextualDefaults: {
        'header': 'bold',
        'body': 'normal',
        'caption': 'normal'
      },
      category: 'style',
      priority: 6
    },
    {
      componentType: 'text-label',
      propertyKey: 'color',
      defaultValue: '#000000',
      commonValues: [
        { value: '#000000', usage: 0.70 },
        { value: '#374151', usage: 0.15 },
        { value: '#6B7280', usage: 0.10 },
        { value: '#1F2937', usage: 0.05 }
      ],
      contextualDefaults: {
        'header': '#1F2937',
        'body': '#374151',
        'caption': '#6B7280'
      },
      category: 'style',
      priority: 7
    },
    {
      componentType: 'text-label',
      propertyKey: 'alignment',
      defaultValue: 'left',
      commonValues: [
        { value: 'left', usage: 0.70 },
        { value: 'center', usage: 0.20 },
        { value: 'right', usage: 0.08 },
        { value: 'justify', usage: 0.02 }
      ],
      contextualDefaults: {
        'header': 'center',
        'body': 'left',
        'caption': 'left'
      },
      category: 'style',
      priority: 5
    },
    {
      componentType: 'text-label',
      propertyKey: 'text',
      defaultValue: 'Label Text',
      commonValues: [
        { value: 'Label Text', usage: 0.30 },
        { value: 'Title', usage: 0.20 },
        { value: 'Description', usage: 0.15 },
        { value: 'Header', usage: 0.10 },
        { value: 'Footer', usage: 0.05 }
      ],
      category: 'core',
      priority: 10
    },

    // Table Component defaults
    {
      componentType: 'table',
      propertyKey: 'rows',
      defaultValue: 5,
      commonValues: [
        { value: 5, usage: 0.35 },
        { value: 10, usage: 0.25 },
        { value: 3, usage: 0.20 },
        { value: 15, usage: 0.15 },
        { value: 20, usage: 0.05 }
      ],
      contextualDefaults: {
        'summary': 3,
        'detail': 10,
        'report': 15
      },
      category: 'core',
      priority: 9
    },
    {
      componentType: 'table',
      propertyKey: 'showHeader',
      defaultValue: true,
      commonValues: [
        { value: true, usage: 0.85 },
        { value: false, usage: 0.15 }
      ],
      contextualDefaults: {
        'data': true,
        'layout': false
      },
      category: 'core',
      priority: 8
    },
    {
      componentType: 'table',
      propertyKey: 'columns',
      defaultValue: ['Column 1', 'Column 2', 'Column 3'],
      commonValues: [
        { value: ['Column 1', 'Column 2', 'Column 3'], usage: 0.30 },
        { value: ['Name', 'Value'], usage: 0.25 },
        { value: ['Item', 'Quantity', 'Price'], usage: 0.20 },
        { value: ['Date', 'Description', 'Amount'], usage: 0.15 },
        { value: ['Product', 'Category', 'Price', 'Stock'], usage: 0.10 }
      ],
      category: 'core',
      priority: 10
    },
    {
      componentType: 'table',
      propertyKey: 'borderStyle',
      defaultValue: 'solid',
      commonValues: [
        { value: 'solid', usage: 0.60 },
        { value: 'none', usage: 0.25 },
        { value: 'dashed', usage: 0.10 },
        { value: 'dotted', usage: 0.05 }
      ],
      contextualDefaults: {
        'formal': 'solid',
        'clean': 'none',
        'draft': 'dashed'
      },
      category: 'style',
      priority: 7
    },
    {
      componentType: 'table',
      propertyKey: 'backgroundColor',
      defaultValue: '#ffffff',
      commonValues: [
        { value: '#ffffff', usage: 0.70 },
        { value: '#f9f9f9', usage: 0.15 },
        { value: '#f0f8ff', usage: 0.10 },
        { value: '#f8f9fa', usage: 0.05 }
      ],
      contextualDefaults: {
        'clean': '#ffffff',
        'subtle': '#f9f9f9',
        'accent': '#f0f8ff'
      },
      category: 'style',
      priority: 6
    },
    {
      componentType: 'table',
      propertyKey: 'headerBackgroundColor',
      defaultValue: '#f8f9fa',
      commonValues: [
        { value: '#f8f9fa', usage: 0.40 },
        { value: '#e9ecef', usage: 0.25 },
        { value: '#007bff', usage: 0.15 },
        { value: '#6c757d', usage: 0.10 },
        { value: '#28a745', usage: 0.10 }
      ],
      contextualDefaults: {
        'neutral': '#f8f9fa',
        'professional': '#e9ecef',
        'brand': '#007bff'
      },
      category: 'style',
      priority: 6
    },

    // Data Field defaults
    {
      componentType: 'data-field',
      propertyKey: 'formatType',
      defaultValue: 'text',
      commonValues: [
        { value: 'text', usage: 0.40 },
        { value: 'number', usage: 0.25 },
        { value: 'date', usage: 0.20 },
        { value: 'currency', usage: 0.15 }
      ],
      category: 'core',
      priority: 10
    },
    {
      componentType: 'data-field',
      propertyKey: 'autoFit',
      defaultValue: true,
      commonValues: [
        { value: true, usage: 0.80 },
        { value: false, usage: 0.20 }
      ],
      category: 'style',
      priority: 6
    },

    // Layout defaults
    {
      componentType: 'all',
      propertyKey: 'width',
      defaultValue: 150,
      commonValues: [
        { value: 150, usage: 0.25 },
        { value: 200, usage: 0.20 },
        { value: 100, usage: 0.18 },
        { value: 120, usage: 0.15 },
        { value: 250, usage: 0.12 },
        { value: 300, usage: 0.10 }
      ],
      category: 'core',
      priority: 8
    },
    {
      componentType: 'all',
      propertyKey: 'height',
      defaultValue: 30,
      commonValues: [
        { value: 30, usage: 0.35 },
        { value: 25, usage: 0.25 },
        { value: 40, usage: 0.20 },
        { value: 20, usage: 0.15 },
        { value: 50, usage: 0.05 }
      ],
      category: 'core',
      priority: 8
    }
  ];

  private constructor() {
    this.initializeDefaults();
  }

  public static getInstance(): SmartDefaults {
    if (!SmartDefaults.instance) {
      SmartDefaults.instance = new SmartDefaults();
    }
    return SmartDefaults.instance;
  }

  private initializeDefaults(): void {
    SmartDefaults.COMMON_DEFAULTS.forEach(config => {
      const key = `${config.componentType}:${config.propertyKey}`;
      this.defaults.set(key, config);
    });
  }

  /**
   * Get smart default recommendation for a property
   */
  public getDefault(
    componentType: string, 
    propertyKey: string, 
    context?: string
  ): DefaultRecommendation {
    // Try specific component type first
    let key = `${componentType}:${propertyKey}`;
    let config = this.defaults.get(key);

    // Fallback to 'all' component type
    if (!config) {
      key = `all:${propertyKey}`;
      config = this.defaults.get(key);
    }

    if (!config) {
      return {
        value: null,
        confidence: 0,
        reason: 'default'
      };
    }

    // Check for contextual defaults first
    if (context && config.contextualDefaults?.[context]) {
      return {
        value: config.contextualDefaults[context],
        confidence: 0.9,
        reason: 'contextual',
        fallbackValue: config.defaultValue
      };
    }

    // Check user preferences
    const userPref = this.getUserPreference(componentType, propertyKey);
    if (userPref) {
      return {
        value: userPref.value,
        confidence: userPref.confidence,
        reason: 'user_preference',
        fallbackValue: config.defaultValue
      };
    }

    // Use most common value if confidence is high enough
    const mostCommon = config.commonValues[0];
    if (mostCommon && mostCommon.usage > 0.4) {
      return {
        value: mostCommon.value,
        confidence: mostCommon.usage,
        reason: 'common',
        fallbackValue: config.defaultValue
      };
    }

    // Return default value
    return {
      value: config.defaultValue,
      confidence: 0.7,
      reason: 'default'
    };
  }

  /**
   * Get all defaults for a component type, organized by category
   */
  public getComponentDefaults(componentType: string): {
    core: Record<string, any>;
    style: Record<string, any>;
    data: Record<string, any>;
  } {
    const result = {
      core: {} as Record<string, any>,
      style: {} as Record<string, any>,
      data: {} as Record<string, any>
    };

    this.defaults.forEach((config, key) => {
      const [type, property] = key.split(':');
      if (type === componentType || type === 'all') {
        const recommendation = this.getDefault(componentType, property);
        result[config.category][property] = recommendation.value;
      }
    });

    return result;
  }

  /**
   * Get user preference for a specific property
   */
  private getUserPreference(
    componentType: string, 
    propertyKey: string
  ): { value: any; confidence: number } | null {
    const componentPrefs = this.userPreferences.componentPreferences[componentType];
    if (!componentPrefs || !componentPrefs[propertyKey]) {
      return null;
    }

    const weight = this.userPreferences.preferenceWeights[`${componentType}:${propertyKey}`] || 0;
    return {
      value: componentPrefs[propertyKey],
      confidence: Math.min(weight / 10, 0.95) // Scale weight to 0-0.95
    };
  }

  /**
   * Record user's property usage to improve future recommendations
   */
  public recordUsage(componentType: string, propertyKey: string, value: any): void {
    // Update user preferences
    if (!this.userPreferences.componentPreferences[componentType]) {
      this.userPreferences.componentPreferences[componentType] = {};
    }
    
    this.userPreferences.componentPreferences[componentType][propertyKey] = value;
    
    // Update preference weight
    const key = `${componentType}:${propertyKey}`;
    this.userPreferences.preferenceWeights[key] = 
      (this.userPreferences.preferenceWeights[key] || 0) + 1;

    // Store last used value
    this.userPreferences.lastUsedValues[key] = value;
  }

  /**
   * Get properties sorted by priority (most important first)
   */
  public getPropertiesByPriority(componentType: string): {
    property: string;
    category: 'core' | 'style' | 'data';
    priority: number;
    defaultValue: any;
  }[] {
    const properties: {
      property: string;
      category: 'core' | 'style' | 'data';
      priority: number;
      defaultValue: any;
    }[] = [];

    this.defaults.forEach((config, key) => {
      const [type, property] = key.split(':');
      if (type === componentType || type === 'all') {
        const recommendation = this.getDefault(componentType, property);
        properties.push({
          property,
          category: config.category,
          priority: config.priority,
          defaultValue: recommendation.value
        });
      }
    });

    return properties.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Check if a value is using the default
   */
  public isUsingDefault(
    componentType: string, 
    propertyKey: string, 
    currentValue: any
  ): boolean {
    const recommendation = this.getDefault(componentType, propertyKey);
    return recommendation.value === currentValue;
  }

  /**
   * Reset a property to its smart default
   */
  public resetToDefault(
    componentType: string, 
    propertyKey: string, 
    context?: string
  ): any {
    const recommendation = this.getDefault(componentType, propertyKey, context);
    return recommendation.value;
  }

  /**
   * Get category-based expansion defaults for progressive disclosure
   */
  public getCategoryExpansionDefaults(): {
    core: boolean;
    style: boolean;
    data: boolean;
  } {
    // Core properties should always be visible (80/20 rule)
    // Style and Data are collapsed by default for progressive disclosure
    return {
      core: true,
      style: false,
      data: false
    };
  }
}

export const smartDefaults = SmartDefaults.getInstance();