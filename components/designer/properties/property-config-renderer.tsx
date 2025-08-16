'use client';

import { PropertyConfig } from '@/types/property-config';
import { PropertyGroup } from './property-group';
import { PropertyInput } from './property-input';

interface PropertyConfigRendererProps {
  config: PropertyConfig;
  values: Record<string, string | number | boolean | string[] | null>;
  onValueChange: (key: string, value: string | number | boolean | string[] | null) => void;
  disabled?: boolean;
  categoryFilter?: 'core' | 'style' | 'data';
}

export function PropertyConfigRenderer({
  config,
  values,
  onValueChange,
  disabled = false,
  categoryFilter
}: PropertyConfigRendererProps) {
  // Filter groups by category if specified
  const filteredGroups = categoryFilter 
    ? config.groups.filter(group => group.category === categoryFilter)
    : config.groups;

  // If no groups match the category filter, render individual properties 
  // that should be in that category
  if (filteredGroups.length === 0 && categoryFilter) {
    // For now, render properties inline without groups when category filtering
    // This handles cases where properties haven't been properly categorized yet
    const allProperties = config.groups.flatMap(g => g.properties);
    
    return (
      <div className="space-y-3">
        {allProperties.map((property, propertyIndex) => (
          <PropertyInput
            key={`${property.key}-${propertyIndex}`}
            label={property.label}
            type={property.type}
            value={values[property.key]}
            onChange={(value) => onValueChange(property.key, value)}
            placeholder={property.placeholder}
            suffix={property.suffix}
            prefix={property.prefix}
            min={property.min}
            max={property.max}
            step={property.step}
            options={property.options}
            disabled={disabled}
            description={property.description}
            helpText={property.helpText}
            usageExample={property.usageExample}
            constraints={property.constraints}
            bestPractice={property.bestPractice}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredGroups.map((group, groupIndex) => (
        <div key={`${group.title}-${groupIndex}`} className="space-y-3">
          {/* Render properties without nested PropertyGroup to avoid double-grouping */}
          {group.properties.map((property, propertyIndex) => (
            <PropertyInput
              key={`${property.key}-${propertyIndex}`}
              label={property.label}
              type={property.type}
              value={values[property.key]}
              onChange={(value) => onValueChange(property.key, value)}
              placeholder={property.placeholder}
              suffix={property.suffix}
              prefix={property.prefix}
              min={property.min}
              max={property.max}
              step={property.step}
              options={property.options}
              disabled={disabled}
              description={property.description}
              helpText={property.helpText}
              usageExample={property.usageExample}
              constraints={property.constraints}
              bestPractice={property.bestPractice}
            />
          ))}
        </div>
      ))}
    </div>
  );
}