import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { LoginPage } from './views/auth/user/LoginPage';
import { RegisterPage } from './views/auth/user/RegisterPage';
import { useLoginUserStore } from './store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { endpoints, getData } from './api/apis';
import { ProjectDetailPage } from './views/project/ProjectDetail';
import ErrorPage from './views/ErrorPage';
import MainPage from './views/MainPage';
import { setNavigator } from './utils/navigator';
import { NoticeDetailPage } from './views/cs/NoticeDetail';
import ProjectsAllPage, { ProjectByCategoryPage, ProjectBySubcategoryPage, SearchProjectPage } from './views/project/ProjectAllPage';
import FundingLoader from './components/FundingLoader';
import { ApprovalDetail } from './views/admin/tabs/ApprovalDetail';
import AdminProjectEdit from './views/admin/tabs/AdminProjectEdit';
import NotificationsPage from './components/NotificationsPage';
import CreatorProjects from './views/creator/pages/CreatorProjects';
import CreatorLayout from './views/creator/CreatorLayout';
import AdminLayout from './views/admin/AdminLayout';
import Layout from './layout/Layout';
import { NoticeTab } from './views/cs/tabs/NoticeTab';
import { InquiryTab } from './views/cs/tabs/InquiryTab';
import { ReportTab } from './views/cs/tabs/ReportTab';
import CSLayout from './views/cs/CSLayout';
import { CreatorQnATab } from './views/creator/pages/CreatorQnATab';
import CreatorProjectDetail from './views/creator/pages/CreatorProjectDetail';
import CreatorShippingList from './views/creator/pages/CreatorShippingList';
import CreatorShippingDetail from './views/creator/pages/CreatorShippingDetail';
import CreatorBacking from './views/creator/pages/CreatorBacking';
import CreatorAddReward from './views/creator/pages/CreatorAddReward';
import CreatorSettlementPage from './views/creator/pages/CreatorSettlementPage';
import RegisterCreator from './views/creator/RegistCreator';
import MyPageLayout from './views/user/MyPageLayout';
import NotificationTab from './views/user/tabs/NotificationTab';
import AccountSettingTab from './views/user/tabs/AccountSettingTab';
import { MyQnATab } from './views/user/tabs/MyQnATab';
import { MyInquiryTab } from './views/user/tabs/MyInquiryTab';
import { MyReportsTab } from './views/user/tabs/MyReportsTab';
import BackingTab from './views/user/tabs/BackingTab';
import LikedProjectTab from './views/user/tabs/LikedProjectTab';
import { BackingPage } from './views/backing/backingPage';
import { AdminRegisterPage } from './views/auth/admin/AdminRegisterPage';
import { AdminLoginPage } from './views/auth/admin/AdminLoginPage';
import { ApprovalsTab } from './views/admin/tabs/ApprovalsTab';
import { ProjectsTab } from './views/admin/tabs/ProjectsTab';
import { ReportsAdminTab } from './views/admin/tabs/ReportsAdminTab';
import { UsersTab } from './views/admin/tabs/UsersTab';
import { AnalyticsTab } from './views/admin/tabs/AnalyticsTab';
import { InquiryAdminTab } from './views/admin/tabs/InquiryAdminTab';
import { NoticeAdminTab } from './views/admin/tabs/NoticeAdminTab';
import { NoticeAddTab } from './views/admin/tabs/NoticeAddTab';
import { NoticeUpdtTab } from './views/admin/tabs/NoticeUpdtTab';
import SettlementTab from './views/admin/tabs/SettlementTab';
import EditProject from './views/creator/pages/EditProject';

const OverviewTab = lazy(() => import('./views/admin/tabs/OverviewTab').then((module) => ({ default: module.OverviewTab })));
const CreatorDashboard = lazy(() => import('./views/creator/pages/CreatorDashboard').then((module) => ({ default: module.default })));

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
      getData(endpoints.getLoginUser, cookie.accessToken).then(getLoginUserResponse);
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
              <Route path="category/:ctgrId" element={<ProjectByCategoryPage />} />
              <Route path="category/:ctgrId/subcategory/:subctgrId" element={<ProjectBySubcategoryPage />} />
              <Route path=":projectId" element={<ProjectDetailPage />} />
              <Route path=":projectId/backing" element={<BackingPage />} />
            </Route>

            <Route path="/user" element={<MyPageLayout />}>
              <Route index element={<BackingTab />} />
              <Route path="support" element={<BackingTab />} />
              {/*<Route index element={<BackingTab />} />
              <Route path="support" element={<BackingTab />} />*/}
              <Route path="wishlist" element={<LikedProjectTab />} />
              <Route path="settings" element={<AccountSettingTab />} />
              <Route path="notifications" element={<NotificationTab />} />
              <Route path="myqna" element={<MyQnATab />} />
              <Route path="myinquiry" element={<MyInquiryTab />} />
              <Route path="myreports" element={<MyReportsTab />} />
            </Route>

            <Route path="/creator/register" element={<RegisterCreator />} />
            <Route path="/creator" element={<CreatorLayout />}>
              <Route index element={<CreatorDashboard />} />
              <Route path="dashboard" element={<CreatorDashboard />} />
              <Route path="project/new" element={<EditProject />} />
              <Route path="project/:projectId" element={<EditProject />} />
              <Route path="projects">
                <Route index element={<CreatorProjects />} />
                <Route path=":projectId" element={<CreatorProjectDetail />} />
                <Route path=":projectId/reward" element={<CreatorAddReward />} />
              </Route>
              <Route path="backings" element={<CreatorBacking />} />
              <Route path="shipping" element={<CreatorShippingList />} />
              <Route path="shipping/:projectId" element={<CreatorShippingDetail />} />
              <Route path="settlement" element={<CreatorSettlementPage />} />
              <Route path="qna" element={<CreatorQnATab />} />
              <Route path="settlement" element={<CreatorSettlementPage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<OverviewTab />} />
              <Route path="overview" element={<OverviewTab />} />
              <Route path="approvals" element={<ApprovalsTab />} />
              <Route path="verify/:projectId" element={<ApprovalDetail />} />
              <Route path="projects" element={<ProjectsTab />} />
              <Route path="project/:projectId" element={<AdminProjectEdit />} />
              <Route path="reports" element={<ReportsAdminTab />} />
              <Route path="users" element={<UsersTab />} />
              <Route path="analytics" element={<AnalyticsTab />} />
              <Route path="inquiry" element={<InquiryAdminTab />} />
              <Route path="notice" element={<NoticeAdminTab />} />
              <Route path="noticeadd" element={<NoticeAddTab />} />
              <Route path="noticeupdate" element={<NoticeUpdtTab />} />
              <Route path="settlement" element={<SettlementTab />} />
            </Route>

            <Route path="/admin">
              <Route path="register" element={<AdminRegisterPage />} />
              <Route path="login" element={<AdminLoginPage />} />
            </Route>

            <Route path="/cs" element={<CSLayout />}>
              <Route index element={<NoticeTab />} />
              <Route path="notice" element={<NoticeTab />} />
              <Route path="notice/:noticeId" element={<NoticeDetailPage />} />
              <Route path="inquiry" element={<InquiryTab />} />
              <Route path="report" element={<ReportTab />} />
            </Route>

            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<ErrorPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </div>
    </Suspense>
  );
}
