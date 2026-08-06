import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { MapPin, Search, X } from "lucide-react";
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

// Lives inside <MapContainer> so it can access the map instance and pan/zoom
// it whenever a location search sets a new target.
function FlyTo({ target }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    if (target.bounds) {
      map.fitBounds(target.bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      map.flyTo([target.lat, target.lng], target.zoom || 13);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return null;
}

function AdminMapPage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationQuery, setLocationQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState("");
  const [flyTarget, setFlyTarget] = useState(null);
  const [mapView, setMapView] = useState("street"); // "street" | "satellite"

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

  // Village/city/district/pincode search: look through our own complaint
  // addresses first (instant, free); if nothing matches, ask Nominatim
  // (the same geocoding service already used on the New Complaint form)
  // where that place is, so admin can still jump there even with zero
  // complaints in that area yet.
  const handleLocationSearch = async (e) => {
    e.preventDefault();
    const query = locationQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchNote("");

    const matches = points.filter((p) =>
      p.address?.toLowerCase().includes(query.toLowerCase())
    );

    if (matches.length > 0) {
      if (matches.length === 1) {
        setFlyTarget({ lat: matches[0].latitude, lng: matches[0].longitude, zoom: 16 });
      } else {
        const bounds = matches.map((p) => [p.latitude, p.longitude]);
        setFlyTarget({ bounds });
      }
      setSearchNote(`Found ${matches.length} complaint${matches.length === 1 ? "" : "s"} matching "${query}"`);
      setSearching(false);
      return;
    }

    // No local matches — fall back to real-world geocoding
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=in&limit=1`
      );
      const results = await res.json();

      if (results.length > 0) {
        setFlyTarget({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon), zoom: 16 });
        setSearchNote(`No complaints in "${query}" yet — showing the area on the map`);
      } else {
        setSearchNote(`Couldn't find "${query}" — try a different spelling or a nearby place`);
      }
    } catch (error) {
      console.error("Location search failed", error);
      setSearchNote("Location search failed — check your internet connection");
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setLocationQuery("");
    setSearchNote("");
    setFlyTarget({ lat: mapCenter[0], lng: mapCenter[1], zoom: 12 });
  };

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

      {/* Location search — village, city, district, or pincode */}
      <form onSubmit={handleLocationSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              placeholder="Search by village, city, district, or pincode…"
              className="w-full pl-9 pr-9 py-2.5 bg-white border border-line rounded-lg text-sm text-ink placeholder:text-slate/60 focus:outline-none focus:border-ink transition-colors"
            />
            {locationQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 bg-ink text-paper rounded-lg text-sm font-medium hover:bg-signal transition-colors disabled:opacity-50"
          >
            {searching ? "Searching…" : "Go"}
          </button>
          <div className="flex border border-line rounded-lg overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => setMapView("street")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                mapView === "street" ? "bg-ink text-paper" : "bg-white text-slate hover:text-ink"
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setMapView("satellite")}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                mapView === "satellite" ? "bg-ink text-paper" : "bg-white text-slate hover:text-ink"
              }`}
            >
              Satellite
            </button>
          </div>
        </div>
        {searchNote && <p className="text-xs text-slate mt-2">{searchNote}</p>}
        {mapView === "satellite" && (
          <p className="text-xs text-slate mt-2">
            Satellite photo detail depends on coverage in that area — very rural spots may show
            "map data not yet available" at close zoom. Switch to Street if that happens.
          </p>
        )}
      </form>

      <div className="bg-white border border-line rounded-2xl overflow-hidden relative" style={{ height: "600px" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate text-sm">Loading map…</div>
        ) : (
          <>
            {points.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[1000] bg-paper/60">
                <MapPin size={32} className="text-slate mb-3" />
                <p className="text-slate text-sm">No complaints with location data yet — you can still search for a place above.</p>
              </div>
            )}
            <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
              {mapView === "satellite" ? (
                <TileLayer
                  attribution="Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxNativeZoom={19}
                  maxZoom={20}
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                />
              )}
              <FlyTo target={flyTarget} />
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
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminMapPage;