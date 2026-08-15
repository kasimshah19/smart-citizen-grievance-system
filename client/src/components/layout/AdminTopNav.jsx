import { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, ChevronDown, FileText, User, AlertCircle, LifeBuoy, Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminTopNav({ onMenuClick, breadcrumb }) {
  const { citizen, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // --- Search ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ complaints: [], citizens: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ complaints: [], citizens: [] });
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/api/admin/search", { params: { q: query.trim() } });
        setResults({ complaints: res.data.complaints, citizens: res.data.citizens });
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToComplaint = (id) => {
    navigate(`/admin/complaints/${id}`);
    setQuery("");
    setSearchOpen(false);
  };

  const goToCitizen = () => {
    navigate("/admin/users");
    setQuery("");
    setSearchOpen(false);
  };

  const hasResults = results.complaints.length > 0 || results.citizens.length > 0;

  // --- Alerts (bell) ---
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alerts, setAlerts] = useState({ pendingComplaints: 0, openTickets: 0 });
  const alertsRef = useRef(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [summaryRes, statusRes] = await Promise.all([
          api.get("/api/admin/dashboard/summary"),
          api.get("/api/admin/dashboard/system-status"),
        ]);
        setAlerts({
          pendingComplaints: summaryRes.data.summary.kpis.pending,
          openTickets: statusRes.data.status.openSupportTickets,
        });
      } catch (error) {
        console.error("Failed to load alerts", error);
      }
    };
    fetchAlerts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target)) {
        setAlertsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAlerts = alerts.pendingComplaints > 0 || alerts.openTickets > 0;

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

        <div ref={searchBoxRef} className="relative hidden md:block max-w-xs flex-1 ml-4">
          <div className="flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2">
            <Search size={16} className="text-slate" />
            <input
              type="text"
              placeholder="Search complaints or citizens…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="bg-transparent text-sm outline-none w-full placeholder:text-slate/60"
            />
          </div>

          {searchOpen && query.trim().length >= 2 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-line rounded-xl shadow-lg py-2 z-30 max-h-80 overflow-y-auto">
              {searching ? (
                <p className="px-4 py-3 text-xs text-slate">Searching…</p>
              ) : !hasResults ? (
                <p className="px-4 py-3 text-xs text-slate">No matches for "{query}"</p>
              ) : (
                <>
                  {results.complaints.length > 0 && (
                    <div>
                      <p className="px-4 pt-1 pb-1 text-[10px] uppercase tracking-wide text-slate">Complaints</p>
                      {results.complaints.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => goToComplaint(c._id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-ink/5"
                        >
                          <FileText size={14} className="text-signal shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-mono text-slate">{c.complaintNumber}</p>
                            <p className="text-sm text-ink truncate">{c.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {results.citizens.length > 0 && (
                    <div>
                      <p className="px-4 pt-2 pb-1 text-[10px] uppercase tracking-wide text-slate">Citizens</p>
                      {results.citizens.map((c) => (
                        <button
                          key={c._id}
                          onClick={goToCitizen}
                          className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-ink/5"
                        >
                          <User size={14} className="text-signal shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-ink truncate">{c.fullName}</p>
                            <p className="text-xs text-slate truncate">{c.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-ink/5 text-ink transition-colors"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div ref={alertsRef} className="relative">
          <button
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative p-2 rounded-full hover:bg-ink/5"
          >
            <Bell size={20} className="text-ink" />
            {hasAlerts && <span className="absolute top-1 right-1 w-2 h-2 bg-signal rounded-full" />}
          </button>

          {alertsOpen && (
            <div className="absolute -right-14 sm:right-0 mt-2 w-[280px] sm:w-72 bg-white border border-line rounded-xl shadow-lg py-2 z-30">
              <p className="px-4 py-2 text-xs font-medium text-ink border-b border-line">Needs Attention</p>
              {!hasAlerts ? (
                <p className="px-4 py-4 text-sm text-slate text-center">You're all caught up 🎉</p>
              ) : (
                <>
                  {alerts.pendingComplaints > 0 && (
                    <Link
                      to="/admin/complaints?status=Submitted"
                      onClick={() => setAlertsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-ink/5"
                    >
                      <AlertCircle size={16} className="text-signal mt-0.5 shrink-0" />
                      <p className="text-sm text-ink">
                        <span className="font-medium">{alerts.pendingComplaints}</span> complaint
                        {alerts.pendingComplaints === 1 ? "" : "s"} awaiting review
                      </p>
                    </Link>
                  )}
                  {alerts.openTickets > 0 && (
                    <Link
                      to="/admin/support-tickets?status=Open"
                      onClick={() => setAlertsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-ink/5"
                    >
                      <LifeBuoy size={16} className="text-signal mt-0.5 shrink-0" />
                      <p className="text-sm text-ink">
                        <span className="font-medium">{alerts.openTickets}</span> open support ticket
                        {alerts.openTickets === 1 ? "" : "s"}
                      </p>
                    </Link>
                  )}
                </>
              )}
            </div>
          )}
        </div>

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
