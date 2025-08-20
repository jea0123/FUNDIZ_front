import { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminDashboard } from './components/AdminDashboard';
import { CreateProject } from './components/CreateProject';
import { LoginPage } from './components/LoginPage';
import { MainPage } from './components/MainPage';
import { MyPage } from './components/MyPage';
import { Navbar } from './components/Navbar';
import { ProjectDetail } from './components/ProjectDetail';
import { RegisterPage } from './components/RegisterPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState<'user' | 'creator' | 'admin'>('user');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} userRole={userRole} onLogout={() => setUser(null)} />
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/project/:id' element={<ProjectDetail />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage onLogin={(userData) => { setUser(userData); setUserRole(userData.role); }} />} />
        <Route path='/mypage' element={<MyPage user={user} userRole={userRole} />} />
        <Route path='/create' element={<CreateProject />} />
        <Route path='/admin' element={<AdminDashboard />} />
      </Routes>
    </div>
  );
}