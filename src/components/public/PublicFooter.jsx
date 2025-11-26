import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Facebook, Youtube, Instagram, Twitter, Mail } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Features", page: "Home" },
    { label: "Pricing", page: "Pricing" },
    { label: "Studio", page: "Studio" },
    { label: "Dashboard", page: "Dashboard" },
  ],
  resources: [
    { label: "Getting Started", page: "GettingStarted" },
    { label: "Knowledge Base", page: "KnowledgeBase" },
    { label: "FAQ", page: "FAQ" },
    { label: "Help Center", page: "HelpCenter" },
  ],
  company: [
    { label: "About", page: "About" },
    { label: "Privacy Policy", page: "PrivacyPolicy" },
    { label: "Terms of Service", page: "TermsOfService" },
    { label: "Admin", page: "Admin" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", color: "#1877F2" },
  { icon: Twitter, href: "https://twitter.com", color: "#1DA1F2" },
  { icon: Instagram, href: "https://instagram.com", gradient: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
  { icon: Youtube, href: "https://youtube.com", color: "#FF0000" },
];

export default function PublicFooter() {
  return (
    <footer 
      className="relative py-16 px-4"
      style={{ 
        background: 'var(--bg-surface)',
        borderTop: '1px solid rgba(45, 163, 255, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
                alt="DishCore"
                className="w-12 h-12 object-contain"
              />
              <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                DishCore
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6 max-w-sm" style={{ color: 'var(--text-muted)' }}>
              AI-powered nutrition platform for personalized health optimization. Transform your eating habits with intelligent meal planning and tracking.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon;
                return (
                  <a 
                    key={idx}
                    href={social.href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ background: social.gradient || social.color }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-sm mb-4 uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.page}>
                  <Link 
                    to={createPageUrl(link.page)} 
                    className="text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <a 
                href="mailto:support@dishcore.life" 
                className="text-sm hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-muted)' }}
              >
                support@dishcore.life
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(45, 163, 255, 0.1)' }}
        >
          <div className="text-center md:text-left">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © {new Date().getFullYear()} Digital Invest Inc. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to={createPageUrl('PrivacyPolicy')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>
              Privacy
            </Link>
            <Link to={createPageUrl('TermsOfService')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>
              Terms
            </Link>
            <a 
              href="https://dishcore.life" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium"
              style={{ 
                background: 'linear-gradient(135deg, #2DA3FF, #0A84FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              dishcore.life
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}