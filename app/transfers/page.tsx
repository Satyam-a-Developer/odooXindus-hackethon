'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Transfers() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("internal_transfers")
      .select(`
        *,
        products ( name )
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Error fetching transfers:", error);
    } else {
      setTransfers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return (
    <div className="p-6 flex gap-6 bg-gray-50 min-h-screen">

      {/* Table Section */}
      <div className={`transition-all duration-300 ${selectedTransfer ? 'w-2/3' : 'w-full'}`}>
        
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Internal Transfers</h1>
          <button 
            onClick={fetchTransfers}
            className="text-xs bg-white border px-3 py-1 rounded hover:bg-gray-100 transition shadow-sm"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-mono text-gray-500 tracking-wider border-b">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Product</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">From</th>
                <th className="p-4">To</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {transfers.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTransfer(t)}
                  className={`border-t cursor-pointer hover:bg-blue-50 transition ${
                    selectedTransfer?.id === t.id
                      ? "bg-blue-50 border-l-4 border-l-indigo-600"
                      : ""
                  }`}
                >
                  <td className="p-4 font-mono text-xs text-indigo-600 font-bold">
                    TR-{t.id.toString().padStart(4, "0")}
                  </td>
                  <td className="p-4 font-medium">{t.products?.name}</td>
                  <td className="p-4 font-mono">{t.quantity}</td>
                  <td className="p-4 text-gray-500">{t.from_location}</td>
                  <td className="p-4 text-gray-500">{t.to_location}</td>
                  <td className="p-4 font-mono text-xs">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && transfers.length === 0 && (
            <div className="p-12 text-center text-gray-400">No transfer history found.</div>
          )}
        </div>
      </div>

      {/* Side Detail Panel */}
      {selectedTransfer && (
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-xl h-fit sticky top-6 animate-in slide-in-from-right">

          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Transfer Details</h2>
              <p className="text-xs font-mono text-gray-400">
                REF: TR-{selectedTransfer.id.toString().padStart(4, "0")}
              </p>
            </div>

            <button
              onClick={() => setSelectedTransfer(null)}
              className="text-gray-400 hover:text-black"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">

            <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
              <label className="text-[10px] uppercase font-mono text-gray-400">
                Product
              </label>
              <div className="text-md font-bold text-gray-900">
                {selectedTransfer.products?.name}
              </div>
              <div className="text-2xl font-bold text-indigo-600 mt-2">
                {selectedTransfer.quantity}
                <span className="text-xs text-gray-400 ml-1">Units</span>
              </div>
            </div>

            <div className="space-y-3">
              <DetailRow label="From Location" value={selectedTransfer.from_location} />
              <DetailRow label="To Location" value={selectedTransfer.to_location} />
              <DetailRow label="Logged At" value={new Date(selectedTransfer.created_at).toLocaleString()} />
            </div>

            <button className="w-full border-2 border-gray-900 text-gray-900 font-bold py-2 rounded-lg text-sm hover:bg-gray-900 hover:text-white transition">
              Print Transfer Label
            </button>

          </div>

        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}