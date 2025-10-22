import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Outlet } from 'react-router-dom';
import UserProfileCard from './components/UserProfileCard';
import { UserSidebar } from './components/UserSidebar';

export default function CreatorLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <UserProfileCard />
              <div className="mt-4">
                <UserSidebar />
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
