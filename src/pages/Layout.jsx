
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard, User, Utensils, CalendarDays, MessageCircle, Activity,
  BarChart3, Camera, Sparkles, ShoppingBag, Settings, Moon, Sun,
  Ruler, Target, Heart, FileText, ChefHat, Users, Trophy, TrendingUp,
  ChevronDown, HelpCircle, BookOpen, ArrowLeft, Home
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ErrorBoundary from "@/components/ErrorBoundary";
import PublicHeader from "@/components/public/PublicHeader";
import PublicFooter from "@/components/public/PublicFooter";
import { initGA, initFacebookPixel, useAnalytics } from "@/components/Analytics";
import { enforceHTTPS } from "@/components/utils/security";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import ChatbotWidget from "@/components/support/ChatbotWidget";
import NPSSurvey from "@/components/feedback/NPSSurvey";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Admin Panel", url: createPageUrl("Admin"), icon: Settings, adminOnly: true },
  { title: "Body Measurements", url: createPageUrl("BodyMeasurements"), icon: Ruler },
  { title: "Body Goals", url: createPageUrl("BodyGoals"), icon: Target },
  { title: "Progress Tracking", url: createPageUrl("Progress"), icon: TrendingUp },
  { title: "AI Body Coach", url: createPageUrl("AIBodyCoach"), icon: Heart },
  { title: "Reports & Share", url: createPageUrl("Reports"), icon: FileText },
  { title: "Recipe Discovery", url: createPageUrl("RecipeDiscovery"), icon: BookOpen },
  { title: "Dish Library", url: createPageUrl("DishLibrary"), icon: Utensils },
  { title: "Menu Planner", url: createPageUrl("MenuPlanner"), icon: CalendarDays },
  { title: "AI DishCore Advisor", url: createPageUrl("AIAssistant"), icon: MessageCircle },
  { title: "AI Voice Coach", url: createPageUrl("VoiceCoach"), icon: MessageCircle },
  { title: "Tracking", url: createPageUrl("Tracking"), icon: Activity },
  { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3 },
  { title: "Food Scanner", url: createPageUrl("FoodScanner"), icon: Camera },
  { title: "Restaurant Mode", url: createPageUrl("RestaurantMode"), icon: ChefHat },
  { title: "Achievements", url: createPageUrl("Achievements"), icon: Trophy },
  { title: "Community", url: createPageUrl("Community"), icon: Users },
  { title: "Recommendations", url: createPageUrl("Recommendations"), icon: Sparkles },
  { title: "Grocery List", url: createPageUrl("GroceryList"), icon: ShoppingBag },
  { title: "Wearables", url: createPageUrl("WearablesSettings"), icon: Activity },
  { title: "Learning Center", url: createPageUrl("LearningCenter"), icon: HelpCircle },
];

