// File: frontend/src/adapters/ui/RoutesTab.tsx
import { useEffect, useState } from "react";
import { api } from "../infrastructure/apiClient";

interface Route {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export default function RoutesTab() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<Route[]>("/routes");
      setRoutes(data);
    } catch (err: any) {
      console.error("Routes fetch error:", err);
      setError(err.message || "Failed to load routes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setBaseline(routeId: string) {
    if (!confirm(`Set route ${routeId} as baseline?`)) return;
    setActionLoading(true);
    try {
      await api.post(`/routes/${routeId}/baseline`, undefined);
      await load();
      alert("Baseline updated.");
    } catch (err: any) {
      console.error("Set baseline error:", err);
      alert(`Failed to set baseline: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading routes...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Routes Data</h2>
        <button
          onClick={load}
          className="bg-gray-200 px-3 py-1 rounded text-sm"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          Error: {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Route ID</th>
              <th className="px-4 py-2 text-left">Vessel</th>
              <th className="px-4 py-2 text-left">Fuel</th>
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-right">GHG Intensity</th>
              <th className="px-4 py-2 text-right">Fuel (t)</th>
              <th className="px-4 py-2 text-right">Distance (km)</th>
              <th className="px-4 py-2 text-right">Total Emissions</th>
              <th className="px-4 py-2 text-center">Baseline?</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {routes.map((r) => {
              const baselineClass = r.isBaseline ? "bg-yellow-50" : "";
              return (  
                <tr key={r.routeId} className={`border-b hover:bg-gray-50 ${baselineClass}`}>
                  <td className="px-4 py-2">{r.routeId}</td>
                  <td className="px-4 py-2">{r.vesselType}</td>
                  <td className="px-4 py-2">{r.fuelType}</td>
                  <td className="px-4 py-2">{r.year}</td>
                  <td className="px-4 py-2 text-right">{r.ghgIntensity?.toFixed(2) ?? "—"}</td>
                  <td className="px-4 py-2 text-right">{r.fuelConsumption?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-2 text-right">{r.distance?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-2 text-right">{r.totalEmissions?.toFixed(1) ?? "—"}</td>
                  <td className="px-4 py-2 text-center">{r.isBaseline ? "✅" : "—"}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setBaseline(r.routeId)}
                      disabled={actionLoading || !!r.isBaseline}
                      className={`px-3 py-1 rounded text-sm ${
                        r.isBaseline ? "bg-gray-200 text-gray-600" : "bg-blue-600 text-white"
                      }`}
                    >
                      {r.isBaseline ? "Baseline" : "Set Baseline"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
