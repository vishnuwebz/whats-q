import React, { useState, useRef, useCallback } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { Header } from '@/components/layout/Header';
import {
  Package, Search, Plus, X, Edit3, Trash2, ImagePlus,
  ZoomIn, Download, UploadCloud, RefreshCw, Camera, AlertTriangle,
  ArrowUpDown, ArrowUp, ArrowDown, SlidersHorizontal, Filter, ChevronDown,
} from 'lucide-react';
import { InventoryItem } from '@/types';

// ─── Image Upload Zone ────────────────────────────────────────────────────────
interface ImageZoneProps { value: string; onChange: (url: string) => void; }

const SAMPLE_PRESETS = [
  { label: 'Basmati Rice', category: 'Grocery', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80' },
  { label: 'Sunflower Oil', category: 'Grocery', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80' },
  { label: 'Milk Powder', category: 'Dairy', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80' },
  { label: 'Colgate Toothpaste', category: 'Personal Care', url: 'https://images.unsplash.com/photo-1559591937-e10b14421b59?w=400&auto=format&fit=crop&q=80' },
  { label: 'Hardware Tool Box', category: 'Hardware', url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80' },
  { label: 'Grocery Pack', category: 'Grocery', url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80' },
];

const ImageZone: React.FC<ImageZoneProps> = ({ value, onChange }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<'upload' | 'url' | 'sample'>('upload');
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
        {(['upload', 'url', 'sample'] as const).map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${tab === t ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
            {t === 'upload' ? '↑ Upload File' : t === 'url' ? '🔗 From URL' : '✨ Sample Presets'}
          </button>
        ))}
      </div>

      {tab === 'upload' && (
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
      )}

      {tab === 'url' && (
        <div className="flex gap-2">
          <input type="url" placeholder="https://example.com/product.jpg" value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800" />
          <button type="button" onClick={() => { if (urlInput) onChange(urlInput); }}
            className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 cursor-pointer">Apply</button>
        </div>
      )}

      {tab === 'sample' && (
        <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.url)}
              className={`p-1.5 rounded-lg border text-left transition-all group cursor-pointer ${
                value === preset.url ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-slate-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="w-full aspect-video rounded overflow-hidden bg-slate-100 mb-1">
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="font-semibold text-[10px] text-slate-800 truncate">{preset.label}</div>
              <div className="text-[9px] text-slate-400">{preset.category}</div>
            </button>
          ))}
        </div>
      )}

      {value && (
        <div className="relative group w-full aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
          <img src={value} alt="Preview" className="w-full h-full object-contain" />
          <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button type="button" onClick={() => { setUrlInput(''); onChange(''); }}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold cursor-pointer">
              <X className="w-3 h-3" /> Remove
            </button>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-slate-800 rounded-lg text-xs font-semibold cursor-pointer">
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
    <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"><X className="w-5 h-5" /></button>
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

// ─── Sample Product Images Auto-Resolver ───────────────────────────────────────
export const getEffectiveItemImage = (item: Partial<InventoryItem>): string => {
  if (item.image_url && item.image_url.trim()) return item.image_url;

  const name = (item.name || '').toLowerCase();
  const sku = (item.sku || '').toUpperCase();
  const cat = (item.category || '').toLowerCase();

  if (sku === 'GROC-001' || name.includes('basmati') || name.includes('rice')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80';
  }
  if (sku === 'GROC-002' || name.includes('sunflower') || name.includes('oil')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&auto=format&fit=crop&q=80';
  }
  if (sku === 'DAIRY-001' || name.includes('milk') || name.includes('dairy')) {
    return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&auto=format&fit=crop&q=80';
  }
  if (sku === 'HPC-001' || name.includes('colgate') || name.includes('toothpaste') || name.includes('dental')) {
    return 'https://images.unsplash.com/photo-1559591937-e10b14421b59?w=400&auto=format&fit=crop&q=80';
  }
  if (name.includes('instrument') || name.includes('box') || name.includes('tool') || cat.includes('hardware')) {
    return 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('appliance') || name.includes('ac') || name.includes('motor')) {
    return 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('personal') || name.includes('soap') || name.includes('cream')) {
    return 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&auto=format&fit=crop&q=80';
  }
  if (cat.includes('grocery') || name.includes('flour') || name.includes('kutyf') || name.includes('wheat') || name.includes('sugar')) {
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&auto=format&fit=crop&q=80';
  }
  return '';
};

// ─── Form State ───────────────────────────────────────────────────────────────
export type InventoryFormState = Omit<Partial<InventoryItem>, 'stock_units' | 'stock_value' | 'reorder_level'> & {
  image_url: string;
  stock_units?: number | string;
  stock_value?: number | string;
  reorder_level?: number | string;
};

const blankForm = (): InventoryFormState => ({
  name: '', sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`, category: 'Grocery',
  stock_units: 50, stock_value: 15000, location: 'Aisle 2, Rack A',
  reorder_level: 20, reorder_qty: 50, supplier: 'Metro Cash & Carry',
  status: 'in_stock', image_url: '',
});

// Urgency ordering weights (Out of stock is #1 critical)
const statusUrgencyWeights: Record<string, number> = {
  out_of_stock: 1,
  low_stock: 2,
  in_stock: 3,
  discontinued: 4,
};

// ─── Inventory Form Fields (Stable component outside InventoryView to prevent unmounting & scroll jumping) ──
interface InventoryFormFieldsProps {
  form: InventoryFormState;
  setForm: React.Dispatch<React.SetStateAction<InventoryFormState>>;
  addToast: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const InventoryFormFields: React.FC<InventoryFormFieldsProps> = ({ form, setForm, addToast }) => {
  const isZeroUnits = form.stock_units === 0 || form.stock_units === '0';

  return (
    <div className="space-y-4 text-xs">
      <div>
        <label className="font-semibold text-slate-700 block mb-2 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-600" /> Product Image <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <ImageZone value={form.image_url || ''} onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-1 sm:col-span-2">
          <label className="font-semibold text-slate-700 block mb-1">Item Name *</label>
          <input
            required
            placeholder="e.g. Basmati Rice 5kg"
            value={form.name || ''}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800"
          />
        </div>
        {(['sku', 'location', 'supplier'] as const).map((k) => (
          <div key={k} className={k === 'supplier' ? 'col-span-1 sm:col-span-2' : ''}>
            <label className="font-semibold text-slate-700 block mb-1 capitalize">{k.replace('_', ' ')}</label>
            <input
              value={(form[k] as string) || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800"
            />
          </div>
        ))}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Category</label>
          <select
            value={form.category || 'Grocery'}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800"
          >
            {['Grocery', 'Dairy', 'Personal Care', 'Hardware', 'Appliances', 'Electronics', 'Clothing'].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stock Units input with stepper buttons & automatic out_of_stock handling */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700 block">Stock Units *</label>
            {isZeroUnits && (
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                0 units = Out of Stock
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                const cur = Number(form.stock_units) || 0;
                const next = Math.max(0, cur - 1);
                setForm((prev) => ({
                  ...prev,
                  stock_units: next,
                  ...(next === 0
                    ? { stock_value: 0, status: 'out_of_stock' }
                    : (prev.status === 'out_of_stock' ? { status: 'in_stock' } : {})),
                }));
              }}
              className="absolute left-1 z-10 w-7 h-7 rounded-lg bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer select-none"
              title="Decrease stock units"
            >
              −
            </button>
            <input
              type="number"
              min="0"
              required
              value={form.stock_units === undefined ? '' : form.stock_units}
              onChange={(e) => {
                const rawVal = e.target.value;
                if (rawVal === '') {
                  // Keep empty string during typing without snapping to 0
                  setForm((prev) => ({ ...prev, stock_units: '' }));
                  return;
                }
                const units = Math.max(0, parseInt(rawVal, 10) || 0);
                if (units === 0) {
                  setForm((prev) => ({
                    ...prev,
                    stock_units: 0,
                    stock_value: 0,
                    status: 'out_of_stock',
                  }));
                } else {
                  setForm((prev) => ({
                    ...prev,
                    stock_units: units,
                    status: prev.status === 'out_of_stock'
                      ? (units <= (Number(prev.reorder_level) || 20) ? 'low_stock' : 'in_stock')
                      : prev.status,
                  }));
                }
              }}
              onBlur={() => {
                // If user leaves the field empty, default to 0 and out_of_stock
                if (form.stock_units === '' || form.stock_units === undefined) {
                  setForm((prev) => ({
                    ...prev,
                    stock_units: 0,
                    stock_value: 0,
                    status: 'out_of_stock',
                  }));
                }
              }}
              placeholder="0"
              className={`w-full text-center px-9 py-2 border rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-semibold ${
                isZeroUnits
                  ? 'bg-red-50/70 border-red-300 text-red-700'
                  : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => {
                const cur = Number(form.stock_units) || 0;
                const next = cur + 1;
                setForm((prev) => ({
                  ...prev,
                  stock_units: next,
                  status: prev.status === 'out_of_stock'
                    ? (next <= (Number(prev.reorder_level) || 20) ? 'low_stock' : 'in_stock')
                    : prev.status,
                }));
              }}
              className="absolute right-1 z-10 w-7 h-7 rounded-lg bg-slate-200/80 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer select-none"
              title="Increase stock units"
            >
              +
            </button>
          </div>
        </div>

        {/* Stock Status - Auto out_of_stock when 0 units, manual configuration when > 0 */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="font-semibold text-slate-700 block">Stock Status</label>
            {isZeroUnits ? (
              <span className="text-[9px] font-bold text-red-600">⚡ Auto Out of Stock</span>
            ) : (
              <span className="text-[9px] font-medium text-emerald-600">✓ Manual Configuration</span>
            )}
          </div>
          <select
            value={isZeroUnits ? 'out_of_stock' : (form.status || 'in_stock')}
            onChange={(e) => {
              const newStatus = e.target.value as InventoryItem['status'];
              if (isZeroUnits && (newStatus === 'in_stock' || newStatus === 'low_stock')) {
                addToast('Cannot mark In Stock when quantity is 0 units. Set stock units > 0 first.', 'warning');
                return;
              }
              setForm((prev) => ({ ...prev, status: newStatus }));
            }}
            className={`w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-semibold ${
              isZeroUnits
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {isZeroUnits ? (
              <>
                <option value="out_of_stock">Out of Stock (Auto - 0 Units)</option>
                <option value="discontinued">Discontinued (0 Units)</option>
              </>
            ) : (
              <>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </>
            )}
          </select>
        </div>

        {/* Stock Value */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Stock Value (₹)</label>
          <input
            type="number"
            min="0"
            value={form.stock_value === undefined ? '' : form.stock_value}
            onChange={(e) => {
              const val = e.target.value;
              setForm((prev) => ({
                ...prev,
                stock_value: val === '' ? '' : Math.max(0, Number(val) || 0),
              }));
            }}
            onBlur={() => {
              if (form.stock_value === '' || form.stock_value === undefined) {
                setForm((prev) => ({ ...prev, stock_value: 0 }));
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800 font-semibold"
          />
        </div>

        {/* Reorder Level */}
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Reorder Level</label>
          <input
            type="number"
            min="0"
            value={form.reorder_level === undefined ? '' : form.reorder_level}
            onChange={(e) => {
              const val = e.target.value;
              setForm((prev) => ({
                ...prev,
                reorder_level: val === '' ? '' : Math.max(0, Number(val) || 0),
              }));
            }}
            onBlur={() => {
              if (form.reorder_level === '' || form.reorder_level === undefined) {
                setForm((prev) => ({ ...prev, reorder_level: 20 }));
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none text-xs text-slate-800"
          />
        </div>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export const InventoryView: React.FC = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, addToast, globalFilter, targetHighlightId } = useQiyamStore();
  const [selectedCat, setSelectedCat] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'status_urgent' | 'status_healthy' | 'units_asc' | 'units_desc' | 'value_desc' | 'name_asc'>('default');
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<{ src: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryFormState>(blankForm());

  const categories = ['All', 'Grocery', 'Dairy', 'Personal Care', 'Hardware', 'Appliances'];

  // Stats calculation
  const totalValue = inventory.reduce((s, i) => s + i.stock_value, 0);
  const inStockCount = inventory.filter((i) => i.status === 'in_stock').length;
  const lowStockCount = inventory.filter((i) => i.status === 'low_stock').length;
  const outOfStockCount = inventory.filter((i) => i.status === 'out_of_stock').length;
  const discontinuedCount = inventory.filter((i) => i.status === 'discontinued').length;

  // Filter and sort
  const filtered = inventory
    .filter((item) => {
      if (selectedCat !== 'All' && item.category !== selectedCat) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (globalFilter.status && globalFilter.status !== 'all' && item.status !== globalFilter.status) return false;
      const q = (search || globalFilter.query || '').toLowerCase();
      if (q) {
        return (
          item.name.toLowerCase().includes(q) ||
          item.sku.toLowerCase().includes(q) ||
          (item.location || '').toLowerCase().includes(q) ||
          (item.supplier || '').toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'status_urgent') {
        const wA = statusUrgencyWeights[a.status] || 99;
        const wB = statusUrgencyWeights[b.status] || 99;
        return wA - wB;
      }
      if (sortBy === 'status_healthy') {
        const wA = statusUrgencyWeights[a.status] || 99;
        const wB = statusUrgencyWeights[b.status] || 99;
        return wB - wA;
      }
      if (sortBy === 'units_asc') return a.stock_units - b.stock_units;
      if (sortBy === 'units_desc') return b.stock_units - a.stock_units;
      if (sortBy === 'value_desc') return b.stock_value - a.stock_value;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return 0;
    });

  const openAdd = () => { setForm(blankForm()); setIsAddOpen(true); };
  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({ ...item, image_url: item.image_url || getEffectiveItemImage(item) });
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { addToast('Enter item name', 'error'); return; }
    const units = form.stock_units !== undefined && form.stock_units !== '' ? Number(form.stock_units) : 0;
    const isZero = units === 0;
    addInventoryItem({
      ...form,
      stock_units: units,
      stock_value: isZero ? 0 : (Number(form.stock_value) || 0),
      reorder_level: Number(form.reorder_level) || 20,
      status: isZero ? 'out_of_stock' : (form.status || 'in_stock'),
    });
    setIsAddOpen(false); setForm(blankForm());
  };
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    const units = form.stock_units !== undefined && form.stock_units !== '' ? Number(form.stock_units) : 0;
    const isZero = units === 0;
    updateInventoryItem(editItem.id, {
      ...form,
      stock_units: units,
      stock_value: isZero ? 0 : (Number(form.stock_value) || 0),
      reorder_level: Number(form.reorder_level) || 20,
      status: isZero ? 'out_of_stock' : (form.status || 'in_stock'),
    });
    setEditItem(null);
  };
  const handleDelete = (item: InventoryItem) => { deleteInventoryItem(item.id); setDeleteConfirm(null); };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] h-full w-full max-w-full overflow-y-auto font-sans">
      <Header title="Inventory & Stock Management" subtitle="Manage warehouse SKU stocks, rack aisle locations, low stock alerts, and suppliers." primaryActionLabel="Add New SKU" onPrimaryAction={openAdd} />
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Interactive Stats / Quick Filter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {[
            {
              label: 'Total SKUs',
              value: inventory.length,
              color: 'text-slate-900',
              statusKey: 'all',
              sub: 'Click to show all',
              activeBorder: 'border-2 border-slate-400 ring-2 ring-slate-400/50',
              activeBadge: 'bg-slate-600 text-white',
              activeValColor: 'text-white'
            },
            {
              label: 'Stock Units',
              value: inventory.reduce((s, i) => s + i.stock_units, 0).toLocaleString(),
              color: 'text-slate-900',
              statusKey: null,
              sub: 'Warehouse volume'
            },
            {
              label: 'Total Stock Value',
              value: `₹${totalValue.toLocaleString()}`,
              color: 'text-emerald-600',
              statusKey: null,
              sub: 'Inventory valuation'
            },
            {
              label: 'Low Stock SKUs',
              value: lowStockCount,
              color: 'text-amber-500',
              statusKey: 'low_stock',
              sub: 'Click to filter',
              activeBorder: 'border-2 border-amber-500 ring-2 ring-amber-500/60',
              activeBadge: 'bg-amber-500 text-slate-950 font-black',
              activeValColor: 'text-amber-400'
            },
            {
              label: 'Out of Stock',
              value: outOfStockCount,
              color: 'text-red-500',
              statusKey: 'out_of_stock',
              sub: 'Click to filter',
              activeBorder: 'border-2 border-red-500 ring-2 ring-red-500/60',
              activeBadge: 'bg-red-500 text-white font-bold',
              activeValColor: 'text-red-400'
            },
          ].map(({ label, value, color, statusKey, sub, activeBorder, activeBadge, activeValColor }) => {
            const isCardActive = statusKey && selectedStatus === statusKey;
            return (
              <div
                key={label}
                onClick={() => {
                  if (statusKey) {
                    setSelectedStatus(selectedStatus === statusKey && statusKey !== 'all' ? 'all' : statusKey);
                  }
                }}
                className={`p-3.5 sm:p-4 rounded-2xl transition-all select-none ${
                  statusKey ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''
                } ${
                  isCardActive
                    ? `bg-slate-900 text-white shadow-md ${activeBorder || 'border-2 border-slate-400 ring-2 ring-slate-400/50'}`
                    : 'bg-white border border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-xs font-semibold ${isCardActive ? 'text-slate-300' : 'text-slate-500'}`}>{label}</div>
                  {statusKey && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      isCardActive ? (activeBadge || 'bg-slate-600 text-white') : 'bg-slate-100 text-slate-500'
                    }`}>
                      {statusKey === 'all' ? 'ALL' : 'FILTER'}
                    </span>
                  )}
                </div>
                <div className={`text-xl sm:text-2xl font-black mt-1 ${isCardActive ? (activeValColor || 'text-white') : color}`}>{value}</div>
                <div className={`text-[10px] mt-0.5 ${isCardActive ? 'text-slate-400' : 'text-slate-400'}`}>{sub}</div>
              </div>
            );
          })}
        </div>

        {/* Filter Bar: Categories + Status Filters + Search + Sort */}
        <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
          {/* Top Row: Categories & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden md:inline">Category:</span>
              {categories.map((cat) => {
                const isCatActive = selectedCat === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer select-none ${
                      isCatActive
                        ? 'bg-slate-900 text-white border-2 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 border-2 border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search SKU, item, location..."
                className="w-full sm:w-60 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>
          </div>

          {/* Bottom Row: Status Filter Badges + Sorting Dropdown */}
          <div className="pt-2.5 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Status Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Status:
              </span>
              {[
                {
                  id: 'all',
                  label: 'All',
                  count: inventory.length,
                  unselected: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100',
                  activeBorder: 'border-2 border-slate-400 ring-2 ring-slate-400/30',
                  activeCount: 'bg-slate-700 text-slate-200',
                },
                {
                  id: 'in_stock',
                  label: 'In Stock',
                  count: inStockCount,
                  unselected: 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100/60',
                  activeBorder: 'border-2 border-emerald-500 ring-2 ring-emerald-500/40',
                  activeCount: 'bg-emerald-500 text-white font-bold',
                },
                {
                  id: 'low_stock',
                  label: 'Low Stock',
                  count: lowStockCount,
                  unselected: 'text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100/60',
                  activeBorder: 'border-2 border-amber-500 ring-2 ring-amber-500/40',
                  activeCount: 'bg-amber-500 text-slate-950 font-black',
                },
                {
                  id: 'out_of_stock',
                  label: 'Out of Stock',
                  count: outOfStockCount,
                  unselected: 'text-red-700 bg-red-50 border-red-200 hover:bg-red-100/60',
                  activeBorder: 'border-2 border-red-500 ring-2 ring-red-500/40',
                  activeCount: 'bg-red-500 text-white font-bold',
                },
                {
                  id: 'discontinued',
                  label: 'Discontinued',
                  count: discontinuedCount,
                  unselected: 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200/60',
                  activeBorder: 'border-2 border-slate-400 ring-2 ring-slate-400/40',
                  activeCount: 'bg-slate-700 text-slate-200 font-bold',
                },
              ].map((s) => {
                const isActive = selectedStatus === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStatus(selectedStatus === s.id && s.id !== 'all' ? 'all' : s.id)}
                    className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap text-[11px] transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isActive
                        ? `bg-slate-900 text-white shadow-sm ${s.activeBorder}`
                        : `${s.unselected} border`
                    }`}
                  >
                    <span>{s.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? s.activeCount : 'bg-white text-slate-700 font-semibold'
                    }`}>
                      {s.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown & Reset */}
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <div className="relative flex items-center">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer appearance-none"
                >
                  <option value="default">Sort: Default</option>
                  <option value="status_urgent">Sort: Status (Out of Stock → Low Stock)</option>
                  <option value="status_healthy">Sort: Status (In Stock First)</option>
                  <option value="units_asc">Sort: Units (Low to High)</option>
                  <option value="units_desc">Sort: Units (High to Low)</option>
                  <option value="value_desc">Sort: Value (High to Low)</option>
                  <option value="name_asc">Sort: Item Name (A-Z)</option>
                </select>
              </div>

              {(selectedCat !== 'All' || selectedStatus !== 'all' || sortBy !== 'default' || search) && (
                <button
                  onClick={() => {
                    setSelectedCat('All');
                    setSelectedStatus('all');
                    setSortBy('default');
                    setSearch('');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                  title="Reset all filters and sorting"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left min-w-[860px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-14">Image</th>
                  <th
                    onClick={() => setSortBy(prev => prev === 'name_asc' ? 'default' : 'name_asc')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    title="Click to sort alphabetically by name"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Item Name</span>
                      {sortBy === 'name_asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                    </div>
                  </th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Category</th>
                  <th
                    onClick={() => setSortBy(prev => prev === 'units_desc' ? 'units_asc' : 'units_desc')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    title="Click to sort by stock units"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Stock Units</span>
                      {sortBy === 'units_desc' ? <ArrowDown className="w-3.5 h-3.5 text-emerald-600" /> : sortBy === 'units_asc' ? <ArrowUp className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                    </div>
                  </th>
                  <th
                    onClick={() => setSortBy(prev => prev === 'value_desc' ? 'default' : 'value_desc')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    title="Click to sort by stock value"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Stock Value</span>
                      {sortBy === 'value_desc' ? <ArrowDown className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowUpDown className="w-3 h-3 text-slate-300" />}
                    </div>
                  </th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th
                    onClick={() => {
                      setSortBy(prev =>
                        prev === 'status_urgent'
                          ? 'status_healthy'
                          : prev === 'status_healthy'
                          ? 'default'
                          : 'status_urgent'
                      );
                    }}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    title="Click to sort by status (Urgent first → Healthy first)"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Status</span>
                      {sortBy === 'status_urgent' ? (
                        <span className="flex items-center text-red-600 font-bold text-[10px]">
                          <ArrowDown className="w-3.5 h-3.5 mr-0.5" /> Urgent
                        </span>
                      ) : sortBy === 'status_healthy' ? (
                        <span className="flex items-center text-emerald-600 font-bold text-[10px]">
                          <ArrowUp className="w-3.5 h-3.5 mr-0.5" /> Healthy
                        </span>
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
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
                        {(() => {
                          const displayImg = getEffectiveItemImage(item);
                          return displayImg ? (
                            <button type="button" onClick={() => setLightboxItem({ src: displayImg, name: item.name })}
                              className="relative group w-9 h-9 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer shadow-xs" title="View full image">
                              <img src={displayImg} alt={item.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><ZoomIn className="w-3.5 h-3.5 text-white" /></div>
                            </button>
                          ) : (
                            <button type="button" onClick={() => openEdit(item)} title="Add product image"
                              className="w-9 h-9 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50 transition-all flex items-center justify-center text-slate-300 hover:text-emerald-500 cursor-pointer">
                              <ImagePlus className="w-4 h-4" />
                            </button>
                          );
                        })()}
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
                      <td className="py-3.5 px-4">
                        {item.stock_units === 0 ? (
                          <div className="inline-flex items-center gap-1.5" title="0 units in stock — Automatic Out of Stock">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200 tracking-wide inline-flex items-center gap-1 shadow-2xs select-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                              OUT OF STOCK
                            </span>
                          </div>
                        ) : (
                          <div className="relative inline-block group">
                            <select
                              value={item.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as InventoryItem['status'];
                                updateInventoryItem(item.id, { status: newStatus });
                              }}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-full border cursor-pointer appearance-none outline-none pr-5.5 transition-all shadow-2xs ${
                                item.status === 'in_stock'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                  : item.status === 'low_stock'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                  : item.status === 'out_of_stock'
                                  ? 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                              title="Click to manually configure stock status"
                            >
                              <option value="in_stock">IN STOCK</option>
                              <option value="low_stock">LOW STOCK</option>
                              <option value="out_of_stock">OUT OF STOCK</option>
                              <option value="discontinued">DISCONTINUED</option>
                            </select>
                            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors" />
                          </div>
                        )}
                      </td>
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
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-emerald-600" /> Add New Inventory SKU
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Record item in warehouse catalog with location & supplier.</p>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
                <InventoryFormFields form={form} setForm={setForm} addToast={addToast} />
              </div>
              <div className="pt-4 p-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0 bg-slate-50/50">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs">
                  Add SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0 bg-white">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" /> Edit SKU
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">{editItem.sku} — {editItem.name}</p>
              </div>
              <button onClick={() => setEditItem(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-5 overflow-y-auto flex-1 overscroll-contain">
                <InventoryFormFields form={form} setForm={setForm} addToast={addToast} />
              </div>
              <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => { setDeleteConfirm(editItem); setEditItem(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 text-red-500 hover:bg-red-50 font-semibold rounded-xl text-xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-xl text-xs transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-xs">
                    Save Changes
                  </button>
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
