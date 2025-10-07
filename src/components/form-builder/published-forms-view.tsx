"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  Download,
  BarChart3,
  Settings,
  Copy,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/types/form-builder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

interface PublishedFormsViewProps {
  forms: Form[];
  onBack: () => void;
}

export function PublishedFormsView({ forms, onBack }: PublishedFormsViewProps) {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);

  const mockAnalytics = {
    totalSubmissions: 1247,
    thisMonth: 89,
    averageCompletionTime: "3m 42s",
    completionRate: 87.3,
  };

  if (selectedForm) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedForm(null)}
                >
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
                      {selectedForm.fields?.length || 0} fields
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
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Total Submissions
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mockAnalytics.thisMonth}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This Month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {mockAnalytics.averageCompletionTime}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Avg. Completion Time
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {mockAnalytics.completionRate}%
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Completion Rate
                    </p>
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
                        <p className="text-slate-500 dark:text-slate-400">
                          Chart visualization would go here
                        </p>
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
                      {(selectedForm.fields || [])
                        .slice(0, 5)
                        .map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {field.label}
                            </span>
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
                  <CardDescription>
                    Latest form submissions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
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
              <FormSettingsEditor form={selectedForm} />
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
            <Button onClick={onBack}>Go to Dashboard</Button>
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
                      <CardTitle className="text-lg mb-2">
                        {form.name}
                      </CardTitle>
                      <CardDescription className="text-sm mb-3">
                        {form.description || "No description provided"}
                      </CardDescription>
                    </div>
                    <Badge variant="default">Published</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Fields:
                      </span>
                      <span className="font-medium">
                        {form.fields?.length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Submissions:
                      </span>
                      <span className="font-medium">
                        {Math.floor(Math.random() * 500) + 50}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Last Updated:
                      </span>
                      <span className="font-medium">
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </span>
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

// Form Settings Editor Component
interface FormSettingsEditorProps {
  form: Form;
}

function FormSettingsEditor({ form }: FormSettingsEditorProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    acceptSubmissions: true,
    emailNotifications: false,
    notificationEmail: "admin@example.com",
    dataRetention: "1_year",
    allowDuplicates: true,
    requireAuth: false,
    customThankYou: false,
    thankYouMessage: "Thank you for your submission!",
    redirectUrl: "",
    maxSubmissions: "",
    submissionDeadline: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: "Form settings updated successfully!",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update form settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Settings</CardTitle>
          <CardDescription>
            Configure basic form behavior and access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Accept Submissions</Label>
              <div className="text-sm text-muted-foreground">
                Allow new form submissions
              </div>
            </div>
            <Switch
              checked={settings.acceptSubmissions}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, acceptSubmissions: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Require Authentication</Label>
              <div className="text-sm text-muted-foreground">
                Users must be logged in to submit
              </div>
            </div>
            <Switch
              checked={settings.requireAuth}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireAuth: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Allow Duplicate Submissions</Label>
              <div className="text-sm text-muted-foreground">
                Allow multiple submissions from same user
              </div>
            </div>
            <Switch
              checked={settings.allowDuplicates}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowDuplicates: checked })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-submissions">
                Max Submissions (Optional)
              </Label>
              <Input
                id="max-submissions"
                type="number"
                placeholder="Unlimited"
                value={settings.maxSubmissions}
                onChange={(e) =>
                  setSettings({ ...settings, maxSubmissions: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="submission-deadline">
                Submission Deadline (Optional)
              </Label>
              <Input
                id="submission-deadline"
                type="datetime-local"
                value={settings.submissionDeadline}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    submissionDeadline: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Configure email notifications and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Email Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Send email when form is submitted
              </div>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, emailNotifications: checked })
              }
            />
          </div>

          {settings.emailNotifications && (
            <div className="space-y-2">
              <Label htmlFor="notification-email">Notification Email</Label>
              <Input
                id="notification-email"
                type="email"
                placeholder="admin@example.com"
                value={settings.notificationEmail}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notificationEmail: e.target.value,
                  })
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Configure data retention and storage policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="data-retention">Data Retention Period</Label>
            <Select
              value={settings.dataRetention}
              onValueChange={(value) =>
                setSettings({ ...settings, dataRetention: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30_days">30 Days</SelectItem>
                <SelectItem value="90_days">90 Days</SelectItem>
                <SelectItem value="6_months">6 Months</SelectItem>
                <SelectItem value="1_year">1 Year</SelectItem>
                <SelectItem value="2_years">2 Years</SelectItem>
                <SelectItem value="indefinite">Indefinite</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              How long to keep submission data before automatic deletion
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thank You Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Thank You Page</CardTitle>
          <CardDescription>
            Customize what users see after submitting the form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Custom Thank You Message</Label>
              <div className="text-sm text-muted-foreground">
                Show custom message instead of default
              </div>
            </div>
            <Switch
              checked={settings.customThankYou}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, customThankYou: checked })
              }
            />
          </div>

          {settings.customThankYou && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="thank-you-message">Thank You Message</Label>
                <Textarea
                  id="thank-you-message"
                  placeholder="Thank you for your submission!"
                  value={settings.thankYouMessage}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      thankYouMessage: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
                <Input
                  id="redirect-url"
                  type="url"
                  placeholder="https://example.com/thank-you"
                  value={settings.redirectUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, redirectUrl: e.target.value })
                  }
                />
                <div className="text-sm text-muted-foreground">
                  Redirect users to this URL after submission
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
