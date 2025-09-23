import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CreateProject } from './views/project/CreateProject';
import { LoginPage } from './components/LoginPage';
import { MyPage } from './components/MyPage';
import { Navbar } from './components/Navbar';
import { RegisterPage } from './components/RegisterPage';
import { CustomerCenterPage } from './components/CustomerCenter';
import { AdminCS } from './components/AdminCS';
import { useLoginUserStore } from './store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { endpoints, getData } from './api/apis';
import { ProjectDetailPage } from './views/project/ProjectDetail';
import ErrorPage from './views/ErrorPage';
import MainPage from './views/MainPage';
import { setNavigator } from './utils/navigator';
import { ProjectsPage } from './views/project/ProjectsPage';
import { CSPage } from './views/cs/CSPage';
import { NoticeDetailPage } from './views/cs/NoticeDetail';
import { FundingPage } from './components/FundingPage';

const AdminDashboard = lazy(() => import('./views/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

export default function App() {
  const { setLoginUser, resetLoginUser } = useLoginUserStore();
  const [cookie] = useCookies();

  function NavigatorRegistrar() {
    const navigate = useNavigate();
    useEffect(() => setNavigator(navigate), [navigate]);
    return null; // 렌더링 없음
  }

  useEffect(() => {
    const getLoginUserResponse = (response: any) => {
      if (response.status === 200) {
        setLoginUser(response.data);
      } else {
        resetLoginUser();
      }
    };

    if (cookie.accessToken) {
      getData(endpoints.getLoginUser, cookie.accessToken).then(getLoginUserResponse);
    }
  }, [cookie.accessToken]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50">
        <NavigatorRegistrar />
        <Navbar />
        <Routes>
          <Route path='/' element={<MainPage />} />

          <Route path='/auth'>
            <Route path='register' element={<RegisterPage />} />
            <Route path='login' element={<LoginPage />} />
          </Route>

        <Route path='/project'>
          <Route index element={<ProjectsPage />} />
          <Route path='category/:ctgrId' element={<ProjectsPage />} />
          <Route path='category/:ctgrId/:subctgrId' element={<ProjectsPage />} />
          <Route path=':projectId' element={<ProjectDetailPage />} />
          <Route path='create' element={<CreateProject />} />
          <Route path=':projectId/backing' element={<FundingPage onBackClick={function (): void {
              throw new Error('Function not implemented.');
            } } onCompleteClick={function (): void {
              throw new Error('Function not implemented.');
            } } />} />
        </Route>

          <Route path='/user'>
            <Route path='mypage' element={<MyPage />} />
          </Route>

          <Route path='/admin'>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='cs' element={<CustomerCenterPage />} />
            <Route path='test2' element={<AdminCS />} />
            <Route path='test3' element={<AdminCSBackup />} />
          </Route>

          <Route path="/cs">
            <Route index element={<CSPage />} />
            <Route path='notice/:noticeId' element={<NoticeDetailPage />} />
          </Route>

          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </div>
    </Suspense>
  );
}