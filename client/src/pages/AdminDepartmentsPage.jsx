import { useEffect, useState } from "react";
import { Plus, X, Edit2, Trash2, Building2 } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/api/departments");
      setDepartments(res.data.departments);
    } catch (err) {
      console.error("Failed to load departments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateForm = () => {
    setFormData({ name: "", description: "" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (dept) => {
    setFormData({ name: dept.name, description: dept.description || "" });
    setEditingId(dept._id);
    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Department name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/api/departments/${editingId}`, formData);
      } else {
        await api.post("/api/departments", formData);
      }
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete department "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-paper border border-line rounded-lg text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors text-sm";

  return (
    <AdminLayout breadcrumb="Departments">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Departments</h1>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-ink text-paper rounded-full text-sm font-medium hover:bg-signal transition-colors"
        >
          <Plus size={16} /> New Department
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-line rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg text-ink">
              {editingId ? "Edit Department" : "New Department"}
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
            <div>
              <label className="block text-sm text-ink mb-1.5">Department Name</label>
              <input
                className={inputClass}
                name="name"
                placeholder="e.g. Electrical, Water, Sanitation"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm text-ink mb-1.5">Description (optional)</label>
              <textarea
                className={`${inputClass} resize-none`}
                name="description"
                rows={2}
                placeholder="Brief description of this department"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving…" : editingId ? "Update Department" : "Create Department"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-line rounded-2xl p-10 text-center text-slate text-sm">
          Loading…
        </div>
      ) : departments.length === 0 ? (
        <div className="bg-white border border-line rounded-2xl p-16 text-center">
          <Building2 size={32} className="text-slate mx-auto mb-3" />
          <p className="text-slate text-sm">No departments created yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div className="w-9 h-9 rounded-lg bg-signal/10 text-signal flex items-center justify-center">
                  <Building2 size={16} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditForm(dept)}
                    className="p-1.5 rounded-lg hover:bg-ink/5 text-slate hover:text-ink"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id, dept.name)}
                    className="p-1.5 rounded-lg hover:bg-error/10 text-slate hover:text-error"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-ink">{dept.name}</p>
              {dept.description && <p className="text-xs text-slate mt-1">{dept.description}</p>}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line">
                <div>
                  <p className="text-sm text-ink">{dept.employeeCount}</p>
                  <p className="text-[11px] text-slate">Employees</p>
                </div>
                <div>
                  <p className="text-sm text-ink">{dept.complaintCount}</p>
                  <p className="text-[11px] text-slate">Complaints</p>
                </div>
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${
                    dept.active ? "bg-success/10 text-success" : "bg-slate/10 text-slate"
                  }`}
                >
                  {dept.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export default AdminDepartmentsPage;