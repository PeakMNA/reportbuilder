'use client';

import { useState, useEffect, useContext } from 'react';
import { ComponentType } from '@/types/component';
import { formulaEngine, FormulaContext } from './formula-engine';
import { DataBindingContext } from '../data-binding/data-binding-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, AlertCircle } from 'lucide-react';

export interface FormulaProperties {
  // Core Properties
  expression: string;
  formatOutput: 'text' | 'number' | 'currency' | 'date';
  autoFit: boolean;
  
  // Style Properties
  fontSize: number;
  color: string;
  
  // Data Properties
  updateFrequency: 'on-data-change' | 'manual';
}

export const DEFAULT_FORMULA_PROPERTIES: FormulaProperties = {
  expression: 'SUM(field1, field2)',
  formatOutput: 'number',
  autoFit: true,
  fontSize: 14,
  color: '#000000',
  updateFrequency: 'on-data-change'
};

interface FormulaComponentProps {
  id: string;
  properties: FormulaProperties;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, properties: Partial<FormulaProperties>) => void;
  className?: string;
}

export function FormulaComponent({
  id,
  properties,
  selected,
  onSelect,
  onUpdate,
  className = ''
}: FormulaComponentProps) {
  const [calculatedValue, setCalculatedValue] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Get data context for formula evaluation
  const { currentData, selectedDataSource } = useContext(DataBindingContext) || {};

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(id);
  };

  // Build formula context from available data
  const buildFormulaContext = (): FormulaContext => {
    const context: FormulaContext = {};
    
    // Add current row data if available
    if (currentData && typeof currentData === 'object') {
      Object.entries(currentData).forEach(([key, value]) => {
        context[key] = value;
      });
    }
    
    // Add sample data for preview if no real data
    if (Object.keys(context).length === 0) {
      context['field1'] = 100;
      context['field2'] = 200;
      context['field3'] = 300;
      context['price'] = 29.99;
      context['quantity'] = 5;
      context['taxRate'] = 0.08;
      context['orderDate'] = new Date();
      context['customerName'] = 'Sample Customer';
      context['total'] = 149.95;
      context['subtotal'] = 138.85;
    }
    
    return context;
  };

  // Evaluate the formula
  const evaluateFormula = async () => {
    if (!properties.expression.trim()) {
      setCalculatedValue('');
      setHasError(false);
      return;
    }

    setIsCalculating(true);
    setHasError(false);

    try {
      const context = buildFormulaContext();
      const result = formulaEngine.evaluateFormula(
        properties.expression,
        context,
        properties.formatOutput
      );

      if (result.error) {
        setHasError(true);
        setErrorMessage(result.error);
        setCalculatedValue('ERROR');
      } else {
        setHasError(false);
        setErrorMessage('');
        setCalculatedValue(result.formattedValue || String(result.value || ''));
      }
    } catch (error) {
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Calculation error');
      setCalculatedValue('ERROR');
    } finally {
      setIsCalculating(false);
    }
  };

  // Re-evaluate formula when expression, data, or format changes
  useEffect(() => {
    const evaluate = async () => {
      if (!properties.expression.trim()) {
        setCalculatedValue('');
        setHasError(false);
        return;
      }

      setIsCalculating(true);
      setHasError(false);

      try {
        const context = buildFormulaContext();
        const result = formulaEngine.evaluateFormula(
          properties.expression,
          context,
          properties.formatOutput
        );

        if (result.error) {
          setHasError(true);
          setErrorMessage(result.error);
          setCalculatedValue('ERROR');
        } else {
          setHasError(false);
          setErrorMessage('');
          setCalculatedValue(result.formattedValue || String(result.value || ''));
        }
      } catch (error) {
        setHasError(true);
        setErrorMessage(error instanceof Error ? error.message : 'Calculation error');
        setCalculatedValue('ERROR');
      } finally {
        setIsCalculating(false);
      }
    };

    if (properties.updateFrequency === 'on-data-change') {
      evaluate();
    }
  }, [properties.expression, properties.formatOutput, currentData, properties.updateFrequency]);

  // Manual recalculation for manual update frequency
  const handleManualRecalculate = () => {
    evaluateFormula();
  };

  const getDisplayValue = () => {
    if (isCalculating) {
      return 'Calculating...';
    }
    
    if (hasError) {
      return 'ERROR';
    }
    
    if (!calculatedValue && !properties.expression.trim()) {
      return 'No formula';
    }
    
    return calculatedValue || 'No result';
  };

  const textStyle = {
    fontSize: `${properties.fontSize}px`,
    color: hasError ? '#dc2626' : properties.color,
    width: properties.autoFit ? 'auto' : '100%',
    height: properties.autoFit ? 'auto' : '100%',
    fontFamily: 'monospace'
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer border-2 transition-colors p-2
        ${selected 
          ? 'border-blue-500 bg-blue-50' 
          : hasError 
            ? 'border-red-300 hover:border-red-400'
            : 'border-transparent hover:border-gray-300'
        }
        ${className}
      `}
      style={properties.autoFit ? {} : { minWidth: '120px', minHeight: '30px' }}
    >
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 mt-0.5">
          {hasError ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : (
            <Calculator className="w-4 h-4 text-purple-600" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Expression preview */}
          <div className="text-xs text-gray-500 mb-1 truncate" title={properties.expression}>
            {properties.expression || 'No formula'}
          </div>
          
          {/* Calculated result */}
          <div style={textStyle} className="break-words">
            {getDisplayValue()}
          </div>
          
          {/* Manual recalculate button for manual update frequency */}
          {properties.updateFrequency === 'manual' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleManualRecalculate();
              }}
              className="mt-1 text-xs text-blue-600 hover:text-blue-800 underline"
              disabled={isCalculating}
            >
              {isCalculating ? 'Calculating...' : 'Recalculate'}
            </button>
          )}
        </div>
      </div>
      
      {/* Formula indicator with status */}
      <div 
        className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white ${
          hasError ? 'bg-red-500' : isCalculating ? 'bg-yellow-500' : 'bg-purple-500'
        }`}
        title={
          hasError 
            ? `Error: ${errorMessage}`
            : isCalculating 
              ? 'Calculating...'
              : `Formula: ${properties.expression}`
        }
      />
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none border-2 border-blue-500" />
      )}
      
      {/* Error details for selected component */}
      {selected && hasError && (
        <Alert className="absolute top-full left-0 right-0 mt-1 z-10 bg-white shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Formula Error:</strong> {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export const FORMULA_COMPONENT_TYPE: ComponentType = {
  id: 'formula',
  name: 'Formula',
  description: 'Calculated fields with mathematical expressions',
  category: 'Data',
  icon: 'Calculator',
  defaultProperties: DEFAULT_FORMULA_PROPERTIES as unknown as Record<string, unknown>
};