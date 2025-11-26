import React from "react";
import { Card } from "@/components/ui/card";
import { FileText, Scale, Shield } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: 'var(--bg-page)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Terms of Service
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Last updated: January 2025
            </p>
          </div>
        </div>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Scale className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Acceptance of Terms
          </h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>
              By accessing and using DishCore ("the Service"), you accept and agree to be bound by these Terms of Service.
            </p>
            <p>
              If you do not agree to these terms, please do not use the Service.
            </p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Service Description
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>DishCore provides:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>AI-powered nutrition tracking and meal planning</li>
              <li>Health analytics and insights</li>
              <li>Body measurement tracking</li>
              <li>Wearable device integration</li>
              <li>Community features and social sharing</li>
            </ul>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            User Responsibilities
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>You agree to:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Provide accurate information</li>
              <li>Keep your account credentials secure</li>
              <li>Not misuse or abuse the Service</li>
              <li>Not share harmful or inappropriate content</li>
              <li>Comply with all applicable laws</li>
            </ul>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--accent-from)' }} />
            Medical Disclaimer
          </h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p className="font-semibold text-orange-400">
              IMPORTANT: DishCore is NOT a medical service.
            </p>
            <p>
              The Service provides wellness guidance and tracking tools. It does not:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Diagnose medical conditions</li>
              <li>Provide medical treatment</li>
              <li>Replace professional healthcare advice</li>
              <li>Prescribe medications or supplements</li>
            </ul>
            <p>
              Always consult qualified healthcare professionals for medical advice, diagnosis, or treatment.
            </p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Subscription & Payments
          </h2>
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p><strong>Billing:</strong> Subscriptions are billed monthly or annually in advance.</p>
            <p><strong>Free Trial:</strong> 14 days on paid plans. Cancel anytime before trial ends to avoid charges.</p>
            <p><strong>Cancellation:</strong> Cancel anytime from Settings. Access continues until end of billing period.</p>
            <p><strong>Refunds:</strong> 30-day money-back guarantee on first payment.</p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Intellectual Property
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>All content, features, and functionality are owned by BioMath Core and protected by copyright.</p>
            <p>You retain ownership of your personal data and content you create (custom recipes, notes, etc.).</p>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Limitation of Liability
          </h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>
              DishCore is provided "as is" without warranties. We are not liable for:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Health outcomes or results</li>
              <li>Data accuracy from third-party integrations</li>
              <li>Service interruptions</li>
              <li>User-generated content</li>
            </ul>
          </div>
        </Card>

        <Card className="gradient-card border-0 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Contact
          </h2>
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Questions about these terms?</p>
            <p className="mt-2">
              Email: <a href="mailto:legal@dishcore.com" className="gradient-text font-semibold">legal@dishcore.com</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}