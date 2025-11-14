// File: frontend/src/adapters/ui/PoolingTab.tsx
import { useState } from "react";
import { api } from "../infrastructure/apiClient";

interface Member {
  shipId: string;
  cbBefore: number;
  cbAfter?: number;
}

export default function PoolingTab() {
  const [year, setYear] = useState(2025);
  const [members, setMembers] = useState<Member[]>([
    { shipId: "Ship-A", cbBefore: 3000 },
    { shipId: "Ship-B", cbBefore: -1000 },
    { shipId: "Ship-C", cbBefore: -1500 },
  ]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateMember(i: number, field: keyof Member, value: string) {
    const copy = [...members];
    copy[i] = {
      ...copy[i],
      [field]: field === "cbBefore" ? Number(value) : value,
    };
    setMembers(copy);
  }

  function addMember() {
    setMembers([...members, { shipId: `Ship-${members.length + 1}`, cbBefore: 0 }]);
  }

  function removeMember(i: number) {
    setMembers(members.filter((_, idx) => idx !== i));
  }

  async function createPool() {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/pools", { year, members });
      setResponse(res);
      if ((res as any).status === "ok") {
        alert("Pool created successfully.");
      }
    } catch (err: any) {
      console.error("Create pool error:", err);
      setError(err.message || "Failed to create pool");
    } finally {
      setLoading(false);
    }
  }

  const total = members.reduce((s, m) => s + (m.cbBefore ?? 0), 0);
  const valid = total >= 0;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-semibold text-center text-gray-800">
        ⚓ Pooling Collaboration
      </h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">{error}</div>}

      <div className="flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <label className="font-medium text-gray-700">Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border p-2 rounded-md w-28"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={addMember}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            Add Member
          </button>

          <button
            onClick={createPool}
            disabled={!valid || loading}
            className={`px-6 py-2 font-semibold rounded-md transition-all ${
              valid ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-400 cursor-not-allowed text-white"
            }`}
          >
            {loading ? "Creating..." : "Create Pool"}
          </button>
        </div>

        <div className={`text-lg font-semibold ${valid ? "text-green-700" : "text-red-600"}`}>
          Total CB: {total.toFixed(2)} gCO₂e
        </div>
      </div>

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Ship ID</th>
              <th className="px-6 py-3 text-left">CB Before</th>
              <th className="px-6 py-3 text-left">CB After (server)</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m, i) => (
              <tr key={i} className="border-b hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3">
                  <input
                    value={m.shipId}
                    onChange={(e) => updateMember(i, "shipId", e.target.value)}
                    className="border rounded-md px-3 py-1 w-full"
                  />
                </td>
                <td className="px-6 py-3">
                  <input
                    type="number"
                    value={m.cbBefore}
                    onChange={(e) => updateMember(i, "cbBefore", e.target.value)}
                    className="border rounded-md px-3 py-1 w-32"
                  />
                </td>
                <td className="px-6 py-3">
                  {typeof m.cbAfter === "number" ? m.cbAfter.toFixed(2) : "—"}
                </td>
                <td className="px-6 py-3">
                  <button
                    onClick={() => removeMember(i)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    disabled={loading}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {response && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold mb-2 text-gray-700">Pooling Result:</h3>
          <pre className="bg-white p-3 rounded-md text-sm overflow-x-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
