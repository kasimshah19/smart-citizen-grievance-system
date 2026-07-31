import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { MapPin } from "lucide-react";
import AdminLayout from "../components/layout/AdminLayout";
import api from "../services/api";

const STATUS_COLORS = {
  Submitted: "#5B6B74",
  "Under Review": "#C1552C",
  Assigned: "#C1552C",
  Accepted: "#C1552C",
  "In Progress": "#C1552C",
  Resolved: "#2B6E4F",
  "Citizen Confirmation": "#2B6E4F",
  Closed: "#142330",
  Reopened: "#B3261E",
};

const INDIA_CENTER = [22.5, 78.9];

function AdminMapPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const res = await api.get("/api/admin/complaints-map");
        setPoints(res.data.points);
      } catch (error) {
        console.error("Failed to load map data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoints();
  }, []);

  const mapCenter =
    points.length > 0 ? [points[0].latitude, points[0].longitude] : INDIA_CENTER;

  return (
    <AdminLayout breadcrumb="Complaint Map">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl text-ink">Complaint Map</h1>
          <p className="text-sm text-slate mt-0.5">
            {loading ? "Loading…" : `${points.length} complaint${points.length !== 1 ? "s" : ""} with location data`}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4 bg-white border border-line rounded-2xl px-5 py-3">
        {Object.entries(STATUS_COLORS)
          .filter(([status]) => ["Submitted", "Assigned", "In Progress", "Resolved", "Closed"].includes(status))
          .map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-slate">{status}</span>
            </div>
          ))}
      </div>

      <div className="bg-white border border-line rounded-2xl overflow-hidden" style={{ height: "600px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate text-sm">Loading map…</div>
        ) : points.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <MapPin size={32} className="text-slate mb-3" />
            <p className="text-slate text-sm">No complaints with location data yet.</p>
          </div>
        ) : (
          <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {points.map((point) => (
              <CircleMarker
                key={point.id}
                center={[point.latitude, point.longitude]}
                radius={9}
                pathOptions={{
                  color: STATUS_COLORS[point.status] || "#142330",
                  fillColor: STATUS_COLORS[point.status] || "#142330",
                  fillOpacity: 0.7,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ minWidth: "180px" }}>
                    <p style={{ fontFamily: "monospace", fontSize: "11px", color: "#5B6B74", margin: 0 }}>
                      {point.complaintNumber}
                    </p>
                    <p style={{ fontWeight: 600, fontSize: "13px", margin: "4px 0" }}>{point.title}</p>
                    <p style={{ fontSize: "12px", color: "#5B6B74", margin: 0 }}>
                      {point.category} · {point.priority} priority
                    </p>
                    <p style={{ fontSize: "12px", margin: "4px 0" }}>{point.status}</p>
                    <p style={{ fontSize: "11px", color: "#5B6B74", margin: "4px 0" }}>{point.address}</p>
                    <Link
                      to={`/admin/complaints/${point.id}`}
                      style={{ fontSize: "12px", color: "#C1552C", fontWeight: 500 }}
                    >
                      View Details →
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminMapPage;