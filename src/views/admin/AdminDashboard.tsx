import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ApprovalsTab } from "./tabs/ApprovalsTab";
//import { ProjectsTab } from "./tabs/ProjectsTab";
import { ReportsTab } from "./tabs/ReportsTab";
import { UsersTab } from "./tabs/UsersTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { CustomerCenterTab } from "./tabs/CustomerCenterTab";
import { OverviewTab } from "./tabs/OverviewTab";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, SearchCheck, LayoutList, Siren, Users, ChartColumnBig, Headset } from "lucide-react";

export function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-2">
                <h1 className="text-3xl mb-2">관리자 대시보드</h1>
                <p className="text-gray-600">플랫폼 운영 현황을 확인하고 관리하세요</p>
            </div>

            <div className="flex items-start gap-6">
                <div className="w-56 shrink-0 border-r border-gray-200 pr-2 mt-6 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("overview")}>
                        <ClipboardList className="mr-2 h-4 w-4" /> 대시보드
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("approvals")}>
                        <SearchCheck className="mr-2 h-4 w-4" /> 프로젝트 심사
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("projects")}>
                        <LayoutList className="mr-2 h-4 w-4" /> 프로젝트 목록
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("reports")}>
                        <Siren className="mr-2 h-4 w-4" /> 신고 관리
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("users")}>
                        <Users className="mr-2 h-4 w-4" /> 회원 관리
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("analytics")}>
                        <ChartColumnBig className="mr-2 h-4 w-4" /> 통계 분석
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("customer-center")}>
                        <Headset className="mr-2 h-4 w-4" /> 고객센터
                    </Button>
                </div>

                <Tabs value={activeTab} className="flex-1 min-w-0 mt-6">
                    <TabsContent value="overview"><OverviewTab /></TabsContent>
                    <TabsContent value="approvals"><ApprovalsTab /></TabsContent>
                    <TabsContent value="reports"><ReportsTab /></TabsContent>
                    <TabsContent value="users"><UsersTab /></TabsContent>
                    <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
                    <TabsContent value="customer-center"><CustomerCenterTab /></TabsContent>
                </Tabs>
            </div>
        </div>
    );
}