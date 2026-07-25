import { useEffect, useState } from "react";
import { Plus, X, Trash2, Edit2, UserCog, Mail, Phone } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

function AdminEmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    department: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get("/api/employees"),
        api.get("/api/departments"),
      ]);
      setEmployees(empRes.data.employees);
      setDepartments(deptRes.data.departments);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setFormData({ fullName: "", email: "", phone: "", password: "", department: "" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (emp) => {
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      password: "",
      department: emp.department,
    });
    setEditingId(emp._id);
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (editingId) {
      if (!formData.fullName.trim() || !formData.department) {
        setError("Full name and department are required");
        return;
      }
      setSubmitting(true);
      try {
        await api.put(`/api/employees/${editingId}`, {
          fullName: formData.fullName,
          department: formData.department,
        });
        setShowForm(false);
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || "Something went wrong");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.password || !formData.department) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/employees", formData);
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove employee "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/employees/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove employee");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";
  const disabledInputClass =
    "w-full px-4 py-3 bg-ink/5 border border-line rounded-lg text-slate text-sm cursor-not-allowed";

  const initials = (name) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <AdminLayout breadcrumb="Employees">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Employees</h1>
        <button
          onClick={openCreateForm}
          disabled={departments.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
        >
          <Plus size={16} /> New Employee
        </button>
      </div>

      {departments.length === 0 && !loading && (
        <div className="mb-6 text-sm bg-signal/5 border border-signal/30 rounded-lg px-4 py-3 text-ink">
          Create at least one department before adding employees.
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-line rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">
              {editingId ? "Edit Employee" : "New Employee"}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate hover:text-ink">
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mb-4 text-sm bg-error/5 border border-error/30 rounded-lg px-4 py-3 text-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-ink mb-1.5">Full Name</label>
                <input className={inputClass} name="fullName" value={formData.fullName} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Department</label>
                <select className={inputClass} name="department" value={formData.department} onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Email Address</label>
                {editingId ? (
                  <input className={disabledInputClass} value={formData.email} disabled />
                ) : (
                  <input className={inputClass} type="email" name="email" value={formData.email} onChange={handleChange} />
                )}
              </div>
              <div>
                <label className="block text-sm text-ink mb-1.5">Mobile Number</label>
                {editingId ? (
                  <input className={disabledInputClass} value={formData.phone} disabled />
                ) : (
                  <input className={inputClass} name="phone" value={formData.phone} onChange={handleChange} />
                )}
              </div>
              {!editingId && (
                <div className="sm:col-span-2">
                  <label className="block text-sm text-ink mb-1.5">Temporary Password</label>
                  <input className={inputClass} type="text" name="password" value={formData.password} onChange={handleChange} />
                  <p className="text-xs text-slate mt-1">
                    Share this password with the employee along with their email. They'll log in at the normal Login page,
                    then can set their own permanent password from Settings.
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving…" : editingId ? "Update Employee" : "Create Employee"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <UserCog size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">No employees added yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-line rounded-2xl divide-y divide-line">
          {employees.map((emp) => (
            <div key={emp._id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-full bg-signal text-paper text-xs font-medium flex items-center justify-center shrink-0">
                  {initials(emp.fullName)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{emp.fullName}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                    <span className="text-xs text-slate flex items-center gap-1">
                      <Mail size={11} /> {emp.email}
                    </span>
                    <span className="text-xs text-slate flex items-center gap-1">
                      <Phone size={11} /> {emp.phone}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-full bg-signal/10 text-signal">
                  {emp.department}
                </span>
                <button
                  onClick={() => openEditForm(emp)}
                  className="p-1.5 rounded-lg hover:bg-ink/5 text-slate hover:text-ink"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(emp._id, emp.fullName)}
                  className="p-1.5 rounded-lg hover:bg-error/10 text-slate hover:text-error"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminEmployeesPage;