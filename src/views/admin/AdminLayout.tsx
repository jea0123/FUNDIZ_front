import { Card, CardContent } from "@/components/ui/card";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./components/AdminSidebar";

export default function CreatorLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <aside className="lg:col-span-1">
                <p className="text-center text-2xl font-bold pb-4">관리자 페이지</p>
                <Card className="sticky">
                    <CardContent>
                        <div>
                            <AdminSidebar />
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