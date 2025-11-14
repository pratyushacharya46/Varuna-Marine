// File: frontend/src/App.tsx
import { useState } from "react";
import RoutesTab from "./adapters/ui/RoutesTab";
import CompareTab from "./adapters/ui/CompareTab";
import PoolingTab from "./adapters/ui/PoolingTab";
import BankingTab from "./adapters/ui/BankingTab";

export default function App() {
  const [tab, setTab] = useState("routes");

  const tabs = [
    { id: "routes", label: "Routes" },
    { id: "compare", label: "Compare" },
    { id: "banking", label: "Banking" },
    { id: "pooling", label: "Pooling" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <div className="text-xl font-semibold">FuelEU Compliance Dashboard</div>

          <nav className="flex gap-4">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-2 rounded-md transition ${
                  tab === t.id ? "bg-blue-600 text-white font-medium" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-6xl mx-auto">
        {tab === "routes" && <RoutesTab />}
        {tab === "compare" && <CompareTab />}
        {tab === "banking" && <BankingTab />}
        {tab === "pooling" && <PoolingTab />}
      </main>
    </div>
  );
}
