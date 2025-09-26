import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useSearchParams } from "react-router-dom";
import { OverviewTab } from "./tabs/OverviewTab";
import { ApprovalsTab } from "./tabs/ApprovalsTab";
import { ReportsAdminTab } from "./tabs/ReportsAdminTab";
import { UsersTab } from "./tabs/UsersTab";
import { AnalyticsTab } from "./tabs/AnalyticsTab";
import { InquiryAdminTab } from "./tabs/InquiryAdminTab";
import { NoticeAdminTab } from "./tabs/NoticeAdminTab";

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
            {/* TODO: 프로젝트 목록 페이지 만들고 주석 풀기 */}
            {/* <TabsContent value="projects"><ProjectsTab /></TabsContent> */}
            <TabsContent value="approvals"><ApprovalsTab /></TabsContent>
            <TabsContent value="analytics"><AnalyticsTab /></TabsContent>
            <TabsContent value="users"><UsersTab /></TabsContent>
            <TabsContent value="reports"><ReportsAdminTab /></TabsContent>
            <TabsContent value="inquiry"><InquiryAdminTab /></TabsContent>
            <TabsContent value="notice"><NoticeAdminTab /></TabsContent>
        </Tabs>
    );
}
