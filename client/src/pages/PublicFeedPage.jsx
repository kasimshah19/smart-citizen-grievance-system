import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Users, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { COMPLAINT_CATEGORIES, STATUS_COLORS } from "../constants/complaint.constants";

function PublicFeedPage() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get("/api/public/stats")
      .then((res) => setStats(res.data.stats))
      .catch((err) => console.error("Failed to load stats", err));
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (status) params.status = status;

      const res = await api.get("/api/public/complaints", { params });
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to load public complaints", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchComplaints();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const selectClass =
    "px-3 py-2.5 bg-white border border-line rounded-lg text-sm text-ink focus:outline-none focus:border-ink transition-colors";

  return (
    <div className="min-h-screen bg-paper">
      {/* Public header — same style as the landing page, no auth needed */}
      <header className="border-b border-line px-6 py-5 flex items-center justify-between bg-paper">
        <Link to="/" className="font-display text-lg tracking-tight text-ink">
          Nagrik<span className="text-signal">.</span>
        </Link>
        <nav className="flex gap-3 text-sm items-center">
          <Link to="/login" className="px-4 py-2 text-ink hover:text-signal transition-colors">
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 bg-ink text-paper rounded-full hover:bg-signal transition-colors"
          >
            Report an Issue
          </Link>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <span className="inline-block font-mono text-xs uppercase tracking-widest text-slate border border-line rounded-full px-3 py-1 mb-4">
          Community Feed
        </span>
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-3">
          What's being reported in your area
        </h1>
        <p className="text-slate text-sm mb-2 max-w-2xl">
          A public, anonymized view of civic issues reported through Nagrik — see what your
          neighbors are dealing with, and what's already being fixed.
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate mb-8">
          <ShieldCheck size={13} className="text-success" />
          Reporter identities are never shown here.
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 mb-8 max-w-sm">
            <div className="bg-white border border-line rounded-2xl p-4">
              <p className="font-display text-2xl text-ink">{stats.total}</p>
              <p className="text-xs text-slate mt-1">Total Reported</p>
            </div>
            <div className="bg-white border border-line rounded-2xl p-4">
              <p className="font-display text-2xl text-success">{stats.resolved}</p>
              <p className="text-xs text-slate mt-1">Resolved</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-line rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="text"
              placeholder="Search by issue or area…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-line rounded-lg text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors"
            />
          </div>
          <select className={selectClass} value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className={selectClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {Object.keys(STATUS_COLORS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
            Loading…
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-white border border-line rounded-2xl p-16 text-center">
            <p className="text-slate text-sm">No complaints match your filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {complaints.map((c) => (
              <div key={c._id} className="bg-white border border-line rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] text-slate">{c.complaintNumber}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <h2 className="font-display text-base text-ink mb-1">{c.title}</h2>
                <p className="text-xs text-slate mb-3">{c.category}</p>

                <div className="flex items-start gap-1.5 text-xs text-slate mb-3">
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  <span>{c.location?.address || "Location not specified"}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-line">
                  <span className="text-[11px] text-slate">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {c.reportCount > 1 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-signal/10 text-signal flex items-center gap-1">
                      <Users size={11} /> {c.reportCount} reports
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-xs text-slate">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-line text-slate hover:text-ink hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-line text-slate hover:text-ink hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 text-center bg-white border border-line rounded-2xl p-8">
          <p className="text-ink font-medium mb-1">Facing a similar issue?</p>
          <p className="text-slate text-sm mb-4">Create a free account and report it in under a minute.</p>
          <Link
            to="/signup"
            className="inline-block px-6 py-2.5 bg-signal text-paper rounded-full font-medium hover:bg-signal-dark transition-colors"
          >
            Report an Issue
          </Link>
        </div>
      </main>
    </div>
  );
}

export default PublicFeedPage;
