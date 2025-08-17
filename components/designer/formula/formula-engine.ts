'use client';

import { HyperFormula } from 'hyperformula';

export interface FormulaContext {
  [fieldName: string]: unknown;
}

export interface FormulaResult {
  value: unknown;
  error?: string;
  formattedValue?: string;
}

class FormulaEngine {
  private static instance: FormulaEngine;
  private hf: HyperFormula;
  private contextSheetId: string | number = 0;

  private constructor() {
    // Configure HyperFormula
    const config: Record<string, unknown> = {
      licenseKey: 'gpl-v3', // Use GPL license
      useColumnIndex: true,
      useArrayArithmetic: false,
      smartRounding: true,
      nullYear: 30,
      leapYear1900: false,
      ignoreWhiteSpace: 'standard',
      caseSensitive: false
    };

    this.hf = HyperFormula.buildEmpty(config);
    
    // Add a sheet for context data
    this.contextSheetId = this.hf.addSheet('Context');
  }

  public static getInstance(): FormulaEngine {
    if (!FormulaEngine.instance) {
      FormulaEngine.instance = new FormulaEngine();
    }
    return FormulaEngine.instance;
  }

  /**
   * Evaluate a formula expression with given context
   */
  public evaluateFormula(
    expression: string, 
    context: FormulaContext = {},
    formatType: 'text' | 'number' | 'currency' | 'date' = 'text'
  ): FormulaResult {
    try {
      // Clear existing context data
      this.hf.clearSheet(this.contextSheetId as unknown as number);
      
      // Set up context data in the sheet
      this.setupContextData(context);
      
      // Process the formula expression to use cell references
      const processedExpression = this.processExpression(expression, context);
      
      // Add formula to a temporary cell
      const tempSheetId = this.hf.addSheet('Temp');
      this.hf.setCellContents({ sheet: tempSheetId as unknown as number, row: 0, col: 0 }, processedExpression);
      
      // Get the calculated value
      const cellValue = this.hf.getCellValue({ sheet: tempSheetId as unknown as number, row: 0, col: 0 });
      
      // Clean up temp sheet
      this.hf.removeSheet(tempSheetId as unknown as number);
      
      // Basic error checking - if result is an error type
      if (cellValue instanceof Error) {
        return { value: null, error: cellValue.message };
      }
      
      // Format the result
      const formattedValue = this.formatResult(cellValue, formatType);
      
      return {
        value: cellValue,
        formattedValue,
        error: undefined
      };
      
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Unknown formula error',
        formattedValue: 'ERROR'
      };
    }
  }

  /**
   * Setup context data in the HyperFormula sheet
   */
  private setupContextData(context: FormulaContext): void {
    let row = 0;
    
    // Set up field references - each field gets a named cell
    for (const [fieldName, value] of Object.entries(context)) {
      // Set the value in column A
      this.hf.setCellContents({ sheet: this.contextSheetId as unknown as number, row, col: 0 }, value as unknown as string | number);
      
      // Create a named range for the field
      try {
        this.hf.addNamedExpression(fieldName, `Context!$A$${row + 1}`);
      } catch (error) {
        // Named expression might already exist, update it
        this.hf.changeNamedExpression(fieldName, `Context!$A$${row + 1}`);
      }
      
      row++;
    }
  }

  /**
   * Process expression to handle field references and functions
   */
  private processExpression(expression: string, context: FormulaContext): string {
    let processed = expression;
    
    // If expression doesn't start with =, add it
    if (!processed.startsWith('=')) {
      processed = '=' + processed;
    }
    
    // Replace common field references that might not be exact matches
    for (const fieldName of Object.keys(context)) {
      // Replace field references in various formats
      const patterns = [
        new RegExp(`\\b${fieldName}\\b`, 'gi'), // Exact word match
        new RegExp(`\\[${fieldName}\\]`, 'gi'), // Bracketed field reference
        new RegExp(`{${fieldName}}`, 'gi'),     // Curly brace field reference
      ];
      
      for (const pattern of patterns) {
        processed = processed.replace(pattern, fieldName);
      }
    }
    
    return processed;
  }

  /**
   * Format the result based on the specified format type
   */
  private formatResult(value: unknown, formatType: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'number') {
      switch (formatType) {
        case 'currency':
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(value);
        
        case 'number':
          return new Intl.NumberFormat('en-US').format(value);
        
        case 'date':
          // Treat number as days since 1900 (Excel style)
          const excelEpoch = new Date(1900, 0, 1);
          const date = new Date(excelEpoch.getTime() + (value - 1) * 24 * 60 * 60 * 1000);
          return date.toLocaleDateString();
        
        default:
          return value.toString();
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    }
    
    return String(value);
  }

  /**
   * Get available functions for the formula builder
   */
  public getAvailableFunctions(): Array<{ name: string; description: string; syntax: string }> {
    return [
      // Math functions
      { name: 'SUM', description: 'Sum of numbers', syntax: 'SUM(number1, number2, ...)' },
      { name: 'AVERAGE', description: 'Average of numbers', syntax: 'AVERAGE(number1, number2, ...)' },
      { name: 'MIN', description: 'Minimum value', syntax: 'MIN(number1, number2, ...)' },
      { name: 'MAX', description: 'Maximum value', syntax: 'MAX(number1, number2, ...)' },
      { name: 'COUNT', description: 'Count of numbers', syntax: 'COUNT(value1, value2, ...)' },
      { name: 'ROUND', description: 'Round to specified digits', syntax: 'ROUND(number, digits)' },
      { name: 'ABS', description: 'Absolute value', syntax: 'ABS(number)' },
      { name: 'SQRT', description: 'Square root', syntax: 'SQRT(number)' },
      { name: 'POWER', description: 'Number raised to power', syntax: 'POWER(base, exponent)' },
      
      // Logic functions
      { name: 'IF', description: 'Conditional logic', syntax: 'IF(condition, value_if_true, value_if_false)' },
      { name: 'AND', description: 'Logical AND', syntax: 'AND(condition1, condition2, ...)' },
      { name: 'OR', description: 'Logical OR', syntax: 'OR(condition1, condition2, ...)' },
      { name: 'NOT', description: 'Logical NOT', syntax: 'NOT(condition)' },
      
      // Text functions
      { name: 'CONCATENATE', description: 'Join text strings', syntax: 'CONCATENATE(text1, text2, ...)' },
      { name: 'LEFT', description: 'Left characters', syntax: 'LEFT(text, num_chars)' },
      { name: 'RIGHT', description: 'Right characters', syntax: 'RIGHT(text, num_chars)' },
      { name: 'MID', description: 'Middle characters', syntax: 'MID(text, start, num_chars)' },
      { name: 'LEN', description: 'Length of text', syntax: 'LEN(text)' },
      { name: 'UPPER', description: 'Convert to uppercase', syntax: 'UPPER(text)' },
      { name: 'LOWER', description: 'Convert to lowercase', syntax: 'LOWER(text)' },
      
      // Date functions
      { name: 'TODAY', description: 'Current date', syntax: 'TODAY()' },
      { name: 'NOW', description: 'Current date and time', syntax: 'NOW()' },
      { name: 'DATE', description: 'Create date', syntax: 'DATE(year, month, day)' },
      { name: 'YEAR', description: 'Year from date', syntax: 'YEAR(date)' },
      { name: 'MONTH', description: 'Month from date', syntax: 'MONTH(date)' },
      { name: 'DAY', description: 'Day from date', syntax: 'DAY(date)' },
      
      // Financial functions
      { name: 'PMT', description: 'Payment calculation', syntax: 'PMT(rate, nper, pv)' },
      { name: 'PV', description: 'Present value', syntax: 'PV(rate, nper, pmt)' },
      { name: 'FV', description: 'Future value', syntax: 'FV(rate, nper, pmt, pv)' }
    ];
  }

  /**
   * Validate a formula expression without evaluating it
   */
  public validateFormula(expression: string): { isValid: boolean; error?: string } {
    try {
      // Create temporary sheet for validation
      const tempSheetId = this.hf.addSheet('Validation');
      
      let processedExpression = expression;
      if (!processedExpression.startsWith('=')) {
        processedExpression = '=' + processedExpression;
      }
      
      // Try to set the formula
      this.hf.setCellContents({ sheet: tempSheetId as unknown as number, row: 0, col: 0 }, processedExpression);
      
      // Clean up
      this.hf.removeSheet(tempSheetId as unknown as number);
      
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid formula syntax'
      };
    }
  }
}

export const formulaEngine = FormulaEngine.getInstance();