import React, { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  UserCircle,
  X,
} from 'lucide-react';
import { BrandMark } from './BrandMark.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface WorkspaceLayoutProps {
  currentPath: string;
  pageTitle: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export function WorkspaceLayout({
  currentPath,
  pageTitle,
  onNavigate,
  children,
}: WorkspaceLayoutProps) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Overview', Icon: LayoutDashboard },
    { path: '/profile', label: 'Student Profile', Icon: UserCircle },
    { path: '/assessment', label: 'Assessment & ML', Icon: ClipboardCheck },
    { path: '/careers', label: 'Skill Gaps & Roles', Icon: Compass },
    { path: '/roadmap', label: 'Learning Roadmap', Icon: BookOpen },
    { path: '/resume', label: 'Resume Analyzer', Icon: FileText },
    { path: '/methodology', label: 'Model & Dataset', Icon: BarChart3 },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: 'Admin Console', Icon: Shield });
  }

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('/');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 border-r border-slate-200 dark:border-slate-800 dark:bg-slate-900">
      <div>
        <div className="px-2 pb-5 border-b border-slate-100 dark:border-slate-800">
          <BrandMark onClick={() => handleNav('/')} />
        </div>

        <nav aria-label="Workspace navigation" className="mt-5 space-y-1">
          {navItems.map(({ path, label, Icon }) => {
            const active = currentPath === path;
            return (
              <button
                key={path}
                type="button"
                onClick={() => handleNav(path)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-blue-50 text-[#1D4ED8] dark:bg-blue-950/60 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-2 dark:border-slate-800">
        <div className="px-3 py-1.5">
          <div className="truncate text-xs font-semibold text-slate-900 dark:text-white">
            {user?.name}
          </div>
          <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
            {user?.role === 'admin' ? 'Administrator' : 'Student'} · {user?.email}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          <span>{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
        </button>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">{SidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-68 max-w-[85vw]">{SidebarContent}</div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="relative z-10 m-3 h-10 w-10 rounded-lg bg-white text-slate-900 flex items-center justify-center shadow"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-6 py-3.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
              CareerIQ <span className="mx-1.5 text-slate-300">/</span>{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{pageTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/assessment')}
              className="rounded-lg bg-[#1D4ED8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              Run assessment
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
