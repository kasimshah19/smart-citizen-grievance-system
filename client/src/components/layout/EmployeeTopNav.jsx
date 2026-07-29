import { useState } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

function EmployeeTopNav({ onMenuClick, breadcrumb }) {
  const { citizen, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const initials = citizen?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 bg-paper border-b border-line px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-ink/5">
          <Menu size={20} className="text-ink" />
        </button>
        <div>
          <p className="text-xs text-slate font-mono uppercase tracking-wide">{breadcrumb || "Employee"}</p>
          <h1 className="font-display text-lg text-ink">Employee Portal</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-full hover:bg-ink/5">
          <Bell size={20} className="text-ink" />
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-ink/5"
          >
            <span className="w-8 h-8 rounded-full bg-signal text-paper text-xs font-medium flex items-center justify-center">
              {initials}
            </span>
            <div className="hidden sm:block text-left">
              <p className="text-sm text-ink leading-tight">{citizen?.fullName?.split(" ")[0]}</p>
              <span className="text-[10px] font-mono uppercase tracking-wide text-signal">{citizen?.department}</span>
            </div>
            <ChevronDown size={16} className="text-slate" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg py-2 z-20">
                <Link
                  to="/employee/profile"
                  className="block px-4 py-2 text-sm text-ink hover:bg-ink/5"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-ink/5"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default EmployeeTopNav;