"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Move,
  Copy,
  Library,
  Settings,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Archive,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FormQuestion,
  QuestionTemplate,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  AnswerType,
} from "@/types/form-builder";
import {
  questionApi,
  templateApi,
  sectionApi,
  handleApiError,
} from "@/lib/api/form-builder-api";

interface FormSection {
  id: number;
  name: string;
  description?: string;
  order: number;
}

interface QuestionManagerProps {
  formId: number;
  sectionId: number;
  questions: FormQuestion[];
  onQuestionsChange: (questions: FormQuestion[]) => void;
  onError: (error: string) => void;
}

export function QuestionManager({
  formId,
  sectionId,
  questions = [],
  onQuestionsChange,
  onError,
}: QuestionManagerProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FormQuestion | null>(
    null,
  );
  const [movingQuestion, setMovingQuestion] = useState<FormQuestion | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load templates when library is opened
  useEffect(() => {
    if (showTemplateLibrary && isClient) {
      loadTemplates();
    }
  }, [showTemplateLibrary, isClient]);

  // Load sections when move dialog is opened
  useEffect(() => {
    if (showMoveDialog && isClient) {
      loadSections();
    }
  }, [showMoveDialog, isClient]);

  const loadTemplates = async () => {
    try {
      const response = await templateApi.listTemplates({
        page: 1,
        limit: 100,
        q: templateSearch,
      });
      if (response.status === "success" && response.data) {
        setTemplates(response.data.rows);
      }
    } catch (error) {
      onError("Failed to load templates");
    }
  };

  const loadSections = async () => {
    try {
      const response = await sectionApi.listSections(formId);
      if (response.status === "success" && response.data) {
        setSections(
          response.data.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            order: s.order,
          })),
        );
      }
    } catch (error) {
      onError("Failed to load sections");
    }
  };

  const handleCreateQuestion = async (data: CreateQuestionRequest) => {
    setIsLoading(true);
    try {
      const response = await questionApi.createQuestion(formId, {
        ...data,
        sectionId,
        status: "draft",
        etag: `etag-${Date.now()}`,
      });
      if (response.status === "success" && response.data) {
        onQuestionsChange([...questions, response.data]);
        setShowCreateDialog(false);
        toast({
          title: "Success",
          description: "Question created successfully!",
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
      const errorMsg = "Failed to create question";
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

  const handleUpdateQuestion = async (
    questionId: number,
    data: UpdateQuestionRequest,
  ) => {
    setIsLoading(true);
    try {
      const response = await questionApi.updateQuestion(questionId, {
        ...data,
        etag: `etag-${Date.now()}`,
      });
      if (response.status === "success" && response.data) {
        onQuestionsChange(
          questions.map((q) => (q.id === questionId ? response.data! : q)),
        );
        setEditingQuestion(null);
        toast({
          title: "Success",
          description: "Question updated successfully!",
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
      const errorMsg = "Failed to update question";
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

  const handleDeleteQuestion = async (questionId: number) => {
    if (
      !confirm(
        "Are you sure you want to archive this question? This action can be reversed later if needed.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await questionApi.archiveQuestion(questionId);
      if (response.status === "success") {
        onQuestionsChange(questions.filter((q) => q.id !== questionId));
        toast({
          title: "Success",
          description: "Question archived successfully!",
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
      const errorMsg = "Failed to archive question";
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

  const handleMoveQuestion = async (
    questionId: number,
    targetSectionId: number,
  ) => {
    setIsLoading(true);
    try {
      const response = await questionApi.moveQuestion(
        questionId,
        targetSectionId,
      );
      if (response.status === "success") {
        // Remove from current section
        onQuestionsChange(questions.filter((q) => q.id !== questionId));
        setShowMoveDialog(false);
        setMovingQuestion(null);
        toast({
          title: "Success",
          description: "Question moved successfully!",
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
      const errorMsg = "Failed to move question";
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

  const handleCopyFromTemplate = async (templateId: number) => {
    setIsLoading(true);
    try {
      const response = await questionApi.copyQuestionFromTemplate(
        formId,
        sectionId,
        templateId,
      );
      if (response.status === "success" && response.data) {
        onQuestionsChange([...questions, response.data]);
        setShowTemplateLibrary(false);
        toast({
          title: "Success",
          description: "Question added from template successfully!",
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
      const errorMsg = "Failed to copy question from template";
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

  const getAnswerTypeColor = (type: AnswerType) => {
    switch (type) {
      case "text":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "number":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "dropdown":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "checkbox":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "date":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Questions</h4>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTemplateLibrary(true)}
          >
            <Library className="w-4 h-4 mr-2" />
            From Library
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-2">
        {!isClient ? (
          <div className="text-center py-6 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading questions...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No questions in this section</p>
            <p className="text-sm">Add questions to start building your form</p>
          </div>
        ) : (
          questions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <Card
                key={question.id}
                className="p-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-sm font-medium">
                      {question.order}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium">{question.label}</h5>
                        <Badge
                          className={getAnswerTypeColor(question.answerType)}
                        >
                          {question.answerType}
                        </Badge>
                        {question.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        {question.questionTemplateId && (
                          <Badge variant="outline" className="text-xs">
                            Template
                          </Badge>
                        )}
                      </div>
                      {question.helperText && (
                        <p className="text-sm text-muted-foreground">
                          {question.helperText}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingQuestion(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMovingQuestion(question);
                        setShowMoveDialog(true);
                      }}
                    >
                      <Move className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
        )}
      </div>

      {/* Create Question Dialog */}
      <QuestionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateQuestion}
        isLoading={isLoading}
        title="Create New Question"
      />

      {/* Edit Question Dialog */}
      {editingQuestion && (
        <QuestionDialog
          open={true}
          onOpenChange={() => setEditingQuestion(null)}
          onSubmit={(data) => handleUpdateQuestion(editingQuestion.id, data)}
          isLoading={isLoading}
          title="Edit Question"
          initialData={editingQuestion}
        />
      )}

      {/* Template Library Dialog */}
      <Dialog open={showTemplateLibrary} onOpenChange={setShowTemplateLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Question Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {templates.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <Library className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Loading question templates...
                  </p>
                </div>
              ) : (
                templates
                  .filter(
                    (template) =>
                      template.label
                        .toLowerCase()
                        .includes(templateSearch.toLowerCase()) ||
                      template.tkey
                        .toLowerCase()
                        .includes(templateSearch.toLowerCase()),
                  )
                  .map((template) => (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleCopyFromTemplate(template.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{template.label}</h4>
                          <Badge
                            className={getAnswerTypeColor(template.answerType)}
                          >
                            {template.answerType}
                          </Badge>
                        </div>
                        {template.helperText && (
                          <p className="text-sm text-muted-foreground">
                            {template.helperText}
                          </p>
                        )}
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {template.tkey}
                          </Badge>
                          {template.category && (
                            <Badge variant="secondary" className="text-xs">
                              {template.category}
                            </Badge>
                          )}
                          {template.defaultValue && (
                            <Badge variant="outline" className="text-xs">
                              Default: {template.defaultValue}
                            </Badge>
                          )}
                        </div>
                        {template.storageMetadata && (
                          <div className="text-xs text-muted-foreground">
                            Storage:{" "}
                            {template.storageMetadata.encrypted
                              ? "Encrypted"
                              : "Plain"}
                            {template.storageMetadata.indexed && ", Indexed"}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move Question Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Move Question</DialogTitle>
          </DialogHeader>
          {movingQuestion && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium">{movingQuestion.label}</h4>
                <p className="text-sm text-muted-foreground">
                  Moving from current section
                </p>
              </div>
              <div>
                <Label>Select Target Section</Label>
                <Select
                  onValueChange={(value) => {
                    const targetSectionId = parseInt(value);
                    if (targetSectionId !== sectionId) {
                      handleMoveQuestion(movingQuestion.id, targetSectionId);
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections
                      .filter((s) => s.id !== sectionId)
                      .map((section) => (
                        <SelectItem
                          key={section.id}
                          value={section.id.toString()}
                        >
                          {section.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Question Dialog Component
interface QuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateQuestionRequest) => void;
  isLoading: boolean;
  title: string;
  initialData?: FormQuestion;
}

function QuestionDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title,
  initialData,
}: QuestionDialogProps) {
  const [formData, setFormData] = useState({
    tkey: initialData?.tkey || "",
    label: initialData?.label || "",
    helperText: initialData?.helperText || "",
    answerType: (initialData?.answerType || "text") as AnswerType,
    required: initialData?.required || false,
    order: initialData?.order || 1,
    visibleIfJson: initialData?.visibleIfJson || {},
    optionsApi: initialData?.optionsApi || "",
    dependsOn: initialData?.dependsOn || [],
    status: initialData?.status || "draft",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    onSubmit({
      tkey:
        formData.tkey.trim() ||
        formData.label.toLowerCase().replace(/\s+/g, "_"),
      label: formData.label.trim(),
      helperText: formData.helperText.trim() || undefined,
      answerType: formData.answerType,
      required: formData.required,
      order: formData.order,
      visibleIfJson: formData.visibleIfJson,
      optionsApi: formData.optionsApi.trim() || undefined,
      dependsOn: formData.dependsOn,
      status: formData.status,
      sectionId: 0, // Will be set by parent
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
            <Label htmlFor="question-label">Question Label</Label>
            <Input
              id="question-label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="Enter question label"
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="question-tkey">API Key (Optional)</Label>
            <Input
              id="question-tkey"
              value={formData.tkey}
              onChange={(e) =>
                setFormData({ ...formData, tkey: e.target.value })
              }
              placeholder="Auto-generated from label"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="question-type">Answer Type</Label>
            <Select
              value={formData.answerType}
              onValueChange={(value) =>
                setFormData({ ...formData, answerType: value as AnswerType })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="lookup">Lookup</SelectItem>
                <SelectItem value="formula">Formula</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="question-help">Help Text (Optional)</Label>
            <Textarea
              id="question-help"
              value={formData.helperText}
              onChange={(e) =>
                setFormData({ ...formData, helperText: e.target.value })
              }
              placeholder="Enter help text"
              className="mt-1"
              rows={2}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="question-required"
              checked={formData.required}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, required: checked })
              }
            />
            <Label htmlFor="question-required">Required Question</Label>
          </div>
          <div>
            <Label htmlFor="question-options-api">Options API (Optional)</Label>
            <Input
              id="question-options-api"
              value={formData.optionsApi}
              onChange={(e) =>
                setFormData({ ...formData, optionsApi: e.target.value })
              }
              placeholder="API endpoint for dynamic options"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="question-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.label.trim()}
            >
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
