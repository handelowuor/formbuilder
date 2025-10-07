"use client";

import { useState } from "react";
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
import { Form, FormField } from "@/types/form-builder";

interface FormPreviewProps {
  form: Form;
  onBack: () => void;
}

export function FormPreview({ form, onBack }: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    (form.fields || []).forEach((field) => {
      const value = formData[field.id];

      // Required field validation
      if (field.required && (!value || value === "")) {
        newErrors[field.id] = `${field.label} is required`;
        return;
      }

      // Type-specific validation
      if (value) {
        field.validationRules.forEach((rule) => {
          switch (rule.type) {
            case "minLength":
              if (
                typeof value === "string" &&
                value.length < (rule.value as number)
              ) {
                newErrors[field.id] = rule.message;
              }
              break;
            case "maxLength":
              if (
                typeof value === "string" &&
                value.length > (rule.value as number)
              ) {
                newErrors[field.id] = rule.message;
              }
              break;
            case "pattern":
              if (typeof value === "string" && rule.value) {
                const regex = new RegExp(rule.value as string);
                if (!regex.test(value)) {
                  newErrors[field.id] = rule.message;
                }
              }
              break;
          }
        });

        // Number field validation
        if (field.type === "number") {
          const numValue = Number(value);
          if (field.minValue !== undefined && numValue < field.minValue) {
            newErrors[field.id] = `Value must be at least ${field.minValue}`;
          }
          if (field.maxValue !== undefined && numValue > field.maxValue) {
            newErrors[field.id] = `Value must be at most ${field.maxValue}`;
          }
        }
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

  const renderField = (field: FormField) => {
    const value = formData[field.id] || field.defaultValue || "";
    const error = errors[field.id];

    const fieldWrapper = (children: React.ReactNode) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="flex items-center space-x-1">
          <span>{field.label}</span>
          {field.required && <span className="text-red-500">*</span>}
        </Label>
        {field.helpText && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {field.helpText}
          </p>
        )}
        {children}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );

    switch (field.type) {
      case "text":
        return fieldWrapper(
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={error ? "border-red-500" : ""}
          />,
        );

      case "number":
        return fieldWrapper(
          <Input
            id={field.id}
            type="number"
            value={value}
            min={field.minValue}
            max={field.maxValue}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={error ? "border-red-500" : ""}
          />,
        );

      case "dropdown":
        return fieldWrapper(
          <Select
            value={value}
            onValueChange={(val) => handleFieldChange(field.id, val)}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {(field.picklistValues || []).map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>,
        );

      case "checkbox":
        return fieldWrapper(
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true}
              onCheckedChange={(checked) =>
                handleFieldChange(field.id, checked)
              }
            />
            <Label htmlFor={field.id} className="text-sm font-normal">
              {field.label}
            </Label>
          </div>,
        );

      case "date":
        return fieldWrapper(
          <Input
            id={field.id}
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={error ? "border-red-500" : ""}
          />,
        );

      case "lookup":
        return fieldWrapper(
          <div className="space-y-2">
            <Input
              id={field.id}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`Search ${field.lookupObject || "records"}...`}
              className={error ? "border-red-500" : ""}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lookup: {field.lookupObject} → {field.lookupField}
            </p>
          </div>,
        );

      case "formula":
        return fieldWrapper(
          <div className="space-y-2">
            <Input
              id={field.id}
              value="[Calculated Value]"
              disabled
              className="bg-slate-50 dark:bg-slate-800"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formula: {field.formula}
            </p>
          </div>,
        );

      default:
        return fieldWrapper(
          <Input
            id={field.id}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {(form.fields || []).map(renderField)}

                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={onBack}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Form
                  </Button>
                </div>
              </form>
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
                  <span className="font-medium">Total Fields:</span>
                  <span className="ml-2">{form.fields?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Required Fields:</span>
                  <span className="ml-2">
                    {(form.fields || []).filter((f) => f.required).length}
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
