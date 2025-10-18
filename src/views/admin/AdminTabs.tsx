import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { OverviewTab } from "./pages/OverviewTab";
import { VerificationQueue } from "./pages/VerificationQueue";
import { ReportsAdminTab } from "./pages/ReportsAdminTab";
import { UsersTab } from "./pages/UsersTab";
import { AnalyticsTab } from "./pages/AnalyticsTab";
import { InquiryAdminTab } from "./pages/InquiryAdminTab";
import { NoticeAdminTab } from "./pages/NoticeAdminTab";
import { NoticeAddTab } from "./pages/NoticeAddTab";
import { NoticeUpdtTab } from "./pages/NoticeUpdtTab";
import { AdminProjectListPage } from "./pages/AdminProjectListPage";
import SettlementTab from "./pages/SettlementTab";

export function AdminTabs() {
    const [sp, setSp] = useSearchParams();
    const tab = sp.get("tab") ?? "overview";

    return (
        <Tabs
            value={tab}
            onValueChange={(v) => {
                sp.set("tab", v);
                setSp(sp, { replace: true });
            }}
            className="w-full"
        >
            <TabsContent value="overview"><OverviewTab /></TabsContent>
            <TabsContent value="approvals"><VerificationQueue /></TabsContent>
            <TabsContent value="projects"><AdminProjectListPage /></TabsContent>
            <TabsContent value="reports"><ReportsAdminTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
            <TabsContent value="inquiry"><InquiryAdminTab /></TabsContent>
            <TabsContent value="notice"><NoticeAdminTab /></TabsContent>
            <TabsContent value="noticeadd"><NoticeAddTab /></TabsContent>
            <TabsContent value="noticeupdate"><NoticeUpdtTab /></TabsContent>
            <TabsContent value="settlement"> <SettlementTab /></TabsContent>
        </Tabs>
    );
}
