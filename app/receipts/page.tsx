'use client'

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function IncomingReceipts() {
  const [receipts, setReceipts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [supplier, setSupplier] = useState("")
  const [items, setItems] = useState([{ product_id: "", quantity: 0 }])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: recs } = await supabase.from("receipts").select("*, receipt_items(*)").order('id', { ascending: false })
    const { data: prods } = await supabase.from("products").select("id, name")
    setReceipts(recs || [])
    setProducts(prods || [])
  }

  // --- ADD RECEIPT TO DB ---
  const createReceipt = async () => {
    if (!supplier || items.some(i => !i.product_id || i.quantity <= 0)) {
      return alert("Please fill in supplier and all item details.")
    }

    setLoading(true)
    
    // 1. Insert Receipt Header
    const { data: receipt, error: rErr } = await supabase
      .from("receipts")
      .insert([{ supplier_name: supplier, status: "pending" }])
      .select().single()

    if (rErr) {
      alert(rErr.message)
      setLoading(false)
      return
    }

    // 2. Insert Line Items using the new Receipt ID
    const lineItems = items.map(item => ({
      receipt_id: receipt.id,
      product_id: item.product_id,
      quantity_received: item.quantity
    }))

    const { error: iErr } = await supabase.from("receipt_items").insert(lineItems)

    if (iErr) {
      alert("Receipt created, but items failed: " + iErr.message)
    } else {
      // 3. Reset Form and Refresh
      setSupplier("")
      setItems([{ product_id: "", quantity: 0 }])
      fetchData()
    }
    setLoading(false)
  }

  // --- VALIDATE & UPDATE STOCK ---
  const validateReceipt = async (receipt: any) => {
    setLoading(true)
    
    // 1. Loop through items to update stock in products table
    for (const item of receipt.receipt_items) {
      const { data: prod } = await supabase.from("products").select("stock").eq("id", item.product_id).single()
      if (prod) {
        await supabase.from("products").update({ stock: prod.stock + item.quantity_received }).eq("id", item.product_id)
      }
    }

    // 2. Update status
    const { error } = await supabase.from("receipts").update({ status: "validated" }).eq("id", receipt.id)

    if (error) alert(error.message)
    fetchData()
    setLoading(false)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Incoming Goods (Receipts)</h1>

      {/* CREATE NEW RECEIPT FORM */}
      <div className="bg-white p-6 rounded-xl border mb-8 shadow-sm">
        <h2 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">New Shipment</h2>
        
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-600 block mb-1">Supplier Name</label>
          <input 
            placeholder="e.g. Acme Corp" 
            className="border p-2 rounded w-full md:w-1/3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-600 block">Items</label>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 items-center">
              <select 
                className="border p-2 rounded flex-1 text-sm bg-white"
                value={item.product_id}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index].product_id = e.target.value
                  setItems(newItems)
                }}
              >
                <option value="">Select Product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input 
                type="number" 
                placeholder="Qty" 
                className="border p-2 rounded w-24 text-sm"
                value={item.quantity || ""}
                onChange={(e) => {
                  const newItems = [...items]
                  newItems[index].quantity = Number(e.target.value)
                  setItems(newItems)
                }}
              />
              {items.length > 1 && (
                <button onClick={() => setItems(items.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button 
            type="button"
            onClick={() => setItems([...items, { product_id: "", quantity: 0 }])}
            className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded"
          >
            + ADD ITEM
          </button>
          <button 
            onClick={createReceipt}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "SAVING..." : "SAVE DRAFT RECEIPT"}
          </button>
        </div>
      </div>

      {/* RECEIPTS TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px]">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Items Count</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-4 font-mono text-gray-400">#REC-{r.id}</td>
                <td className="p-4 font-bold text-gray-800">{r.supplier_name}</td>
                <td className="p-4 text-gray-500">{r.receipt_items?.length || 0} items</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                    r.status === 'validated' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {r.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-right">
                  {r.status === 'pending' ? (
                    <button 
                      onClick={() => validateReceipt(r)}
                      disabled={loading}
                      className="bg-gray-900 text-white px-3 py-1.5 rounded text-[10px] font-bold hover:bg-gray-800 transition-colors"
                    >
                      VALIDATE & ADD STOCK
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-gray-400">COMPLETED</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}