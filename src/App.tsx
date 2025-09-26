import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import { CreateProject } from './views/creator/CreateProject';
import { LoginPage } from './components/LoginPage';
import { MyPage } from './views/user/MyPage';
import { Navbar, Footer } from './components/Navbar';
import { RegisterPage } from './components/RegisterPage';
import { useLoginUserStore } from './store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { endpoints, getData } from './api/apis';
import { ProjectDetailPage } from './views/project/ProjectDetail';
import ErrorPage from './views/ErrorPage';
import MainPage from './views/MainPage';
import { setNavigator } from './utils/navigator';
import { CSPage } from './views/cs/CSPage';
import { NoticeDetailPage } from './views/cs/NoticeDetail';
import ProjectsAllPage, { ProjectByCategoryPage, ProjectBySubcategoryPage } from './views/project/ProjectAllPage';
import { FundingPage } from './views/backing/backingPage';
import FundingLoader from './components/FundingLoader';
import { ApprovalDetail } from './views/admin/tabs/ApprovalDetail';
import { AdminTabs } from './views/admin/AdminTabs';

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
    <Suspense fallback={<FundingLoader />}>
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
            <Route index element={<ProjectsAllPage />} />
            <Route path='category/:ctgrId' element={<ProjectByCategoryPage />} />
            <Route path='category/:ctgrId/subcategory/:subctgrId' element={<ProjectBySubcategoryPage />} />
            <Route path=':projectId' element={<ProjectDetailPage />} />
            <Route path='create' element={<CreateProject />} />
            <Route path=':projectId/backing' element={<FundingPage onBackClick={function (): void {
              throw new Error('Function not implemented.');
            }} onCompleteClick={function (): void {
              throw new Error('Function not implemented.');
            }} />} />
          </Route>

          <Route path='/user'>
            <Route path='mypage' element={<MyPage />} />
          </Route>

          <Route path='/admin' element={<AdminDashboard />}>
            <Route index element={<AdminTabs />} />
            <Route path='verify/:projectId' element={<ApprovalDetail />} />
          </Route>

          <Route path="/cs">
            <Route index element={<CSPage />} />
            <Route path='notice/:noticeId' element={<NoticeDetailPage />} />
          </Route>

          <Route path="/error" element={<ErrorPage />} />
          <Route path="*" element={<ErrorPage />} />
          {/* <Route path="/loading" element={<FundingLoader />} /> */}
        </Routes>
        <Footer />
      </div>
    </Suspense>
  );
}
