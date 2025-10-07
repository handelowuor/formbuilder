// Base Types
export type CountryCode = "UG" | "KE";
export type FormType = "cds1" | "cds2" | "lead_registration" | "kyc";
export type FormStatus = "active" | "inactive" | "archived";
export type AnswerType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "lookup"
  | "formula";

// Company Region
export interface CompanyRegion {
  id: number;
  name: string;
  countryCode: CountryCode;
  isActive: boolean;
}

// Form Structure
export interface Form {
  id: number;
  name: string;
  slug: string;
  description?: string;
  formType: FormType;
  companyRegionId: number;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  fields?: FormField[]; // For UI purposes
}

// Form Section
export interface FormSection {
  id: number;
  formId: number;
  companyRegionId: number;
  formType: FormType;
  slug: string;
  name: string;
  description?: string;
  meta: Record<string, any>;
  order: number;
  isActive: boolean;
  status: string;
  legacyStatus: string;
  etag: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Form Question
export interface FormQuestion {
  id: number;
  formId: number;
  sectionId: number;
  order: number;
  questionTemplateId?: number;
  tkey: string;
  label: string;
  helperText?: string;
  answerType: AnswerType;
  required: boolean;
  validation: Record<string, any>;
  visibleIf: any[];
  visibleIfJson?: Record<string, any>;
  defaultValue?: string;
  optionsApi?: string;
  dependsOn: any[];
  options: any[];
  storage?: Record<string, any>;
  status: string;
  legacyStatus: string;
  etag: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  dbColumn?: string;
  apiEndpoint?: string;
  picklistValues?: PicklistValue[];
}

// Question Template
export interface QuestionTemplate {
  id: number;
  tkey: string;
  label: string;
  answerType: AnswerType;
  validationJson: Record<string, any>;
  defaultValue?: string;
  storageMetadata?: Record<string, any>;
  helperText?: string;
  availableRegions: number[];
  createdBy: string;
  isGlobal: boolean;
  category?: string;
  tags?: string[];
  dbColumn?: string;
  apiEndpoint?: string;
  options?: PicklistValue[];
  status?: "active" | "inactive" | "archived";
}

// Form Field (UI representation)
export interface FormField {
  id: string;
  type: AnswerType;
  label: string;
  apiName: string;
  helpText?: string;
  required: boolean;
  defaultValue?: string;
  picklistValues?: PicklistValue[];
  minValue?: number;
  maxValue?: number;
  formula?: string;
  lookupObject?: string;
  lookupField?: string;
  templateId?: number;
  isFromTemplate?: boolean;
  validationRules: ValidationRule[];
  dependencies: any[];
  useGlobalValueSet?: boolean;
  dbColumn?: string;
  apiEndpoint?: string;
}

// Validation Rule
export interface ValidationRule {
  id: string;
  type: "required" | "minLength" | "maxLength" | "pattern" | "custom";
  value?: string | number;
  message: string;
}

// Picklist Value
export interface PicklistValue {
  id: string;
  label: string;
  value: string;
  order?: number;
  isDefault?: boolean;
  isActive?: boolean;
  usageCount?: number;
}

// API Request/Response Types
export interface ApiResponse<T> {
  status: "success" | false;
  data?: T;
  code?: string;
  message?: string;
}

// API Test Response
export interface ApiTestResponse {
  success: boolean;
  data?: any[];
  error?: string;
  responseTime?: number;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  rows: T[];
  page: number;
  limit: number;
}

// Form Management
export interface CreateFormRequest {
  name: string;
  slug?: string;
  description?: string;
  formType: FormType;
  companyRegionId: number;
  status?: FormStatus;
}

export interface UpdateFormRequest {
  name?: string;
  slug?: string;
  description?: string;
  formType?: FormType;
  status?: FormStatus;
}

// Section Management
export interface CreateSectionRequest {
  name: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateSectionRequest {
  name?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
}

// Question Management
export interface CreateQuestionRequest {
  sectionId: number;
  questionTemplateId?: number;
  tkey?: string;
  label?: string;
  helperText?: string;
  answerType?: AnswerType;
  required?: boolean;
  validation?: Record<string, any>;
  visibleIf?: any[];
  visibleIfJson?: Record<string, any>;
  defaultValue?: string;
  optionsApi?: string;
  dependsOn?: any[];
  options?: any[];
  storage?: Record<string, any>;
  order?: number;
  status?: string;
  etag?: string;
}

export interface UpdateQuestionRequest {
  tkey?: string;
  label?: string;
  helperText?: string;
  answerType?: AnswerType;
  required?: boolean;
  validation?: Record<string, any>;
  visibleIf?: any[];
  visibleIfJson?: Record<string, any>;
  defaultValue?: string;
  optionsApi?: string;
  dependsOn?: any[];
  options?: any[];
  storage?: Record<string, any>;
  order?: number;
  status?: string;
  etag?: string;
}

// Version Control
export interface FormVersion {
  id: number;
  formId: number;
  version: number;
  changes: Record<string, any>;
  createdAt: string;
  createdBy: string;
}

// Import/Export
export interface ImportResult {
  success: boolean;
  formId?: number;
  errors?: string[];
  warnings?: string[];
}

// Audit Trail
export interface AuditEntry {
  id: number;
  entityType: string;
  entityId: number;
  action: string;
  changes: Record<string, any>;
  userId: string;
  timestamp: string;
}

// Form History
export interface FormHistoryEntry {
  id: number;
  formId: number;
  version: number;
  action: "created" | "updated" | "published" | "unpublished" | "archived";
  changes?: Record<string, any>;
  userId: string;
  userName?: string;
  timestamp: string;
  description?: string;
}

// Question Usage Tracking
export interface FormQuestionUsage {
  formId: number;
  formName: string;
  sectionId: number;
  sectionName: string;
  questionId: number;
  isActive: boolean;
}

// Validation Configuration
export interface ValidationConfig {
  rules: Record<string, any>;
  messages: Record<string, string>;
}

// Frontend UI Types - Enhanced
export interface FormBuilderState {
  currentForm: Form | null;
  sections: FormSection[];
  questions: FormQuestion[];
  selectedSection: FormSection | null;
  selectedQuestion: FormQuestion | null;
  isLoading: boolean;
  error: string | null;
  // Multi-country support - Updated to support multiple countries
  selectedCountries: CountryCode[];
  selectedRegions: number[];
  availableRegions: CompanyRegion[];
  // Question template library
  questionTemplates: QuestionTemplate[];
  sharedQuestions: FormQuestion[];
}

// Form Editor State
export interface FormEditorState {
  form: Form;
  sections: FormSection[];
  questions: FormQuestion[];
  selectedSection: FormSection | null;
  selectedQuestion: FormQuestion | null;
  isDirty: boolean;
  isSaving: boolean;
  validationErrors: Record<string, string[]>;
}

// Question Library State
export interface QuestionLibraryState {
  templates: QuestionTemplate[];
  categories: string[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
}

// Analytics Types
export interface FormAnalytics {
  formId: number;
  totalSubmissions: number;
  completionRate: number;
  averageTime: number;
  dropoffPoints: Array<{
    sectionId: number;
    questionId: number;
    dropoffRate: number;
  }>;
  popularFields: Array<{
    questionId: number;
    interactionCount: number;
  }>;
}

export interface QuestionAnalytics {
  questionId: number;
  responseCount: number;
  skipRate: number;
  averageResponseTime: number;
  validationErrors: number;
  popularAnswers?: Array<{
    value: string;
    count: number;
  }>;
}
