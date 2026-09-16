import React, { useState, useRef, useCallback } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Package, Search, Plus, X, Edit3, Trash2, ImagePlus,
  ZoomIn, Download, UploadCloud, RefreshCw, Camera, AlertTriangle,
} from 'lucide-react';
import { InventoryItem } from '@/types';

// ─── Image Upload Zone ────────────────────────────────────────────────────────
interface ImageZoneProps { value: string; onChange: (url: string) => void; }

const ImageZone: React.FC<ImageZoneProps> = ({ value, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [dragging, setDragging] = useState(false);

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => { if (e.target?.result) onChange(e.target.result as string); };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) readFile(file);
  }, []);

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1 bg-slate-100 p-0.5 rounded-xl w-fit text-xs">
        {(['upload', 'url'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${tab === t ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'upload' ? '↑ Upload File' : '🔗 From URL'}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-5 cursor-pointer transition-all text-xs ${dragging ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/40'}`}>
          <UploadCloud className="w-7 h-7 text-slate-300" />
          <div className="text-slate-500 font-medium"><span className="text-emerald-600 font-bold">Click to browse</span> or drag & drop</div>
          <div className="text-slate-400">PNG, JPG, WEBP up to 10 MB</div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) readFile(f); }} />
        </div>
      ) : (
        <div className="flex gap-2">
          <input type="url" placeholder="https://example.com/product.jpg" value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800" />
          <button type="button" onClick={() => { if (urlInput) onChange(urlInput); }}
            className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700">Apply</button>
        </div>
      )}

      {value && (
        <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => { setUrlInput(''); onChange(''); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold">
              <X className="w-3 h-3" /> Remove
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold">
              <RefreshCw className="w-3 h-3" /> Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{ src: string; name: string; onClose: () => void }> = ({ src, name, onClose }) => (
  <div className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"><X className="w-5 h-5" /></button>
    <a href={src} download={name} onClick={(e) => e.stopPropagation()} className="absolute top-4 right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white" title="Download"><Download className="w-5 h-5" /></a>
    <img src={src} alt={name} className="max-w-full max-h-[88vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium bg-black/40 px-3 py-1.5 rounded-full">{name}</div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge: React.FC<{ status: InventoryItem['status'] }> = ({ status }) => {
  const map: Record<string, string> = {
    in_stock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    low_stock: 'bg-amber-50 text-amber-700 border-amber-200',
    out_of_stock: 'bg-red-50 text-red-700 border-red-200',
    discontinued: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[status] || map.in_stock}`}>{status.replace(/_/g, ' ').toUpperCase()}</span>;
};

// ─── Blank form ───────────────────────────────────────────────────────────────
const blankForm = (): Partial<InventoryItem> & { image_url: string } => ({
  name: '', sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`, category: 'Grocery',
  stock_units: 50, stock_value: 15000, location: 'Aisle 2, Rack A',
  reorder_level: 20, reorder_qty: 50, supplier: 'Metro Cash & Carry',
  status: 'in_stock', image_url: '',
});

// ─── Main View ────────────────────────────────────────────────────────────────
export const InventoryView: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, addToast, globalFilter, targetHighlightId } = useQiyamStore();
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{ src: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<Partial<InventoryItem> & { image_url: string }>(blankForm());

  const categories = ['All', 'Grocery', 'Dairy', 'Personal Care', 'Hardware', 'Appliances'];
  const filtered = inventory.filter((item) => {
    if (selectedCat !== 'All' && item.category !== selectedCat) return false;
    if (globalFilter.status && globalFilter.status !== 'all' && item.status !== globalFilter.status) return false;
    const q = (search || globalFilter.query || '').toLowerCase();
    if (q) return item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
    return true;
  });

  const totalValue = inventory.reduce((s, i) => s + i.stock_value, 0);
  const lowStock = inventory.filter((i) => i.status === 'low_stock').length;
  const outOfStock = inventory.filter((i) => i.status === 'out_of_stock').length;

  const openAdd = () => { setForm(blankForm()); setIsAddOpen(true); };
  const openEdit = (item: InventoryItem) => { setEditItem(item); setForm({ ...item, image_url: item.image_url || '' }); };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { addToast('Enter item name', 'error'); return; }
    addInventoryItem({ ...form });
    setIsAddOpen(false); setForm(blankForm());
  };
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    updateInventoryItem(editItem.id, { ...form });
    setEditItem(null);
  };
  const handleDelete = (item: InventoryItem) => { deleteInventoryItem(item.id); setDeleteConfirm(null); };

  const FormBody = () => (
    <div className="space-y-4 pt-4 text-xs">
      <div>
        <label className="font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-600" /> Product Image <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <ImageZone value={form.image_url || ''} onChange={(url) => setForm({ ...form, image_url: url })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-1 sm:col-span-2">
          <label className="font-semibold text-slate-700 block mb-1">Item Name *</label>
          <input required placeholder="e.g. Basmati Rice 5kg" value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800" />
        </div>
        {(['sku', 'location', 'supplier'] as const).map((k) => (
          <div key={k} className={k === 'supplier' ? 'col-span-1 sm:col-span-2' : ''}>
            <label className="font-semibold text-slate-700 block mb-1 capitalize">{k.replace('_', ' ')}</label>
            <input value={(form[k] as string) || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800" />
          </div>
        ))}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Category</label>
          <select value={form.category || 'Grocery'} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800">
            {['Grocery','Dairy','Personal Care','Hardware','Appliances','Electronics','Clothing'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Status</label>
          <select value={form.status || 'in_stock'} onChange={(e) => setForm({ ...form, status: e.target.value as InventoryItem['status'] })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800">
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
        </div>
        {(['stock_units', 'stock_value', 'reorder_level'] as const).map((k) => (
          <div key={k}>
            <label className="font-semibold text-slate-700 block mb-1 capitalize">{k.replace(/_/g, ' ')}{k === 'stock_value' ? ' (₹)' : ''}</label>
            <input type="number" min="0" value={(form[k] as number) ?? 0}
              onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header title="Inventory & Stock Management" subtitle="Manage warehouse SKU stocks, rack aisle locations, low stock alerts, and suppliers." primaryActionLabel="Add New SKU" onPrimaryAction={openAdd} />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            { label: 'Total SKUs', value: inventory.length, color: 'text-slate-900' },
            { label: 'Stock Units', value: inventory.reduce((s, i) => s + i.stock_units, 0).toLocaleString(), color: 'text-slate-900' },
            { label: 'Total Stock Value', value: `₹${totalValue.toLocaleString()}`, color: 'text-emerald-600' },
            { label: 'Low Stock SKUs', value: lowStock, color: 'text-amber-500' },
            { label: 'Out of Stock', value: outOfStock, color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-xs font-semibold text-slate-500">{label}</div>
              <div className={`text-xl sm:text-2xl font-black mt-1 ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setSelectedCat(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedCat === cat ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{cat}</button>
            ))}
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU or item..."
              className="w-full sm:w-56 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[860px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-14">Image</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Units</th>
                  <th className="py-3 px-4">Stock Value</th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.length === 0 && (
                  <tr><td colSpan={10} className="py-12 text-center text-slate-400"><Package className="w-8 h-8 mx-auto mb-2 opacity-30" /><div>No items found</div></td></tr>
                )}
                {filtered.map((item) => {
                  const isTarget = targetHighlightId === item.sku || String(targetHighlightId) === String(item.id);
                  return (
                    <tr key={item.id} className={`transition-colors ${isTarget ? 'bg-amber-50 ring-2 ring-inset ring-amber-400' : 'hover:bg-slate-50/80'}`}>
                      <td className="py-2.5 px-4">
                        {item.image_url ? (
                          <button type="button" onClick={() => setLightboxItem({ src: item.image_url!, name: item.name })}
                            className="relative group w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-emerald-400 transition-all" title="View full image">
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ZoomIn className="w-3.5 h-3.5 text-white" /></div>
                          </button>
                        ) : (
                          <button type="button" onClick={() => openEdit(item)} title="Add product image"
                            className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center justify-center text-slate-300 hover:text-emerald-500">
                            <ImagePlus className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">{item.name}
                          {isTarget && <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded uppercase animate-pulse">Target</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{item.sku}</td>
                      <td className="py-3.5 px-4">{item.category}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.stock_units} units</td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">₹{item.stock_value.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-slate-500">{item.location}</td>
                      <td className="py-3.5 px-4"><StatusBadge status={item.status} /></td>
                      <td className="py-3.5 px-4 text-slate-600">{item.supplier}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => openEdit(item)} title="Edit" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => setDeleteConfirm(item)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[94dvh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div><h3 className="font-bold text-base text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-600" /> Add New Inventory SKU</h3>
              <p className="text-xs text-slate-500 mt-0.5">Record item in warehouse catalog with location & supplier.</p></div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5"><FormBody />
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs">Add SKU</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[94dvh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div><h3 className="font-bold text-base text-slate-900 flex items-center gap-2"><Edit3 className="w-4 h-4 text-blue-600" /> Edit SKU</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">{editItem.sku} — {editItem.name}</p></div>
              <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5"><FormBody />
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button type="button" onClick={() => { setDeleteConfirm(editItem); setEditItem(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 font-semibold rounded-xl text-xs"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
              <div><h3 className="font-bold text-slate-900">Delete SKU?</h3>
              <p className="text-xs text-slate-500 mt-1"><strong>{deleteConfirm.name}</strong> ({deleteConfirm.sku}) will be permanently removed from inventory.</p></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxItem && <Lightbox src={lightboxItem.src} name={lightboxItem.name} onClose={() => setLightboxItem(null)} />}
    </div>
  );
};
