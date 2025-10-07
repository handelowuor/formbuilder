import {
  ApiResponse,
  PaginatedResponse,
  Form,
  FormSection,
  FormQuestion,
  FormVersion,
  CreateFormRequest,
  UpdateFormRequest,
  CreateSectionRequest,
  UpdateSectionRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ImportResult,
  AuditEntry,
  CompanyRegion,
  QuestionTemplate,
  FormQuestionUsage,
  ValidationConfig,
} from "@/types/form-builder";
import {
  testRegions,
  testForms,
  testSections,
  testQuestions,
  testQuestionTemplates,
  availableSections,
} from "@/data/test-data";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const JWT_TOKEN = process.env.NEXT_PUBLIC_JWT_TOKEN || "";

// HTTP Client with error handling - Modified to return test data
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    // For development, return test data instead of making actual API calls
    console.log(`Mock API call to: ${endpoint}`, options);

    // Simulate network delay
    await new Promise((resolve) =>
      setTimeout(resolve, 300 + Math.random() * 700),
    );

    // Return success response with test data
    return {
      status: "success",
      data: {} as T, // This will be overridden by specific endpoints
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

const apiClient = new ApiClient();

// Form Management API - Modified to return test data
export const formApi = {
  // List forms with pagination and filters
  async listForms(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      companyRegionId?: number;
      formType?: string;
    } = {},
  ): Promise<ApiResponse<PaginatedResponse<Form>>> {
    // Filter test forms based on parameters
    let filteredForms = [...testForms];

    if (params.companyRegionId) {
      filteredForms = filteredForms.filter(
        (f) => f.companyRegionId === params.companyRegionId,
      );
    }

    if (params.status) {
      filteredForms = filteredForms.filter((f) => f.status === params.status);
    }

    if (params.formType) {
      filteredForms = filteredForms.filter(
        (f) => f.formType === params.formType,
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedForms = filteredForms.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      status: "success",
      data: {
        count: filteredForms.length,
        rows: paginatedForms,
        page,
        limit,
      },
    };
  },

  // Create new form
  async createForm(data: CreateFormRequest): Promise<ApiResponse<Form>> {
    const newForm: Form = {
      id: Math.max(...testForms.map((f) => f.id)) + 1,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description,
      formType: data.formType,
      companyRegionId: data.companyRegionId,
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    testForms.push(newForm);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      status: "success",
      data: newForm,
    };
  },

  // Update existing form
  async updateForm(
    id: number,
    data: UpdateFormRequest,
  ): Promise<ApiResponse<Form>> {
    const formIndex = testForms.findIndex((f) => f.id === id);
    if (formIndex === -1) {
      return {
        status: false,
        code: "FORM_NOT_FOUND",
        message: "Form not found",
      };
    }

    testForms[formIndex] = {
      ...testForms[formIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      status: "success",
      data: testForms[formIndex],
    };
  },

  // Get form by ID
  async getForm(id: number): Promise<ApiResponse<Form>> {
    const form = testForms.find((f) => f.id === id);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (!form) {
      return {
        status: false,
        code: "FORM_NOT_FOUND",
        message: "Form not found",
      };
    }

    return {
      status: "success",
      data: form,
    };
  },

  // Delete form
  async deleteForm(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/forms/${id}`);
  },

  // Duplicate form
  async duplicateForm(id: number): Promise<ApiResponse<Form>> {
    return apiClient.post<Form>(`/forms/${id}/duplicate`, {});
  },

  // Export form
  async exportForm(id: number): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/forms/${id}/export`);
  },

  // Import form
  async importForm(data: any): Promise<ApiResponse<ImportResult>> {
    return apiClient.post<ImportResult>("/forms/import", data);
  },

  // Get form versions
  async getFormVersions(id: number): Promise<ApiResponse<FormVersion[]>> {
    return apiClient.get<FormVersion[]>(`/forms/${id}/versions`);
  },

  // Publish form
  async publishForm(id: number): Promise<ApiResponse<Form>> {
    return apiClient.post<Form>(`/forms/${id}/publish`, {});
  },

  // Unpublish form
  async unpublishForm(id: number): Promise<ApiResponse<Form>> {
    return apiClient.post<Form>(`/forms/${id}/unpublish`, {});
  },

  // Get form audit trail
  async getFormAudit(id: number): Promise<ApiResponse<AuditEntry[]>> {
    return apiClient.get<AuditEntry[]>(`/forms/${id}/audit`);
  },
};

// Region and Country Management API - Modified to return test data
export const regionApi = {
  // Get available regions
  async getRegions(): Promise<ApiResponse<CompanyRegion[]>> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: "success",
      data: testRegions,
    };
  },

  // Get regions by country
  async getRegionsByCountry(
    countryCode: string,
  ): Promise<ApiResponse<CompanyRegion[]>> {
    const filteredRegions = testRegions.filter(
      (r) => r.countryCode === countryCode,
    );

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: "success",
      data: filteredRegions,
    };
  },
};

