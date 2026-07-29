import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LifeBuoy,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
} from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

const STATUS_LIST = ["Open", "In Progress", "Resolved", "Closed"];

const TICKET_STATUS_COLORS = {
  Open: "bg-error/10 text-error",
  "In Progress": "bg-signal/10 text-signal",
  Resolved: "bg-success/10 text-success",
  Closed: "bg-ink/10 text-ink",
};

function AdminSupportTicketsPage() {
  const [searchParams] = useSearchParams();
  const [tickets, setTickets] = useState([]);
  const [openCount, setOpenCount] = useState(0);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);

  const [expandedId, setExpandedId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [statusDrafts, setStatusDrafts] = useState({});
  const [sendingId, setSendingId] = useState(null);
  const [sendError, setSendError] = useState({});

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

      const res = await api.get("/api/admin/support-tickets", { params });
      setTickets(res.data.tickets);
      setOpenCount(res.data.openCount);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchTickets();
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const toggleExpand = (ticket) => {
    if (expandedId === ticket._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(ticket._id);
    setStatusDrafts((prev) => ({ ...prev, [ticket._id]: prev[ticket._id] ?? ticket.status }));
  };

  const handleSendReply = async (ticket) => {
    const reply = replyDrafts[ticket._id]?.trim();
    if (!reply) {
      setSendError((prev) => ({ ...prev, [ticket._id]: "Reply message can't be empty" }));
      return;
    }

    setSendingId(ticket._id);
    setSendError((prev) => ({ ...prev, [ticket._id]: "" }));
    try {
      const res = await api.patch(`/api/admin/support-tickets/${ticket._id}/reply`, {
        reply,
        status: statusDrafts[ticket._id] || undefined,
      });
      setTickets((prev) => prev.map((t) => (t._id === ticket._id ? res.data.ticket : t)));
      setReplyDrafts((prev) => ({ ...prev, [ticket._id]: "" }));
    } catch (err) {
      setSendError((prev) => ({
        ...prev,
        [ticket._id]: err.response?.data?.message || "Something went wrong",
      }));
    } finally {
      setSendingId(null);
    }
  };

  const selectClass =
    "px-3 py-2.5 bg-paper border border-line rounded-lg text-sm text-ink focus:outline-none focus:border-ink transition-colors";
  const inputClass =
    "w-full px-3 py-2.5 bg-paper border border-line rounded-lg text-sm text-ink focus:outline-none focus:border-ink transition-colors";

  return (
    <AdminLayout breadcrumb="Support Tickets">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Support Tickets</h1>
        <p className="text-sm text-slate">
          {openCount} open · {pagination.total} total
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-line rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            className="w-full pl-9 pr-3 py-2.5 bg-paper border border-line rounded-lg text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors"
            placeholder="Search by subject or citizen name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className={selectClass} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <LifeBuoy size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">No support tickets match your filters.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {tickets.map((t) => {
            const isExpanded = expandedId === t._id;
            return (
              <div key={t._id}>
                <div
                  onClick={() => toggleExpand(t)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-paper/60 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{t.subject}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-xs text-slate">{t.citizen?.fullName || "Unknown"}</span>
                      <span className="text-xs text-slate flex items-center gap-1">
                        <Mail size={11} /> {t.citizen?.email}
                      </span>
                      <span className="text-xs text-slate flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full ${TICKET_STATUS_COLORS[t.status]}`}>
                      {t.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate" />
                    ) : (
                      <ChevronDown size={16} className="text-slate" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 bg-paper/40">
                    <div className="pt-4 space-y-4">
                      {/* Citizen's message */}
                      <div className="bg-white border border-line rounded-lg p-4">
                        <p className="text-xs text-slate mb-1.5 flex items-center gap-1">
                          <Phone size={11} /> {t.citizen?.phone}
                        </p>
                        <p className="text-sm text-ink whitespace-pre-wrap">{t.message}</p>
                      </div>

                      {/* Existing admin reply, if any */}
                      {t.adminReply && (
                        <div className="bg-signal/5 border border-signal/20 rounded-lg p-4">
                          <p className="text-xs text-signal font-medium mb-1.5">
                            Admin replied ·{" "}
                            {new Date(t.repliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <p className="text-sm text-ink whitespace-pre-wrap">{t.adminReply}</p>
                        </div>
                      )}

                      {/* Reply form */}
                      <div>
                        {sendError[t._id] && (
                          <p className="text-xs text-error mb-2">{sendError[t._id]}</p>
                        )}
                        <textarea
                          rows={3}
                          className={`${inputClass} resize-none mb-3`}
                          placeholder={t.adminReply ? "Send another reply…" : "Write a reply to this citizen…"}
                          value={replyDrafts[t._id] || ""}
                          onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [t._id]: e.target.value }))}
                        />
                        <div className="flex items-center gap-3">
                          <select
                            className={selectClass}
                            value={statusDrafts[t._id] ?? t.status}
                            onChange={(e) => setStatusDrafts((prev) => ({ ...prev, [t._id]: e.target.value }))}
                          >
                            {STATUS_LIST.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSendReply(t)}
                            disabled={sendingId === t._id}
                            className="px-5 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
                          >
                            {sendingId === t._id ? "Sending…" : "Send Reply"}
                          </button>
                        </div>
                      </div>
                    </div>
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

export default AdminSupportTicketsPage;
