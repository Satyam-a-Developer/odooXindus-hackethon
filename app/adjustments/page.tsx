'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Adjustments() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedAdjustment, setSelectedAdjustment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [adjType, setAdjType] = useState<'add' | 'remove'>('add'); // Toggle state
  const [formData, setFormData] = useState({
    product_id: "",
    adjustment_qty: 0,
    warehouse: "Main Warehouse",
    reason: "Correction"
  });

  const fetchData = async () => {
    setLoading(true);
    const { data: adjData } = await supabase.from("stock_adjustments").select(`*, products ( name )`).order("id", { ascending: false });
    const { data: prodData } = await supabase.from("products").select("id, name, stock");
    setAdjustments(adjData || []);
    setProducts(prodData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdjustment = async () => {
    if (!formData.product_id || formData.adjustment_qty <= 0) {
      return alert("Please select a product and enter a quantity greater than 0");
    }

    setLoading(true);
    try {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      
      const finalQty = adjType === 'add' ? formData.adjustment_qty : -formData.adjustment_qty;
      const newStock = (product?.stock || 0) + finalQty;

      if (newStock < 0) throw new Error("Stock cannot go below zero.");

      // 1. Log adjustment
      const { error: adjError } = await supabase
        .from("stock_adjustments")
        .insert([{ ...formData, adjustment_qty: finalQty }]);

      if (adjError) throw adjError;

      // 2. Update Product
      const { error: prodError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", formData.product_id);

      if (prodError) throw prodError;

      alert("Inventory adjusted successfully!");
      setFormData({ product_id: "", adjustment_qty: 0, warehouse: "Main Warehouse", reason: "Correction" });
      setShowForm(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex gap-6 bg-gray-50 min-h-screen font-sans">
      
      {/* Table Section */}
      <div className={`transition-all duration-300 ${showForm || selectedAdjustment ? 'w-2/3' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustments</h1>
          <button 
            onClick={() => { setShowForm(true); setSelectedAdjustment(null); }}
            className="bg-indigo-600 text-white text-xs px-5 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100"
          >
            + LOG ADJUSTMENT
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-mono text-gray-500 border-b">
              <tr>
                <th className="p-4">Ref</th>
                <th className="p-4">Product</th>
                <th className="p-4">Change</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => { setSelectedAdjustment(a); setShowForm(false); }}
                  className="border-t cursor-pointer hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-mono text-xs text-gray-400">#AD-{a.id}</td>
                  <td className="p-4 font-bold text-gray-800">{a.products?.name}</td>
                  <td className={`p-4 font-mono font-bold ${a.adjustment_qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {a.adjustment_qty > 0 ? '+' : ''}{a.adjustment_qty}
                  </td>
                  <td className="p-4 text-gray-500 text-xs">{a.reason}</td>
                  <td className="p-4 text-xs text-gray-400">{new Date(a.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Panel */}
      {(showForm || selectedAdjustment) && (
        <div className="w-1/3 bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl h-fit sticky top-6 animate-in slide-in-from-right duration-300">
          
          {showForm ? (
            <div className="space-y-5">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-lg font-extrabold text-gray-900">Modify Stock</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black text-xl">✕</button>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">1. Select Product</label>
                <select 
                  className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.product_id}
                  onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                >
                  <option value="">Search items...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (In Stock: {p.stock})</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">2. Adjust Quantity</label>
                <div className="flex border rounded-lg overflow-hidden mb-3">
                  <button 
                    onClick={() => setAdjType('add')}
                    className={`flex-1 py-2 text-xs font-bold transition ${adjType === 'add' ? 'bg-emerald-500 text-white' : 'bg-gray-50 text-gray-400'}`}
                  >
                    ADD (+)
                  </button>
                  <button 
                    onClick={() => setAdjType('remove')}
                    className={`flex-1 py-2 text-xs font-bold transition ${adjType === 'remove' ? 'bg-rose-500 text-white' : 'bg-gray-50 text-gray-400'}`}
                  >
                    REMOVE (-)
                  </button>
                </div>
                <input 
                  type="number"
                  placeholder="Enter amount..."
                  className="w-full border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.adjustment_qty || ""}
                  onChange={(e) => setFormData({...formData, adjustment_qty: Math.abs(parseInt(e.target.value))})}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-gray-400 block mb-2">3. Reason</label>
                <select 
                  className="w-full border p-2.5 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                >
                  <option value="Correction">Data Correction</option>
                  <option value="Damaged">Damaged / Broken</option>
                  <option value="Return">Customer Return</option>
                  <option value="Shrinkage">Lost / Theft</option>
                </select>
              </div>

              <button 
                onClick={handleAdjustment}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-bold text-sm text-white transition-all shadow-lg ${
                  adjType === 'add' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                } disabled:opacity-50`}
              >
                {loading ? "SAVING..." : `CONFIRM ${adjType.toUpperCase()}`}
              </button>
            </div>
          ) : (
            /* View Details Logic remains same as previous */
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-lg font-bold">Adjustment Log</h2>
                 <button onClick={() => setSelectedAdjustment(null)} className="text-gray-400">✕</button>
              </div>
              <div className={`p-6 rounded-2xl text-center border-2 ${selectedAdjustment.adjustment_qty > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Impact</div>
                <div className={`text-4xl font-black ${selectedAdjustment.adjustment_qty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedAdjustment.adjustment_qty > 0 ? '+' : ''}{selectedAdjustment.adjustment_qty}
                </div>
                <div className="text-[10px] text-gray-400 mt-1 uppercase font-bold">{selectedAdjustment.products?.name}</div>
              </div>
              {/* Detail Rows */}
              <div className="pt-4 space-y-3">
                <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-400">Reason</span><span className="font-bold">{selectedAdjustment.reason}</span></div>
                <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-400">Warehouse</span><span className="font-bold">{selectedAdjustment.warehouse}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Time</span><span className="font-bold">{new Date(selectedAdjustment.created_at).toLocaleString()}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}