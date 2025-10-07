"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Tag,
  ArrowLeft,
  Grid,
  List,
  BookOpen,
  Globe,
  Building,
  User,
  Phone,
  Calendar,
  Hash,
  Type,
  CheckSquare,
  ChevronDown,
  Archive,
  MoreVertical,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  QuestionTemplate,
  AnswerType,
  CountryCode,
} from "@/types/form-builder";
import { useToast } from "@/components/ui/use-toast";
import { templateApi, handleApiError } from "@/lib/api/form-builder-api";

interface QuestionLibraryProps {
  onBack: () => void;
  selectedCountry?: CountryCode;
  onSelectTemplate?: (template: QuestionTemplate) => void;
}

export function QuestionLibrary({
  onBack,
  selectedCountry = "UG",
  onSelectTemplate,
}: QuestionLibraryProps) {
  const [templates, setTemplates] = useState<QuestionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAnswerType, setSelectedAnswerType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<QuestionTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] =
    useState<QuestionTemplate | null>(null);
  const [archivingTemplate, setArchivingTemplate] =
    useState<QuestionTemplate | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] =
    useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  // Get region ID based on selected country
  const getRegionId = (country: CountryCode): number => {
    return country === "UG" ? 1 : 5; // Uganda: 1, Kenya: 5
  };

  // Load all templates
  const loadTemplates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const regionId = getRegionId(selectedCountry);

      // Load all templates without filtering to show everything
      const response = await templateApi.listTemplates({
        regionId,
        page: currentPage,
        limit: 100, // Load more templates to show all
        ...(selectedCategory !== "all" && { category: selectedCategory }),
        ...(selectedAnswerType !== "all" && { answerType: selectedAnswerType }),
        ...(searchQuery && { q: searchQuery }),
      });

      if (response.status === "success" && response.data) {
        setTemplates(response.data.rows);
        setTotalCount(response.data.count);
      } else {
        setError(handleApiError(response));
      }
    } catch (err) {
      setError("Failed to load question templates. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      loadTemplates();
    }
  }, [
    isClient,
    currentPage,
    selectedCategory,
    selectedAnswerType,
    searchQuery,
    selectedCountry,
  ]);

  // Get unique categories from templates
  const categories = Array.from(
    new Set(templates.map((t) => t.category).filter(Boolean)),
  );

  // Get answer type icon
  const getAnswerTypeIcon = (type: AnswerType) => {
    switch (type) {
      case "text":
      case "textarea":
        return <Type className="w-4 h-4" />;
      case "number":
        return <Hash className="w-4 h-4" />;
      case "date":
        return <Calendar className="w-4 h-4" />;
      case "dropdown":
      case "radio":
        return <ChevronDown className="w-4 h-4" />;
      case "checkbox":
        return <CheckSquare className="w-4 h-4" />;
      default:
        return <Type className="w-4 h-4" />;
    }
  };

  // Get answer type color
  const getAnswerTypeColor = (type: AnswerType) => {
    switch (type) {
      case "text":
      case "textarea":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "number":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "date":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "dropdown":
      case "radio":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "checkbox":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Get category icon
  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "personal information":
        return <User className="w-4 h-4" />;
      case "contact information":
        return <Phone className="w-4 h-4" />;
      case "business information":
        return <Building className="w-4 h-4" />;
      case "financial information":
        return <Hash className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tkey.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (template.helperText?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    return matchesSearch;
  });

  // Handle template actions
  const handleEditTemplate = (template: QuestionTemplate) => {
    setEditingTemplate(template);
    setShowEditDialog(true);
  };

  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;

    setActionLoading(true);
    try {
      const response = await templateApi.deleteTemplate(deletingTemplate.id);
      if (response.status === "success") {
        setTemplates(templates.filter((t) => t.id !== deletingTemplate.id));
        setShowDeleteDialog(false);
        setDeletingTemplate(null);
        setSuccessMessage(
          `Template "${deletingTemplate.label}" has been deleted successfully!`,
        );
        setShowSuccessDialog(true);
        toast({
          title: "Success",
          description: "Template deleted successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: handleApiError(response),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchiveTemplate = async () => {
    if (!archivingTemplate) return;

    setActionLoading(true);
    try {
      const response = await templateApi.archiveTemplate(archivingTemplate.id);
      if (response.status === "success") {
        setTemplates(
          templates.map((t) =>
            t.id === archivingTemplate.id ? { ...t, status: "archived" } : t,
          ),
        );
        setShowArchiveDialog(false);
        setArchivingTemplate(null);
        setSuccessMessage(
          `Template "${archivingTemplate.label}" has been archived successfully!`,
        );
        setShowSuccessDialog(true);
        toast({
          title: "Success",
          description: "Template archived successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: handleApiError(response),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to archive template",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateTemplate = async (
    templateData: Omit<QuestionTemplate, "id">,
  ) => {
    setActionLoading(true);
    try {
      const response = await templateApi.createTemplate({
        ...templateData,
        availableRegions: [getRegionId(selectedCountry)],
        createdBy: "user",
      });
      if (response.status === "success" && response.data) {
        setTemplates([response.data, ...templates]);
        setShowCreateTemplateDialog(false);
        setSuccessMessage(
          `Template "${response.data.label}" has been created successfully!`,
        );
        setShowSuccessDialog(true);
        toast({
          title: "Success",
          description: "Template created successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: handleApiError(response),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateTemplate = async (
    templateData: Partial<QuestionTemplate>,
  ) => {
    if (!editingTemplate) return;

    setActionLoading(true);
    try {
      const response = await templateApi.updateTemplate(
        editingTemplate.id,
        templateData,
      );
      if (response.status === "success" && response.data) {
        setTemplates(
          templates.map((t) =>
            t.id === editingTemplate.id ? response.data! : t,
          ),
        );
        setShowEditDialog(false);
        setEditingTemplate(null);
        setSuccessMessage(
          `Template "${response.data.label}" has been updated successfully!`,
        );
        setShowSuccessDialog(true);
        toast({
          title: "Success",
          description: "Template updated successfully!",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: handleApiError(response),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteDialog = (template: QuestionTemplate) => {
    setDeletingTemplate(template);
    setShowDeleteDialog(true);
  };

  const openArchiveDialog = (template: QuestionTemplate) => {
    setArchivingTemplate(template);
    setShowArchiveDialog(true);
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
                Back to Dashboard
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Question Library
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Manage reusable questions and templates
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateTemplateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Import Templates
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates by name, key, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedAnswerType}
              onValueChange={setSelectedAnswerType}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="textarea">Textarea</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="radio">Radio</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {isClient ? totalCount : "..."}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total Templates
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {isClient
                      ? templates.filter((t) => t.isGlobal).length
                      : "..."}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Global Templates
                  </p>
                </div>
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {isClient ? categories.length : "..."}
                  </div>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
                <Tag className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {isClient ? filteredTemplates.length : "..."}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Filtered Results
                  </p>
                </div>
                <Filter className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ||
                selectedCategory !== "all" ||
                selectedAnswerType !== "all"
                  ? "No templates found"
                  : "No templates yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ||
                selectedCategory !== "all" ||
                selectedAnswerType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first question template to get started"}
              </p>
              {!searchQuery &&
                selectedCategory === "all" &&
                selectedAnswerType === "all" && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Template
                  </Button>
                )}
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => onSelectTemplate?.(template)}
              >
                <CardHeader className={viewMode === "list" ? "pb-4" : ""}>
                  <div
                    className={`flex items-start ${viewMode === "list" ? "justify-between" : "flex-col"}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors flex items-center">
                          {getCategoryIcon(template.category)}
                          <span className="ml-2">{template.label}</span>
                        </CardTitle>
                        {template.isGlobal && (
                          <Badge variant="outline" className="text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            Global
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={getAnswerTypeColor(template.answerType)}
                        >
                          {getAnswerTypeIcon(template.answerType)}
                          <span className="ml-1">{template.answerType}</span>
                        </Badge>
                        {template.category && (
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm mb-2">
                        <strong>Key:</strong> {template.tkey}
                      </CardDescription>
                      {template.helperText && (
                        <CardDescription className="text-sm">
                          {template.helperText}
                        </CardDescription>
                      )}
                    </div>
                    {viewMode === "list" && (
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSelectTemplate?.(template)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Use Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openArchiveDialog(template)}
                              className="text-orange-600"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </CardHeader>
                {viewMode === "grid" && (
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>ID: {template.id}</span>
                        <span>Regions: {template.availableRegions.length}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Template
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onSelectTemplate?.(template)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Use Template
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openArchiveDialog(template)}
                              className="text-orange-600"
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(template)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {isClient && totalCount > 100 && (
          <div className="flex items-center justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {Math.ceil(totalCount / 100)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalCount / 100)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Template Dialog */}
      <TemplateDialog
        open={showCreateTemplateDialog}
        onOpenChange={setShowCreateTemplateDialog}
        onSubmit={handleCreateTemplate}
        isLoading={actionLoading}
        title="Create New Template"
      />

      {/* Edit Template Dialog */}
      {editingTemplate && (
        <TemplateDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSubmit={handleUpdateTemplate}
          isLoading={actionLoading}
          title="Edit Template"
          initialData={editingTemplate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deletingTemplate?.label}
              &quot;? This action cannot be undone and will remove the template
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowDeleteDialog(false);
                setDeletingTemplate(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTemplate}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? "Deleting..." : "Delete Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive &quot;{archivingTemplate?.label}
              &quot;? Archived templates can be restored later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowArchiveDialog(false);
                setArchivingTemplate(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchiveTemplate}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {actionLoading ? "Archiving..." : "Archive Template"}
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

// Template Dialog Component
interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    data: Omit<QuestionTemplate, "id"> | Partial<QuestionTemplate>,
  ) => void;
  isLoading: boolean;
  title: string;
  initialData?: QuestionTemplate;
}

function TemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  title,
  initialData,
}: TemplateDialogProps) {
  const [formData, setFormData] = useState({
    tkey: initialData?.tkey || "",
    label: initialData?.label || "",
    question: initialData?.question || "",
    answerType: (initialData?.answerType || "text") as AnswerType,
    helperText: initialData?.helperText || "",
    category: initialData?.category || "",
    tags: initialData?.tags?.join(", ") || "",
    isGlobal: initialData?.isGlobal || false,
    defaultValue: initialData?.defaultValue || "",
    dbColumn: initialData?.dbColumn || "",
    apiEndpoint: initialData?.apiEndpoint || "",
    tableName: initialData?.tableName || "",
    columnName: initialData?.columnName || "",
    encrypted: initialData?.encrypted || false,
    indexed: initialData?.indexed || false,
    persistToTable: initialData?.persistToTable || false,
  });

  const [options, setOptions] = useState<PicklistValue[]>(
    initialData?.options || [],
  );
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.label.trim()) return;

    const templateData = {
      tkey:
        formData.tkey.trim() ||
        formData.label.toLowerCase().replace(/\s+/g, "_"),
      label: formData.label.trim(),
      question: formData.question.trim() || undefined,
      answerType: formData.answerType,
      helperText: formData.helperText.trim() || undefined,
      category: formData.category.trim() || undefined,
      tags: formData.tags
        ? formData.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      isGlobal: formData.isGlobal,
      defaultValue: formData.defaultValue.trim() || undefined,
      dbColumn: formData.dbColumn.trim() || undefined,
      apiEndpoint: formData.apiEndpoint.trim() || undefined,
      validationJson: {},
      storageMetadata: {
        tableName: formData.tableName.trim() || undefined,
        columnName: formData.columnName.trim() || undefined,
        encrypted: formData.encrypted,
        indexed: formData.indexed,
        persistToTable: formData.persistToTable,
      },
      options,
      expectedAnswers: options,
      answers: options,
      encrypted: formData.encrypted,
      indexed: formData.indexed,
      persistToTable: formData.persistToTable,
      tableName: formData.tableName.trim() || undefined,
      columnName: formData.columnName.trim() || undefined,
    };

    onSubmit(templateData);
  };

  const handleAddOption = () => {
    if (!newOptionLabel.trim() || !newOptionValue.trim()) return;

    const newOption: PicklistValue = {
      id: `opt-${Date.now()}`,
      label: newOptionLabel.trim(),
      value: newOptionValue.trim(),
      order: options.length + 1,
      isActive: true,
      isDefault: false,
    };

    setOptions([...options, newOption]);
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleRemoveOption = (optionId: string) => {
    setOptions(options.filter((opt) => opt.id !== optionId));
  };

  const requiresOptions = ["dropdown", "radio", "checkbox"].includes(
    formData.answerType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-label">Template Label</Label>
              <Input
                id="template-label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Enter template label"
                className="mt-1"
                required
              />
            </div>
            <div>
              <Label htmlFor="template-tkey">Template Key</Label>
              <Input
                id="template-tkey"
                value={formData.tkey}
                onChange={(e) =>
                  setFormData({ ...formData, tkey: e.target.value })
                }
                placeholder="Auto-generated from label"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template-question">Question Text (Optional)</Label>
            <Textarea
              id="template-question"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Additional question text"
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-type">Answer Type</Label>
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
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                  <SelectItem value="radio">Radio</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="lookup">Lookup</SelectItem>
                  <SelectItem value="formula">Formula</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template-category">Category</Label>
              <Input
                id="template-category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Personal Information"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="template-help">Help Text</Label>
            <Textarea
              id="template-help"
              value={formData.helperText}
              onChange={(e) =>
                setFormData({ ...formData, helperText: e.target.value })
              }
              placeholder="Help text for users"
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="template-tags">Tags (comma-separated)</Label>
              <Input
                id="template-tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="tag1, tag2, tag3"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="template-default">Default Value</Label>
              <Input
                id="template-default"
                value={formData.defaultValue}
                onChange={(e) =>
                  setFormData({ ...formData, defaultValue: e.target.value })
                }
                placeholder="Default value"
                className="mt-1"
              />
            </div>
          </div>

          {/* Storage Configuration */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">Storage Configuration</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-table">Table Name</Label>
                <Input
                  id="template-table"
                  value={formData.tableName}
                  onChange={(e) =>
                    setFormData({ ...formData, tableName: e.target.value })
                  }
                  placeholder="e.g., customers"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="template-column">Column Name</Label>
                <Input
                  id="template-column"
                  value={formData.columnName}
                  onChange={(e) =>
                    setFormData({ ...formData, columnName: e.target.value })
                  }
                  placeholder="e.g., first_name"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="template-encrypted"
                  checked={formData.encrypted}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, encrypted: checked })
                  }
                />
                <Label htmlFor="template-encrypted">Encrypted</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="template-indexed"
                  checked={formData.indexed}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, indexed: checked })
                  }
                />
                <Label htmlFor="template-indexed">Indexed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="template-persist"
                  checked={formData.persistToTable}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, persistToTable: checked })
                  }
                />
                <Label htmlFor="template-persist">Persist to Table</Label>
              </div>
            </div>
          </div>

          {/* Options for enumerated types */}
          {requiresOptions && (
            <div className="space-y-4">
              <Label>Answer Options</Label>
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
                  onClick={handleAddOption}
                  disabled={!newOptionLabel.trim() || !newOptionValue.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {options.length > 0 && (
                <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center justify-between p-2 rounded bg-background"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Value: {option.value}
                        </div>
                      </div>
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
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="template-global"
              checked={formData.isGlobal}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isGlobal: checked })
              }
            />
            <Label htmlFor="template-global">Global Template</Label>
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
