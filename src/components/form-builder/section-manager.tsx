"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Move,
  ChevronDown,
  ChevronRight,
  Settings,
  Copy,
  Archive,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FormSection,
  FormQuestion,
  CreateSectionRequest,
  UpdateSectionRequest,
} from "@/types/form-builder";
import {
  sectionApi,
  questionApi,
  handleApiError,
} from "@/lib/api/form-builder-api";
import { QuestionManager } from "./question-manager";

interface SectionManagerProps {
  formId: number;
  sections: FormSection[];
  onSectionsChange: (sections: FormSection[]) => void;
  onError: (error: string) => void;
}

export function SectionManager({
  formId,
  sections,
  onSectionsChange,
  onError,
}: SectionManagerProps) {
  const { toast } = useToast();
  const [expandedSections, setExpandedSections] = useState<Set<number>>(
    new Set(),
  );
  const [editingSection, setEditingSection] = useState<FormSection | null>(
    null,
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sectionQuestions, setSectionQuestions] = useState<
    Record<number, FormQuestion[]>
  >({});
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load questions for expanded sections
  useEffect(() => {
    const loadQuestionsForSections = async () => {
      const questionsToLoad = Array.from(expandedSections).filter(
        (sectionId) => !sectionQuestions[sectionId],
      );

      if (questionsToLoad.length === 0) return;

      try {
        const questionPromises = questionsToLoad.map((sectionId) =>
          questionApi.listQuestions(formId, { sectionId }),
        );

        const responses = await Promise.all(questionPromises);
        const newQuestions: Record<number, FormQuestion[]> = {};

        responses.forEach((response, index) => {
          if (response.status === "success" && response.data) {
            newQuestions[questionsToLoad[index]] = response.data.items;
          }
        });

        setSectionQuestions((prev) => ({ ...prev, ...newQuestions }));
      } catch (error) {
        onError("Failed to load questions");
      }
    };

    loadQuestionsForSections();
  }, [expandedSections, formId, sectionQuestions, onError]);

  const toggleSection = (sectionId: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const handleCreateSection = async (data: CreateSectionRequest) => {
    setIsLoading(true);
    try {
      const response = await sectionApi.createSection(formId, data);
      if (response.status === "success" && response.data) {
        onSectionsChange([...sections, response.data]);
        setShowCreateDialog(false);
        toast({
          title: "Success",
          description: "Section created successfully!",
          variant: "default",
        });
      } else {
        const errorMsg = handleApiError(response);
        onError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = "Failed to create section";
      onError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSection = async (
    sectionId: number,
    data: UpdateSectionRequest,
  ) => {
    setIsLoading(true);
    try {
      const response = await sectionApi.updateSection(sectionId, data);
      if (response.status === "success" && response.data) {
        onSectionsChange(
          sections.map((s) => (s.id === sectionId ? response.data! : s)),
        );
        setEditingSection(null);
        toast({
          title: "Success",
          description: "Section updated successfully!",
          variant: "default",
        });
      } else {
        const errorMsg = handleApiError(response);
        onError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = "Failed to update section";
      onError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (
      !confirm(
        "Are you sure you want to archive this section? All questions in this section will also be archived. This action can be reversed later if needed.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await sectionApi.archiveSection(sectionId);
      if (response.status === "success") {
        onSectionsChange(sections.filter((s) => s.id !== sectionId));
        // Remove questions from state
        setSectionQuestions((prev) => {
          const newQuestions = { ...prev };
          delete newQuestions[sectionId];
          return newQuestions;
        });
        toast({
          title: "Success",
          description: "Section archived successfully!",
          variant: "default",
        });
      } else {
        const errorMsg = handleApiError(response);
        onError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMsg = "Failed to archive section";
      onError(errorMsg);
      toast({
        title: "Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionsChange = (
    sectionId: number,
    questions: FormQuestion[],
  ) => {
    setSectionQuestions((prev) => ({
      ...prev,
      [sectionId]: questions,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Form Sections</h3>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="form-builder-button-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Sections List */}
      <div className="space-y-3">
        {sections.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-12 h-12 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </div>
              <h4 className="font-medium mb-2">No sections yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first section to organize your form questions
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        ) : (
          sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <Card key={section.id} className="form-builder-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSection(section.id)}
                        className="p-1"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                      <div>
                        <CardTitle className="text-base">
                          {section.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Order: {section.order}
                          </Badge>
                          <Badge
                            variant={section.isActive ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {section.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {isClient
                              ? sectionQuestions[section.id]?.length || 0
                              : 0}{" "}
                            questions
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {section.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {section.description}
                    </p>
                  )}
                </CardHeader>

                {expandedSections.has(section.id) && (
                  <CardContent className="pt-0">
                    <Separator className="mb-4" />
                    <QuestionManager
                      formId={formId}
                      sectionId={section.id}
                      questions={sectionQuestions[section.id] || []}
                      onQuestionsChange={(questions) =>
                        handleQuestionsChange(section.id, questions)
                      }
                      onError={onError}
                    />
                  </CardContent>
                )}
              </Card>
            ))
        )}
      </div>

      {/* Create Section Dialog */}
      <SectionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateSection}
        isLoading={isLoading}
        title="Create New Section"
      />

      {/* Edit Section Dialog */}
      {editingSection && (
        <SectionDialog
          open={true}
          onOpenChange={() => setEditingSection(null)}
          onSubmit={(data) => handleUpdateSection(editingSection.id, data)}
          isLoading={isLoading}
          title="Edit Section"
          initialData={{
            name: editingSection.name,
            description: editingSection.description,
            order: editingSection.order,
            isActive: editingSection.isActive,
          }}
        />
      )}
    </div>
  );
}

// Section Dialog Component
interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateSectionRequest) => void;
  isLoading: boolean;
  title: string;
  initialData?: {
    name: string;
    description?: string;
    order: number;
    isActive: boolean;
  };
}

function SectionDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title,
  initialData,
}: SectionDialogProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || 1,
    isActive: initialData?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      order: formData.order,
      isActive: formData.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter section name"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="section-description">Description (Optional)</Label>
            <Textarea
              id="section-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter section description"
              className="mt-1"
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="section-order">Order</Label>
            <Input
              id="section-order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  order: parseInt(e.target.value) || 1,
                })
              }
              className="mt-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="section-active"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="section-active">Active Section</Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
