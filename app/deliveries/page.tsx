'use client'

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDeliveries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("deliveries")
      .select(`
        *,
        products ( id, name, stock )
      `)
      .order("id", { ascending: false })

    if (error) console.error("Error fetching deliveries:", error)
    else setDeliveries(data || [])
    
    // Update the selected delivery details if it's currently open
    if (selectedDelivery) {
      const updated = data?.find(d => d.id === selectedDelivery.id)
      setSelectedDelivery(updated)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDeliveries()
  }, [])

  // --- UPDATE STATUS & SUBTRACT STOCK ---
  const markAsDelivered = async (delivery: any) => {
    if (!confirm("Confirm delivery? This will deduct stock from inventory.")) return
    setLoading(true)

    try {
      // 1. Calculate new stock
      const currentStock = delivery.products?.stock || 0
      const newStock = currentStock - delivery.quantity

      if (newStock < 0) {
        alert(`Insufficient stock! Current: ${currentStock}`)
        setLoading(false)
        return
      }

      // 2. Update Product Stock
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", delivery.product_id)

      if (stockError) throw stockError

      // 3. Update Delivery Status
      const { error: deliveryError } = await supabase
        .from("deliveries")
        .update({ status: "delivered" })
        .eq("id", delivery.id)

      if (deliveryError) throw deliveryError

      alert("Delivery successful!")
      fetchDeliveries()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 flex gap-6 bg-gray-50 min-h-screen">
      
      {/* TABLE SECTION */}
      <div className={`transition-all duration-300 ${selectedDelivery ? "w-2/3" : "w-full"}`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Orders</h1>
          <button onClick={fetchDeliveries} className="text-xs bg-white border px-3 py-1 rounded hover:bg-gray-100">
            {loading ? "Processing..." : "Refresh"}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden text-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase font-mono text-gray-500 tracking-wider border-b">
              <tr>
                <th className="p-4">Reference</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4 text-right">Qty</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelectedDelivery(d)}
                  className={`border-t cursor-pointer hover:bg-blue-50 transition ${selectedDelivery?.id === d.id ? "bg-blue-50 border-l-4 border-l-indigo-600" : ""}`}
                >
                  <td className="p-4 font-mono text-xs text-indigo-600 font-bold">DO-{d.id.toString().padStart(4, "0")}</td>
                  <td className="p-4 font-medium">{d.customer}</td>
                  <td className="p-4">{d.products?.name}</td>
                  <td className="p-4 text-right font-mono">{d.quantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] rounded font-bold uppercase ${d.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILS PANEL */}
      {selectedDelivery && (
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-xl h-fit sticky top-6">
          <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Order Action</h2>
              <p className="text-xs font-mono text-gray-400">REF: DO-{selectedDelivery.id}</p>
            </div>
            <button onClick={() => setSelectedDelivery(null)} className="text-gray-400 hover:text-black">✕</button>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
              <label className="text-[10px] uppercase font-mono text-indigo-400">Items to Ship</label>
              <div className="text-md font-bold text-gray-900">{selectedDelivery.products?.name}</div>
              <div className="text-2xl font-bold text-indigo-600 mt-2">{selectedDelivery.quantity} units</div>
            </div>

            <div className="space-y-3">
              <DetailRow label="Client" value={selectedDelivery.customer} />
              <DetailRow label="Location" value={selectedDelivery.warehouse} />
              <DetailRow label="Status" value={selectedDelivery.status.toUpperCase()} isStatus />
            </div>

            {/* ACTION BUTTON: Only shows if status is pending */}
            {selectedDelivery.status !== "delivered" ? (
              <button 
                onClick={() => markAsDelivered(selectedDelivery)}
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {loading ? "Updating Stock..." : "MARK AS DELIVERED"}
              </button>
            ) : (
              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-xs font-bold border border-green-100">
                ✓ SHIPMENT COMPLETED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ label, value, isStatus = false }: { label: string, value: string, isStatus?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${isStatus ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</span>
    </div>
  )
}