import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon, Globe, User } from "lucide-react";
import Footer from "@/components/Footer";

const publicMenuItems = [];

export default function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('dishcore-theme') || 'dark');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dishcore-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="min-h-screen flex flex-col noise-texture" style={{ background: 'var(--bg-page)' }}>
      {/* Premium Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" 
        style={{ 
          background: theme === 'dark' ? 'rgba(7, 24, 47, 0.8)' : 'rgba(255, 255, 255, 0.8)', 
          borderBottom: `1px solid ${theme === 'dark' ? 'rgba(45, 163, 255, 0.1)' : '#E2E8F0'}`,
          boxShadow: theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
                alt="DishCore"
                className="w-10 h-10 transition-all duration-300 group-hover:scale-110"
              />
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                DishCore
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {publicMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  className="nav-link text-sm font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                style={{ 
                  background: theme === 'dark' ? 'var(--bg-surface)' : '#F1F5F9',
                  border: `1px solid ${theme === 'dark' ? 'var(--border-soft)' : '#E2E8F0'}`
                }}
              >
                {theme === 'dark' ? 
                  <Sun className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} /> : 
                  <Moon className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                }
              </button>

              {/* Language Selector */}
              <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-opacity-80"
                style={{ background: theme === 'dark' ? 'var(--bg-surface)' : '#F1F5F9' }}>
                <Globe className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>EN</span>
              </button>

              {/* User Profile */}
              <Link to={createPageUrl("Dashboard")} className="hidden md:block">
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ 
                    background: 'var(--gradient-blue)',
                    boxShadow: '0 4px 12px var(--accent-glow)'
                  }}>
                  <User className="w-5 h-5 text-white" />
                </button>
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-3">
              {publicMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.url}
                  className="text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link to={createPageUrl("Dashboard")} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full btn-primary-glow rounded-full py-3">
                  Get Started
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}