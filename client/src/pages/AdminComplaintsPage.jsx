import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, Search } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";
import { COMPLAINT_STATUS_LIST } from "../shared/constants/complaintStatus";
import { PRIORITIES_LIST } from "../shared/constants/priorities";

const STATUS_COLORS = {
  Submitted: "bg-slate/10 text-slate",
  "Under Review": "bg-signal/10 text-signal",
  Assigned: "bg-signal/10 text-signal",
  Accepted: "bg-signal/10 text-signal",
  "In Progress": "bg-signal/10 text-signal",
  Resolved: "bg-success/10 text-success",
  "Citizen Confirmation": "bg-success/10 text-success",
  Closed: "bg-ink/10 text-ink",
  Reopened: "bg-error/10 text-error",
};

function AdminComplaintsPage() {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: searchParams.get("status") || "",
    priority: "",
    search: "",
  });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const res = await api.get("/api/admin/complaints", { params });
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error("Failed to load complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const inputClass =
    "px-3 py-2 bg-white border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-ink";

  return (
    <AdminLayout breadcrumb="Complaints">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Complaints</h1>
        <p className="text-sm text-slate">{complaints.length} total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 bg-white border border-line rounded-lg px-3 py-2 flex-1">
            <Search size={15} className="text-slate" />
            <input
              type="text"
              placeholder="Search by ID, title, or citizen..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="bg-transparent text-sm outline-none w-full placeholder:text-slate/60"
            />
          </div>
        </form>

        <select
          className={inputClass}
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {COMPLAINT_STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className={inputClass}
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          {PRIORITIES_LIST.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate text-sm">Loading…</div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-slate text-sm">No complaints found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="px-4 py-3 text-xs text-slate font-medium">ID</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium">Citizen</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium hidden md:table-cell">Priority</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium">Status</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium hidden lg:table-cell">Department</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium hidden lg:table-cell">Employee</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3 text-xs text-slate font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id} className="border-b border-line last:border-0 hover:bg-ink/5">
                    <td className="px-4 py-3 font-mono text-xs text-slate">{c.complaintNumber}</td>
                    <td className="px-4 py-3 text-ink">{c.citizen?.fullName || "Unknown"}</td>
                    <td className="px-4 py-3 text-slate hidden sm:table-cell">{c.category}</td>
                    <td className="px-4 py-3 text-slate hidden md:table-cell">{c.priority}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate hidden lg:table-cell">{c.department || "—"}</td>
                    <td className="px-4 py-3 text-slate hidden lg:table-cell">{c.assignedEmployee?.fullName || "—"}</td>
                    <td className="px-4 py-3 text-slate hidden lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/admin/complaints/${c._id}`}>
                        <Eye size={15} className="text-slate hover:text-ink" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminComplaintsPage;