// File: frontend/src/adapters/ui/CompareTab.tsx
import { useEffect, useState } from "react";
import { api } from "../infrastructure/apiClient";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface ComparisonRow {
  routeId: string;
  baselineGHG: number;
  comparisonGHG: number;
  percentDiff: number;
  compliant: boolean;
}

export default function CompareTab() {
  const [data, setData] = useState<ComparisonRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    api.get<ComparisonRow[]>("/routes/comparison")
      .then(setData)
      .catch((err) => {
        console.error("Compare fetch error:", err);
        setError(err.message || "Failed to load comparison");
        setData([]);
      });
  }, []);

  if (data === null) {
    return <p className="p-6">Loading comparison data...</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Compare Routes</h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Route ID</th>
              <th className="px-4 py-2 text-right">Baseline</th>
              <th className="px-4 py-2 text-right">Comparison</th>
              <th className="px-4 py-2 text-right">% Diff</th>
              <th className="px-4 py-2 text-center">Compliant</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.routeId} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">{r.routeId}</td>
                <td className="px-4 py-2 text-right">{r.baselineGHG.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{r.comparisonGHG.toFixed(2)}</td>
                <td className={`px-4 py-2 text-right ${r.percentDiff <= 0 ? "text-green-600" : "text-red-600"}`}>
                  {r.percentDiff.toFixed(2)}%
                </td>
                <td className="px-4 py-2 text-center">{r.compliant ? "✅" : "❌"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="routeId" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="baselineGHG" name="Baseline" fill="#1f77b4" />
            <Bar dataKey="comparisonGHG" name="Comparison" fill="#ff7f0e" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
