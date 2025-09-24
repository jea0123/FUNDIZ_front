import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ApprovalsTab } from "./tabs/ApprovalsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { UsersTab } from "./tabs/UsersTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { CustomerCenterTab } from "./tabs/CustomerCenterTab";
import { OverviewTab } from "./tabs/OverviewTab";

export function AdminDashboard() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl mb-2">관리자 대시보드</h1>
                <p className="text-gray-600">플랫폼 운영 현황을 확인하고 관리하세요</p>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="overview">대시보드</TabsTrigger>
                    <TabsTrigger value="approvals">프로젝트 심사</TabsTrigger>
                    <TabsTrigger value="reports">신고 관리</TabsTrigger>
                    <TabsTrigger value="users">회원 관리</TabsTrigger>
                    <TabsTrigger value="analytics">통계 분석</TabsTrigger>
                    <TabsTrigger value="customer-center">고객센터</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6"><OverviewTab /></TabsContent>
                <TabsContent value="approvals" className="mt-6"><ApprovalsTab /></TabsContent>
                <TabsContent value="reports" className="mt-6"><ReportsTab /></TabsContent>
                <TabsContent value="users" className="mt-6"><UsersTab /></TabsContent>
                <TabsContent value="analytics" className="mt-6"><AnalyticsTab /></TabsContent>
                <TabsContent value="customer-center" className="mt-6"><CustomerCenterTab /></TabsContent>
            </Tabs>
        </div>
    );
}
