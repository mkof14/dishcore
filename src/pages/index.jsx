import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Profile from "./Profile";

import MenuPlanner from "./MenuPlanner";

import Settings from "./Settings";

import AIAssistant from "./AIAssistant";

import Tracking from "./Tracking";

import Analytics from "./Analytics";

import FoodScanner from "./FoodScanner";

import Recommendations from "./Recommendations";

import GroceryList from "./GroceryList";

import BodyMeasurements from "./BodyMeasurements";

import BodyGoals from "./BodyGoals";

import AIBodyCoach from "./AIBodyCoach";

import Reports from "./Reports";

import RestaurantMode from "./RestaurantMode";

import Community from "./Community";

import Achievements from "./Achievements";

import StudioLanding from "./StudioLanding";

import StudioHub from "./StudioHub";

import StudioScore from "./StudioScore";

import StudioMetabolism from "./StudioMetabolism";

import StudioMenuEngine from "./StudioMenuEngine";

import StudioCulture from "./StudioCulture";

import StudioMood from "./StudioMood";

import StudioForecast from "./StudioForecast";

import StudioCoach from "./StudioCoach";

import StudioPreferences from "./StudioPreferences";

import StudioReports from "./StudioReports";

import Onboarding from "./Onboarding";

import WearablesSettings from "./WearablesSettings";

import DesignGuide from "./DesignGuide";

import AIInsights from "./AIInsights";

import CommunityForums from "./CommunityForums";

import CommunityGroups from "./CommunityGroups";

import MicronutrientInsights from "./MicronutrientInsights";

import AdaptiveMenuDaily from "./AdaptiveMenuDaily";

import Studio from "./Studio";

import UserProfile from "./UserProfile";

import ForumTopic from "./ForumTopic";

import Friends from "./Friends";

import Progress from "./Progress";

import Goals from "./Goals";

import LearningCenter from "./LearningCenter";

import GettingStarted from "./GettingStarted";

import KnowledgeBase from "./KnowledgeBase";

import FAQ from "./FAQ";

import PrivacyPolicy from "./PrivacyPolicy";

import Pricing from "./Pricing";

import TermsOfService from "./TermsOfService";

import Home from "./Home";

import About from "./About";

import HelpCenter from "./HelpCenter";

import RecipeDiscovery from "./RecipeDiscovery";

import VoiceCoach from "./VoiceCoach";

import Admin from "./Admin";

import AdminUsers from "./AdminUsers";

import AdminFinance from "./AdminFinance";

import AdminProductUsage from "./AdminProductUsage";

import AdminMonitoring from "./AdminMonitoring";

import AdminSettings from "./AdminSettings";

import AdminAudit from "./AdminAudit";

import AdminContent from "./AdminContent";

import AdminRoles from "./AdminRoles";

import NotificationSettings from "./NotificationSettings";

import AdminNotifications from "./AdminNotifications";

import ProgressTracking from "./ProgressTracking";

import ContentModeration from "./ContentModeration";

import SupportTickets from "./SupportTickets";

import ContentAnalytics from "./ContentAnalytics";

import SupportAnalytics from "./SupportAnalytics";

import TicketAutomation from "./TicketAutomation";

import Security from "./Security";

import NotificationHistory from "./NotificationHistory";

import AdminEmailTemplates from "./AdminEmailTemplates";

