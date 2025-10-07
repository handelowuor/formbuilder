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
  const [editingTemplate, setEditingTemplate] =
    useState<QuestionTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] =
    useState<QuestionTemplate | null>(null);
  const [archivingTemplate, setArchivingTemplate] =
    useState<QuestionTemplate | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
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
    loadTemplates();
  }, [
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
              <Button variant="outline" size="sm">
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
                  <div className="text-2xl font-bold">{totalCount}</div>
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
                    {templates.filter((t) => t.isGlobal).length}
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
                  <div className="text-2xl font-bold">{categories.length}</div>
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
                    {filteredTemplates.length}
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
        {totalCount > 100 && (
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

      {/* Edit Template Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Label</label>
                <input
                  type="text"
                  value={editingTemplate.label}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      label: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Helper Text</label>
                <textarea
                  value={editingTemplate.helperText || ""}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      helperText: e.target.value,
                    })
                  }
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
