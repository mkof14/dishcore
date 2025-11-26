import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Plus, Edit, Eye, Trash2, ArrowLeft, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_TEMPLATES = [
  {
    name: 'Welcome Email',
    slug: 'welcome',
    subject: '🎉 Welcome to DishCore!',
    category: 'transactional',
    variables: ['user_name', 'dashboard_url']
  },
  {
    name: 'Payment Successful',
    slug: 'payment_success',
    subject: '✅ Payment Received - DishCore',
    category: 'transactional',
    variables: ['user_name', 'amount', 'plan', 'date', 'receipt_url']
  },
  {
    name: 'Subscription Renewed',
    slug: 'subscription_renewed',
    subject: '🔄 Your Subscription Has Been Renewed',
    category: 'transactional',
    variables: ['user_name', 'plan', 'next_billing_date', 'amount']
  },
  {
    name: 'Payment Failed',
    slug: 'payment_failed',
    subject: '⚠️ Payment Issue - Action Required',
    category: 'transactional',
    variables: ['user_name', 'plan', 'retry_date', 'update_payment_url']
  },
  {
    name: 'Trial Ending Soon',
    slug: 'trial_ending',
    subject: '⏰ Your Trial Ends in 3 Days',
    category: 'marketing',
    variables: ['user_name', 'trial_end_date', 'upgrade_url']
  },
  {
    name: 'Weekly Report',
    slug: 'weekly_report',
    subject: '📊 Your Weekly Progress Report',
    category: 'notification',
    variables: ['user_name', 'meals_logged', 'avg_calories', 'streak', 'insights']
  },
  {
    name: 'Goal Achieved',
    slug: 'goal_achieved',
    subject: '🎉 Congratulations! Goal Achieved',
    category: 'notification',
    variables: ['user_name', 'goal_name', 'achievement_date']
  },
  {
    name: 'Password Reset',
    slug: 'password_reset',
    subject: '🔐 Reset Your Password',
    category: 'system',
    variables: ['user_name', 'reset_link', 'expires_in']
  },
  {
    name: 'Account Verification',
    slug: 'verify_email',
    subject: '✉️ Verify Your Email Address',
    category: 'system',
    variables: ['user_name', 'verification_link']
  },
  {
    name: 'Subscription Cancelled',
    slug: 'subscription_cancelled',
    subject: '👋 Sorry to See You Go',
    category: 'transactional',
    variables: ['user_name', 'end_date', 'feedback_url']
  },
  {
    name: 'New Feature Announcement',
    slug: 'feature_announcement',
    subject: '🚀 New Feature: {{feature_name}}',
    category: 'marketing',
    variables: ['user_name', 'feature_name', 'feature_description', 'learn_more_url']
  },
  {
    name: 'Meal Reminder',
    slug: 'meal_reminder',
    subject: '🍽️ Time to Log Your Meal',
    category: 'notification',
    variables: ['user_name', 'meal_type', 'time']
  }
];

