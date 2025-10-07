export type FieldType = 
  | 'text' 
  | 'number' 
  | 'dropdown' 
  | 'checkbox' 
  | 'date' 
  | 'lookup' 
  | 'formula';

export interface ValidationRule {
  id: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: string | number;
  message: string;
}

export interface PicklistValue {
  id: string;
  label: string;
  value: string;
  isDefault?: boolean;
  dependencies?: string[];
}

export interface FieldDependency {
  id: string;
  controllingFieldId: string;
  conditions: {
    operator: 'equals' | 'notEquals' | 'contains' | 'isEmpty';
    value: string;
  }[];
  action: 'show' | 'hide' | 'require' | 'disable';
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  apiName: string;
  helpText?: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  validationRules: ValidationRule[];
  dependencies: FieldDependency[];
  
  // Type-specific properties
  picklistValues?: PicklistValue[];
  useGlobalValueSet?: boolean;
  globalValueSetId?: string;
  lookupObject?: string;
  lookupField?: string;
  formula?: string;
  minValue?: number;
  maxValue?: number;
  dateFormat?: string;
}

export interface FormVersion {
  id: string;
  version: number;
  createdAt: Date;
  createdBy: string;
  changes: string;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  status: 'draft' | 'published';
  versions: FormVersion[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalValueSet {
  id: string;
  name: string;
  values: PicklistValue[];
  createdAt: Date;
  updatedAt: Date;
}