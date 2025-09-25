import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { InquiryAdminTab } from "./tabs/InquiryAdminTab";
import { ReportsAdminTab } from "./tabs/ReportsAdminTab";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Megaphone, MessageCircle, Siren } from "lucide-react";

export function AdminCS() {
    const [activeTab, setActiveTab] = useState("inquiry");

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-2">
                <h1 className="text-3xl mb-2">고객센터 관리</h1>
            </div>

            <div className="flex items-start gap-6">
                <div className="w-56 shrink-0 border-r border-gray-200 pr-2 mt-6 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("notice")}>
                        <Megaphone className="mr-2 h-4 w-4" /> 공지사항 관리
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("inquiry")}>
                        <MessageCircle className="mr-2 h-4 w-4" /> 문의 내역
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("reports")}>
                        <Siren className="mr-2 h-4 w-4" /> 신고 내역
                    </Button>
                </div>

                <Tabs value={activeTab} className="flex-1 min-w-0 mt-6">
                    <TabsContent value="inquiry"><InquiryAdminTab /></TabsContent>
                    <TabsContent value="reports"><ReportsAdminTab /></TabsContent>
                </Tabs>
            </div>
        </div>
    );
}