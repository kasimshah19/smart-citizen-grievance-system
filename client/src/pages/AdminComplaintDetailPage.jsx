import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Tag, AlertCircle, Clock, UserCog } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";
import { COMPLAINT_STATUS_LIST } from "../shared/constants/complaintStatus";

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

function AdminComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [assignDept, setAssignDept] = useState("");
  const [assignEmployee, setAssignEmployee] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [newStatus, setNewStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchAll = async () => {
    setLoadError("");
    try {
      // Fetch the complaint on its own first — this is the critical data for this page.
      // If department/employee lookups fail, we still want to show the complaint.
      const detailRes = await api.get(`/api/admin/complaints/${id}`);
      setComplaint(detailRes.data.complaint);
      setHistory(detailRes.data.history);
      setAssignDept(detailRes.data.complaint.department || "");
      setAssignEmployee(detailRes.data.complaint.assignedEmployee?._id || "");
      setNewStatus(detailRes.data.complaint.status);

      const [deptResult, empResult] = await Promise.allSettled([
        api.get("/api/departments"),
        api.get("/api/employees"),
      ]);

      if (deptResult.status === "fulfilled") {
        setDepartments(deptResult.value.data.departments);
      } else {
        console.error("Failed to load departments", deptResult.reason);
      }

      if (empResult.status === "fulfilled") {
        setEmployees(empResult.value.data.employees);
      } else {
        console.error("Failed to load employees", empResult.reason);
      }
    } catch (err) {
      console.error("Failed to load complaint", err);
      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;
      setLoadError(
        status
          ? `Error ${status}: ${serverMessage || "Unknown server error"}`
          : `Network error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignDept) {
      setMessage("Please select a department");
      setMessageType("error");
      return;
    }
    setAssigning(true);
    try {
      await api.put(`/api/admin/complaints/${id}/assign`, {
        department: assignDept,
        employeeId: assignEmployee || null,
      });
      setMessage("Complaint assigned successfully");
      setMessageType("success");
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to assign complaint");
      setMessageType("error");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdatingStatus(true);
    try {
      await api.put(`/api/admin/complaints/${id}/status`, {
        status: newStatus,
        remarks: statusRemarks,
      });
      setMessage("Status updated successfully");
      setMessageType("success");
      setStatusRemarks("");
      fetchAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update status");
      setMessageType("error");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredEmployees = employees.filter((e) => e.department === assignDept);

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  if (loading) {
    return (
      <AdminLayout breadcrumb="Complaints">
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      </AdminLayout>
    );
  }

  if (!complaint) {
    return (
      <AdminLayout breadcrumb="Complaints">
        <div className="bg-white border border-line rounded-2xl p-10 text-center">
          <AlertCircle size={28} className="text-error mx-auto mb-3" />
          <p className="text-slate text-sm">Complaint not found</p>
          {loadError && (
            <p className="text-xs font-mono text-error mt-3 bg-error/5 inline-block px-3 py-2 rounded-lg">
              {loadError}
            </p>
          )}
          <p className="text-xs text-slate mt-4">
            Complaint ID: <span className="font-mono">{id}</span>
          </p>
        </div>
      </AdminLayout>
    );
  }

  const photoUrl = complaint.photoUrl ? `http://localhost:5000${complaint.photoUrl}` : null;

  return (
    <AdminLayout breadcrumb="Complaint Detail">
      <Link
        to="/admin/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-ink transition-colors mb-4"
      >
        <ArrowLeft size={15} />
        Back to Complaints
      </Link>

      {message && (
        <div
          className={`mb-5 text-sm border rounded-lg px-4 py-3 ${
            messageType === "error"
              ? "bg-error/5 border-error/30 text-error"
              : "bg-success/5 border-success/30 text-success"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Complaint details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-line rounded-2xl overflow-hidden">
            {photoUrl && (
              <img src={photoUrl} alt={complaint.title} className="w-full max-h-72 object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs text-slate">{complaint.complaintNumber}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${STATUS_COLORS[complaint.status]}`}>
                  {complaint.status}
                </span>
              </div>

              <h1 className="font-display text-2xl text-ink mb-2">{complaint.title}</h1>
              <p className="text-slate text-sm leading-relaxed mb-6">{complaint.description}</p>

              <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t border-line">
                <div className="flex items-start gap-3">
                  <Tag size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Category</p>
                    <p className="text-sm text-ink">{complaint.category}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Priority</p>
                    <p className="text-sm text-ink">{complaint.priority}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Location</p>
                    <p className="text-sm text-ink">{complaint.location?.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Submitted On</p>
                    <p className="text-sm text-ink">
                      {new Date(complaint.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UserCog size={16} className="text-slate mt-0.5" />
                  <div>
                    <p className="text-xs text-slate">Citizen</p>
                    <p className="text-sm text-ink">{complaint.citizen?.fullName}</p>
                    <p className="text-xs text-slate">{complaint.citizen?.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Assign section */}
          <div className="bg-white border border-line rounded-2xl p-6">
            <h2 className="font-display text-lg text-ink mb-1">Assign Complaint</h2>
            {complaint.department ? (
              <p className="text-xs text-slate mb-4">
                Currently assigned to <span className="text-ink font-medium">{complaint.department}</span>
                {complaint.assignedEmployee?.fullName && (
                  <> · <span className="text-ink font-medium">{complaint.assignedEmployee.fullName}</span></>
                )}
              </p>
            ) : (
              <p className="text-xs text-slate mb-4">Not assigned to any department yet</p>
            )}
            <form onSubmit={handleAssign} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-ink mb-1.5">Department</label>
                  <select
                    className={inputClass}
                    value={assignDept}
                    onChange={(e) => {
                      setAssignDept(e.target.value);
                      setAssignEmployee("");
                    }}
                  >
                    <option value="">Select department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink mb-1.5">Employee (optional)</label>
                  <select
                    className={`${inputClass} disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-line/30`}
                    value={assignEmployee}
                    onChange={(e) => setAssignEmployee(e.target.value)}
                    disabled={!assignDept}
                  >
                    <option value="">Unassigned</option>
                    {filteredEmployees.map((emp) => (
                      <option key={emp._id} value={emp._id}>{emp.fullName}</option>
                    ))}
                  </select>
                  {!assignDept ? (
                    <p className="text-xs text-slate mt-1.5">Select a department first to see its employees</p>
                  ) : filteredEmployees.length === 0 ? (
                    <p className="text-xs text-slate mt-1.5">No employees in this department yet</p>
                  ) : null}
                </div>
              </div>
              <button
                type="submit"
                disabled={assigning}
                className="px-6 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
              >
                {assigning ? "Assigning…" : "Assign"}
              </button>
            </form>
          </div>

          {/* Status update section */}
          <div className="bg-white border border-line rounded-2xl p-6">
            <h2 className="font-display text-lg text-ink mb-4">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-sm text-ink mb-1.5">New Status</label>
                <select className={inputClass} value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  {COMPLAINT_STATUS_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Remarks (optional)</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder="Add a note about this status change"
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={updatingStatus}
                className="px-6 py-2.5 bg-signal text-paper rounded-lg text-sm font-medium hover:bg-signal-dark transition-colors disabled:opacity-50"
              >
                {updatingStatus ? "Updating…" : "Update Status"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="bg-white border border-line rounded-2xl p-6 h-fit">
          <h2 className="font-display text-lg text-ink mb-5">Complaint Timeline</h2>

          {history.length === 0 ? (
            <p className="text-sm text-slate">No history available yet.</p>
          ) : (
            <div className="space-y-6">
              {history.map((h, index) => (
                <div key={h._id} className="relative pl-6">
                  {index !== history.length - 1 && (
                    <span className="absolute left-[5px] top-3 bottom-[-24px] w-px bg-line" />
                  )}
                  <span
                    className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full ${
                      index === history.length - 1 ? "bg-signal" : "bg-ink/20"
                    }`}
                  />
                  <p className="text-sm font-medium text-ink">{h.action}</p>
                  <p className="text-xs text-slate mt-0.5">
                    {h.status} · {h.performerRole}
                    {h.performedBy?.fullName ? ` (${h.performedBy.fullName})` : ""}
                  </p>
                  {h.remarks && <p className="text-xs text-slate mt-1">{h.remarks}</p>}
                  <p className="text-xs text-slate/70 mt-1 flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(h.createdAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminComplaintDetailPage;