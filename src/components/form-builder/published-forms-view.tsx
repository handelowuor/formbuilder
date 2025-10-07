'use client';

import { useState } from 'react';
import { ArrowLeft, Eye, Download, BarChart3, Settings, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form } from '@/types/form-builder';

interface PublishedFormsViewProps {
  forms: Form[];
  onBack: () => void;
}

export function PublishedFormsView({ forms, onBack }: PublishedFormsViewProps) {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const mockAnalytics = {
    totalSubmissions: 1247,
    thisMonth: 89,
    averageCompletionTime: '3m 42s',
    completionRate: 87.3
  };

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setSelectedForm(null)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Published Forms
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {selectedForm.name}
                  </h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="default">Published</Badge>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedForm.fields.length} fields
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="submissions">Submissions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {mockAnalytics.totalSubmissions.toLocaleString()}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Submissions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mockAnalytics.thisMonth}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">This Month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {mockAnalytics.averageCompletionTime}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Completion Time</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {mockAnalytics.completionRate}%
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Placeholder */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Submissions Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400">Chart visualization would go here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Field Completion Rates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedForm.fields.slice(0, 5).map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{field.label}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full">
                              <div 
                                className="h-2 bg-primary rounded-full" 
                                style={{ width: `${95 - index * 5}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {95 - index * 5}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="submissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Submissions</CardTitle>
                  <CardDescription>Latest form submissions and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Submission #{1000 + i}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Submitted {i} hours ago
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">Complete</Badge>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Form Settings</CardTitle>
                  <CardDescription>Configure form behavior and notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Accept Submissions</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Allow new form submissions
                        </p>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Send email when form is submitted
                        </p>
                      </div>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Retention</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          How long to keep submission data
                        </p>
                      </div>
                      <Badge variant="outline">1 Year</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

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
              <div>
                <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Published Forms
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Manage and monitor your live forms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {forms.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No published forms
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Publish a form to see it here and start collecting submissions
            </p>
            <Button onClick={onBack}>
              Go to Dashboard
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card 
                key={form.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedForm(form)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{form.name}</CardTitle>
                      <CardDescription className="text-sm mb-3">
                        {form.description || 'No description provided'}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Published</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Fields:</span>
                      <span className="font-medium">{form.fields.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Submissions:</span>
                      <span className="font-medium">{Math.floor(Math.random() * 500) + 50}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Last Updated:</span>
                      <span className="font-medium">{form.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}