'use client';

import { useState } from 'react';
import { Plus, FileText, Settings, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form } from '@/types/form-builder';
import { FormEditor } from './form-editor';
import { PublishedFormsView } from './published-forms-view';

interface FormBuilderDashboardProps {
  forms?: Form[];
}

export function FormBuilderDashboard({ 
  forms = [
    {
      id: '1',
      name: 'Customer Registration Form',
      description: 'Collect customer information and preferences',
      fields: [],
      status: 'published' as const,
      versions: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2', 
      name: 'Product Feedback Survey',
      description: 'Gather user feedback on product features',
      fields: [],
      status: 'draft' as const,
      versions: [],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-18')
    }
  ]
}: FormBuilderDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor' | 'published'>('dashboard');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const handleCreateForm = () => {
    const newForm: Form = {
      id: Date.now().toString(),
      name: 'New Form',
      description: '',
      fields: [],
      status: 'draft',
      versions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSelectedForm(newForm);
    setCurrentView('editor');
  };

  const handleEditForm = (form: Form) => {
    setSelectedForm(form);
    setCurrentView('editor');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedForm(null);
  };

  if (currentView === 'editor' && selectedForm) {
    return (
      <FormEditor 
        form={selectedForm} 
        onBack={handleBackToDashboard}
        onSave={(updatedForm) => {
          // In a real app, this would save to backend
          console.log('Saving form:', updatedForm);
          handleBackToDashboard();
        }}
      />
    );
  }

  if (currentView === 'published') {
    return (
      <PublishedFormsView 
        forms={forms.filter(f => f.status === 'published')}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Form Builder
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Create, configure, and manage custom forms with advanced validation and dependencies
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20" onClick={handleCreateForm}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Create New Form</CardTitle>
              <CardDescription>
                Start building a new form with custom fields and validation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20" onClick={() => setCurrentView('published')}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Published Forms</CardTitle>
              <CardDescription>
                View and manage your published forms and their analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-xl">Global Settings</CardTitle>
              <CardDescription>
                Manage global value sets and form templates
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Forms */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Recent Forms</h2>
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-2" />
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleEditForm(form)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{form.name}</CardTitle>
                      <CardDescription className="text-sm mb-3">
                        {form.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>
                      {form.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>{form.fields.length} fields</span>
                    <span>Updated {form.updatedAt.toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{forms.length}</div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Forms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {forms.filter(f => f.status === 'published').length}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Published</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {forms.filter(f => f.status === 'draft').length}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Drafts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {forms.reduce((acc, form) => acc + form.fields.length, 0)}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Fields</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}