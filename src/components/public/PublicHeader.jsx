import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Menu, X, Sun, Moon } from "lucide-react";

const navLinks = [
  { label: "Home", page: "Home" },
  { label: "About", page: "About" },
  { label: "Pricing", page: "Pricing" },
  { label: "Help Center", page: "HelpCenter" },
];

export default function PublicHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('dishcore-theme') || 'dark');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dishcore-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-4'
      }`}
      style={{ 
        background: scrolled 
          ? (theme === 'dark' ? 'rgba(7, 24, 47, 0.95)' : 'rgba(255, 255, 255, 0.95)') 
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled 
          ? (theme === 'dark' ? '1px solid rgba(45, 163, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)') 
          : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to={createPageUrl("Home")} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
            alt="DishCore"
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            DishCore
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.page}
              to={createPageUrl(link.page)}
              className="text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ 
              background: theme === 'dark' ? 'linear-gradient(135deg, #FFB84D, #FF9500)' : 'linear-gradient(135deg, #4D9FFF, #0080FF)',
              boxShadow: theme === 'dark' ? '0 0 20px rgba(255, 184, 77, 0.3)' : '0 0 20px rgba(77, 159, 255, 0.3)'
            }}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          <Link to={createPageUrl("Dashboard")} className="hidden md:block">
            <Button 
              className="px-6 py-2 rounded-full text-sm font-semibold text-white border-0 hover:scale-105 transition-transform"
              style={{ 
                background: 'linear-gradient(135deg, #2DA3FF, #0A84FF)',
                boxShadow: '0 4px 15px rgba(45, 163, 255, 0.3)'
              }}
            >
              Get Started
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(45, 163, 255, 0.1)' }}
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            ) : (
              <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden absolute top-full left-0 right-0 p-4"
          style={{ 
            background: theme === 'dark' ? 'rgba(7, 24, 47, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: theme === 'dark' ? '1px solid rgba(45, 163, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)'
          }}
        >
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.page}
                to={createPageUrl(link.page)}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ 
                  color: 'var(--text-secondary)',
                  background: theme === 'dark' ? 'rgba(45, 163, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              to={createPageUrl("Dashboard")}
              onClick={() => setIsMenuOpen(false)}
              className="mt-2"
            >
              <Button 
                className="w-full py-3 rounded-xl text-sm font-semibold text-white border-0"
                style={{ 
                  background: 'linear-gradient(135deg, #2DA3FF, #0A84FF)',
                }}
              >
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}