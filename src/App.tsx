import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { LoginPage } from './views/auth/LoginPage';
import { MyPage } from './views/user/MyPage';
import { RegisterPage } from './views/auth/RegisterPage';
import { useLoginUserStore } from './store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { endpoints, getData } from './api/apis';
import { ProjectDetailPage } from './views/project/ProjectDetail';
import ErrorPage from './views/ErrorPage';
import MainPage from './views/MainPage';
import { setNavigator } from './utils/navigator';
import { NoticeDetailPage } from './views/cs/NoticeDetail';

import ProjectsAllPage, { ProjectByCategoryPage, ProjectBySubcategoryPage, SearchProjectPage, } from './views/project/ProjectAllPage';

import ProjectsAllPage, {ProjectByCategoryPage,ProjectBySubcategoryPage,SearchProjectPage,} from './views/project/ProjectAllPage';

import { FundingPage } from './views/backing/backingPage';
import FundingLoader from './components/FundingLoader';
import { ApprovalDetail } from './views/admin/tabs/ApprovalDetail';
import AdminProjectEdit from './views/admin/tabs/AdminProjectEdit';
import NotificationsPage from './components/NotificationsPage';
import CreateProject from './views/creator/pages/CreateProject';
import CreatorDashboard from './views/creator/pages/CreatorDashboard';
import CreatorProjects from './views/creator/pages/CreatorProjects';
import CreatorLayout from './views/creator/CreatorLayout';
import { AdminConsole } from './views/admin/AdminConsole';
import Layout from './layout/Layout';
import { NoticeTab } from './views/cs/tabs/NoticeTab';
import { InquiryTab } from './views/cs/tabs/InquiryTab';
import { ReportTab } from './views/cs/tabs/ReportTab';
import CSLayout from './views/cs/CSLayout';
import { CreatorQnATab } from './views/creator/pages/CreatorQnATab';
import CreatorProjectDetail from './views/creator/pages/CreatorProjectDetail';
import { CreatorShippingList } from './views/creator/pages/CreatorShippingList';
import { CreatorShippingDetail } from './views/creator/pages/CreatorShippingDetail';
import CreatorBacking from './views/creator/pages/CreatorBacking';
import CreatorAddReward from './views/creator/pages/CreatorAddReward';
import CreatorSettlementPage from './views/creator/pages/CreatorSettlementPage';


const AdminTabs = lazy(() => import('./views/admin/AdminTabs').then((module) => ({ default: module.AdminTabs, })));

const AdminTabs = lazy(() =>import('./views/admin/AdminTabs').then((module) => ({default: module.AdminTabs,})));


export default function App() {
  const { setLoginUser, resetLoginUser } = useLoginUserStore();
  const [cookie] = useCookies();

  /**
   * @description Navigator를 전역 상태로 설정
   * @returns {null} 렌더링 없음
   */
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
      getData(endpoints.getLoginUser, cookie.accessToken).then(
        getLoginUserResponse
      );
    }
  }, [cookie.accessToken]);

  return (
    <Suspense fallback={<FundingLoader />}>
      <div className="min-h-screen bg-gray-50">
        <NavigatorRegistrar />
        {/* <Layout /> */}
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<MainPage />} />

            <Route path="/auth">
              <Route path="register" element={<RegisterPage />} />
              <Route path="login" element={<LoginPage />} />
            </Route>

            <Route path="/project">
              <Route index element={<ProjectsAllPage />} />
              <Route path="search" element={<SearchProjectPage />} />
              <Route
                path="category/:ctgrId"
                element={<ProjectByCategoryPage />}
              />
              <Route
                path="category/:ctgrId/subcategory/:subctgrId"
                element={<ProjectBySubcategoryPage />}
              />
              <Route path=":projectId" element={<ProjectDetailPage />} />
              <Route
                path=":projectId/backing"
                element={
                  <FundingPage
                    onBackClick={function (): void {
                      throw new Error('Function not implemented.');
                    }}
                    onCompleteClick={function (): void {
                      throw new Error('Function not implemented.');
                    }}
                  />
                }
              />
            </Route>

            <Route path="/user">
              <Route path="Mypage" element={<MyPage />} />
            </Route>

            <Route path="/creator" element={<CreatorLayout />}>
              <Route index element={<CreatorDashboard />} />
              <Route path="dashboard" element={<CreatorDashboard />} />
              <Route path="project/new" element={<CreateProject />} />
              <Route path="project/:projectId" element={<CreateProject />} />
              <Route path="projects">
                <Route index element={<CreatorProjects />} />
                <Route path=":projectId" element={<CreatorProjectDetail />} />
              </Route>
              <Route path=":projectId/reward" element={<CreatorAddReward />} />
              <Route path="backings" element={<CreatorBacking />} />
              <Route path="shipping" element={<CreatorShippingList />} />
<<<<<<< HEAD
              <Route path="shipping/:projectId" element={<CreatorShippingDetail />} />
=======
              <Route path="shipping/:projectId" element={<CreatorShippingDetail />}/>
              <Route path="qna" />
              <Route path="settlement" element={<CreatorSettlementPage />} />
>>>>>>> 0deec91a7a7ad05a624ad4d783a8baf9efd4f189
              <Route path="qna" element={<CreatorQnATab />} />
              <Route path="settlement" element={<CreatorSettlementPage />} />
            </Route>


            <Route path="/admin" element={<AdminConsole />}>
              <Route index element={<AdminTabs />} />
              <Route path="verify/:projectId" element={<ApprovalDetail />} />
              <Route path="project/:projectId" element={<AdminProjectEdit />} />
            </Route>

            <Route path="/cs" element={<CSLayout />}>
              <Route index element={<NoticeTab />} />
              <Route path="notice" element={<NoticeTab />} />
              <Route path="notice/:noticeId" element={<NoticeDetailPage />} />
              <Route path="inquiry" element={<InquiryTab />} />
              <Route path="report" element={<ReportTab />} />
            </Route>

<<<<<<< HEAD
=======
            <Route path="/creator" element={<CreatorLayout />}>
              <Route index element={<CreatorDashboard />} />
              <Route path="dashboard" element={<CreatorDashboard />} />
              <Route path="project/new" element={<CreateProject />} />
              <Route path="project/:projectId" element={<CreateProject />} />
              <Route path="projects">
                <Route index element={<CreatorProjects />} />
                <Route path=":projectId" element={<CreatorProjectDetail />} />
                <Route path=":projectId/reward" element={<CreatorAddReward />}/>
              </Route>
              <Route path="backings" />
              <Route path="shipping" />
              <Route path="qna" />
              <Route path="settlement" />
            </Route>

>>>>>>> 0deec91a7a7ad05a624ad4d783a8baf9efd4f189
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </div>
    </Suspense>
  );
}