export default function AdminEmailTemplates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['email-templates'],
    queryFn: () => base44.entities.EmailTemplate.list('-created_date'),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (template) => base44.entities.EmailTemplate.create(template),
    onSuccess: () => {
      queryClient.invalidateQueries(['email-templates']);
      toast.success('Template created');
      setShowEditor(false);
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmailTemplate.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['email-templates']);
      toast.success('Template updated');
      setShowEditor(false);
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.EmailTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['email-templates']);
      toast.success('Template deleted');
    },
  });

  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ template, email }) => {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: template.subject,
        body: template.html_content
      });
    },
    onSuccess: () => {
      toast.success('Test email sent!');
      setShowPreview(false);
    },
  });

  const initializeTemplates = async () => {
    for (const template of DEFAULT_TEMPLATES) {
      const exists = templates.find(t => t.slug === template.slug);
      if (!exists) {
        await createTemplateMutation.mutateAsync({
          ...template,
          html_content: generateTemplateHTML(template.slug)
        });
      }
    }
    toast.success('Default templates initialized');
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Email Templates
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>
              Manage branded email templates
            </p>
          </div>
          <div className="flex gap-3">
            {templates.length === 0 && (
              <Button onClick={initializeTemplates} variant="outline">
                Initialize Templates
              </Button>
            )}
            <Button onClick={() => {
              setSelectedTemplate(null);
              setShowEditor(true);
            }} className="gradient-accent text-white border-0">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
            <Link to={createPageUrl('Admin')}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <Card className="gradient-card border-0 p-4">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="gradient-card border-0 p-6 rounded-3xl">
              <div className="flex items-start justify-between mb-3">
                <Mail className="w-8 h-8 text-blue-500" />
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {template.name}
              </h3>
              <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                {template.subject}
              </p>
              <div className="flex items-center gap-2 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                <span>Sent: {template.sent_count || 0}</span>
                <span>•</span>
                <span>{template.variables?.length || 0} variables</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedTemplate(template);
                  setShowPreview(true);
                }}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedTemplate(template);
                  setShowEditor(true);
                }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => deleteTemplateMutation.mutate(template.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview: {selectedTemplate?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div dangerouslySetInnerHTML={{ __html: selectedTemplate?.html_content }} />
              <div className="flex gap-3">
                <Input
                  placeholder="Test email address"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  type="email"
                  className="flex-1"
                />
                <Button onClick={() => sendTestEmailMutation.mutate({ 
                  template: selectedTemplate, 
                  email: testEmail 
                })} disabled={!testEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function generateTemplateHTML(slug) {
  const logo = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png';
  
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: linear-gradient(135deg, #07182F 0%, #0D1F36 100%);
    margin: 0;
    padding: 40px 20px;
  `;

  const templates = {
    welcome: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #00A3E3, #0080FF); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 80px; height: 80px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 32px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">Welcome to DishCore! 🎉</h1>
          </div>
          <div style="padding: 40px;">
            <h2 style="color: #FFFFFF; margin-top: 0;">Hi {{user_name}}!</h2>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              We're thrilled to have you join our community of health-conscious food lovers!
            </p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              DishCore is your AI-powered nutrition companion. Here's what you can do:
            </p>
            <ul style="color: #B5D6FF; font-size: 16px; line-height: 1.8;">
              <li>🍽️ Track your meals with AI-powered analysis</li>
              <li>📊 Monitor your nutrition goals in real-time</li>
              <li>🎯 Get personalized meal recommendations</li>
              <li>📈 View detailed progress reports</li>
            </ul>
            <div style="text-align: center; margin: 40px 0;">
              <a href="{{dashboard_url}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(0, 163, 227, 0.4);">
                Get Started Now
              </a>
            </div>
            <p style="color: #8AA8CC; font-size: 14px; text-align: center;">
              Need help? Reply to this email or visit <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    payment_success: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">Payment Received!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Thank you for your payment. Your DishCore subscription is now active!
            </p>
            <div style="background: rgba(21, 43, 71, 0.5); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(45, 163, 255, 0.2);">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #8AA8CC;">Amount:</td>
                  <td style="padding: 8px 0; color: #FFFFFF; font-weight: bold; text-align: right;">{{amount}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8AA8CC;">Plan:</td>
                  <td style="padding: 8px 0; color: #FFFFFF; font-weight: bold; text-align: right;">{{plan}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #8AA8CC;">Date:</td>
                  <td style="padding: 8px 0; color: #FFFFFF; font-weight: bold; text-align: right;">{{date}}</td>
                </tr>
              </table>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{receipt_url}}" style="display: inline-block; color: #00A3E3; text-decoration: none; font-weight: 600; padding: 12px 24px; border: 1px solid #00A3E3; border-radius: 8px;">
                Download Receipt →
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    subscription_renewed: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #00A3E3, #0080FF); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">🔄 Subscription Renewed</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Great news! Your DishCore {{plan}} subscription has been successfully renewed.
            </p>
            <div style="background: rgba(21, 43, 71, 0.5); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(45, 163, 255, 0.2);">
              <p style="color: #8AA8CC; margin: 0 0 8px 0;">Next Billing Date:</p>
              <p style="color: #FFFFFF; font-size: 24px; font-weight: bold; margin: 0;">{{next_billing_date}}</p>
              <p style="color: #8AA8CC; margin: 16px 0 0 0;">Amount: <span style="color: #FFFFFF; font-weight: bold;">{{amount}}</span></p>
            </div>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Thank you for being a valued member of DishCore!
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://dishcore.life" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Continue Your Journey
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    payment_failed: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.3);">
          <div style="background: linear-gradient(135deg, #EF4444, #DC2626); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Payment Issue</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              We were unable to process your payment for the {{plan}} subscription.
            </p>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(239, 68, 68, 0.3);">
              <p style="color: #FCA5A5; font-weight: bold; margin: 0 0 8px 0;">Action Required</p>
              <p style="color: #B5D6FF; margin: 0;">We'll automatically retry on {{retry_date}}. Please update your payment method to avoid service interruption.</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{update_payment_url}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Update Payment Method
              </a>
            </div>
            <p style="color: #8AA8CC; font-size: 14px; text-align: center;">
              Need help? Contact us at <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    trial_ending: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.3);">
          <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Trial Ending Soon</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Your DishCore trial ends in just 3 days on {{trial_end_date}}.
            </p>
            <div style="background: rgba(251, 191, 36, 0.1); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(251, 191, 36, 0.3);">
              <p style="color: #FCD34D; font-weight: bold; margin: 0 0 12px 0;">Don't lose access to:</p>
              <ul style="color: #B5D6FF; margin: 0; padding-left: 20px;">
                <li>AI-powered meal analysis</li>
                <li>Personalized nutrition insights</li>
                <li>Progress tracking & reports</li>
                <li>Custom meal plans</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{upgrade_url}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(0, 163, 227, 0.4);">
                Upgrade Now
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    weekly_report: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #8B5CF6, #6366F1); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">📊 Your Weekly Report</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Here's your nutrition journey this week:
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0;">
              <div style="background: rgba(21, 43, 71, 0.5); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(45, 163, 255, 0.2);">
                <p style="color: #8AA8CC; margin: 0 0 8px 0; font-size: 14px;">Meals Logged</p>
                <p style="color: #00A3E3; font-size: 32px; font-weight: bold; margin: 0;">{{meals_logged}}</p>
              </div>
              <div style="background: rgba(21, 43, 71, 0.5); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(45, 163, 255, 0.2);">
                <p style="color: #8AA8CC; margin: 0 0 8px 0; font-size: 14px;">Avg Calories</p>
                <p style="color: #10B981; font-size: 32px; font-weight: bold; margin: 0;">{{avg_calories}}</p>
              </div>
            </div>
            <div style="background: linear-gradient(135deg, rgba(0, 163, 227, 0.1), rgba(139, 92, 246, 0.1)); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(45, 163, 255, 0.2);">
              <p style="color: #FCD34D; font-weight: bold; margin: 0 0 8px 0;">🔥 Current Streak: {{streak}} days</p>
              <p style="color: #B5D6FF; margin: 0;">{{insights}}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://dishcore.life" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                View Full Report
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    goal_achieved: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(16, 185, 129, 0.3);">
          <div style="background: linear-gradient(135deg, #10B981, #059669); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <div style="font-size: 64px; margin: 16px 0;">🎉</div>
            <h1 style="color: white; margin: 0; font-size: 32px;">Congratulations!</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Amazing work, {{user_name}}!</p>
            <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1)); padding: 32px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(16, 185, 129, 0.3); text-align: center;">
              <p style="color: #6EE7B7; font-size: 16px; margin: 0 0 12px 0;">You achieved your goal:</p>
              <p style="color: #FFFFFF; font-size: 28px; font-weight: bold; margin: 0 0 12px 0;">{{goal_name}}</p>
              <p style="color: #8AA8CC; font-size: 14px; margin: 0;">Completed on {{achievement_date}}</p>
            </div>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6; text-align: center;">
              This is just the beginning of your journey. Keep up the great work!
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://dishcore.life" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Set Your Next Goal
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    password_reset: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #6366F1, #4F46E5); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Reset Your Password</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              We received a request to reset your DishCore password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{reset_link}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(0, 163, 227, 0.4);">
                Reset Password
              </a>
            </div>
            <div style="background: rgba(251, 191, 36, 0.1); padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(251, 191, 36, 0.2);">
              <p style="color: #FCD34D; font-weight: bold; margin: 0 0 8px 0; font-size: 14px;">⚠️ Security Notice</p>
              <p style="color: #B5D6FF; margin: 0; font-size: 14px;">This link expires in {{expires_in}}. If you didn't request this, please ignore this email.</p>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    verify_email: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #00A3E3, #0080FF); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 80px; height: 80px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">✉️ Verify Your Email</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Welcome to DishCore! Please verify your email address to activate your account and start your nutrition journey.
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{verification_link}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(0, 163, 227, 0.4);">
                Verify Email Address
              </a>
            </div>
            <p style="color: #8AA8CC; font-size: 14px; text-align: center;">
              Or copy this link: <span style="color: #00A3E3;">{{verification_link}}</span>
            </p>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    subscription_cancelled: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #64748B, #475569); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <h1 style="color: white; margin: 0; font-size: 28px;">👋 Sorry to See You Go</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              Your DishCore subscription has been cancelled. You'll continue to have access until {{end_date}}.
            </p>
            <div style="background: rgba(21, 43, 71, 0.5); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(45, 163, 255, 0.2);">
              <p style="color: #B5D6FF; font-size: 16px; margin: 0;">
                We'd love to hear your feedback to improve DishCore for everyone.
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{feedback_url}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Share Feedback
              </a>
            </div>
            <p style="color: #8AA8CC; font-size: 14px; text-align: center;">
              Changed your mind? You can reactivate anytime at <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    feature_announcement: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #8B5CF6, #7C3AED); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">New Feature: {{feature_name}}</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              We're excited to announce a new feature that will enhance your DishCore experience!
            </p>
            <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.1)); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(139, 92, 246, 0.3);">
              <p style="color: #C4B5FD; font-weight: bold; margin: 0 0 12px 0; font-size: 18px;">{{feature_name}}</p>
              <p style="color: #B5D6FF; margin: 0;">{{feature_description}}</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="{{learn_more_url}}" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(0, 163, 227, 0.4);">
                Try It Now
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `,
    meal_reminder: `
      <div style="${baseStyle}">
        <div style="max-width: 600px; margin: 0 auto; background: #0D1F36; border-radius: 24px; overflow: hidden; border: 1px solid rgba(45, 163, 255, 0.2);">
          <div style="background: linear-gradient(135deg, #F59E0B, #D97706); padding: 40px; text-align: center;">
            <img src="${logo}" alt="DishCore" style="width: 60px; height: 60px; margin-bottom: 16px;" />
            <div style="font-size: 48px; margin-bottom: 16px;">🍽️</div>
            <h1 style="color: white; margin: 0; font-size: 28px;">Time to Log Your Meal</h1>
          </div>
          <div style="padding: 40px;">
            <p style="color: #FFFFFF; font-size: 18px;">Hi {{user_name}},</p>
            <p style="color: #B5D6FF; font-size: 16px; line-height: 1.6;">
              It's {{time}} - time for your {{meal_type}}! Don't forget to log what you eat to stay on track with your goals.
            </p>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid rgba(245, 158, 11, 0.3); text-align: center;">
              <p style="color: #FCD34D; font-size: 16px; margin: 0;">
                Consistent logging = Better results! 📈
              </p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <a href="https://dishcore.life" style="display: inline-block; background: linear-gradient(135deg, #00A3E3, #0080FF); color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 20px rgba(0, 163, 227, 0.4);">
                Log Meal Now
              </a>
            </div>
          </div>
          <div style="background: rgba(7, 24, 47, 0.5); padding: 20px; text-align: center; border-top: 1px solid rgba(45, 163, 255, 0.2);">
            <p style="color: #8AA8CC; font-size: 12px; margin: 0;">
              © 2025 DishCore | <a href="https://dishcore.life" style="color: #00A3E3; text-decoration: none;">dishcore.life</a>
            </p>
          </div>
        </div>
      </div>
    `
  };

  return templates[slug] || templates.welcome;
}