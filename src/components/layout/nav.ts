import { BarChart3, BookOpen, Calculator, CalendarDays, Crown, Layers, LayoutDashboard, Languages, Mic, Settings, Sparkles, type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  route: string;
  icon: LucideIcon;
  premium?: boolean;
}

export const NAV_MAIN: NavItem[] = [
  { label: 'Dashboard', route: 'dashboard', icon: LayoutDashboard },
  { label: 'Languages', route: 'languages', icon: Languages },
  { label: 'Mathematics', route: 'math', icon: Calculator },
  { label: 'Theory', route: 'theory', icon: BookOpen },
  { label: 'My Flashcards', route: 'flashcards', icon: Layers },
  { label: 'Learning Progress', route: 'progress', icon: BarChart3 },
];

export const NAV_PREMIUM: NavItem[] = [
  { label: 'AI Learning Coach', route: 'coach', icon: Sparkles, premium: true },
  { label: 'Learning Plan', route: 'plan', icon: CalendarDays, premium: true },
  { label: 'Voice Mode', route: 'voice', icon: Mic, premium: true },
];

export const NAV_FOOTER: NavItem[] = [
  { label: 'Upgrade to Premium', route: 'pricing', icon: Crown },
  { label: 'Settings', route: 'preferences', icon: Settings },
];

export const PREMIUM_FEATURE_NAMES: Record<string, string> = {
  coach: 'AI Learning Coach',
  plan: 'Personalized Learning Plan',
  voice: 'AI Voice Learning Mode',
};
