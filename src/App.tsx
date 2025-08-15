import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MainPage } from './components/MainPage';
import { ProjectDetail } from './components/ProjectDetail';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { MyPage } from './components/MyPage';
import { CreateProject } from './components/CreateProject';
import { AdminDashboard } from './components/AdminDashboard';

type Page = 'main' | 'project' | 'login' | 'register' | 'mypage' | 'create' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('main');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<'user' | 'creator' | 'admin'>('user');

  const handleNavigation = (page: Page, projectId?: string) => {
    setCurrentPage(page);
    if (projectId) {
      setSelectedProjectId(projectId);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentPage('main');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'main':
        return <MainPage onNavigate={handleNavigation} />;
      case 'project':
        return <ProjectDetail projectId={selectedProjectId} onNavigate={handleNavigation} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onNavigate={handleNavigation} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigation} />;
      case 'mypage':
        return <MyPage user={user} userRole={userRole} onNavigate={handleNavigation} />;
      case 'create':
        return <CreateProject onNavigate={handleNavigation} />;
      case 'admin':
        return <AdminDashboard onNavigate={handleNavigation} />;
      default:
        return <MainPage onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        user={user}
        userRole={userRole}
        onNavigate={handleNavigation}
        onLogout={() => setUser(null)}
      />
      {renderPage()}
    </div>
  );
}