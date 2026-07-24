import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopNav from "./AdminTopNav";

function AdminLayout({ children, breadcrumb }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-paper flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopNav onMenuClick={() => setSidebarOpen(true)} breadcrumb={breadcrumb} />
        <main className="flex-1 px-4 lg:px-8 py-6">{children}</main>
        <footer className="px-4 lg:px-8 py-4 border-t border-line text-center text-xs text-slate">
          Smart Citizen Grievance Management System — Admin Portal
        </footer>
      </div>
    </div>
  );
}

export default AdminLayout;