// Question Template Management API - Modified to return test data
export const templateApi = {
  // List question templates
  async listTemplates(
    params: {
      regionId?: number;
      category?: string;
      answerType?: string;
      isGlobal?: boolean;
      page?: number;
      limit?: number;
      q?: string;
    } = {},
  ): Promise<ApiResponse<PaginatedResponse<QuestionTemplate>>> {
    let filteredTemplates = [...testQuestionTemplates];

    if (params.regionId) {
      filteredTemplates = filteredTemplates.filter((t) =>
        t.availableRegions.includes(params.regionId!),
      );
    }

    if (params.category) {
      filteredTemplates = filteredTemplates.filter((t) =>
        t.category?.toLowerCase().includes(params.category!.toLowerCase()),
      );
    }

    if (params.answerType) {
      filteredTemplates = filteredTemplates.filter(
        (t) => t.answerType === params.answerType,
      );
    }

    if (params.q) {
      const query = params.q.toLowerCase();
      filteredTemplates = filteredTemplates.filter(
        (t) =>
          t.label.toLowerCase().includes(query) ||
          t.tkey.toLowerCase().includes(query),
      );
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      status: "success",
      data: {
        count: filteredTemplates.length,
        rows: paginatedTemplates,
        page,
        limit,
      },
    };
  },

  // Get template by ID
  async getTemplate(id: number): Promise<ApiResponse<QuestionTemplate>> {
    return apiClient.get<QuestionTemplate>(`/question-templates/${id}`);
  },

  // Create new template
  async createTemplate(
    data: Omit<QuestionTemplate, "id">,
  ): Promise<ApiResponse<QuestionTemplate>> {
    return apiClient.post<QuestionTemplate>("/question-templates", data);
  },

  // Update template
  async updateTemplate(
    id: number,
    data: Partial<QuestionTemplate>,
  ): Promise<ApiResponse<QuestionTemplate>> {
    return apiClient.put<QuestionTemplate>(`/question-templates/${id}`, data);
  },

  // Delete template
  async deleteTemplate(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/question-templates/${id}`);
  },

  // Get template usage
  async getTemplateUsage(
    id: number,
  ): Promise<ApiResponse<FormQuestionUsage[]>> {
    return apiClient.get<FormQuestionUsage[]>(
      `/question-templates/${id}/usage`,
    );
  },
};

// Section Management API - Modified to return test data
export const sectionApi = {
  // List sections for a form
  async listSections(
    formId: number,
    status?: string,
  ): Promise<ApiResponse<FormSection[]>> {
    let filteredSections = testSections.filter((s) => s.formId === formId);

    if (status) {
      filteredSections = filteredSections.filter((s) => s.status === status);
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: "success",
      data: filteredSections,
    };
  },

  // Get available sections that can be added to forms
  async getAvailableSections(
    formType?: string,
    regionId?: number,
  ): Promise<ApiResponse<typeof availableSections>> {
    let filtered = [...availableSections];

    if (formType) {
      filtered = filtered.filter((s) => s.formType === formType);
    }

    if (regionId) {
      filtered = filtered.filter((s) => s.companyRegionId === regionId);
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      status: "success",
      data: filtered,
    };
  },

  // Get section by ID
  async getSection(id: number): Promise<ApiResponse<FormSection>> {
    return apiClient.get<FormSection>(`/sections/${id}`);
  },

  // Create new section
  async createSection(
    formId: number,
    data: CreateSectionRequest,
  ): Promise<ApiResponse<FormSection>> {
    const form = testForms.find((f) => f.id === formId);
    if (!form) {
      return {
        status: false,
        code: "FORM_NOT_FOUND",
        message: "Form not found",
      };
    }

    const newSection: FormSection = {
      id: Math.max(...testSections.map((s) => s.id)) + 1,
      formId,
      companyRegionId: form.companyRegionId,
      formType: form.formType,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      name: data.name,
      description: data.description,
      meta: {},
      order:
        data.order ||
        testSections.filter((s) => s.formId === formId).length + 1,
      isActive: data.isActive ?? true,
      status: "draft",
      legacyStatus: "active",
      etag: `etag-${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "user",
      updatedBy: "user",
    };

    testSections.push(newSection);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      status: "success",
      data: newSection,
    };
  },

  // Update section
  async updateSection(
    id: number,
    data: UpdateSectionRequest,
  ): Promise<ApiResponse<FormSection>> {
    return apiClient.put<FormSection>(`/sections/${id}`, data);
  },

  // Archive section
  async archiveSection(sectionId: number): Promise<ApiResponse<void>> {
    const sectionIndex = testSections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) {
      return {
        status: false,
        code: "SECTION_NOT_FOUND",
        message: "Section not found",
      };
    }

    // Remove section and its questions
    testSections.splice(sectionIndex, 1);
    const questionIndices = testQuestions
      .map((q, i) => (q.sectionId === sectionId ? i : -1))
      .filter((i) => i !== -1);
    questionIndices.reverse().forEach((i) => testQuestions.splice(i, 1));

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      status: "success",
      data: undefined,
    };
  },

  // Reorder sections
  async reorderSections(
    formId: number,
    sectionIds: number[],
  ): Promise<ApiResponse<FormSection[]>> {
    return apiClient.put<FormSection[]>(`/forms/${formId}/sections/reorder`, {
      sectionIds,
    });
  },
};

