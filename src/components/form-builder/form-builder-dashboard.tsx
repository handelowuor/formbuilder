"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Settings,
  History,
  Sparkles,
  TrendingUp,
  Users,
  Clock,
  Search,
  Filter,
  Grid,
  List,
  Globe,
  MapPin,
  Library,
  Share2,
  Zap,
  CheckSquare,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormType,
  FormStatus,
  CountryCode,
  CompanyRegion,
} from "@/types/form-builder";
import {
  formApi,
  handleApiError,
  regionApi,
  templateApi,
} from "@/lib/api/form-builder-api";
import { FormEditor } from "./form-editor";
import { PublishedFormsView } from "./published-forms-view";
import { QuestionLibrary } from "./question-library";

interface FormBuilderDashboardProps {
  companyRegionId?: number;
  defaultCountry?: CountryCode;
}

export function FormBuilderDashboard({
  companyRegionId = 1,
  defaultCountry = "UG",
}: FormBuilderDashboardProps) {
  const [currentView, setCurrentView] = useState<
    "dashboard" | "editor" | "published" | "templates"
  >("dashboard");
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FormStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<FormType | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Country support - simplified to just country selection
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(defaultCountry);
  const [templateCount, setTemplateCount] = useState(0);

  // Get company region ID based on selected country
  const getCompanyRegionId = (country: CountryCode): number => {
    // Map country codes to region IDs
    return country === "UG" ? 1 : 5; // Uganda: 1, Kenya: 5
  };

  // Load forms from API
  const loadForms = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const regionId = getCompanyRegionId(selectedCountry);

      const [formResponse, templateResponse] = await Promise.all([
        formApi.listForms({
          page: currentPage,
          limit: 20,
          companyRegionId: regionId,
          ...(statusFilter !== "all" && { status: statusFilter }),
          ...(typeFilter !== "all" && { formType: typeFilter }),
        }),
        templateApi.listTemplates({
          regionId,
          page: 1,
          limit: 1, // Just to get count
        }),
      ]);

      if (formResponse.status === "success" && formResponse.data) {
        setForms(formResponse.data.rows);
        setTotalCount(formResponse.data.count);
      }

      if (templateResponse.status === "success" && templateResponse.data) {
        setTemplateCount(templateResponse.data.count);
      }
    } catch (err) {
      setError("Failed to load forms. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [currentPage, statusFilter, typeFilter, selectedCountry]);

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
  };

  const handleCreateForm = async () => {
    try {
      const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      const response = await formApi.createForm({
        name: `New Form - ${timestamp}`,
        description: "A new form created with the form builder",
        formType: "cds1",
        companyRegionId: getCompanyRegionId(selectedCountry),
        status: "active",
      });

      if (response.status === "success" && response.data) {
        setSelectedForm(response.data);
        setCurrentView("editor");
      } else {
        setError(handleApiError(response));
      }
    } catch (err) {
      setError("Failed to create form. Please try again.");
    }
  };

  const handleEditForm = (form: Form) => {
    setSelectedForm(form);
    setCurrentView("editor");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedForm(null);
    loadForms(); // Refresh forms when returning to dashboard
  };

  const filteredForms = forms.filter((form) => {
    const matchesSearch =
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false);
    return matchesSearch;
  });

  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case "active":
        return "status-published";
      case "inactive":
        return "status-draft";
      case "archived":
        return "status-archived";
      default:
        return "status-draft";
    }
  };

  const getTypeColor = (type: FormType) => {
    switch (type) {
      case "cds1":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "cds2":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "lead_registration":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "kyc":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  if (currentView === "editor" && selectedForm) {
    return (
      <FormEditor
        form={selectedForm}
        onBack={handleBackToDashboard}
        onSave={async (updatedForm) => {
          try {
            const response = await formApi.updateForm(selectedForm.id, {
              name: updatedForm.name,
              description: updatedForm.description,
              formType: updatedForm.formType,
              status: updatedForm.status,
            });

            if (response.status === "success") {
              handleBackToDashboard();
            } else {
              setError(handleApiError(response));
            }
          } catch (err) {
            setError("Failed to save form. Please try again.");
          }
        }}
      />
    );
  }

  if (currentView === "published") {
    return (
      <PublishedFormsView
        forms={forms.filter((f) => f.status === "active")}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === "templates") {
    return (
      <QuestionLibrary
        selectedCountry={selectedCountry}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen form-builder-canvas">
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                Form Builder
              </h1>
              <p className="text-lg text-muted-foreground">
                Create, configure, and manage custom forms with advanced
                validation and dependencies
              </p>

              {/* Country Selection */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Country:</span>
                </div>
                <Select
                  value={selectedCountry}
                  onValueChange={(value) =>
                    handleCountryChange(value as CountryCode)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UG">🇺🇬 Uganda</SelectItem>
                    <SelectItem value="KE">🇰🇪 Kenya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={handleCreateForm}
                className="form-builder-button-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 form-builder-input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as FormStatus | "all")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={typeFilter}
                onValueChange={(value) =>
                  setTypeFilter(value as FormType | "all")
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="cds1">CDS1</SelectItem>
                  <SelectItem value="cds2">CDS2</SelectItem>
                  <SelectItem value="lead_registration">
                    Lead Registration
                  </SelectItem>
                  <SelectItem value="kyc">KYC</SelectItem>
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
        </div>

        {/* Enhanced Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="form-builder-card-hover group"
            onClick={handleCreateForm}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-7 h-7 text-primary" />
              </div>
              <CardTitle className="text-xl mb-2">Create New Form</CardTitle>
              <CardDescription className="text-sm">
                Start building a new form with custom fields and validation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="form-builder-card-hover group"
            onClick={() => setCurrentView("published")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl mb-2">Published Forms</CardTitle>
              <CardDescription className="text-sm">
                View and manage your published forms and analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="form-builder-card-hover group"
            onClick={() => setCurrentView("templates")}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Library className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl mb-2">Question Library</CardTitle>
              <CardDescription className="text-sm">
                Manage reusable questions and templates
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="form-builder-card-hover group">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-indigo-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Share2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-xl mb-2">Shared Questions</CardTitle>
              <CardDescription className="text-sm">
                Questions used across multiple forms
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Forms List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Forms</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {filteredForms.length} of {totalCount} forms
              </span>
              <Button variant="outline" size="sm">
                <History className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </div>

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
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredForms.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-muted rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? "No forms found" : "No forms yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "Try adjusting your search or filters"
                    : "Create your first form to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Form
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
              {filteredForms.map((form) => (
                <Card
                  key={form.id}
                  className="form-builder-card-hover group animate-fade-in"
                  onClick={() => handleEditForm(form)}
                >
                  <CardHeader className={viewMode === "list" ? "pb-4" : ""}>
                    <div
                      className={`flex items-start ${viewMode === "list" ? "justify-between" : "flex-col"}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {form.name}
                          </CardTitle>
                          <Badge className={getStatusColor(form.status)}>
                            {form.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={getTypeColor(form.formType)}
                          >
                            {form.formType.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm mb-3">
                          {form.description || "No description provided"}
                        </CardDescription>
                      </div>
                      {viewMode === "list" && (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {new Date(form.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  {viewMode === "grid" && (
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <span>ID: {form.id}</span>
                          <span>
                            Country:{" "}
                            {form.companyRegionId === 1
                              ? "🇺🇬 Uganda"
                              : "🇰🇪 Kenya"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(form.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="form-builder-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-foreground">
                    {totalCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Forms</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="form-builder-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {forms.filter((f) => f.status === "active").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="form-builder-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {templateCount}
                  </div>
                  <p className="text-sm text-muted-foreground">Templates</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Library className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="form-builder-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.floor(Math.random() * 50) + 10}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Shared Questions
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="form-builder-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {Math.floor(Math.random() * 1000) + 500}
                  </div>
                  <p className="text-sm text-muted-foreground">Submissions</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
