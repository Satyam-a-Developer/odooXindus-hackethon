"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

type InventoryItem = {
  id: number;
  product: string;
  documentType: string;
  status: string;
  warehouse: string;
  category: string;
  quantity: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    documentType: "",
    status: "",
    warehouse: "",
    category: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data, error } = await supabase
      .from("inventory_dashboard")
      .select("*");

    if (error) {
      console.error(error);
    } else {
      setData(data);
    }

    setLoading(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      return (
        (!filters.documentType || item.documentType === filters.documentType) &&
        (!filters.status || item.status === filters.status) &&
        (!filters.warehouse || item.warehouse === filters.warehouse) &&
        (!filters.category || item.category === filters.category)
      );
    });
  }, [filters, data]);

  const kpis = {
    totalStock: data.reduce((acc, item) => acc + item.quantity, 0),
    lowStock: data.filter((i) => i.quantity < 10).length,
    pendingReceipts: data.filter(
      (i) => i.documentType === "receipt" && i.status !== "done",
    ).length,
    pendingDeliveries: data.filter(
      (i) => i.documentType === "delivery" && i.status !== "done",
    ).length,
    internalTransfers: data.filter((i) => i.documentType === "internal").length,
  };

  if (loading) {
    return <div className="p-6">Loading inventory...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">
        Inventory Dashboard
      </h1>

      {/* KPI Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI title="Total Products in Stock" value={kpis.totalStock} />
        <KPI title="Low Stock / Out of Stock Items" value={kpis.lowStock} />
        <KPI title="Pending Receipts" value={kpis.pendingReceipts} />
        <KPI title="Pending Deliveries" value={kpis.pendingDeliveries} />
        <KPI
          title="Internal Transfers Scheduled"
          value={kpis.internalTransfers}
        />
      </div>

      {/* Filters */}

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            name="documentType"
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Document Type</option>
            <option value="receipt">Receipts</option>
            <option value="delivery">Delivery</option>
            <option value="internal">Internal</option>
            <option value="adjustment">Adjustments</option>
          </select>

          <select
            name="status"
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Status</option>
            <option value="draft">Draft</option>
            <option value="waiting">Waiting</option>
            <option value="ready">Ready</option>
            <option value="done">Done</option>
            <option value="cancel">Canceled</option>
          </select>

          <select
            name="warehouse"
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Warehouse</option>
            <option>Main Warehouse</option>
            <option>Production Floor</option>
          </select>

          <select
            name="category"
            onChange={handleChange}
            className="border rounded-lg p-2"
          >
            <option value="">Product Category</option>
            <option>Metal</option>
            <option>Furniture</option>
            <option>Electrical</option>
          </select>
        </div>
      </div>

      {/* Table */}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Document Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Warehouse</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Qty</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-t">
                <td className="p-3">{item.product}</td>
                <td className="p-3">{item.documentType}</td>
                <td className="p-3">{item.status}</td>
                <td className="p-3">{item.warehouse}</td>
                <td className="p-3">{item.category}</td>
                <td className="p-3">{item.quantity}</td>
              </tr>
            ))}

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
    </div>
  );
}
