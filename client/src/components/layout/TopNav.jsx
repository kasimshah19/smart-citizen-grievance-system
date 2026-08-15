import { useState, useEffect, useRef } from "react";
import { Menu, Search, Bell, ChevronDown, FileText, Moon, Sun } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { connectSocket } from "../../services/socket";

function TopNav({ onMenuClick }) {
  const { citizen, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellPulse, setBellPulse] = useState(false);

  // --- Search ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get("/api/notifications");
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to load notifications count", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Live updates: the moment the admin does something that generates a
  // notification for this citizen, bump the badge without a page refresh.
  useEffect(() => {
    const socket = connectSocket();
    if (!socket) return;

    const handleNewNotification = () => {
      fetchUnreadCount();
      setBellPulse(true);
      setTimeout(() => setBellPulse(false), 2000);
    };

    socket.on("notification:new", handleNewNotification);
    return () => socket.off("notification:new", handleNewNotification);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get("/api/complaints/search", { params: { q: query.trim() } });
        setResults(res.data.complaints);
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
    navigate(`/dashboard/complaints/${id}`);
    setQuery("");
    setSearchOpen(false);
  };

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
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-ink/5"
        >
          <Menu size={20} className="text-ink" />
        </button>
        <h1 className="font-display text-lg text-ink hidden sm:block">Dashboard</h1>

        <div ref={searchBoxRef} className="relative hidden md:block max-w-xs flex-1">
          <div className="flex items-center gap-2 bg-white border border-line rounded-full px-4 py-2">
            <Search size={16} className="text-slate" />
            <input
              type="text"
              placeholder="Search your complaints…"
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
              ) : results.length === 0 ? (
                <p className="px-4 py-3 text-xs text-slate">No complaints match "{query}"</p>
              ) : (
                results.map((c) => (
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
                ))
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

        <button
          onClick={() => navigate("/dashboard/notifications")}
          className={`relative p-2 rounded-full hover:bg-ink/5 transition-transform ${bellPulse ? "scale-110" : ""}`}
        >
          <Bell size={20} className="text-ink" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-signal rounded-full" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-ink/5"
          >
            <span className="w-8 h-8 rounded-full bg-signal text-paper text-xs font-medium flex items-center justify-center">
              {initials}
            </span>
            <span className="text-sm text-ink hidden sm:block">{citizen?.fullName?.split(" ")[0]}</span>
            <ChevronDown size={16} className="text-slate" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-line rounded-xl shadow-lg py-2 z-20">
                <Link
                  to="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-ink hover:bg-ink/5"
                  onClick={() => setDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  to="/dashboard/settings"
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

export default TopNav;
