import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
