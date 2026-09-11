import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Package, Search, Filter, Plus, AlertTriangle, CheckCircle2, MoreVertical } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, addToast } = useQiyamStore();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Grocery', 'Dairy', 'Personal Care'];

  const filtered = inventory.filter((item) => {
    if (selectedCat !== 'All' && item.category !== selectedCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen overflow-y-auto font-sans">
      <Header
        title="Inventory & Stock Management"
        subtitle="Manage warehouse SKU stocks, rack aisle locations, low stock alerts, and suppliers."
        primaryActionLabel="Add New SKU"
        onPrimaryAction={() => addToast('Add SKU modal opened', 'info')}
      />

      <div className="p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total SKUs</div>
            <div className="text-2xl font-black text-slate-900 mt-1">142</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Stock Units</div>
            <div className="text-2xl font-black text-slate-900 mt-1">12,450</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Stock Value</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">₹8,45,200</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Low Stock SKUs</div>
            <div className="text-2xl font-black text-amber-500 mt-1">12</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Out of Stock</div>
            <div className="text-2xl font-black text-red-500 mt-1">3</div>
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  selectedCat === cat ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU or item name..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none w-56 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Inventory Table (Matching photo_32) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Stock Value</th>
                <th className="py-3 px-4">Warehouse Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{item.sku}</td>
                  <td className="py-3.5 px-4">{item.category}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{item.stock_units} units</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600">₹{item.stock_value.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-slate-500">{item.location}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'in_stock'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'low_stock'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {item.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