// Public pages that should not show sidebar
const publicPages = ['Home', 'Pricing', 'About', 'HelpCenter', 'PrivacyPolicy', 'TermsOfService'];

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('dishcore-theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(null);

  useAnalytics();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await import('@/api/base44Client').then(m => m.base44.auth.me());
        setCurrentUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dishcore-theme', theme);
  }, [theme]);

  useEffect(() => {
    enforceHTTPS();
    const gaId = process.env.REACT_APP_GA_MEASUREMENT_ID;
    const fbId = process.env.REACT_APP_FB_PIXEL_ID;
    if (gaId) initGA(gaId);
    if (fbId) initFacebookPixel(fbId);
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // Sync theme from localStorage for public pages
  useEffect(() => {
    const handleStorageChange = () => {
      const storedTheme = localStorage.getItem('dishcore-theme') || 'dark';
      if (storedTheme !== theme) {
        setTheme(storedTheme);
      }
    };
    
    // Listen for storage changes from other components (like PublicHeader)
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for same-window changes
    const interval = setInterval(() => {
      const storedTheme = localStorage.getItem('dishcore-theme') || 'dark';
      if (storedTheme !== theme) {
        setTheme(storedTheme);
      }
    }, 100);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [theme]);

  // If it's a public page, render with public header/footer
  if (publicPages.includes(currentPageName)) {
    return (
      <div className={`min-h-screen flex flex-col ${theme}`} data-theme={theme} style={{ background: 'var(--bg-page)' }}>
        <style>{`
          :root, .dark, [data-theme="dark"] {
            --bg-page: #07182F;
            --bg-surface: #0D1F36;
            --bg-surface-alt: #152B47;
            --bg-card: rgba(13, 31, 54, 0.6);
            --text-primary: #FFFFFF;
            --text-secondary: #B5D6FF;
            --text-muted: #8AA8CC;
            --accent-from: #2DA3FF;
            --accent-to: #0A84FF;
            --border: rgba(45, 163, 255, 0.1);
            --border-soft: rgba(45, 163, 255, 0.1);
            --background: #07182F;
            --surface: #0D1F36;
          }
          .light, [data-theme="light"] {
            --bg-page: #F8FAFC;
            --bg-surface: #FFFFFF;
            --bg-surface-alt: #F1F5F9;
            --bg-card: rgba(255, 255, 255, 0.9);
            --text-primary: #0F172A;
            --text-secondary: #475569;
            --text-muted: #64748B;
            --border: #E2E8F0;
            --border-soft: #E2E8F0;
            --background: #F8FAFC;
            --surface: #FFFFFF;
            --accent-from: #2DA3FF;
            --accent-to: #0A84FF;
          }
          body {
            background: var(--bg-page) !important;
          }
        `}</style>
        <PublicHeader />
        <main className="flex-1 pt-20" style={{ background: 'var(--bg-page)' }}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --bg-page: #1A202C;
          --bg-surface: #2D3748;
          --bg-surface-alt: #374151;
          --text-primary: #FFFFFF;
          --text-secondary: #D4DFE6;
          --text-muted: #9CA3AF;
          --accent-primary: #00A3E3;
          --border-soft: rgba(255, 255, 255, 0.12);
          --background: #1A202C;
          --surface: #2D3748;
          --border: rgba(255, 255, 255, 0.12);
          --accent-from: #00A3E3;
          --accent-to: #0080FF;
        }
        .light {
          --bg-page: #F9FAFB;
          --bg-surface: #FFFFFF;
          --bg-surface-alt: #F2F4F7;
          --text-primary: #1C1E21;
          --text-secondary: #4A4F55;
          --text-muted: #7B8086;
          --border-soft: #E5E7EB;
          --background: #F9FAFB;
          --surface: #FFFFFF;
          --border: #E5E7EB;
        }
        body { background: var(--bg-page) !important; }
        /* outline buttons use transparent bg */
        button.gradient-accent {
          background: linear-gradient(135deg, var(--accent-from), var(--accent-to)) !important;
          color: white !important;
          border: none !important;
        }
        .menu-item-active {
          background: linear-gradient(135deg, #00A3E3, #0080FF) !important;
          box-shadow: 0 0 20px rgba(0, 163, 227, 0.3);
          border: none !important;
        }
        .menu-item-active span, .menu-item-active svg {
          color: #FFFFFF !important;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
          font-weight: 700;
        }
      `}</style>
      <div className="min-h-screen flex w-full" style={{ background: 'var(--bg-page)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-surface)' }}>
          <SidebarHeader className="border-b p-4 flex items-center justify-center gap-3" style={{ borderColor: 'var(--border-soft)' }}>
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
              alt="DishCore"
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>DishCore</h1>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <Link to={createPageUrl('Studio')}>
              <div className="mb-4 p-3 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(0, 163, 227, 0.15), rgba(0, 128, 255, 0.15))',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(var(--bg-surface), var(--bg-surface)), linear-gradient(135deg, #00A3E3, #0080FF)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}>
                <span className="text-sm font-bold whitespace-nowrap" 
                  style={{ 
                    background: 'linear-gradient(135deg, #00A3E3, #0080FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                  DishCore Studio™
                </span>
              </div>
            </Link>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-3 py-2" 
                style={{ color: 'var(--text-muted)' }}>
                Member Zone
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    // Skip admin-only items if user is not admin
                    if (item.adminOnly && currentUser?.role !== 'admin') {
                      return null;
                    }

                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`rounded-xl mb-1 transition-all duration-200 ${isActive ? 'menu-item-active' : ''}`}
                          style={!isActive ? { color: 'var(--text-secondary)' } : {}}>
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                            <item.icon size={20} />
                            <span className="font-medium text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col relative">
          <header className="border-b px-4 md:px-6 py-3" style={{ borderColor: 'var(--border-soft)', background: 'var(--bg-surface)' }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden p-2 rounded-lg" />
                
                {/* Back Button */}
                <button 
                  onClick={() => window.history.back()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: 'rgba(0, 163, 227, 0.1)',
                    border: '1px solid rgba(0, 163, 227, 0.2)'
                  }}
                >
                  <ArrowLeft className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
                </button>

                {/* Home Button */}
                <Link 
                  to={createPageUrl('Home')}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                  style={{ 
                    background: 'rgba(0, 163, 227, 0.1)',
                    border: '1px solid rgba(0, 163, 227, 0.2)'
                  }}
                >
                  <Home className="w-4 h-4" style={{ color: 'var(--accent-from)' }} />
                </Link>

                <div className="flex items-center gap-3">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6917c77b0e566a8b7a19860e/992333ee8_DishCore3.png"
                    alt="DishCore"
                    className="w-8 h-8 object-contain"
                  />
                  <h1 className="text-base md:text-lg font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>
                    DishCore
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <NotificationCenter />
                <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: theme === 'dark' ? 'linear-gradient(135deg, #FFB84D, #FF9500)' : 'linear-gradient(135deg, #4D9FFF, #0080FF)', border: 'none',
                    boxShadow: theme === 'dark' ? '0 0 20px rgba(255, 184, 77, 0.3)' : '0 0 20px rgba(77, 159, 255, 0.3)' }}>
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-8 md:h-9 px-3" style={{ borderColor: 'var(--border-soft)' }}>
                      <User size={14} className="mr-2" />
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Profile')}>
                      <User size={14} className="mr-2" /><span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Settings')}>
                      <Settings size={14} className="mr-2" /><span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>

          <PublicFooter />

          {/* DishCore Assistant */}
          <ChatbotWidget />

          {/* NPS Survey */}
          <NPSSurvey />
        </main>
      </div>
    </SidebarProvider>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ErrorBoundary>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </ErrorBoundary>
  );
}