// Question Management API - Modified to return test data
export const questionApi = {
  // List questions for a form
  async listQuestions(
    formId: number,
    params: {
      sectionId?: number;
      status?: string;
      type?: string;
      page?: number;
      pageSize?: number;
      q?: string;
    } = {},
  ): Promise<
    ApiResponse<{
      items: FormQuestion[];
      page: number;
      pageSize: number;
      total: number;
    }>
  > {
    let filteredQuestions = testQuestions.filter((q) => q.formId === formId);

    if (params.sectionId) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.sectionId === params.sectionId,
      );
    }

    if (params.status) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.status === params.status,
      );
    }

    if (params.type) {
      filteredQuestions = filteredQuestions.filter(
        (q) => q.answerType === params.type,
      );
    }

    if (params.q) {
      const query = params.q.toLowerCase();
      filteredQuestions = filteredQuestions.filter(
        (q) =>
          q.label.toLowerCase().includes(query) ||
          q.tkey.toLowerCase().includes(query),
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 250));

    return {
      status: "success",
      data: {
        items: paginatedQuestions,
        page,
        pageSize,
        total: filteredQuestions.length,
      },
    };
  },

  // Get question by ID
  async getQuestion(id: number): Promise<ApiResponse<FormQuestion>> {
    return apiClient.get<FormQuestion>(`/questions/${id}`);
  },

  // Create new question
  async createQuestion(
    formId: number,
    data: CreateQuestionRequest,
  ): Promise<ApiResponse<FormQuestion>> {
    const form = testForms.find((f) => f.id === formId);
    const section = testSections.find((s) => s.id === data.sectionId);

    if (!form) {
      return {
        status: false,
        code: "FORM_NOT_FOUND",
        message: "Form not found",
      };
    }

    if (!section) {
      return {
        status: false,
        code: "SECTION_NOT_FOUND",
        message: "Section not found",
      };
    }

    const newQuestion: FormQuestion = {
      id: Math.max(...testQuestions.map((q) => q.id)) + 1,
      formId,
      sectionId: data.sectionId,
      order:
        data.order ||
        testQuestions.filter((q) => q.sectionId === data.sectionId).length + 1,
      questionTemplateId: data.questionTemplateId,
      tkey: data.tkey || `question_${Date.now()}`,
      label: data.label || "New Question",
      helperText: data.helperText,
      answerType: data.answerType || "text",
      required: data.required || false,
      validation: data.validation || {},
      visibleIf: data.visibleIf || [],
      defaultValue: data.defaultValue,
      optionsApi: data.optionsApi,
      dependsOn: data.dependsOn || [],
      options: data.options || [],
      storage: data.storage,
      status: "draft",
      legacyStatus: "active",
      etag: `etag-q${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    testQuestions.push(newQuestion);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      status: "success",
      data: newQuestion,
    };
  },

  // Update question
  async updateQuestion(
    id: number,
    data: UpdateQuestionRequest,
  ): Promise<ApiResponse<FormQuestion>> {
    return apiClient.put<FormQuestion>(`/questions/${id}`, data);
  },

  // Archive question
  async archiveQuestion(questionId: number): Promise<ApiResponse<void>> {
    const questionIndex = testQuestions.findIndex((q) => q.id === questionId);
    if (questionIndex === -1) {
      return {
        status: false,
        code: "QUESTION_NOT_FOUND",
        message: "Question not found",
      };
    }

    testQuestions.splice(questionIndex, 1);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      status: "success",
      data: undefined,
    };
  },

  // Reorder questions
  async reorderQuestions(
    sectionId: number,
    questionIds: number[],
  ): Promise<ApiResponse<FormQuestion[]>> {
    return apiClient.put<FormQuestion[]>(
      `/sections/${sectionId}/questions/reorder`,
      { questionIds },
    );
  },

  // Bulk update questions
  async bulkUpdateQuestions(
    questionIds: number[],
    updates: Partial<FormQuestion>,
  ): Promise<ApiResponse<FormQuestion[]>> {
    return apiClient.put<FormQuestion[]>("/questions/bulk-update", {
      questionIds,
      updates,
    });
  },
};

// Validation API
export const validationApi = {
  // Get validation config
  async getValidationConfig(): Promise<ApiResponse<ValidationConfig>> {
    return apiClient.get<ValidationConfig>("/validation/config");
  },

  // Validate form structure
  async validateForm(formId: number): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/forms/${formId}/validate`, {});
  },

  // Validate question configuration
  async validateQuestion(
    questionData: Partial<FormQuestion>,
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>("/questions/validate", questionData);
  },
};

// Analytics API
export const analyticsApi = {
  // Get form analytics
  async getFormAnalytics(
    formId: number,
    dateRange?: { start: string; end: string },
  ): Promise<ApiResponse<any>> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    return apiClient.get<any>(`/forms/${formId}/analytics${params}`);
  },

  // Get question analytics
  async getQuestionAnalytics(
    questionId: number,
    dateRange?: { start: string; end: string },
  ): Promise<ApiResponse<any>> {
    const params = dateRange
      ? `?start=${dateRange.start}&end=${dateRange.end}`
      : "";
    return apiClient.get<any>(`/questions/${questionId}/analytics${params}`);
  },
};

// Error handling utility
export const handleApiError = (response: any): string => {
  if (response.message) {
    return response.message;
  }
  if (response.code) {
    return `Error: ${response.code}`;
  }
  return "An unexpected error occurred";
};
