import { useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  UserX,
  UserCheck,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";
import { STATUS_COLORS } from "../constants/complaint.constants";

function AdminUsersPage() {
  const [citizens, setCitizens] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);
  const [detailCache, setDetailCache] = useState({});
  const [detailLoading, setDetailLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

      const res = await api.get("/api/admin/users", { params });
      setCitizens(res.data.citizens);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to load citizens", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchCitizens();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detailCache[id]) {
      setDetailLoading(true);
      try {
        const res = await api.get(`/api/admin/users/${id}`);
        setDetailCache((prev) => ({ ...prev, [id]: res.data.complaints }));
      } catch (err) {
        console.error("Failed to load citizen detail", err);
      } finally {
        setDetailLoading(false);
      }
    }
  };

  const handleToggleStatus = async (citizen) => {
    const action = citizen.active === false ? "activate" : "deactivate";
    if (!window.confirm(`Are you sure you want to ${action} "${citizen.fullName}"'s account?`)) return;

    setTogglingId(citizen._id);
    try {
      const res = await api.patch(`/api/admin/users/${citizen._id}/toggle-status`);
      setCitizens((prev) =>
        prev.map((c) => (c._id === citizen._id ? { ...c, active: res.data.citizen.active } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setTogglingId(null);
    }
  };

  const initials = (name) =>
    name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const selectClass =
    "px-3 py-2.5 bg-paper border border-line rounded-lg text-sm text-ink focus:outline-none focus:border-ink transition-colors";

  return (
    <AdminLayout breadcrumb="Users">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Users</h1>
        <p className="text-sm text-slate">{pagination.total} total citizens</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            className="w-full pl-9 pr-3 py-2.5 bg-paper border border-line rounded-lg text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors"
            placeholder="Search by name, email, or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className={selectClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : citizens.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <Users size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">No users match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {citizens.map((c) => {
            const isActive = c.active !== false;
            const isExpanded = expandedId === c._id;
            return (
              <div key={c._id}>
                <div
                  onClick={() => toggleExpand(c._id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-paper/60 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-10 h-10 rounded-full text-xs font-medium flex items-center justify-center shrink-0 ${
                        isActive ? "bg-signal text-paper" : "bg-slate/20 text-slate"
                      }`}
                    >
                      {initials(c.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{c.fullName}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                        <span className="text-xs text-slate flex items-center gap-1">
                          <Mail size={11} /> {c.email}
                        </span>
                        <span className="text-xs text-slate flex items-center gap-1">
                          <Phone size={11} /> {c.phone}
                        </span>
                        {c.city && (
                          <span className="text-xs text-slate flex items-center gap-1">
                            <MapPin size={11} /> {c.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-ink/5 text-ink hidden sm:inline-block">
                      {c.complaintCount} complaint{c.complaintCount === 1 ? "" : "s"}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full ${
                        isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"
                      }`}
                    >
                      {isActive ? "Active" : "Deactivated"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(c);
                      }}
                      disabled={togglingId === c._id}
                      title={isActive ? "Deactivate account" : "Activate account"}
                      className={`p-1.5 rounded-lg hover:bg-ink/5 transition-colors disabled:opacity-50 ${
                        isActive ? "text-slate hover:text-error" : "text-slate hover:text-success"
                      }`}
                    >
                      {isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate" />
                    ) : (
                      <ChevronDown size={16} className="text-slate" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 bg-paper/40">
                    <div className="grid sm:grid-cols-2 gap-3 mb-4 pt-4 text-xs">
                      <p className="text-slate">
                        District / Taluka: <span className="text-ink">{c.district || "—"} / {c.taluka || "—"}</span>
                      </p>
                      <p className="text-slate">
                        Area: <span className="text-ink">{c.area || "—"}</span>
                      </p>
                      <p className="text-slate">
                        Joined: <span className="text-ink">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </p>
                      <p className="text-slate">
                        Phone Verified: <span className="text-ink">{c.phoneVerified ? "Yes" : "No"}</span>
                      </p>
                    </div>

                    <p className="text-xs font-medium text-ink mb-2">Complaint History</p>
                    {detailLoading && !detailCache[c._id] ? (
                      <p className="text-xs text-slate">Loading…</p>
                    ) : detailCache[c._id]?.length === 0 ? (
                      <p className="text-xs text-slate">No complaints filed yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {detailCache[c._id]?.map((comp) => (
                          <div
                            key={comp._id}
                            className="flex items-center justify-between bg-white border border-line rounded-lg px-3 py-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-mono text-slate">{comp.complaintNumber}</p>
                              <p className="text-xs text-ink truncate">{comp.title}</p>
                            </div>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[comp.status]}`}>
                              {comp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg border border-line text-slate hover:text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-lg border border-line text-slate hover:text-ink hover:bg-paper disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminUsersPage;
