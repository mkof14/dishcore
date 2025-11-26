import React from "react";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Download, Mail } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Privacy Policy
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Last updated: January 2025
            </p>
          </div>
        </div>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Lock className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Data We Collect
          </h2>
          <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Personal Information:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Name and email address</li>
                <li>Age, sex, height, weight</li>
                <li>Health goals and preferences</li>
                <li>Dietary restrictions and allergies</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Health Data:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Meal logs and nutrition data</li>
                <li>Body measurements and progress</li>
                <li>Wearable device data (steps, sleep, heart rate)</li>
                <li>Custom recipes and meal plans</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Usage Data:</h3>
              <ul className="list-disc ml-6 space-y-1">
                <li>Pages visited and features used</li>
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Eye className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            How We Use Your Data
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>• Provide personalized nutrition recommendations</p>
            <p>• Generate AI-powered meal plans and insights</p>
            <p>• Track your progress and achievements</p>
            <p>• Send reminders and notifications</p>
            <p>• Improve our services and features</p>
            <p>• Communicate with you about updates</p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Data Security
          </h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>We implement industry-standard security measures:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>End-to-end encryption for sensitive data</li>
              <li>Secure HTTPS connections</li>
              <li>Regular security audits</li>
              <li>Access controls and authentication</li>
              <li>Encrypted database storage</li>
            </ul>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Download className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Your Rights (GDPR)
          </h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Access</strong> - Request a copy of your data</li>
              <li><strong>Rectification</strong> - Correct inaccurate data</li>
              <li><strong>Erasure</strong> - Request deletion of your data</li>
              <li><strong>Portability</strong> - Export your data</li>
              <li><strong>Objection</strong> - Object to data processing</li>
              <li><strong>Restriction</strong> - Limit how we use your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, go to Settings → Data Export or contact us at{' '}
              <a href="mailto:privacy@dishcore.com" className="gradient-text font-semibold">
                privacy@dishcore.com
              </a>
            </p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Third-Party Services
          </h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>We integrate with:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Analytics</strong> - Google Analytics, Facebook Pixel (anonymized)</li>
              <li><strong>AI Services</strong> - OpenAI for meal planning and insights</li>
              <li><strong>Wearables</strong> - Apple Health, Fitbit, Garmin (with your permission)</li>
              <li><strong>Payment</strong> - Stripe (if applicable)</li>
            </ul>
            <p className="mt-3">
              These services have their own privacy policies. We share only necessary data.
            </p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Cookies
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>We use cookies for:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Authentication and session management</li>
              <li>User preferences (theme, language)</li>
              <li>Analytics and performance tracking</li>
            </ul>
            <p className="mt-3">You can disable cookies in your browser settings.</p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Mail className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Contact Us
          </h2>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p className="mb-3">Questions about privacy?</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@dishcore.com" className="gradient-text font-semibold">
                privacy@dishcore.com
              </a>
            </p>
            <p className="mt-2">
              <strong>Data Protection Officer:</strong>{' '}
              <a href="mailto:dpo@dishcore.com" className="gradient-text font-semibold">
                dpo@dishcore.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}