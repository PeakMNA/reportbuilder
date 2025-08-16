'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle, Info, Lightbulb, AlertTriangle, Calculator } from 'lucide-react'
import { FormulaBuilderDialog } from '../formula/formula-builder'

interface PropertyInputProps {
  label: string
  type: 'text' | 'number' | 'color' | 'select' | 'checkbox' | 'textarea' | 'array' | 'formula'
  value: string | number | boolean | string[] | null
  onChange: (value: string | number | boolean | string[] | null) => void
  placeholder?: string
  suffix?: string
  prefix?: string
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  disabled?: boolean
  className?: string
  // Enhanced UX props
  description?: string
  helpText?: string
  usageExample?: string
  constraints?: string
  bestPractice?: string
  // Enhanced Framework props
  required?: boolean
  validationRules?: import('@/types/property-config').ValidationRule[]
  validationErrors?: string[]
  propertyKey?: string
  onValidationChange?: (propertyKey: string, errors: string[]) => void
}

export function PropertyInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  suffix,
  prefix,
  min,
  max,
  step,
  options = [],
  disabled = false,
  className = '',
  description,
  helpText,
  usageExample,
  constraints,
  bestPractice,
  required = false,
  validationRules = [],
  validationErrors = [],
  propertyKey,
  onValidationChange,
}: PropertyInputProps) {
  const [showFormulaBuilder, setShowFormulaBuilder] = useState(false);

  // Validate input using validation rules
  const validateInput = (inputValue: unknown): string[] => {
    const errors: string[] = [];
    
    // Check required validation
    if (required && (inputValue === undefined || inputValue === null || inputValue === '')) {
      errors.push(`${label} is required`);
    }
    
    // Check custom validation rules
    for (const rule of validationRules) {
      const error = validateRule(rule, inputValue);
      if (error) {
        errors.push(error);
      }
    }
    
    return errors;
  };

  // Validate individual rule
  const validateRule = (rule: import('@/types/property-config').ValidationRule, inputValue: unknown): string | null => {
    switch (rule.type) {
      case 'required':
        if (inputValue === undefined || inputValue === null || inputValue === '') {
          return rule.message || `${label} is required`;
        }
        break;

      case 'min':
        if (typeof inputValue === 'number' && inputValue < rule.value) {
          return rule.message || `${label} must be at least ${rule.value}`;
        }
        if (typeof inputValue === 'string' && inputValue.length < rule.value) {
          return rule.message || `${label} must be at least ${rule.value} characters`;
        }
        break;

      case 'max':
        if (typeof inputValue === 'number' && inputValue > rule.value) {
          return rule.message || `${label} must be at most ${rule.value}`;
        }
        if (typeof inputValue === 'string' && inputValue.length > rule.value) {
          return rule.message || `${label} must be at most ${rule.value} characters`;
        }
        break;

      case 'pattern':
        if (typeof inputValue === 'string' && rule.value instanceof RegExp) {
          if (!rule.value.test(inputValue)) {
            return rule.message || `${label} format is invalid`;
          }
        }
        break;

      case 'enum':
        if (Array.isArray(rule.value) && !rule.value.includes(inputValue)) {
          return rule.message || `${label} must be one of: ${rule.value.join(', ')}`;
        }
        break;

      case 'custom':
        if (rule.validator) {
          try {
            const result = rule.validator(inputValue);
            if (result !== true) {
              return typeof result === 'string' ? result : (rule.message || `${label} validation failed`);
            }
          } catch (error) {
            return `${label} validation error: ${error}`;
          }
        }
        break;
    }
    
    return null;
  };

  // Handle value changes with validation
  const handleChange = (newValue: string | number | boolean | string[] | null) => {
    // Call original onChange
    onChange(newValue);
    
    // Perform validation and notify parent
    if (propertyKey && onValidationChange) {
      const errors = validateInput(newValue);
      onValidationChange(propertyKey, errors);
    }
  };

  // Check if there are validation errors to display
  const hasErrors = validationErrors.length > 0;
  const errorClass = hasErrors ? 'border-red-500 focus:border-red-500' : '';
  
  // Render help tooltip with comprehensive information
  const renderHelpTooltip = () => {
    if (!description && !helpText && !usageExample && !constraints && !bestPractice) {
      return null;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              type="button"
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <HelpCircle className="h-3 w-3" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-80 p-3">
            <div className="space-y-2">
              {description && (
                <div className="text-sm font-medium">{description}</div>
              )}
              {helpText && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{helpText}</span>
                </div>
              )}
              {usageExample && (
                <div className="flex items-start gap-2 text-xs text-blue-600">
                  <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{usageExample}</span>
                </div>
              )}
              {constraints && (
                <div className="flex items-start gap-2 text-xs text-orange-600">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{constraints}</span>
                </div>
              )}
              {bestPractice && (
                <div className="flex items-start gap-2 text-xs text-green-600">
                  <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <strong>Best Practice:</strong> {bestPractice}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select value={value?.toString()} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger className={`h-8 ${className} ${errorClass}`}>
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`checkbox-${label}`}
              checked={Boolean(value)}
              onCheckedChange={handleChange}
              disabled={disabled}
            />
            <label
              htmlFor={`checkbox-${label}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          </div>
        )

      case 'textarea':
        return (
          <Textarea
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`min-h-[80px] ${className} ${errorClass}`}
          />
        )

      case 'color':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="color"
              value={String(value || '#000000')}
              onChange={(e) => handleChange(e.target.value)}
              disabled={disabled}
              className="w-12 h-8 p-1 rounded cursor-pointer"
            />
            <Input
              type="text"
              value={String(value || '#000000')}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="#000000"
              disabled={disabled}
              className={`h-8 font-mono text-xs ${className} ${errorClass}`}
            />
          </div>
        )

      case 'number':
        return (
          <div className="flex items-center">
            {prefix && (
              <span className="text-xs text-muted-foreground mr-1">{prefix}</span>
            )}
            <Input
              type="number"
              value={String(value || '')}
              onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
              placeholder={placeholder}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`h-8 ${className} ${errorClass}`}
            />
            {suffix && (
              <span className="text-xs text-muted-foreground ml-1">{suffix}</span>
            )}
          </div>
        )

      case 'array':
        return (
          <Textarea
            value={Array.isArray(value) ? value.join(', ') : String(value || '')}
            onChange={(e) => {
              const arrayValue = e.target.value.split(',').map(item => item.trim()).filter(item => item)
              handleChange(arrayValue)
            }}
            placeholder={placeholder || "Enter comma-separated values"}
            disabled={disabled}
            className={`min-h-[60px] ${className} ${errorClass}`}
          />
        )

      case 'formula':
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Textarea
                value={String(value || '')}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder || "Enter formula expression..."}
                disabled={disabled}
                className={`min-h-[80px] font-mono text-sm ${className} ${errorClass}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowFormulaBuilder(true)}
                disabled={disabled}
                className="h-auto"
              >
                <Calculator className="w-4 h-4" />
              </Button>
            </div>
            <FormulaBuilderDialog
              open={showFormulaBuilder}
              onClose={() => setShowFormulaBuilder(false)}
              onSave={handleChange}
              expression={String(value || '')}
              onExpressionChange={() => {}} // Not used in dialog mode
              availableFields={[
                'field1', 'field2', 'field3', 'price', 'quantity', 'taxRate',
                'orderDate', 'customerName', 'total', 'subtotal'
              ]}
              context={{
                field1: 100,
                field2: 200,
                field3: 300,
                price: 29.99,
                quantity: 5,
                taxRate: 0.08,
                orderDate: new Date(),
                customerName: 'Sample Customer',
                total: 149.95,
                subtotal: 138.85
              }}
            />
          </div>
        )

      default:
        return (
          <Input
            type="text"
            value={String(value || '')}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={`h-8 ${className} ${errorClass}`}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return renderInput()
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor={`input-${label}`} className={`text-xs font-medium ${required ? 'after:content-["*"] after:text-red-500 after:ml-1' : ''}`}>
          {label}
        </Label>
        {renderHelpTooltip()}
      </div>
      <div id={`input-${label}`}>
        {renderInput()}
      </div>
      {/* Display validation errors */}
      {hasErrors && (
        <div className="space-y-1">
          {validationErrors.map((error, index) => (
            <div key={index} className="flex items-center text-xs text-red-600">
              <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
              {error}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}