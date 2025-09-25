import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { NoticeTab } from "./tabs/NoticeTab";
import { InquiryTab } from "./tabs/InquiryTab";
import { ReportTab } from "./tabs/ReportTab";
import { Megaphone, MessageCircle, Siren } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CSPage() {
    const [activeTab, setActiveTab] = useState("notice");

    return (
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-2">
                <h1 className="text-3xl mb-2">고객센터</h1>
            </div>

            <div className="flex items-start gap-6">
                <div className="w-56 shrink-0 border-r border-gray-200 pr-2 mt-6 space-y-2">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("notice")}>
                        <Megaphone className="mr-2 h-4 w-4" /> 공지사항
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("inquiry")}>
                        <MessageCircle className="mr-2 h-4 w-4" /> 1:1 문의
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab("report")}>
                        <Siren className="mr-2 h-4 w-4" /> 신고하기
                    </Button>
                </div>

                <Tabs value={activeTab} className="flex-1 min-w-0 mt-3">
                    <TabsContent value="notice" className="mt-3"><NoticeTab /></TabsContent>
                    <TabsContent value="inquiry" className="mt-3"><InquiryTab /></TabsContent>
                    <TabsContent value="report" className="mt-3"><ReportTab /></TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

