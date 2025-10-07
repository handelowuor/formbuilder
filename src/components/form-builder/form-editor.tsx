"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Eye, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormField,
  FormSection,
  FormQuestion,
  QuestionTemplate,
  CompanyRegion,
} from "@/types/form-builder";
import { FieldTypeSelector } from "./field-type-selector";
import { FieldConfigurationPanel } from "./field-configuration-panel";
import { FormPreview } from "./form-preview";
import { SectionManager } from "./section-manager";
import {
  sectionApi,
  questionApi,
  handleApiError,
} from "@/lib/api/form-builder-api";

interface FormEditorProps {
  form: Form;
  onBack: () => void;
  onSave: (form: Form) => void;
  selectedRegion?: number;
  availableTemplates?: QuestionTemplate[];
}

export function FormEditor({
  form,
  onBack,
  onSave,
  selectedRegion,
  availableTemplates = [],
}: FormEditorProps) {
  const [currentForm, setCurrentForm] = useState<Form>({
    ...form,
    fields: form.fields || [],
  });
  const [selectedField, setSelectedField] = useState<FormField | null>(null);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sections when component mounts
  useEffect(() => {
    loadSections();
  }, [form.id]);

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const response = await sectionApi.listSections(form.id);
      if (response.status === "success" && response.data) {
        setSections(response.data);
      } else {
        setError(handleApiError(response));
      }
    } catch (err) {
      setError("Failed to load sections");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormUpdate = (updates: Partial<Form>) => {
    setCurrentForm((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSectionsChange = (updatedSections: FormSection[]) => {
    setSections(updatedSections);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
  };

  const handleAddField = (fieldType: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: fieldType as any,
      label: `New ${fieldType} Field`,
      apiName: `new_${fieldType}_field_${Date.now()}`,
      required: false,
      validationRules: [],
      dependencies: [],
    };

    setCurrentForm((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
      updatedAt: new Date(),
    }));

    setSelectedField(newField);
    setShowFieldSelector(false);
  };

  const handleFieldUpdate = (updatedField: FormField) => {
    setCurrentForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === updatedField.id ? updatedField : field,
      ),
      updatedAt: new Date(),
    }));
    setSelectedField(updatedField);
  };

  const handleFieldDelete = (fieldId: string) => {
    setCurrentForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
      updatedAt: new Date(),
    }));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const handleSave = () => {
    onSave(currentForm);
  };

  const handlePublish = () => {
    const publishedForm = {
      ...currentForm,
      status: "active" as const,
      updatedAt: new Date().toISOString(),
    };
    onSave(publishedForm);
  };

  if (showPreview) {
    return (
      <FormPreview form={currentForm} onBack={() => setShowPreview(false)} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {currentForm.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant={
                      currentForm.status === "active" ? "default" : "secondary"
                    }
                  >
                    {currentForm.status}
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {sections.length} sections
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handlePublish}>
                Publish Form
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Form Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form-name">Form Name</Label>
                  <Input
                    id="form-name"
                    value={currentForm.name}
                    onChange={(e) => handleFormUpdate({ name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="form-description">Description</Label>
                  <Textarea
                    id="form-description"
                    value={currentForm.description || ""}
                    onChange={(e) =>
                      handleFormUpdate({ description: e.target.value })
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Form Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sections:</span>
                      <Badge variant="outline">{sections.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge
                        variant={
                          currentForm.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {currentForm.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Canvas - Section Manager */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="text-lg">Form Structure</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Loading sections...
                    </p>
                  </div>
                ) : (
                  <SectionManager
                    formId={currentForm.id}
                    sections={sections}
                    onSectionsChange={handleSectionsChange}
                    onError={handleError}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Field Type Selector Modal */}
      {showFieldSelector && (
        <FieldTypeSelector
          onSelect={handleAddField}
          onClose={() => setShowFieldSelector(false)}
        />
      )}

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Question Library</h2>
              <Button
                variant="ghost"
                onClick={() => setShowTemplateLibrary(false)}
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                  onClick={() => {
                    const newField: FormField = {
                      id: Date.now().toString(),
                      type: template.answerType,
                      label: template.label,
                      apiName: template.tkey,
                      required: false,
                      validationRules: [],
                      dependencies: [],
                      templateId: template.id,
                      isFromTemplate: true,
                      helpText: template.helperText,
                    };

                    setCurrentForm((prev) => ({
                      ...prev,
                      fields: [...prev.fields, newField],
                      updatedAt: new Date(),
                    }));

                    setSelectedField(newField);
                    setShowTemplateLibrary(false);
                  }}
                >
                  <h3 className="font-medium">{template.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {template.answerType}
                  </p>
                  {template.helperText && (
                    <p className="text-xs text-slate-400 mt-1">
                      {template.helperText}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
