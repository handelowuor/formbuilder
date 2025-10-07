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
  TestTube,
  Loader2,
  Database,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FormQuestion,
  QuestionTemplate,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  AnswerType,
  PicklistValue,
  ApiTestResponse,
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
  const [deletingQuestion, setDeletingQuestion] = useState<FormQuestion | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Prevent hydration mismatch by ensuring consistent initial state
  const safeQuestions = isClient ? questions : [];

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
        onQuestionsChange([...safeQuestions, response.data]);
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
          safeQuestions.map((q) => (q.id === questionId ? response.data! : q)),
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

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;

    setIsLoading(true);
    try {
      const response = await questionApi.archiveQuestion(deletingQuestion.id);
      if (response.status === "success") {
        onQuestionsChange(
          safeQuestions.filter((q) => q.id !== deletingQuestion.id),
        );
        setShowDeleteDialog(false);
        setDeletingQuestion(null);
        setSuccessMessage(
          `Question "${deletingQuestion.label}" has been archived successfully!`,
        );
        setShowSuccessDialog(true);
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

  const openDeleteDialog = (question: FormQuestion) => {
    setDeletingQuestion(question);
    setShowDeleteDialog(true);
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
        onQuestionsChange(safeQuestions.filter((q) => q.id !== questionId));
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
        onQuestionsChange([...safeQuestions, response.data]);
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
        ) : safeQuestions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No questions in this section</p>
            <p className="text-sm">Add questions to start building your form</p>
          </div>
        ) : (
          safeQuestions
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
                      onClick={() => openDeleteDialog(question)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive &quot;{deletingQuestion?.label}
              &quot;? This action can be reversed later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingQuestion(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Archiving..." : "Archive Question"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Success</span>
            </AlertDialogTitle>
            <AlertDialogDescription>{successMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
    dbColumn: initialData?.dbColumn || "",
    apiEndpoint: initialData?.apiEndpoint || "",
  });

  const [picklistValues, setPicklistValues] = useState<PicklistValue[]>(
    initialData?.picklistValues || [],
  );
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState<ApiTestResponse | null>(
    null,
  );
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    const questionData: CreateQuestionRequest = {
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
      storage: {
        ...initialData?.storage,
        dbColumn: formData.dbColumn.trim() || undefined,
        apiEndpoint: formData.apiEndpoint.trim() || undefined,
      },
      options: picklistValues.length > 0 ? picklistValues : undefined,
    };

    onSubmit(questionData);
  };

  const handleTestApi = async () => {
    if (!formData.apiEndpoint.trim()) return;

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const response = await templateApi.testApiEndpoint(formData.apiEndpoint);
      if (response.status === "success" && response.data) {
        setApiTestResult(response.data);
        // Auto-populate options if API returns data
        if (response.data.data && Array.isArray(response.data.data)) {
          const apiOptions: PicklistValue[] = response.data.data.map(
            (item: any, index: number) => ({
              id: `api-${index}`,
              label: item.label || item.name || String(item.value),
              value: String(item.value || item.id),
              order: index + 1,
              isActive: true,
              isDefault: false,
            }),
          );
          setPicklistValues(apiOptions);
        }
      } else {
        setApiTestResult({
          success: false,
          error: response.message || "API test failed",
        });
      }
    } catch (error) {
      setApiTestResult({
        success: false,
        error: "Failed to test API endpoint",
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return;

    const newOption: PicklistValue = {
      id: `opt-${Date.now()}`,
      label: newOptionLabel.trim(),
      value: newOptionValue.trim(),
      order: picklistValues.length + 1,
      isActive: true,
      isDefault: false,
      usageCount: 0,
    };

    setPicklistValues([...picklistValues, newOption]);
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleRemoveOption = (optionId: string) => {
    setPicklistValues(picklistValues.filter((opt) => opt.id !== optionId));
  };

  const handleToggleOptionActive = (optionId: string) => {
    setPicklistValues(
      picklistValues.map((opt) =>
        opt.id === optionId ? { ...opt, isActive: !opt.isActive } : opt,
      ),
    );
  };

  const handleSetDefaultOption = (optionId: string) => {
    setPicklistValues(
      picklistValues.map((opt) => ({
        ...opt,
        isDefault: opt.id === optionId,
      })),
    );
  };

  const requiresOptions = ["dropdown", "radio", "checkbox"].includes(
    formData.answerType,
  );

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
          {/* Database Column */}
          <div>
            <Label htmlFor="question-db-column">
              Database Column (Optional)
            </Label>
            <Input
              id="question-db-column"
              value={formData.dbColumn}
              onChange={(e) =>
                setFormData({ ...formData, dbColumn: e.target.value })
              }
              placeholder="e.g., customer_first_name"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Specify the database column where this field's data will be stored
            </p>
          </div>

          {/* API Endpoint for Options */}
          {requiresOptions && (
            <div>
              <Label htmlFor="question-api-endpoint">
                API Endpoint (Optional)
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="question-api-endpoint"
                  value={formData.apiEndpoint}
                  onChange={(e) =>
                    setFormData({ ...formData, apiEndpoint: e.target.value })
                  }
                  placeholder="https://api.example.com/options"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestApi}
                  disabled={!formData.apiEndpoint.trim() || isTestingApi}
                >
                  {isTestingApi ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <TestTube className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {apiTestResult && (
                <div
                  className={`mt-2 p-2 rounded text-sm ${
                    apiTestResult.success
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {apiTestResult.success ? (
                    <div>
                      <div className="flex items-center gap-1 font-medium">
                        <CheckCircle className="w-3 h-3" />
                        API Test Successful
                      </div>
                      <div className="text-xs mt-1">
                        Response time: {apiTestResult.responseTime}ms | Status:{" "}
                        {apiTestResult.statusCode}
                      </div>
                      {apiTestResult.data && (
                        <div className="text-xs mt-1">
                          Found {apiTestResult.data.length} options
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3" />
                        API Test Failed
                      </div>
                      <div className="text-xs mt-1">{apiTestResult.error}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Manual Options */}
          {requiresOptions && (
            <div>
              <Label>Answer Options</Label>
              <div className="mt-2 space-y-2">
                {/* Add New Option */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Option label"
                    value={newOptionLabel}
                    onChange={(e) => setNewOptionLabel(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Option value"
                    value={newOptionValue}
                    onChange={(e) => setNewOptionValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Options List */}
                {picklistValues.length > 0 && (
                  <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                    {picklistValues.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          option.isActive
                            ? "bg-background"
                            : "bg-muted opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleOptionActive(option.id)}
                          >
                            {option.isActive ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                          </Button>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {option.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Value: {option.value}
                              {option.usageCount !== undefined &&
                                option.usageCount > 0 && (
                                  <span className="ml-2">
                                    Used {option.usageCount} times
                                  </span>
                                )}
                            </div>
                          </div>
                          {option.isDefault && (
                            <Badge variant="secondary" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultOption(option.id)}
                            disabled={option.isDefault}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(option.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {picklistValues.length === 0 && !formData.apiEndpoint && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No options added yet. Add options manually or configure an
                    API endpoint.
                  </div>
                )}
              </div>
            </div>
          )}
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
