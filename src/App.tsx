import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom';
import { LoginPage } from './views/auth/LoginPage';
import { MyPage } from './views/user/MyPage';
import { Footer } from './layout/Header';
import { RegisterPage } from './views/auth/RegisterPage';
import { useLoginUserStore } from './store/LoginUserStore.store';
import { useCookies } from 'react-cookie';
import { endpoints, getData } from './api/apis';
import { ProjectDetailPage } from './views/project/ProjectDetail';
import ErrorPage from './views/ErrorPage';
import MainPage from './views/MainPage';
import { setNavigator } from './utils/navigator';
import { CSPage } from './views/cs/CSPage';
import { NoticeDetailPage } from './views/cs/NoticeDetail';
import ProjectsAllPage, { ProjectByCategoryPage, ProjectBySubcategoryPage, SearchProjectPage } from './views/project/ProjectAllPage';
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

const AdminTabs = lazy(() => import('./views/admin/AdminTabs').then(module => ({ default: module.AdminTabs })));

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
                {/* <Layout /> */}
                <Routes>
                    <Route element={<Layout />}>
                        <Route path='/' element={<MainPage />} />

                        <Route path='/auth'>
                            <Route path='register' element={<RegisterPage />} />
                            <Route path='login' element={<LoginPage />} />
                        </Route>

                        <Route path='/project'>
                            <Route index element={<ProjectsAllPage />} />
                            <Route path='search' element={<SearchProjectPage />} />
                            <Route path='category/:ctgrId' element={<ProjectByCategoryPage />} />
                            <Route path='category/:ctgrId/subcategory/:subctgrId' element={<ProjectBySubcategoryPage />} />
                            <Route path=':projectId' element={<ProjectDetailPage />} />
                            <Route path=':projectId/backing' element={<FundingPage onBackClick={function (): void {
                                throw new Error('Function not implemented.');
                            }} onCompleteClick={function (): void {
                                throw new Error('Function not implemented.');
                            }} />} />
                        </Route>

                        <Route path='/user'>
                            <Route path='Mypage' element={<MyPage />} />
                        </Route>

                        <Route path='/creator' element={<CreatorLayout />}>
                            <Route index element={<CreatorDashboard />} />
                            <Route path='dashboard' element={<CreatorDashboard />} />
                            <Route path='project/new' element={<CreateProject />} />
                            <Route path='project/:projectId' element={<CreateProject />} />
                            <Route path='projects'>
                                <Route index element={<CreatorProjects />} />
                                {/* TODO: 프로젝트 상세 */}
                                {/* <Route path=':projectId' element={<CreatorProjectDetail />} /> */}
                            </Route>
                            <Route path='backings' />
                            <Route path='shipping' />
                            <Route path='qna' />
                            <Route path='settlement' />
                        </Route>

                        <Route path='/admin' element={<AdminConsole />}>
                            <Route index element={<AdminTabs />} />
                            <Route path='verify/:projectId' element={<ApprovalDetail />} />
                            <Route path='project/:projectId' element={<AdminProjectEdit />} />
                        </Route>

                        <Route path="/cs">
                            <Route index element={<CSPage />} />
                            <Route path='notice/:noticeId' element={<NoticeDetailPage />} />
                        </Route>

                        <Route path="/error" element={<ErrorPage />} />
                        <Route path="*" element={<ErrorPage />} />
                        <Route path="/notifications" element={<NotificationsPage />} />
                    </Route>
                </Routes>
                <Footer />
            </div>
        </Suspense>
    );
}
