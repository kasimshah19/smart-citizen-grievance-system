import { useState } from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

function AdminTopNav({ onMenuClick, breadcrumb }) {
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
          <p className="text-xs text-slate font-mono uppercase tracking-wide">{breadcrumb || "Admin"}</p>
          <h1 className="font-display text-lg text-ink">Admin Dashboard</h1>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2 max-w-xs flex-1 ml-4">
          <Search size={16} className="text-slate" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-slate/60"
          />
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
              <span className="text-[10px] font-mono uppercase tracking-wide text-signal">{citizen?.role}</span>
            </div>
            <ChevronDown size={16} className="text-slate" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg py-2 z-20">
                <Link
                  to="/admin/settings"
                  className="block px-4 py-2 text-sm text-ink hover:bg-ink/5"
                  onClick={() => setDropdownOpen(false)}
                >
                  Settings
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

export default AdminTopNav;