import DishLibrary from "./DishLibrary";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Profile: Profile,
    
    MenuPlanner: MenuPlanner,
    
    Settings: Settings,
    
    AIAssistant: AIAssistant,
    
    Tracking: Tracking,
    
    Analytics: Analytics,
    
    FoodScanner: FoodScanner,
    
    Recommendations: Recommendations,
    
    GroceryList: GroceryList,
    
    BodyMeasurements: BodyMeasurements,
    
    BodyGoals: BodyGoals,
    
    AIBodyCoach: AIBodyCoach,
    
    Reports: Reports,
    
    RestaurantMode: RestaurantMode,
    
    Community: Community,
    
    Achievements: Achievements,
    
    StudioLanding: StudioLanding,
    
    StudioHub: StudioHub,
    
    StudioScore: StudioScore,
    
    StudioMetabolism: StudioMetabolism,
    
    StudioMenuEngine: StudioMenuEngine,
    
    StudioCulture: StudioCulture,
    
    StudioMood: StudioMood,
    
    StudioForecast: StudioForecast,
    
    StudioCoach: StudioCoach,
    
    StudioPreferences: StudioPreferences,
    
    StudioReports: StudioReports,
    
    Onboarding: Onboarding,
    
    WearablesSettings: WearablesSettings,
    
    DesignGuide: DesignGuide,
    
    AIInsights: AIInsights,
    
    CommunityForums: CommunityForums,
    
    CommunityGroups: CommunityGroups,
    
    MicronutrientInsights: MicronutrientInsights,
    
    AdaptiveMenuDaily: AdaptiveMenuDaily,
    
    Studio: Studio,
    
    UserProfile: UserProfile,
    
    ForumTopic: ForumTopic,
    
    Friends: Friends,
    
    Progress: Progress,
    
    Goals: Goals,
    
    LearningCenter: LearningCenter,
    
    GettingStarted: GettingStarted,
    
    KnowledgeBase: KnowledgeBase,
    
    FAQ: FAQ,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Pricing: Pricing,
    
    TermsOfService: TermsOfService,
    
    Home: Home,
    
    About: About,
    
    HelpCenter: HelpCenter,
    
    RecipeDiscovery: RecipeDiscovery,
    
    VoiceCoach: VoiceCoach,
    
    Admin: Admin,
    
    AdminUsers: AdminUsers,
    
    AdminFinance: AdminFinance,
    
    AdminProductUsage: AdminProductUsage,
    
    AdminMonitoring: AdminMonitoring,
    
    AdminSettings: AdminSettings,
    
    AdminAudit: AdminAudit,
    
    AdminContent: AdminContent,
    
    AdminRoles: AdminRoles,
    
    NotificationSettings: NotificationSettings,
    
    AdminNotifications: AdminNotifications,
    
    ProgressTracking: ProgressTracking,
    
    ContentModeration: ContentModeration,
    
    SupportTickets: SupportTickets,
    
    ContentAnalytics: ContentAnalytics,
    
    SupportAnalytics: SupportAnalytics,
    
    TicketAutomation: TicketAutomation,
    
    Security: Security,
    
    NotificationHistory: NotificationHistory,
    
    AdminEmailTemplates: AdminEmailTemplates,
    
    DishLibrary: DishLibrary,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/MenuPlanner" element={<MenuPlanner />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/AIAssistant" element={<AIAssistant />} />
                
                <Route path="/Tracking" element={<Tracking />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/FoodScanner" element={<FoodScanner />} />
                
                <Route path="/Recommendations" element={<Recommendations />} />
                
                <Route path="/GroceryList" element={<GroceryList />} />
                
                <Route path="/BodyMeasurements" element={<BodyMeasurements />} />
                
                <Route path="/BodyGoals" element={<BodyGoals />} />
                
                <Route path="/AIBodyCoach" element={<AIBodyCoach />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/RestaurantMode" element={<RestaurantMode />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/Achievements" element={<Achievements />} />
                
                <Route path="/StudioLanding" element={<StudioLanding />} />
                
                <Route path="/StudioHub" element={<StudioHub />} />
                
                <Route path="/StudioScore" element={<StudioScore />} />
                
                <Route path="/StudioMetabolism" element={<StudioMetabolism />} />
                
                <Route path="/StudioMenuEngine" element={<StudioMenuEngine />} />
                
                <Route path="/StudioCulture" element={<StudioCulture />} />
                
                <Route path="/StudioMood" element={<StudioMood />} />
                
                <Route path="/StudioForecast" element={<StudioForecast />} />
                
                <Route path="/StudioCoach" element={<StudioCoach />} />
                
                <Route path="/StudioPreferences" element={<StudioPreferences />} />
                
                <Route path="/StudioReports" element={<StudioReports />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/WearablesSettings" element={<WearablesSettings />} />
                
                <Route path="/DesignGuide" element={<DesignGuide />} />
                
                <Route path="/AIInsights" element={<AIInsights />} />
                
                <Route path="/CommunityForums" element={<CommunityForums />} />
                
                <Route path="/CommunityGroups" element={<CommunityGroups />} />
                
                <Route path="/MicronutrientInsights" element={<MicronutrientInsights />} />
                
                <Route path="/AdaptiveMenuDaily" element={<AdaptiveMenuDaily />} />
                
                <Route path="/Studio" element={<Studio />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/ForumTopic" element={<ForumTopic />} />
                
                <Route path="/Friends" element={<Friends />} />
                
                <Route path="/Progress" element={<Progress />} />
                
                <Route path="/Goals" element={<Goals />} />
                
                <Route path="/LearningCenter" element={<LearningCenter />} />
                
                <Route path="/GettingStarted" element={<GettingStarted />} />
                
                <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
                
                <Route path="/FAQ" element={<FAQ />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/HelpCenter" element={<HelpCenter />} />
                
                <Route path="/RecipeDiscovery" element={<RecipeDiscovery />} />
                
                <Route path="/VoiceCoach" element={<VoiceCoach />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/AdminFinance" element={<AdminFinance />} />
                
                <Route path="/AdminProductUsage" element={<AdminProductUsage />} />
                
                <Route path="/AdminMonitoring" element={<AdminMonitoring />} />
                
                <Route path="/AdminSettings" element={<AdminSettings />} />
                
                <Route path="/AdminAudit" element={<AdminAudit />} />
                
                <Route path="/AdminContent" element={<AdminContent />} />
                
                <Route path="/AdminRoles" element={<AdminRoles />} />
                
                <Route path="/NotificationSettings" element={<NotificationSettings />} />
                
                <Route path="/AdminNotifications" element={<AdminNotifications />} />
                
                <Route path="/ProgressTracking" element={<ProgressTracking />} />
                
                <Route path="/ContentModeration" element={<ContentModeration />} />
                
                <Route path="/SupportTickets" element={<SupportTickets />} />
                
                <Route path="/ContentAnalytics" element={<ContentAnalytics />} />
                
                <Route path="/SupportAnalytics" element={<SupportAnalytics />} />
                
                <Route path="/TicketAutomation" element={<TicketAutomation />} />
                
                <Route path="/Security" element={<Security />} />
                
                <Route path="/NotificationHistory" element={<NotificationHistory />} />
                
                <Route path="/AdminEmailTemplates" element={<AdminEmailTemplates />} />
                
                <Route path="/DishLibrary" element={<DishLibrary />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}