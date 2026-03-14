'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MoveHistory() {
  const [moves, setMoves] = useState<any[]>([]);
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchMoves = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("stock_moves")
      .select(`*, products ( name )`)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setMoves(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMoves(); }, []);

  // --- UPDATE MOVE IN DB ---
  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("stock_moves")
      .update({
        move_type: editData.move_type,
        quantity: editData.quantity,
        warehouse: editData.warehouse,
        status: editData.status
      })
      .eq("id", editData.id);

    if (error) {
      alert(error.message);
    } else {
      setIsEditing(false);
      setSelectedMove(editData); // Update detail view
      fetchMoves(); // Refresh table
    }
    setLoading(false);
  };

  const startEdit = () => {
    setEditData({ ...selectedMove });
    setIsEditing(true);
  };

  return (
    <div className="p-6 flex gap-6 bg-gray-50 min-h-screen">
      
      {/* TABLE SECTION */}
      <div className={`transition-all duration-300 ${selectedMove ? "w-2/3" : "w-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Stock Move History</h1>
          <button onClick={fetchMoves} className="text-xs bg-white border px-4 py-2 rounded-lg font-bold shadow-sm">
            {loading ? "Syncing..." : "Refresh Logs"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-mono text-gray-500 border-b">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Type</th>
                <th className="p-4">Product</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => { setSelectedMove(m); setIsEditing(false); }}
                  className={`border-t cursor-pointer hover:bg-blue-50 transition ${selectedMove?.id === m.id ? "bg-blue-50 border-l-4 border-l-indigo-600" : ""}`}
                >
                  <td className="p-4 font-mono text-xs text-indigo-600 font-bold uppercase">{m.reference_id || `MV-${m.id}`}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.move_type === 'receipt' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {m.move_type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-800">{m.products?.name}</td>
                  <td className={`p-4 font-mono font-bold ${m.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{m.quantity}</td>
                  <td className="p-4"><span className="text-[10px] bg-gray-100 px-2 py-1 rounded font-bold uppercase">{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL / EDIT PANEL */}
      {selectedMove && (
        <div className="w-1/3 bg-white border border-gray-200 rounded-2xl p-6 shadow-xl h-fit sticky top-6 animate-in slide-in-from-right duration-200">
          
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">{isEditing ? "Edit Move" : "Move Details"}</h2>
            <button onClick={() => { setSelectedMove(null); setIsEditing(false); }} className="text-gray-400 hover:text-black">✕</button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              {/* EDIT FORM */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Movement Type</label>
                <select 
                  className="w-full border p-2 rounded-lg mt-1 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editData.move_type}
                  onChange={(e) => setEditData({...editData, move_type: e.target.value})}
                >
                  <option value="receipt">Receipt (Stock In)</option>
                  <option value="delivery">Delivery (Stock Out)</option>
                  <option value="adjustment">Internal Adjustment</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Quantity</label>
                <input 
                  type="number"
                  className="w-full border p-2 rounded-lg mt-1 text-sm"
                  value={editData.quantity}
                  onChange={(e) => setEditData({...editData, quantity: Number(e.target.value)})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Warehouse</label>
                <input 
                  className="w-full border p-2 rounded-lg mt-1 text-sm"
                  value={editData.warehouse}
                  onChange={(e) => setEditData({...editData, warehouse: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button 
                  onClick={handleUpdate}
                  className="flex-1 bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-2 rounded-lg text-sm hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* VIEW MODE */
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                <label className="text-[10px] uppercase font-mono text-gray-400">Current Product</label>
                <div className="text-md font-bold text-gray-900">{selectedMove.products?.name}</div>
                <div className={`text-2xl font-bold mt-2 ${selectedMove.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedMove.quantity > 0 ? '+' : ''}{selectedMove.quantity}
                </div>
              </div>

              <div className="space-y-3">
                <DetailRow label="Type" value={selectedMove.move_type.toUpperCase()} />
                <DetailRow label="Warehouse" value={selectedMove.warehouse} />
                <DetailRow label="Status" value={selectedMove.status.toUpperCase()} />
                <DetailRow label="Date" value={new Date(selectedMove.created_at).toLocaleDateString()} />
              </div>

              <button 
                onClick={startEdit}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm hover:bg-gray-800 transition shadow-lg"
              >
                Edit Movement Record
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500 font-medium">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}