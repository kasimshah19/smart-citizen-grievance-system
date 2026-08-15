import { useState } from "react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopNav from "./EmployeeTopNav";

function EmployeeLayout({ children, breadcrumb }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-paper flex">
      <EmployeeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <EmployeeTopNav onMenuClick={() => setSidebarOpen(true)} breadcrumb={breadcrumb} />
        <main className="flex-1 px-4 lg:px-8 py-6">{children}</main>
        <footer className="px-4 lg:px-8 py-4 border-t border-line text-center text-xs text-slate">
          Smart Citizen Grievance Management System — Employee Portal
        </footer>
      </div>
    </div>
  );
}

export default EmployeeLayout;