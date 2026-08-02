import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, Search, Users, FileSpreadsheet, FileDown } from "lucide-react";
import ExcelJS from "exceljs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";
import { COMPLAINT_STATUS_LIST } from "../shared/constants/complaintStatus";
import { PRIORITIES_LIST } from "../shared/constants/priorities";

// Nagrik theme colors, as hex (no leading #) — used to style the exported reports
const THEME = {
  ink: "142330",
  signal: "C1552C",
  paper: "F7F4EC",
  slate: "5B6B74",
  line: "DEDACD",
  white: "FFFFFF",
};

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

  const handleExportExcel = async () => {
    if (complaints.length === 0) return;

    const columns = [
      { header: "Complaint No", key: "complaintNumber", width: 18 },
      { header: "Citizen", key: "citizen", width: 18 },
      { header: "Category", key: "category", width: 18 },
      { header: "Priority", key: "priority", width: 12 },
      { header: "Status", key: "status", width: 16 },
      { header: "Department", key: "department", width: 16 },
      { header: "Employee", key: "employee", width: 18 },
      { header: "Reports", key: "reportCount", width: 10 },
      { header: "Date", key: "date", width: 14 },
    ];
    const colCount = columns.length;
    const lastColLetter = String.fromCharCode(64 + colCount); // e.g. 9 columns -> "I"

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Smart Citizen Grievance Management System";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("Complaints");

    sheet.columns = columns.map((c) => ({ key: c.key, width: c.width }));

    // Title block — merged, centered, bold, on-brand colors
    sheet.mergeCells(`A1:${lastColLetter}1`);
    sheet.getCell("A1").value = "Smart Citizen Grievance Management System";
    sheet.getCell("A1").font = { bold: true, size: 16, color: { argb: `FF${THEME.ink}` } };
    sheet.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(1).height = 26;

    sheet.mergeCells(`A2:${lastColLetter}2`);
    sheet.getCell("A2").value = "Complaints Report";
    sheet.getCell("A2").font = { bold: true, size: 13, color: { argb: `FF${THEME.signal}` } };
    sheet.getCell("A2").alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(2).height = 20;

    sheet.mergeCells(`A3:${lastColLetter}3`);
    sheet.getCell("A3").value = `Generated on ${new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })} — ${complaints.length} complaint(s)`;
    sheet.getCell("A3").font = { italic: true, size: 10, color: { argb: `FF${THEME.slate}` } };
    sheet.getCell("A3").alignment = { horizontal: "center", vertical: "middle" };
    sheet.getRow(3).height = 18;

    // Blank spacer row
    sheet.getRow(4).height = 8;

    // Header row for the actual table (row 5)
    const headerRow = sheet.getRow(5);
    columns.forEach((col, i) => {
      const cell = headerRow.getCell(i + 1);
      cell.value = col.header;
      cell.font = { bold: true, color: { argb: `FF${THEME.white}` } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${THEME.ink}` } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    headerRow.height = 22;

    complaints.forEach((c, index) => {
      const row = sheet.addRow({
        complaintNumber: c.complaintNumber,
        citizen: c.citizen?.fullName || "Unknown",
        category: c.category,
        priority: c.priority,
        status: c.status,
        department: c.department || "Unassigned",
        employee: c.assignedEmployee?.fullName || "Unassigned",
        reportCount: c.reportCount || 1,
        date: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      });
      // Soft alternating row shading, matching the app's paper background
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: `FF${THEME.paper}` } };
        });
      }
      row.eachCell((cell) => {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = { bottom: { style: "thin", color: { argb: `FF${THEME.line}` } } };
      });
    });

    sheet.autoFilter = { from: "A5", to: `${lastColLetter}5` };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaints-report-${new Date().toISOString().split("T")[0]}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (complaints.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;

    // Title block — centered, bold, on-brand colors
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(20, 35, 48); // ink
    doc.text("Smart Citizen Grievance Management System", centerX, 16, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(193, 85, 44); // signal
    doc.text("Complaints Report", centerX, 23, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(91, 107, 116); // slate
    doc.text(
      `Generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} — ${complaints.length} complaint(s)`,
      centerX,
      29,
      { align: "center" }
    );

    // Thin rule under the header, in the theme's line color
    doc.setDrawColor(222, 218, 205); // line
    doc.line(14, 33, pageWidth - 14, 33);

    autoTable(doc, {
      startY: 38,
      head: [["Complaint No", "Citizen", "Category", "Priority", "Status", "Department", "Employee", "Date"]],
      body: complaints.map((c) => [
        c.complaintNumber,
        c.citizen?.fullName || "Unknown",
        c.category,
        c.priority,
        c.status,
        c.department || "—",
        c.assignedEmployee?.fullName || "—",
        new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      ]),
      styles: { fontSize: 8, halign: "center" },
      headStyles: { fillColor: [20, 35, 48], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [247, 244, 236] }, // paper
    });

    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`complaints-report-${dateStr}.pdf`);
  };

  const inputClass =
    "px-3 py-2 bg-white border border-line rounded-lg text-ink text-sm focus:outline-none focus:border-ink";

  return (
    <AdminLayout breadcrumb="Complaints">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Complaints</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-slate">{complaints.length} total</p>
          <button
            onClick={handleExportExcel}
            disabled={complaints.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-2 border border-line rounded-lg text-ink hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={14} /> Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={complaints.length === 0}
            className="flex items-center gap-1.5 text-xs px-3 py-2 border border-line rounded-lg text-ink hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FileDown size={14} /> Export PDF
          </button>
        </div>
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
                    <td className="px-4 py-3 font-mono text-xs text-slate">
                      <div className="flex items-center gap-1.5">
                        {c.complaintNumber}
                        {c.reportCount > 1 && (
                          <span
                            title={`Reported by ${c.reportCount} citizens`}
                            className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-signal/10 text-signal font-sans"
                          >
                            <Users size={10} /> {c.reportCount}
                          </span>
                        )}
                      </div>
                    </td>
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