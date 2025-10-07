'use client';

import { useState } from 'react';
import { Trash2, Plus, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FormField, ValidationRule, PicklistValue } from '@/types/form-builder';

interface FieldConfigurationPanelProps {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}

export function FieldConfigurationPanel({ field, onUpdate, onDelete }: FieldConfigurationPanelProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const handleFieldUpdate = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const handleValidationRuleAdd = () => {
    const newRule: ValidationRule = {
      id: Date.now().toString(),
      type: 'required',
      message: 'This field is required'
    };
    handleFieldUpdate({
      validationRules: [...field.validationRules, newRule]
    });
  };

  const handleValidationRuleUpdate = (ruleId: string, updates: Partial<ValidationRule>) => {
    handleFieldUpdate({
      validationRules: field.validationRules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    });
  };

  const handleValidationRuleDelete = (ruleId: string) => {
    handleFieldUpdate({
      validationRules: field.validationRules.filter(rule => rule.id !== ruleId)
    });
  };

  const handlePicklistValueAdd = () => {
    const newValue: PicklistValue = {
      id: Date.now().toString(),
      label: 'New Option',
      value: 'new_option'
    };
    handleFieldUpdate({
      picklistValues: [...(field.picklistValues || []), newValue]
    });
  };

  const handlePicklistValueUpdate = (valueId: string, updates: Partial<PicklistValue>) => {
    handleFieldUpdate({
      picklistValues: (field.picklistValues || []).map(value =>
        value.id === valueId ? { ...value, ...updates } : value
      )
    });
  };

  const handlePicklistValueDelete = (valueId: string) => {
    handleFieldUpdate({
      picklistValues: (field.picklistValues || []).filter(value => value.id !== valueId)
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Field Configuration</CardTitle>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="field-label">Field Label</Label>
              <Input
                id="field-label"
                value={field.label}
                onChange={(e) => handleFieldUpdate({ label: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="field-api-name">API Name</Label>
              <Input
                id="field-api-name"
                value={field.apiName}
                onChange={(e) => handleFieldUpdate({ apiName: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="field-help-text">Help Text</Label>
              <Textarea
                id="field-help-text"
                value={field.helpText || ''}
                onChange={(e) => handleFieldUpdate({ helpText: e.target.value })}
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="field-required"
                checked={field.required}
                onCheckedChange={(checked) => handleFieldUpdate({ required: checked })}
              />
              <Label htmlFor="field-required">Required Field</Label>
            </div>

            {/* Type-specific configurations */}
            {field.type === 'dropdown' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Picklist Values</Label>
                  <Button variant="outline" size="sm" onClick={handlePicklistValueAdd}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {(field.picklistValues || []).map((value) => (
                    <div key={value.id} className="flex items-center space-x-2 p-2 border rounded">
                      <Input
                        value={value.label}
                        onChange={(e) => handlePicklistValueUpdate(value.id, { label: e.target.value })}
                        placeholder="Label"
                        className="flex-1"
                      />
                      <Input
                        value={value.value}
                        onChange={(e) => handlePicklistValueUpdate(value.id, { value: e.target.value })}
                        placeholder="Value"
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePicklistValueDelete(value.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {field.type === 'number' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-value">Min Value</Label>
                  <Input
                    id="min-value"
                    type="number"
                    value={field.minValue || ''}
                    onChange={(e) => handleFieldUpdate({ minValue: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="max-value">Max Value</Label>
                  <Input
                    id="max-value"
                    type="number"
                    value={field.maxValue || ''}
                    onChange={(e) => handleFieldUpdate({ maxValue: Number(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>
            )}

            {field.type === 'formula' && (
              <div>
                <Label htmlFor="formula">Formula Expression</Label>
                <Textarea
                  id="formula"
                  value={field.formula || ''}
                  onChange={(e) => handleFieldUpdate({ formula: e.target.value })}
                  className="mt-1"
                  rows={3}
                  placeholder="e.g., field1 + field2 * 0.1"
                />
              </div>
            )}

            {field.type === 'lookup' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="lookup-object">Lookup Object</Label>
                  <Input
                    id="lookup-object"
                    value={field.lookupObject || ''}
                    onChange={(e) => handleFieldUpdate({ lookupObject: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., Account, Contact"
                  />
                </div>
                <div>
                  <Label htmlFor="lookup-field">Display Field</Label>
                  <Input
                    id="lookup-field"
                    value={field.lookupField || ''}
                    onChange={(e) => handleFieldUpdate({ lookupField: e.target.value })}
                    className="mt-1"
                    placeholder="e.g., Name, Email"
                  />
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Validation Rules</h4>
              <Button variant="outline" size="sm" onClick={handleValidationRuleAdd}>
                <Plus className="w-4 h-4 mr-1" />
                Add Rule
              </Button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {field.validationRules.map((rule) => (
                <Card key={rule.id} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Select
                        value={rule.type}
                        onValueChange={(value) => handleValidationRuleUpdate(rule.id, { type: value as any })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="required">Required</SelectItem>
                          <SelectItem value="minLength">Min Length</SelectItem>
                          <SelectItem value="maxLength">Max Length</SelectItem>
                          <SelectItem value="pattern">Pattern</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleValidationRuleDelete(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {(rule.type === 'minLength' || rule.type === 'maxLength') && (
                      <Input
                        type="number"
                        value={rule.value || ''}
                        onChange={(e) => handleValidationRuleUpdate(rule.id, { value: Number(e.target.value) })}
                        placeholder="Enter value"
                      />
                    )}

                    {rule.type === 'pattern' && (
                      <Input
                        value={rule.value || ''}
                        onChange={(e) => handleValidationRuleUpdate(rule.id, { value: e.target.value })}
                        placeholder="Enter regex pattern"
                      />
                    )}

                    <Input
                      value={rule.message}
                      onChange={(e) => handleValidationRuleUpdate(rule.id, { message: e.target.value })}
                      placeholder="Error message"
                    />
                  </div>
                </Card>
              ))}
            </div>

            {field.validationRules.length === 0 && (
              <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No validation rules configured</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div>
              <Label htmlFor="default-value">Default Value</Label>
              <Input
                id="default-value"
                value={field.defaultValue?.toString() || ''}
                onChange={(e) => handleFieldUpdate({ defaultValue: e.target.value })}
                className="mt-1"
              />
            </div>

            {field.type === 'dropdown' && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-global-valueset"
                  checked={field.useGlobalValueSet || false}
                  onCheckedChange={(checked) => handleFieldUpdate({ useGlobalValueSet: checked })}
                />
                <Label htmlFor="use-global-valueset">Use Global Value Set</Label>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Field Dependencies</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Configure when this field should be visible or required based on other field values
              </p>
              <Button variant="outline" size="sm" disabled>
                <Plus className="w-4 h-4 mr-1" />
                Add Dependency
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">Field Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Type:</span>
                  <Badge variant="outline">{field.type}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Required:</span>
                  <Badge variant={field.required ? 'destructive' : 'secondary'}>
                    {field.required ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Validation Rules:</span>
                  <Badge variant="outline">{field.validationRules.length}</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}