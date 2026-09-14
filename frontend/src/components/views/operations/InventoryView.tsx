import React, { useState } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import { Package, Search, Filter, Plus, AlertTriangle, CheckCircle2, MoreVertical, X } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, addInventoryItem, addToast, globalFilter, targetHighlightId } = useQiyamStore();
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New SKU form state
  const [skuForm, setSkuForm] = useState({
    name: '',
    sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    category: 'Grocery',
    stock_units: 50,
    stock_value: 15000,
    location: 'Aisle 2, Rack A',
    reorder_level: 20,
    supplier: 'Metro Cash & Carry',
    status: 'in_stock' as 'in_stock' | 'low_stock' | 'out_of_stock'
  });

  const categories = ['All', 'Grocery', 'Dairy', 'Personal Care'];

  const filtered = inventory.filter((item) => {
    if (selectedCat !== 'All' && item.category !== selectedCat) return false;
    if (globalFilter.status && globalFilter.status !== 'all' && item.status !== globalFilter.status) return false;
    
    const activeSearch = (search || globalFilter.query || '').toLowerCase();
    if (activeSearch) {
      return item.name.toLowerCase().includes(activeSearch) || item.sku.toLowerCase().includes(activeSearch);
    }
    return true;
  });

  const handleCreateSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuForm.name) {
      addToast('Please enter an item name', 'error');
      return;
    }

    addInventoryItem({
      ...skuForm,
      stock_units: Number(skuForm.stock_units),
      stock_value: Number(skuForm.stock_value),
      reorder_level: Number(skuForm.reorder_level),
      reorder_qty: 50,
    });

    addToast(`SKU ${skuForm.sku} (${skuForm.name}) added to inventory!`, 'success');
    setIsAddModalOpen(false);
    setSkuForm({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Grocery',
      stock_units: 50,
      stock_value: 15000,
      location: 'Aisle 2, Rack A',
      reorder_level: 20,
      supplier: 'Metro Cash & Carry',
      status: 'in_stock'
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header
        title="Inventory & Stock Management"
        subtitle="Manage warehouse SKU stocks, rack aisle locations, low stock alerts, and suppliers."
        primaryActionLabel="Add New SKU"
        onPrimaryAction={() => setIsAddModalOpen(true)}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total SKUs</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">142</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Stock Units</div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">12,450</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Total Stock Value</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">₹8,45,200</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Low Stock SKUs</div>
            <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">12</div>
          </div>
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-xs font-semibold text-slate-500">Out of Stock</div>
            <div className="text-xl sm:text-2xl font-black text-red-500 mt-1">3</div>
          </div>
        </div>

        {/* Categories Bar & Search */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  selectedCat === cat ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU or item..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm sm:text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[760px]">
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
              {filtered.map((item) => {
                const isTarget = targetHighlightId === item.sku || String(targetHighlightId) === String(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isTarget
                        ? 'bg-amber-50 ring-2 ring-amber-400 font-medium'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      {item.name}
                      {isTarget && (
                        <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">
                          Target
                        </span>
                      )}
                    </td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Add New SKU Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Add New Inventory SKU</h3>
                <p className="text-xs text-slate-500">Record item in warehouse catalog with location & supplier.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSku} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Basmati Rice 5kg or Copper Pipe 1/2 inch"
                    value={skuForm.name}
                    onChange={(e) => setSkuForm({ ...skuForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={skuForm.sku}
                    onChange={(e) => setSkuForm({ ...skuForm, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={skuForm.category}
                    onChange={(e) => setSkuForm({ ...skuForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  >
                    <option value="Grocery">Grocery</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Hardware">Hardware / Tools</option>
                    <option value="Appliances">Appliances</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    min="0"
                    value={skuForm.stock_units}
                    onChange={(e) => setSkuForm({ ...skuForm, stock_units: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Stock Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={skuForm.stock_value}
                    onChange={(e) => setSkuForm({ ...skuForm, stock_value: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Warehouse Location</label>
                  <input
                    type="text"
                    placeholder="Aisle 3, Rack C"
                    value={skuForm.location}
                    onChange={(e) => setSkuForm({ ...skuForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reorder Level Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={skuForm.reorder_level}
                    onChange={(e) => setSkuForm({ ...skuForm, reorder_level: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Metro Cash & Carry, Local Distributor"
                    value={skuForm.supplier}
                    onChange={(e) => setSkuForm({ ...skuForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-sm sm:text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Add SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


