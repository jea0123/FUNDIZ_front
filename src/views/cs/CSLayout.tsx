import { Card, CardContent } from "@/components/ui/card";
import { Outlet } from "react-router-dom";
import { CSSidebar } from "./tabs/CSSidebar";

export default function CSLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <aside className="lg:col-span-1">
                
                        <p className="text-center text-2xl font-bold p-2">고객센터</p>
                        <div className="mt-4">
                            <CSSidebar />
                        </div>

            </aside>

            <main className="lg:col-span-4 min-w-0">
                <Outlet />
            </main>
        </div>
    </div>
  );
}