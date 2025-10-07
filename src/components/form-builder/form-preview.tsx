"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Send, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormField,
  FormSection,
  FormQuestion,
} from "@/types/form-builder";
import { sectionApi, questionApi } from "@/lib/api/form-builder-api";

interface FormPreviewProps {
  form: Form;
  onBack: () => void;
}

export function FormPreview({ form, onBack }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sections, setSections] = useState<FormSection[]>([]);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load form sections and questions
  useEffect(() => {
    const loadFormData = async () => {
      setIsLoading(true);
      try {
        // Load sections
        const sectionsResponse = await sectionApi.listSections(form.id);
        if (sectionsResponse.status === "success" && sectionsResponse.data) {
          setSections(sectionsResponse.data);

          // Load all questions for all sections
          const questionPromises = sectionsResponse.data.map((section) =>
            questionApi.listQuestions(form.id, { sectionId: section.id }),
          );

          const questionResponses = await Promise.all(questionPromises);
          const allQuestions: FormQuestion[] = [];

          questionResponses.forEach((response) => {
            if (response.status === "success" && response.data) {
              allQuestions.push(...response.data.items);
            }
          });

          setQuestions(allQuestions.sort((a, b) => a.order - b.order));
        }
      } catch (error) {
        console.error("Failed to load form data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [form.id]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    questions.forEach((question) => {
      const value = formData[question.id];

      // Required field validation
      if (question.required && (!value || value === "")) {
        newErrors[question.id] = `${question.label} is required`;
        return;
      }

      // Type-specific validation
      if (value && question.validation) {
        // Handle validation rules from question.validation object
        Object.entries(question.validation).forEach(
          ([key, validationValue]) => {
            switch (key) {
              case "minLength":
                if (
                  typeof value === "string" &&
                  value.length < (validationValue as number)
                ) {
                  newErrors[question.id] =
                    `Minimum length is ${validationValue}`;
                }
                break;
              case "maxLength":
                if (
                  typeof value === "string" &&
                  value.length > (validationValue as number)
                ) {
                  newErrors[question.id] =
                    `Maximum length is ${validationValue}`;
                }
                break;
              case "pattern":
                if (typeof value === "string" && validationValue) {
                  const regex = new RegExp(validationValue as string);
                  if (!regex.test(value)) {
                    newErrors[question.id] = "Invalid format";
                  }
                }
                break;
            }
          },
        );
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      alert("Form submitted successfully!");
    }
  };

  const renderQuestion = (question: FormQuestion) => {
    const value = formData[question.id] || question.defaultValue || "";
    const error = errors[question.id];

    const questionWrapper = (children: React.ReactNode) => (
      <div key={question.id} className="space-y-2">
        <Label
          htmlFor={question.id.toString()}
          className="flex items-center space-x-1"
        >
          <span>{question.label}</span>
          {question.required && <span className="text-red-500">*</span>}
        </Label>
        {question.helperText && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {question.helperText}
          </p>
        )}
        {children}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );

    switch (question.answerType) {
      case "text":
        return questionWrapper(
          <Input
            id={question.id.toString()}
            value={value}
            onChange={(e) =>
              handleFieldChange(question.id.toString(), e.target.value)
            }
            className={error ? "border-red-500" : ""}
          />,
        );

      case "textarea":
        return questionWrapper(
          <Textarea
            id={question.id.toString()}
            value={value}
            onChange={(e) =>
              handleFieldChange(question.id.toString(), e.target.value)
            }
            className={error ? "border-red-500" : ""}
            rows={3}
          />,
        );

      case "number":
        return questionWrapper(
          <Input
            id={question.id.toString()}
            type="number"
            value={value}
            onChange={(e) =>
              handleFieldChange(question.id.toString(), e.target.value)
            }
            className={error ? "border-red-500" : ""}
          />,
        );

      case "dropdown":
        return questionWrapper(
          <Select
            value={value}
            onValueChange={(val) =>
              handleFieldChange(question.id.toString(), val)
            }
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(question.options || []).map((option, index) => (
                <SelectItem key={index} value={option.value || option}>
                  {option.label || option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,
        );

      case "radio":
        return questionWrapper(
          <div className="space-y-2">
            {(question.options || []).map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${question.id}_${index}`}
                  name={question.id.toString()}
                  value={option.value || option}
                  checked={value === (option.value || option)}
                  onChange={(e) =>
                    handleFieldChange(question.id.toString(), e.target.value)
                  }
                  className="w-4 h-4"
                />
                <Label
                  htmlFor={`${question.id}_${index}`}
                  className="text-sm font-normal"
                >
                  {option.label || option}
                </Label>
              </div>
            ))}
          </div>,
        );

      case "checkbox":
        return questionWrapper(
          <div className="flex items-center space-x-2">
            <Checkbox
              id={question.id.toString()}
              checked={value === true}
              onCheckedChange={(checked) =>
                handleFieldChange(question.id.toString(), checked)
              }
            />
            <Label
              htmlFor={question.id.toString()}
              className="text-sm font-normal"
            >
              {question.label}
            </Label>
          </div>,
        );

      case "date":
        return questionWrapper(
          <Input
            id={question.id.toString()}
            type="date"
            value={value}
            onChange={(e) =>
              handleFieldChange(question.id.toString(), e.target.value)
            }
            className={error ? "border-red-500" : ""}
          />,
        );

      case "lookup":
        return questionWrapper(
          <div className="space-y-2">
            <Input
              id={question.id.toString()}
              value={value}
              onChange={(e) =>
                handleFieldChange(question.id.toString(), e.target.value)
              }
              placeholder="Search records..."
              className={error ? "border-red-500" : ""}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lookup field
            </p>
          </div>,
        );

      case "formula":
        return questionWrapper(
          <div className="space-y-2">
            <Input
              id={question.id.toString()}
              value="[Calculated Value]"
              disabled
              className="bg-slate-50 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formula field (calculated automatically)
            </p>
          </div>,
        );

      default:
        return questionWrapper(
          <Input
            id={question.id.toString()}
            value={value}
            onChange={(e) =>
              handleFieldChange(question.id.toString(), e.target.value)
            }
            className={error ? "border-red-500" : ""}
          />,
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Editor
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Form Preview
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview Mode
                  </Badge>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {form.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{form.name}</CardTitle>
              {form.description && (
                <p className="text-slate-600 dark:text-slate-400">
                  {form.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Loading form preview...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {sections.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-slate-500 dark:text-slate-400">
                        No sections found in this form. Add sections and
                        questions to see the preview.
                      </p>
                    </div>
                  ) : (
                    sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const sectionQuestions = questions
                          .filter((q) => q.sectionId === section.id)
                          .sort((a, b) => a.order - b.order);

                        if (sectionQuestions.length === 0) return null;

                        return (
                          <div key={section.id} className="space-y-6">
                            <div className="border-l-4 border-primary pl-4">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {section.name}
                              </h3>
                              {section.description && (
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  {section.description}
                                </p>
                              )}
                            </div>
                            <div className="space-y-4 ml-4">
                              {sectionQuestions.map(renderQuestion)}
                            </div>
                          </div>
                        );
                      })
                  )}

                  {sections.length > 0 && questions.length > 0 && (
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={onBack}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        <Send className="w-4 h-4 mr-2" />
                        Submit Form
                      </Button>
                    </div>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          {/* Form Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Form Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Sections:</span>
                  <span className="ml-2">{sections.length}</span>
                </div>
                <div>
                  <span className="font-medium">Total Questions:</span>
                  <span className="ml-2">{questions.length}</span>
                </div>
                <div>
                  <span className="font-medium">Required Questions:</span>
                  <span className="ml-2">
                    {questions.filter((q) => q.required).length}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge
                    variant={
                      form.status === "published" ? "default" : "secondary"
                    }
                    className="ml-2"
                  >
                    {form.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span>
                  <span className="ml-2">
                    {new Date(form.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
