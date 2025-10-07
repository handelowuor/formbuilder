# Multi-Form Questions Documentation

## Overview

The Dynamic Form Builder now supports questions that can be used across multiple forms, enabling better consistency and reusability across different form types and regions.

## Key Features

### 1. Question Templates
- **Reusable Definitions**: Create question templates that can be used across multiple forms
- **Regional Availability**: Control which regions can access specific templates
- **Global Templates**: Mark templates as globally available across all regions
- **Categorization**: Organize templates by category and tags for easy discovery

### 2. Multi-Country Support
- **Country Selection**: Support for Uganda (UG) and Kenya (KE)
- **Regional Management**: Each country can have multiple regions
- **Localized Templates**: Templates can be region-specific or global
- **Cross-Region Cloning**: Clone templates between regions when needed

### 3. Shared Questions
- **Template-Based Questions**: Questions created from templates maintain a link to the original
- **Form-Specific Customizations**: Override labels, validation, and requirements per form
- **Usage Tracking**: See which forms use a specific question template
- **Synchronized Updates**: Option to propagate template changes to all using forms

## Implementation Guide

### Backend API Endpoints

#### Question Templates
```
GET /api/v1/question-templates
- List available templates with filtering
- Supports regionId, category, answerType, isGlobal filters

POST /api/v1/question-templates
- Create new question template
- Specify availableRegions array

PUT /api/v1/question-templates/{id}
- Update template definition
- Can propagate changes to forms using the template

GET /api/v1/question-templates/{id}/usage
- Get list of forms using this template
```

#### Multi-Form Questions
```
POST /api/v1/forms/{formId}/questions/add-existing
- Add existing template to form
- Support customizations (label, required, validation)

DELETE /api/v1/forms/{formId}/questions/{questionId}/remove
- Remove question from form (keeps template)

GET /api/v1/questions/{questionId}/usage
- Get usage across all forms

POST /api/v1/questions/{questionId}/sync
- Sync changes across all forms using this question
```

#### Regions and Countries
```
GET /api/v1/regions
- Get all available regions

GET /api/v1/regions?country={countryCode}
- Get regions for specific country
```

### Frontend Implementation

#### Enhanced Types
```typescript
// Multi-country support
export type CountryCode = "UG" | "KE";

export interface CompanyRegion {
  id: number;
  name: string;
  countryCode: CountryCode;
  isActive: boolean;
}

// Enhanced question template
export interface QuestionTemplate {
  id: number;
  tkey: string;
  label: string;
  answerType: AnswerType;
  availableRegions: number[];
  isGlobal: boolean;
  category?: string;
  tags?: string[];
}

// Question usage tracking
export interface FormQuestionUsage {
  formId: number;
  formName: string;
  sectionId: number;
  sectionName: string;
  order: number;
  required: boolean;
  customLabel?: string;
  isActive: boolean;
}
```

#### Form Builder Dashboard
- **Country/Region Selector**: Dropdown to switch between countries and regions
- **Template Library**: Access to shared question templates
- **Usage Analytics**: Statistics on template usage across forms

#### Form Editor Enhancements
- **Add from Library**: Button to add questions from template library
- **Template Indicator**: Visual indication when a field comes from a template
- **Usage Information**: Show which other forms use the same question

#### Field Configuration Panel
- **Usage Tab**: New tab showing template information and cross-form usage
- **Customization Options**: Form-specific overrides for template questions
- **Sync Warnings**: Alerts when changes might affect other forms

## Usage Workflows

### Creating a Shared Question
1. Create question template in the Question Library
2. Specify which regions can access it
3. Add categories and tags for organization
4. Set as global if needed across all regions

### Adding Shared Question to Form
1. In Form Editor, click "Add from Library"
2. Browse available templates for current region
3. Select template and customize as needed
4. Question maintains link to original template

### Managing Template Changes
1. Update template in Question Library
2. Choose whether to propagate changes to existing forms
3. Review affected forms before applying changes
4. Forms can override template changes if needed

### Cross-Region Template Management
1. Clone templates between regions when expanding
2. Maintain separate versions for region-specific requirements
3. Use global templates for universal questions

## Best Practices

### Template Design
- **Descriptive Names**: Use clear, descriptive labels for templates
- **Consistent Naming**: Follow naming conventions across regions
- **Appropriate Categories**: Organize templates by business domain
- **Minimal Validation**: Keep template validation generic, customize per form

### Regional Management
- **Region-Specific Templates**: Create templates for local requirements
- **Global Standards**: Use global templates for universal data points
- **Regular Reviews**: Periodically review template usage and consolidate

### Form Development
- **Template First**: Check template library before creating new questions
- **Consistent Customization**: Apply similar customizations across forms
- **Document Changes**: Track why form-specific overrides were needed

## Error Handling

### Common Error Codes
- `QUESTION_TEMPLATE_REGION_UNAVAILABLE`: Template not available for current region
- `TEMPLATE_CLONE_FAILED`: Failed to clone template to target region
- `QUESTION_IN_USE`: Warning when modifying templates used in multiple forms
- `REGION_ACCESS_DENIED`: User doesn't have access to selected region

### User Experience
- **Clear Warnings**: Show impact of template changes before applying
- **Graceful Fallbacks**: Handle region switches gracefully
- **Usage Indicators**: Visual cues for shared vs. form-specific questions

## Migration Guide

### Existing Forms
1. **Identify Common Questions**: Review existing forms for duplicate questions
2. **Create Templates**: Convert common questions to templates
3. **Update Forms**: Replace form-specific questions with template references
4. **Test Thoroughly**: Ensure all customizations are preserved

### Data Migration
```sql
-- Example migration to convert existing questions to templates
INSERT INTO question_templates (tkey, label, answer_type, available_regions)
SELECT DISTINCT tkey, label, answer_type, ARRAY[company_region_id]
FROM form_questions 
WHERE tkey IN (
  SELECT tkey 
  FROM form_questions 
  GROUP BY tkey 
  HAVING COUNT(DISTINCT form_id) > 1
);
```

## Performance Considerations

### Caching Strategy
- **Template Cache**: Cache frequently used templates
- **Region Cache**: Cache region data for quick switching
- **Usage Cache**: Cache usage statistics for dashboard

### Database Optimization
- **Indexes**: Add indexes on template tkey and region relationships
- **Partitioning**: Consider partitioning by region for large datasets
- **Archival**: Archive old template versions to maintain performance

## Security Considerations

### Access Control
- **Region-Based Access**: Users can only access templates for their regions
- **Template Permissions**: Control who can create/modify global templates
- **Audit Trail**: Track all template changes and usage

### Data Privacy
- **Regional Compliance**: Ensure templates comply with local data regulations
- **Cross-Border Data**: Handle cross-region template sharing carefully
- **Sensitive Data**: Mark templates containing sensitive information

## Monitoring and Analytics

### Key Metrics
- **Template Usage**: Track which templates are most/least used
- **Regional Distribution**: Monitor template usage across regions
- **Form Efficiency**: Measure time saved by using templates
- **Error Rates**: Track template-related errors and issues

### Reporting
- **Usage Reports**: Regular reports on template adoption
- **Performance Reports**: Impact of shared questions on form creation time
- **Compliance Reports**: Ensure regional compliance requirements are met
