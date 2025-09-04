import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AdminDashboard } from './components/AdminDashboard';
import { CreateProject } from './components/CreateProject';
import { LoginPage } from './components/LoginPage';
import { MainPage } from './components/MainPage';
import { MyPage } from './components/MyPage';
import { Navbar } from './components/Navbar';
import { RegisterPage } from './components/RegisterPage';
import { CustomerCenterPage } from './components/CustomerCenter';
import { AdminCS } from './components/AdminCS';
import { useLoginUserStore } from './store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { endpoints, getData } from './api/apis';
import Main from './views/Main';
import { ProjectDetailPage } from './components/ProjectDetail';

export default function App() {
  const { setLoginUser, resetLoginUser } = useLoginUserStore();
  const [cookie] = useCookies();

  useEffect(() => {
    if (cookie.accessToken) {
      getData(endpoints.getLoginUser, cookie.accessToken).then(getLoginUserResponse);
    }
  }, [cookie.accessToken]);

  const getLoginUserResponse = (response: any) => {
    if (response.status === 200) {
      setLoginUser(response.data);
    } else {
      resetLoginUser();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path='/' element={<Main />} />
        <Route path='/project/:projectId' element={<ProjectDetailPage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/mypage' element={<MyPage />} />
        <Route path='/create' element={<CreateProject />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/cs' element={<CustomerCenterPage />} />
        <Route path='/test2' element={<AdminCS />} />
      </Routes>
    </div>
  );
}