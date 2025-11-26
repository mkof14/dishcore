import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Facebook, Youtube, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t py-12 px-4" 
      style={{ 
        borderColor: 'var(--border-soft)', 
        background: 'var(--bg-surface)'
      }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>About DishCore</h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              AI-powered nutrition platform for personalized health optimization and wellness tracking.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Resources</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to={createPageUrl("GettingStarted")} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Getting Started</Link></li>
              <li><Link to={createPageUrl("KnowledgeBase")} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Knowledge Base</Link></li>
              <li><Link to={createPageUrl("FAQ")} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>FAQ</Link></li>
              <li><Link to={createPageUrl("HelpCenter")} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Company</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to={createPageUrl('Home')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Home</Link></li>
              <li><Link to={createPageUrl('About')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>About</Link></li>
              <li><Link to={createPageUrl('Pricing')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Pricing</Link></li>
              <li><Link to={createPageUrl('PrivacyPolicy')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: '#1877F2' }}>
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: '#FF0000' }}>
                <Youtube className="w-5 h-5 text-white" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}>
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t pt-6" style={{ borderColor: 'var(--border-soft)' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>© 2025 Digital Invest Inc. All rights reserved.</p>
              <a href="https://dishcore.life" target="_blank" rel="noopener noreferrer" className="text-xs gradient-text hover:opacity-80 transition-opacity">dishcore.life</a>
            </div>
            <div className="flex gap-4 text-xs">
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Privacy Policy</Link>
              <Link to={createPageUrl('TermsOfService')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Terms of Service</Link>
              <Link to={createPageUrl('HelpCenter')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--text-muted)' }}>Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}