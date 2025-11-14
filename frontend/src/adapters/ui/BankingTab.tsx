// File: frontend/src/adapters/ui/BankingTab.tsx
import { useState } from "react";
import { api } from "../infrastructure/apiClient";

export default function BankingTab() {
  const [shipId, setShipId] = useState("Ship-01");
  const [year, setYear] = useState(2025);
  const [cb, setCb] = useState<number>(0);
  const [deficit, setDeficit] = useState<number>(0);
  const [response, setResponse] = useState<any>(null);
  const [banked, setBanked] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkBalance() {
    setError(null);
    setLoading(true);
    try {
      const result = await api.get<{ amountGCO2eq: number }>(
        `/banking/balance?shipId=${encodeURIComponent(shipId)}&year=${year}`
      );
      setBanked(result.amountGCO2eq);
    } catch (err: any) {
      console.error("Balance error:", err);
      setError(err.message || "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  }

  async function bankSurplus() {
    if (!shipId) return setError("Provide a Ship ID");
    if (cb <= 0) return setError("Surplus must be positive");
    setError(null);
    setLoading(true);
    try {
      const result = await api.post("/banking/bank", { shipId, year, cb });
      setResponse(result);
      await checkBalance();
    } catch (err: any) {
      console.error("Bank error:", err);
      setError(err.message || "Failed to bank surplus");
    } finally {
      setLoading(false);
    }
  }

  async function applySurplus() {
    if (!shipId) return setError("Provide a Ship ID");
    if (deficit >= 0) return setError("Deficit must be negative value");
    if (!banked || banked <= 0) return setError("No banked surplus available");
    setError(null);
    setLoading(true);
    try {
      const result = await api.post("/banking/apply", { shipId, year, deficit });
      setResponse(result);
      await checkBalance();
    } catch (err: any) {
      console.error("Apply error:", err);
      setError(err.message || "Failed to apply surplus");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Banking Operations</h2>

      <div className="flex gap-4 items-center">
        <label>Ship ID:</label>
        <input
          value={shipId}
          onChange={(e) => setShipId(e.target.value)}
          className="border p-2 rounded"
        />

        <label>Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2 rounded w-24"
        />

        <button
          onClick={checkBalance}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Balance"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      {banked !== null && (
        <p className="text-lg">
          💰 Current Banked: <b>{banked.toFixed(2)} gCO₂e</b>
        </p>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Bank Surplus</h3>
          <input
            type="number"
            value={cb}
            onChange={(e) => setCb(Number(e.target.value))}
            placeholder="Enter surplus CB"
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={bankSurplus}
            className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
            disabled={loading}
          >
            Bank Surplus
          </button>
        </div>

        <div className="border p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-2">Apply Surplus</h3>
          <input
            type="number"
            value={deficit}
            onChange={(e) => setDeficit(Number(e.target.value))}
            placeholder="Enter deficit (negative)"
            className="border p-2 rounded w-full mb-2"
          />
          <button
            onClick={applySurplus}
            className="bg-yellow-600 text-white px-4 py-2 rounded w-full disabled:opacity-60"
            disabled={loading || !banked || banked <= 0}
          >
            Apply Surplus
          </button>
        </div>
      </div>

      {response != null && (
        <pre className="bg-gray-100 p-3 rounded-lg mt-4 text-sm overflow-x-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
