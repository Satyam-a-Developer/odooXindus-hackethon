'use client'

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface Product {
  id: number
  name: string
  sku: string
  category: string
  unit: string
  stock: number
  min: number
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "",
    stock: 0
  })

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false })

    if (error) console.error("Error fetching:", error)
    else setProducts(data || [])
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // --- CREATE ---
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.sku) return

    const { data, error } = await supabase
      .from("products")
      .insert([{ ...newProduct, min: 10 }])
      .select()
      .single()

    if (error) {
      alert("Error adding product: " + error.message)
      return
    }

    setProducts([data, ...products])
    setNewProduct({ name: "", sku: "", category: "", unit: "", stock: 0 })
  }

  // --- UPDATE ---
  const updateProduct = async () => {
    if (!selectedProduct) return

    const { error } = await supabase
      .from("products")
      .update({
        name: selectedProduct.name,
        sku: selectedProduct.sku,
        category: selectedProduct.category,
        stock: selectedProduct.stock,
        unit: selectedProduct.unit
      })
      .eq('id', selectedProduct.id)

    if (error) {
      alert("Update failed: " + error.message)
    } else {
      // Refresh local state
      setProducts(products.map(p => p.id === selectedProduct.id ? selectedProduct : p))
      setIsEditing(false)
    }
  }

  // --- DELETE ---
  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure?")) return

    const { error } = await supabase.from("products").delete().eq('id', id)

    if (error) {
      alert("Delete failed")
    } else {
      setProducts(products.filter(p => p.id !== id))
      setSelectedProduct(null)
    }
  }

  return (
    <div className="p-6 relative flex gap-6 bg-gray-50 min-h-screen font-sans">
      <div className={`transition-all duration-300 ${selectedProduct ? 'w-2/3' : 'w-full'}`}>
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Product Catalog</h1>

        {/* CREATE PRODUCT FORM */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <h2 className="text-sm font-bold mb-4">Create Product</h2>
          <div className="grid grid-cols-5 gap-3">
            <input placeholder="Name" className="border p-2 rounded text-sm" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            <input placeholder="SKU" className="border p-2 rounded text-sm" value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} />
            <input placeholder="Category" className="border p-2 rounded text-sm" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
            <input placeholder="Unit" className="border p-2 rounded text-sm" value={newProduct.unit} onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })} />
            <input type="number" placeholder="Stock" className="border p-2 rounded text-sm" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} />
          </div>
          <button onClick={addProduct} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
            Save to Database
          </button>
        </div>

        {/* PRODUCT TABLE */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-500 uppercase border-b">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr 
                  key={product.id} 
                  onClick={() => { setSelectedProduct(product); setIsEditing(false); }}
                  className={`border-t hover:bg-blue-50 cursor-pointer ${selectedProduct?.id === product.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""}`}
                >
                  <td className="p-4 font-bold">{product.name}</td>
                  <td className="p-4 font-mono text-xs text-gray-400">{product.sku}</td>
                  <td className="p-4">
                    <span className={`font-semibold ${product.stock <= product.min ? "text-orange-600" : "text-emerald-600"}`}>
                      {product.stock} <span className="text-[10px] opacity-60 uppercase">{product.unit}</span>
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-xs text-blue-600 font-bold">DETAILS</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SIDE DETAILS & EDIT PANEL */}
      {selectedProduct && (
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 h-fit sticky top-6 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Product" : "Product Details"}</h2>
            <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-900">✕</button>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase">Product Name</label>
                <input 
                  className="w-full border p-2 rounded" 
                  value={selectedProduct.name} 
                  onChange={e => setSelectedProduct({...selectedProduct, name: e.target.value})}
                />
                <label className="block text-xs font-bold text-gray-500 uppercase">Current Stock</label>
                <input 
                  type="number" 
                  className="w-full border p-2 rounded" 
                  value={selectedProduct.stock} 
                  onChange={e => setSelectedProduct({...selectedProduct, stock: Number(e.target.value)})}
                />
                <div className="flex gap-2 pt-4">
                  <button onClick={updateProduct} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm">Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-[10px] text-gray-400 uppercase">SKU: {selectedProduct.sku}</p>
                  <p className="text-lg font-bold mt-1">{selectedProduct.name}</p>
                  <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-[9px] text-gray-400 uppercase mb-1">Current Stock</div>
                    <div className="text-xl font-bold">{selectedProduct.stock}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <div className="text-[9px] text-gray-400 uppercase mb-1">Min Level</div>
                    <div className="text-xl font-bold text-red-500">{selectedProduct.min}</div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-gray-800"
                >
                  Edit Product Details
                </button>
                <button 
                  onClick={() => deleteProduct(selectedProduct.id)}
                  className="w-full text-red-500 text-xs font-bold py-2 hover:underline"
                >
                  Delete Product
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}