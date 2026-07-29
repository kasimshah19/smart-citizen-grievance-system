import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, User, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/employee" },
  { label: "My Assigned Complaints", icon: ClipboardList, path: "/employee/complaints" },
  { label: "Profile", icon: User, path: "/employee/profile" },
];

function EmployeeSidebar({ open, onClose }) {
  const { citizen, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-ink/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-ink text-paper flex flex-col z-40 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-6 border-b border-paper/10">
          <span className="font-display text-xl">
            Nagrik<span className="text-signal">.</span>
          </span>
          <p className="text-xs text-paper/50 mt-0.5 font-mono uppercase tracking-widest">
            {citizen?.department || "Employee"} Portal
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/employee"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-signal text-paper"
                    : "text-paper/70 hover:bg-paper/10 hover:text-paper"
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-paper/10">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate">{citizen?.fullName}</p>
            <p className="text-xs text-paper/50 truncate">{citizen?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-paper/70 hover:bg-paper/10 hover:text-paper transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

export default EmployeeSidebar;