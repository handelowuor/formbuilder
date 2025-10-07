'use client';

import { X, Type, Hash, ChevronDown, CheckSquare, Calendar, Link, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FieldTypeSelectorProps {
  onSelect: (fieldType: string) => void;
  onClose: () => void;
}

const fieldTypes = [
  {
    type: 'text',
    name: 'Text Field',
    description: 'Single line text input for names, emails, etc.',
    icon: Type,
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    type: 'number',
    name: 'Number Field',
    description: 'Numeric input with validation and formatting',
    icon: Hash,
    color: 'text-green-600 dark:text-green-400'
  },
  {
    type: 'dropdown',
    name: 'Dropdown/Picklist',
    description: 'Select from predefined options',
    icon: ChevronDown,
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    description: 'Boolean true/false selection',
    icon: CheckSquare,
    color: 'text-orange-600 dark:text-orange-400'
  },
  {
    type: 'date',
    name: 'Date Field',
    description: 'Date picker with format options',
    icon: Calendar,
    color: 'text-red-600 dark:text-red-400'
  },
  {
    type: 'lookup',
    name: 'Lookup Relationship',
    description: 'Reference to another object or data source',
    icon: Link,
    color: 'text-indigo-600 dark:text-indigo-400'
  },
  {
    type: 'formula',
    name: 'Formula Field',
    description: 'Calculated field based on other field values',
    icon: Calculator,
    color: 'text-teal-600 dark:text-teal-400'
  }
];

export function FieldTypeSelector({ onSelect, onClose }: FieldTypeSelectorProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Select Field Type</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {fieldTypes.map((fieldType) => {
            const IconComponent = fieldType.icon;
            return (
              <Card
                key={fieldType.type}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/20"
                onClick={() => onSelect(fieldType.type)}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3">
                    <IconComponent className={`w-6 h-6 ${fieldType.color}`} />
                  </div>
                  <CardTitle className="text-lg">{fieldType.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {fieldType.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}