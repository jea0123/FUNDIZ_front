import { Card, CardContent } from "@/components/ui/card";
import { Outlet } from "react-router-dom";
import { CSSidebar } from "./tabs/CSSidebar";

export default function CSLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <Card className="sticky">
                    <CardContent>
                        <div className="pb-5 border-b border-gray-200">
                            <p className="text-center text-2xl font-black">고객센터</p>
                        </div>
                        <div className="pt-5">
                            <CSSidebar />
                        </div>
                    </CardContent>
                </Card>
            </aside>

            <main className="lg:col-span-3 min-w-0">
                <Outlet />
            </main>
        </div>
    </div>
  );
}