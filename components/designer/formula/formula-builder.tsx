'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formulaEngine, FormulaContext } from './formula-engine';
import { Calculator, Code, Database, Hash, Calendar, Type, Zap } from 'lucide-react';

interface FormulaBuilderProps {
  expression: string;
  onExpressionChange: (expression: string) => void;
  availableFields?: string[];
  context?: FormulaContext;
  formatType?: 'text' | 'number' | 'currency' | 'date';
}

export function FormulaBuilder({
  expression,
  onExpressionChange,
  availableFields = [],
  context = {},
  formatType = 'text'
}: FormulaBuilderProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string }>({ isValid: true });
  const [previewResult, setPreviewResult] = useState<string>('');
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const functions = formulaEngine.getAvailableFunctions();

  // Group functions by category
  const functionCategories = {
    math: functions.filter(f => ['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'ROUND', 'ABS', 'SQRT', 'POWER'].includes(f.name)),
    logic: functions.filter(f => ['IF', 'AND', 'OR', 'NOT'].includes(f.name)),
    text: functions.filter(f => ['CONCATENATE', 'LEFT', 'RIGHT', 'MID', 'LEN', 'UPPER', 'LOWER'].includes(f.name)),
    date: functions.filter(f => ['TODAY', 'NOW', 'DATE', 'YEAR', 'MONTH', 'DAY'].includes(f.name)),
    financial: functions.filter(f => ['PMT', 'PV', 'FV'].includes(f.name))
  };

  // Validate formula and update preview
  useEffect(() => {
    const validateAndPreview = async () => {
      if (!expression.trim()) {
        setValidationResult({ isValid: true });
        setPreviewResult('');
        return;
      }

      setIsValidating(true);

      // Validate formula syntax
      const validation = formulaEngine.validateFormula(expression);
      setValidationResult(validation);

      // Generate preview if valid and context is available
      if (validation.isValid && Object.keys(context).length > 0) {
        try {
          const result = formulaEngine.evaluateFormula(expression, context, formatType);
          if (result.error) {
            setPreviewResult(`Error: ${result.error}`);
          } else {
            setPreviewResult(result.formattedValue || String(result.value));
          }
        } catch (error) {
          setPreviewResult('Preview unavailable');
        }
      } else {
        setPreviewResult('No preview data');
      }

      setIsValidating(false);
    };

    const timeoutId = setTimeout(validateAndPreview, 300);
    return () => clearTimeout(timeoutId);
  }, [expression, context, formatType]);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeText = expression.substring(0, start);
    const afterText = expression.substring(end);
    const newExpression = beforeText + text + afterText;
    
    onExpressionChange(newExpression);

    // Set cursor position after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const insertFunction = (functionName: string, syntax: string) => {
    // Extract parameters from syntax
    const match = syntax.match(/\(([^)]+)\)/);
    const params = match ? match[1] : '';
    
    // Create function template with placeholders
    const template = `${functionName}(${params.split(',').map((_, i) => `param${i + 1}`).join(', ')})`;
    insertAtCursor(template);
    setSelectedFunction('');
  };

  const insertField = (fieldName: string) => {
    insertAtCursor(fieldName);
  };

  const insertOperator = (operator: string) => {
    insertAtCursor(` ${operator} `);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'math': return <Calculator className="w-4 h-4" />;
      case 'logic': return <Code className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'date': return <Calendar className="w-4 h-4" />;
      case 'financial': return <Hash className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Expression Editor */}
      <div className="space-y-2">
        <Label htmlFor="formula-expression">Formula Expression</Label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            id="formula-expression"
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            placeholder="Enter your formula (e.g., SUM(field1, field2) * 1.08)"
            className={`w-full min-h-[100px] p-3 border rounded-md font-mono text-sm resize-y ${
              !validationResult.isValid ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          
          {/* Validation status */}
          <div className="absolute bottom-2 right-2">
            {isValidating ? (
              <Badge variant="secondary" className="text-xs">Validating...</Badge>
            ) : !validationResult.isValid ? (
              <Badge variant="destructive" className="text-xs">Invalid</Badge>
            ) : (
              <Badge variant="default" className="text-xs bg-green-600">Valid</Badge>
            )}
          </div>
        </div>
        
        {/* Error message */}
        {!validationResult.isValid && validationResult.error && (
          <p className="text-sm text-red-600">{validationResult.error}</p>
        )}
        
        {/* Preview */}
        {previewResult && (
          <div className="p-2 bg-gray-50 border rounded text-sm">
            <span className="font-medium">Preview: </span>
            <span className="font-mono">{previewResult}</span>
          </div>
        )}
      </div>

      {/* Formula Builder Tools */}
      <Tabs defaultValue="functions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="fields">Fields</TabsTrigger>
          <TabsTrigger value="operators">Operators</TabsTrigger>
        </TabsList>

        {/* Functions Tab */}
        <TabsContent value="functions" className="space-y-4">
          <div className="space-y-4">
            {Object.entries(functionCategories).map(([category, categoryFunctions]) => (
              <Card key={category}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium capitalize">
                    {getCategoryIcon(category)}
                    {category} Functions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {categoryFunctions.map((func) => (
                      <div
                        key={func.name}
                        className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => insertFunction(func.name, func.syntax)}
                      >
                        <div className="flex-1">
                          <div className="font-mono text-sm font-medium">{func.name}</div>
                          <div className="text-xs text-gray-500">{func.description}</div>
                        </div>
                        <div className="text-xs text-gray-400 font-mono">{func.syntax}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fields Tab */}
        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Database className="w-4 h-4" />
                Available Fields
              </CardTitle>
              <CardDescription>Click to insert field reference</CardDescription>
            </CardHeader>
            <CardContent>
              {availableFields.length > 0 ? (
                <div className="grid gap-2">
                  {availableFields.map((field) => (
                    <div
                      key={field}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => insertField(field)}
                    >
                      <span className="font-mono text-sm">{field}</span>
                      <Badge variant="outline" className="text-xs">Field</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No fields available. Connect to a data source to see available fields.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Operators Tab */}
        <TabsContent value="operators" className="space-y-4">
          <div className="grid gap-4">
            {/* Arithmetic Operators */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Arithmetic Operators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { op: '+', desc: 'Addition' },
                    { op: '-', desc: 'Subtraction' },
                    { op: '*', desc: 'Multiplication' },
                    { op: '/', desc: 'Division' },
                    { op: '%', desc: 'Modulo' },
                    { op: '^', desc: 'Power' }
                  ].map(({ op, desc }) => (
                    <Button
                      key={op}
                      variant="outline"
                      size="sm"
                      onClick={() => insertOperator(op)}
                      title={desc}
                      className="font-mono"
                    >
                      {op}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparison Operators */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Comparison Operators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { op: '=', desc: 'Equals' },
                    { op: '<>', desc: 'Not equals' },
                    { op: '>', desc: 'Greater than' },
                    { op: '<', desc: 'Less than' },
                    { op: '>=', desc: 'Greater than or equal' },
                    { op: '<=', desc: 'Less than or equal' }
                  ].map(({ op, desc }) => (
                    <Button
                      key={op}
                      variant="outline"
                      size="sm"
                      onClick={() => insertOperator(op)}
                      title={desc}
                      className="font-mono"
                    >
                      {op}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Other Symbols */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Symbols</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { op: '(', desc: 'Open parenthesis' },
                    { op: ')', desc: 'Close parenthesis' },
                    { op: ',', desc: 'Comma separator' },
                    { op: ';', desc: 'Semicolon' }
                  ].map(({ op, desc }) => (
                    <Button
                      key={op}
                      variant="outline"
                      size="sm"
                      onClick={() => insertAtCursor(op)}
                      title={desc}
                      className="font-mono"
                    >
                      {op}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExpressionChange('')}
          disabled={!expression}
        >
          Clear
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertFunction('SUM', 'SUM(field1, field2)')}
        >
          Insert SUM
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => insertFunction('IF', 'IF(condition, true_value, false_value)')}
        >
          Insert IF
        </Button>
      </div>
    </div>
  );
}

interface FormulaBuilderDialogProps extends FormulaBuilderProps {
  open: boolean;
  onClose: () => void;
  onSave: (expression: string) => void;
  title?: string;
}

export function FormulaBuilderDialog({
  open,
  onClose,
  onSave,
  expression,
  onExpressionChange,
  title = "Formula Builder",
  ...builderProps
}: FormulaBuilderDialogProps) {
  const [localExpression, setLocalExpression] = useState(expression);

  useEffect(() => {
    if (open) {
      setLocalExpression(expression);
    }
  }, [open, expression]);

  const handleSave = () => {
    onSave(localExpression);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Build complex formulas with functions, field references, and operators.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <FormulaBuilder
            {...builderProps}
            expression={localExpression}
            onExpressionChange={setLocalExpression}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Formula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}