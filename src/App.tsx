import React, { useCallback, useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { WorkspaceLayout } from './components/WorkspaceLayout.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AssessmentPage } from './pages/AssessmentPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { ModelInfoPage } from './pages/ModelInfoPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage.tsx';
import { RoadmapLearnPage } from './pages/RoadmapLearnPage.tsx';
import { RoadmapPage } from './pages/RoadmapPage.tsx';
import { SkillGapCareersPage } from './pages/SkillGapCareersPage.tsx';

function CareerIqRouter() {
  const { user, loading } = useAuth();
  const [path, setPath] = useState<string>(() => window.location.pathname || '/');

  const navigate = useCallback((nextPath: string) => {
    if (nextPath !== window.location.pathname) {
      window.history.pushState({}, '', nextPath);
    }
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  if (path === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (path === '/register') {
    return <AuthPage mode="register" onNavigate={navigate} />;
  }

  if (path === '/login') {
    return <AuthPage mode="login" onNavigate={navigate} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-slate-950">
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
          Loading CareerIQ workspace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage mode="login" onNavigate={navigate} />;
  }

  const pageMeta: Record<string, { title: string; element: React.ReactNode }> = {
    '/dashboard': { title: 'Overview', element: <DashboardPage onNavigate={navigate} /> },
    '/profile': { title: 'Student Profile', element: <ProfilePage onNavigate={navigate} /> },
    '/assessment': { title: 'Assessment & ML', element: <AssessmentPage onNavigate={navigate} /> },
    '/careers': {
      title: 'Skill Gaps & Roles',
      element: <SkillGapCareersPage onNavigate={navigate} />,
    },
    '/roadmap': { title: 'Learning Roadmap', element: <RoadmapPage onNavigate={navigate} /> },
    '/resume': { title: 'Resume Analyzer', element: <ResumeAnalyzerPage /> },
    '/methodology': { title: 'Model & Dataset', element: <ModelInfoPage /> },
    '/admin': {
      title: 'Admin Console',
      element:
        user.role === 'admin' ? (
          <AdminDashboardPage />
        ) : (
          <DashboardPage onNavigate={navigate} />
        ),
    },
  };

  if (path.startsWith('/roadmap/learn/')) {
    const taskId = decodeURIComponent(path.slice('/roadmap/learn/'.length));
    return (
      <WorkspaceLayout currentPath="/roadmap" pageTitle="Learning Guide" onNavigate={navigate}>
        <RoadmapLearnPage taskId={taskId} onNavigate={navigate} />
      </WorkspaceLayout>
    );
  }

  const current = pageMeta[path] || pageMeta['/dashboard'];

  return (
    <WorkspaceLayout currentPath={path} pageTitle={current.title} onNavigate={navigate}>
      {current.element}
    </WorkspaceLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CareerIqRouter />
    </AuthProvider>
  );
}
