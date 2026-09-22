import React, { useState, useRef, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { PdfEditorDocument, PdfCanvasElement } from '@/types';
import {
  Printer, Download, X, Move, Plus, Trash2, RotateCcw,
  CheckCircle2, ShieldCheck, Award, FileText, Image as ImageIcon,
  Edit3, ZoomIn, ZoomOut, Grid, Eye, Sparkles, PenTool,
  QrCode, Stamp, Layers, Sliders, Type, Check, RefreshCw, Copy, Upload
} from 'lucide-react';

const AdvancedPdfEditorContent: React.FC<{ initialDoc: PdfEditorDocument }> = ({ initialDoc }) => {
  const { closePdfEditor, addToast } = useQiyamStore();

  // Local document state
  const [doc, setDoc] = useState<PdfEditorDocument>(initialDoc);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'element' | 'document'>('element');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Logo file upload state
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [logoUploadTargetId, setLogoUploadTargetId] = useState<string | null>(null);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigEmpty, setIsSigEmpty] = useState(true);

  // Handle uploaded logo file
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      if (logoUploadTargetId) {
        setDoc((prev) => ({
          ...prev,
          elements: prev.elements.map((el) =>
            el.id === logoUploadTargetId
              ? { ...el, imageUrl: dataUrl, content: dataUrl }
              : el
          ),
        }));
        addToast('Company logo updated with uploaded icon file!', 'success');
      } else {
        const existingLogo = doc.elements.find((el) => el.type === 'logo');
        if (existingLogo) {
          setDoc((prev) => ({
            ...prev,
            elements: prev.elements.map((el) =>
              el.id === existingLogo.id
                ? { ...el, imageUrl: dataUrl, content: dataUrl }
                : el
            ),
          }));
          setSelectedElementId(existingLogo.id);
          addToast('Company logo updated with uploaded icon file!', 'success');
        } else {
          const newId = `logo-${Date.now()}`;
          const newEl: PdfCanvasElement = {
            id: newId,
            type: 'logo',
            imageUrl: dataUrl,
            content: dataUrl,
            x: 40,
            y: 35,
            width: 70,
            height: 70,
          };
          setDoc((prev) => ({ ...prev, elements: [...prev.elements, newEl] }));
          setSelectedElementId(newId);
          addToast('Company logo placed onto document!', 'success');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Sync when initialDoc changes
  useEffect(() => {
    setDoc(initialDoc);
  }, [initialDoc]);

  // Selected & Editing element helpers
  const selectedElement = doc.elements.find((el) => el.id === selectedElementId) || null;
  const editingElement = doc.elements.find((el) => el.id === editingElementId) || null;

  // Update element properties
  const updateSelectedElement = (updates: Partial<PdfCanvasElement>) => {
    if (!selectedElementId) return;
    setDoc((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === selectedElementId ? { ...el, ...updates } : el)),
    }));
  };

  const updateEditingElement = (updates: Partial<PdfCanvasElement>) => {
    if (!editingElementId) return;
    setDoc((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === editingElementId ? { ...el, ...updates } : el)),
    }));
  };

  // Handle Drag Start
  const handleMouseDownElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
    setInspectorTab('element');
    setDraggingId(id);

    const el = doc.elements.find((item) => item.id === id);
    if (el && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoomLevel / 100;
      const mouseX = (e.clientX - rect.left) / scale;
      const mouseY = (e.clientY - rect.top) / scale;
      setDragOffset({
        x: mouseX - el.x,
        y: mouseY - el.y,
      });
    }
  };

  // Handle Dragging over Canvas
  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!draggingId || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = zoomLevel / 100;
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;

    let newX = Math.round(currentX - dragOffset.x);
    let newY = Math.round(currentY - dragOffset.y);

    // Snap to grid (10px) if enabled
    if (showGrid) {
      newX = Math.round(newX / 10) * 10;
      newY = Math.round(newY / 10) * 10;
    }

    // Keep within canvas bounds
    newX = Math.max(10, Math.min(newX, 720));
    newY = Math.max(10, Math.min(newY, 1020));

    setDoc((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === draggingId ? { ...el, x: newX, y: newY } : el
      ),
    }));
  };

  const handleMouseUpCanvas = () => {
    setDraggingId(null);
  };

  // Handle dropping elements or templates directly onto the PDF Canvas
  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);

    // 1. Check for template drop
    const templateDataStr = e.dataTransfer.getData('application/pdf-template');
    if (templateDataStr) {
      try {
        const templateUpdates = JSON.parse(templateDataStr);
        setDoc((prev) => ({ ...prev, ...templateUpdates }));
        addToast('Template design loaded onto document!', 'success');
        return;
      } catch (err) {
        console.error('Failed to parse dropped template:', err);
      }
    }

    // 2. Check for canvas element drop
    const elementDataStr = e.dataTransfer.getData('application/pdf-element');
    if (!elementDataStr || !canvasRef.current) return;

    try {
      const data = JSON.parse(elementDataStr);
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoomLevel / 100;

      let dropX = Math.round((e.clientX - rect.left) / scale);
      let dropY = Math.round((e.clientY - rect.top) / scale);

      if (showGrid) {
        dropX = Math.round(dropX / 10) * 10;
        dropY = Math.round(dropY / 10) * 10;
      }

      const width = data.width || 120;
      const height = data.height || 60;
      dropX = Math.max(10, Math.min(dropX - Math.round(width / 2), 770 - width));
      dropY = Math.max(10, Math.min(dropY - Math.round(height / 2), 1100 - height));

      const newId = `${data.type}-${Date.now()}`;
      const newElement: PdfCanvasElement = {
        ...data,
        id: newId,
        x: dropX,
        y: dropY,
      };

      setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
      setSelectedElementId(newId);
      setInspectorTab('element');
      addToast(`${data.label || 'Element'} placed! Click Edit to customize.`, 'success');
    } catch (err) {
      console.error('Failed to parse dropped element:', err);
    }
  };

  // Add Elements
  const handleAddSeal = (sealType: PdfCanvasElement['sealType'] = 'official_circle') => {
    const newId = `seal-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'seal',
      sealType,
      sealTitle: sealType === 'paid' ? '★ PAID ★' : sealType === 'approved' ? '★ APPROVED ★' : '★ OFFICIAL ★',
      sealSubtext: sealType === 'paid' ? 'PAID & SETTLED' : sealType === 'approved' ? 'APPROVED' : 'VERIFIED SEAL',
      sealBottomText: 'GOVT REGD KL',
      x: 550,
      y: 750,
      width: 115,
      height: 115,
      color: sealType === 'official_circle' ? '#059669' : sealType === 'paid' ? '#0284c7' : '#dc2626',
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Official seal added! Drag to position or click Edit to change text.', 'info');
  };

  const handleAddSignature = (signatureType: PdfCanvasElement['signatureType'] = 'director') => {
    const newId = `sig-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'signature',
      signatureType,
      signeeName: signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta',
      signeeRole: signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director',
      x: 80,
      y: 800,
      width: 160,
      height: 60,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Signature added! Drag anywhere or click Edit to change signee name.', 'info');
  };

  const handleAddLogo = () => {
    const newId = `logo-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'logo',
      logoText: 'Q',
      color: '#059669',
      x: 40,
      y: 35,
      width: 56,
      height: 56,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Company logo added to canvas.', 'info');
  };

  const handleAddQr = () => {
    const newId = `qr-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'qr',
      qrLabel: 'VERIFIED',
      x: 640,
      y: 35,
      width: 65,
      height: 65,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Verification QR code added.', 'info');
  };

  const handleAddCustomText = () => {
    const newId = `text-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'text',
      content: 'Important Notice / Special Clause',
      x: 80,
      y: 650,
      fontSize: 12,
      isBold: false,
      color: '#1e293b',
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Editable text block added.', 'info');
  };

  const handleDeleteElement = (id: string) => {
    setDoc((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (selectedElementId === id) setSelectedElementId(null);
    if (editingElementId === id) setEditingElementId(null);
    addToast('Element deleted', 'info');
  };

  const handleDuplicateElement = (id: string) => {
    const el = doc.elements.find((item) => item.id === id);
    if (!el) return;
    const newId = `${el.type}-${Date.now()}`;
    const duplicated: PdfCanvasElement = {
      ...el,
      id: newId,
      x: Math.min(el.x + 20, 700),
      y: Math.min(el.y + 20, 1000),
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, duplicated] }));
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Element duplicated!', 'info');
  };

  // Signature Pad Handlers
  const handleStartDrawSig = () => {
    setIsDrawingSig(true);
    setTimeout(() => {
      if (sigCanvasRef.current) {
        const ctx = sigCanvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#0B1528';
          ctx.lineCap = 'round';
        }
      }
    }, 100);
  };

  const handleSaveDrawnSig = () => {
    if (!sigCanvasRef.current) return;
    const dataUrl = sigCanvasRef.current.toDataURL();
    const newId = `sig-custom-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'signature',
      signatureType: 'custom_drawn',
      content: dataUrl,
      signeeName: 'Drawn Signature',
      signeeRole: 'Authorized Signatory',
      x: 100,
      y: 820,
      width: 140,
      height: 50,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setIsDrawingSig(false);
    setSelectedElementId(newId);
    setInspectorTab('element');
    addToast('Hand-drawn digital signature placed!', 'success');
  };

  // Print & PDF Export
  const handlePrintPdf = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1100');
    if (!printWindow) {
      addToast('Popup blocked! Please allow popups to export PDF.', 'error');
      return;
    }

    // Build printable HTML mirroring the canvas
    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${doc.title} - ${doc.referenceNumber}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 40px 50px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; position: relative; background: #fff; box-sizing: border-box; width: 794px; min-height: 1123px; }
            .letterhead { border-bottom: 2px solid #cbd5e1; padding-bottom: 18px; margin-bottom: 25px; text-align: center; }
            .company-name { font-size: 20px; font-weight: 800; letter-spacing: 1px; color: #0b1528; }
            .company-sub { font-size: 11px; color: #64748b; margin-top: 3px; }
            .ref-bar { display: flex; justify-content: space-between; font-size: 12px; color: #475569; margin-bottom: 25px; }
            .recipient { font-size: 13px; line-height: 1.5; margin-bottom: 25px; }
            .recipient-name { font-weight: 700; font-size: 14px; }
            .subject { font-size: 14px; font-weight: 800; text-align: center; text-decoration: underline; margin-bottom: 25px; letter-spacing: 0.5px; }
            .body-text { font-size: 13px; line-height: 1.8; color: #1e293b; margin-bottom: 30px; white-space: pre-wrap; }
            .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 70px; font-weight: 900; color: rgba(15, 23, 42, ${doc.watermarkOpacity || 0.08}); pointer-events: none; z-index: 0; text-transform: uppercase; white-space: nowrap; }
            .canvas-element { position: absolute; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${doc.showWatermark ? `<div class="watermark">${doc.watermarkText || 'OFFICIAL'}</div>` : ''}
          <div class="letterhead">
            <div class="company-name">${doc.companyName}</div>
            <div class="company-sub">${doc.companyAddress} • Ph: ${doc.companyPhone || '+91 94963 00233'}</div>
          </div>
          <div class="ref-bar">
            <span>Ref: ${doc.referenceNumber}</span>
            <span>Date: ${doc.dateStr}</span>
          </div>
          <div class="recipient">
            <div>To,</div>
            <div class="recipient-name">${doc.recipientName}</div>
            <div>${doc.recipientRole || 'Employee'} (${doc.recipientId || ''})</div>
          </div>
          <div class="subject">${doc.subject || 'OFFICIAL LETTER'}</div>
          <div class="body-text">${doc.bodyContent}</div>

          <!-- Absolute positioned elements -->
          ${doc.elements
            .map((el) => {
              if (el.type === 'seal') {
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;">
                    <div style="width: 100%; height: 100%; border: 3px dashed ${el.color || '#059669'}; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: ${el.color || '#059669'}; font-weight: 800; font-size: 10px; text-transform: uppercase; transform: rotate(-8deg);">
                      <span>${el.sealTitle || '★ OFFICIAL ★'}</span>
                      <span style="font-size: 8px;">${el.sealSubtext || (el.sealType === 'paid' ? 'PAID & SETTLED' : el.sealType === 'approved' ? 'APPROVED' : 'VERIFIED SEAL')}</span>
                      <span style="font-size: 7px;">${el.sealBottomText || 'GOVT REGD KL'}</span>
                    </div>
                  </div>
                `;
              }
              if (el.type === 'signature') {
                if (el.signatureType === 'custom_drawn' && el.content) {
                  return `<div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;"><img src="${el.content}" style="width:100%; height:100%; object-fit:contain;" /></div>`;
                }
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;">
                    <div style="font-family: 'Brush Script MT', cursive, sans-serif; font-size: 24px; color: #0b1528; border-bottom: 1px solid #94a3b8; padding-bottom: 2px;">
                      ${el.signeeName || (el.signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta')}
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #475569; margin-top: 3px;">
                      ${el.signeeRole || (el.signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director')}
                    </div>
                  </div>
                `;
              }
              if (el.type === 'logo') {
                if (el.imageUrl || (el.content && el.content.startsWith('data:image'))) {
                  return `
                    <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; display: flex; align-items: center; justify-content: center;">
                      <img src="${el.imageUrl || el.content}" style="width: 100%; height: 100%; object-fit: contain;" alt="Company Logo" />
                    </div>
                  `;
                }
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; background: ${el.color || 'linear-gradient(135deg, #059669, #0d9488)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    ${el.logoText || el.content || 'Q'}
                  </div>
                `;
              }
              if (el.type === 'qr') {
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; border: 1px solid #cbd5e1; padding: 4px; border-radius: 8px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 28px; line-height: 1;">▦</div>
                    <div style="font-size: 7px; font-weight: 700; color: #059669; margin-top: 2px;">${el.qrLabel || 'VERIFIED'}</div>
                  </div>
                `;
              }
              if (el.type === 'text' && el.content) {
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; font-size: ${el.fontSize || 12}px; font-weight: ${el.isBold ? '700' : '400'}; color: ${el.color || '#1e293b'};">
                    ${el.content}
                  </div>
                `;
              }
              return '';
            })
            .join('')}

          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    addToast('PDF ready for printing & high-res download!', 'success');
  };

  const handleSaveTemplate = () => {
    try {
      localStorage.setItem(`whatsq_custom_pdf_${doc.type}`, JSON.stringify(doc));
      addToast('Document design saved successfully!', 'success');
    } catch {
      addToast('Design saved to active session', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Hidden file input for uploading company icon / logo file */}
      <input
        type="file"
        ref={logoFileInputRef}
        onChange={handleLogoFileUpload}
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
        className="hidden"
      />

      {/* Top Studio Control Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">Official Document &amp; PDF Studio</span>
              {isPreviewMode ? (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1 shadow-sm">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span>PREVIEW MODE ACTIVE</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  DRAG &amp; DROP READY
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate max-w-xs">{doc.title}</div>
          </div>
        </div>

        {/* Center Canvas Tools: Zoom, Grid, Watermark */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 15, 60))}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-mono px-2 text-slate-200 font-semibold">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 15, 150))}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
              showGrid ? 'bg-emerald-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Snap-to-Grid alignment"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>
          <button
            onClick={() => setDoc({ ...doc, showWatermark: !doc.showWatermark })}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all ${
              doc.showWatermark ? 'bg-purple-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Background Watermark"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Watermark</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Preview Mode Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setIsPreviewMode(!isPreviewMode);
              if (!isPreviewMode) {
                setSelectedElementId(null);
                setEditingElementId(null);
                addToast('Preview Mode enabled. Showing clean final PDF view.', 'info');
              } else {
                addToast('Returned to editing mode.', 'info');
              }
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
              isPreviewMode
                ? 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/80 shadow-blue-900/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-blue-500/50 hover:text-white'
            }`}
            title={isPreviewMode ? 'Return to editing mode' : 'Preview clean final PDF output before downloading'}
          >
            {isPreviewMode ? (
              <>
                <Edit3 className="w-3.5 h-3.5 text-blue-200" />
                <span>Edit Mode</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Preview Mode</span>
              </>
            )}
          </button>

          <button
            onClick={handleSaveTemplate}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Design</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>

          <button
            onClick={closePdfEditor}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Studio Body: Sidebar Palette + Canvas + Properties Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Elements Palette */}
        {!isPreviewMode && (
          <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 select-none text-xs">
          <div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-2 mb-3 shadow-xs">
              <Move className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Drag any item below onto the PDF canvas, or click to add!</span>
            </div>

            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2.5">
              Drag-and-Drop Elements
            </h4>
            <div className="space-y-2">
              {/* Official Seal */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'seal',
                      sealType: 'official_circle',
                      width: 115,
                      height: 115,
                      sealTitle: '★ OFFICIAL ★',
                      sealSubtext: 'VERIFIED SEAL',
                      sealBottomText: 'GOVT REGD KL',
                      color: '#059669',
                      label: 'Official Seal',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => handleAddSeal('official_circle')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-emerald-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Stamp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Official Seal</div>
                    <div className="text-[10px] text-slate-400">Government / Company Stamp</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </div>

              {/* Paid Stamp */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'seal',
                      sealType: 'paid',
                      width: 115,
                      height: 115,
                      sealTitle: '★ PAID ★',
                      sealSubtext: 'PAID & SETTLED',
                      sealBottomText: 'ACCOUNTS DEPT',
                      color: '#0284c7',
                      label: 'Paid Stamp',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => handleAddSeal('paid')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-blue-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-blue-300 transition-colors">Paid &amp; Verified Stamp</div>
                    <div className="text-[10px] text-slate-400">UPI / Cash Settled Seal</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
              </div>

              {/* Approved Stamp */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'seal',
                      sealType: 'approved',
                      width: 115,
                      height: 115,
                      sealTitle: '★ APPROVED ★',
                      sealSubtext: 'MANAGEMENT SANCTIONED',
                      sealBottomText: 'AUDIT PASS',
                      color: '#dc2626',
                      label: 'Approved Stamp',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => handleAddSeal('approved')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-red-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-red-300 transition-colors">Approved Stamp</div>
                    <div className="text-[10px] text-slate-400">Management Sanction Seal</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
              </div>

              {/* Director Signature */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'signature',
                      signatureType: 'director',
                      width: 160,
                      height: 60,
                      signeeName: 'Rahul V. Mehta',
                      signeeRole: 'Operations Director',
                      label: 'Director Signature',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => handleAddSignature('director')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-purple-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-purple-300 transition-colors">Director Signature</div>
                    <div className="text-[10px] text-slate-400">Rahul V. Mehta (Director)</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors" />
              </div>

              {/* Manager Signature */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'signature',
                      signatureType: 'manager',
                      width: 160,
                      height: 60,
                      signeeName: 'S. Sharma',
                      signeeRole: 'HR & Admin Manager',
                      label: 'Manager Signature',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => handleAddSignature('manager')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-indigo-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">Manager Signature</div>
                    <div className="text-[10px] text-slate-400">S. Sharma (HR &amp; Admin)</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
              </div>

              {/* Draw Signature */}
              <button
                type="button"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'signature',
                      signatureType: 'custom_drawn',
                      width: 150,
                      height: 55,
                      signeeName: 'Authorized Signer',
                      signeeRole: 'Authorized Signatory',
                      label: 'Drawn Signature',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={handleStartDrawSig}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-amber-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors">Draw Your Signature</div>
                    <div className="text-[10px] text-slate-400">Interactive drawing pad</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
              </button>

              {/* Company Logo */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'logo',
                      logoText: 'Q',
                      color: '#059669',
                      width: 56,
                      height: 56,
                      label: 'Company Logo',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all hover:border-emerald-500 hover:scale-[1.01] group space-y-2"
              >
                <div
                  onClick={handleAddLogo}
                  className="flex items-center justify-between text-left cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-emerald-300 transition-colors">Company Logo</div>
                      <div className="text-[10px] text-slate-400">Emblem or uploaded file</div>
                    </div>
                  </div>
                  <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLogoUploadTargetId(null);
                    logoFileInputRef.current?.click();
                  }}
                  className="w-full py-1.5 px-2 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 hover:border-indigo-400 text-indigo-200 hover:text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload Icon File (PNG/JPG)</span>
                </button>
              </div>

              {/* Security QR Code */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'qr',
                      qrLabel: 'VERIFIED',
                      width: 65,
                      height: 65,
                      label: 'Security QR Code',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={handleAddQr}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-teal-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-teal-300 transition-colors">Security QR Code</div>
                    <div className="text-[10px] text-slate-400">Digital verification badge</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
              </div>

              {/* Custom Text Block */}
              <div
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-element',
                    JSON.stringify({
                      type: 'text',
                      content: 'Important Notice / Special Clause',
                      fontSize: 12,
                      isBold: false,
                      color: '#1e293b',
                      width: 220,
                      height: 40,
                      label: 'Text Block',
                    })
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={handleAddCustomText}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-grab active:cursor-grabbing transition-all hover:border-cyan-500 hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">Custom Text Block</div>
                    <div className="text-[10px] text-slate-400">Freeform movable text</div>
                  </div>
                </div>
                <Move className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick Preset Document Switcher */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center justify-between">
              <span>Preset Templates</span>
              <span className="text-[9px] text-slate-500 font-normal">Drag or Click</span>
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-template',
                    JSON.stringify({
                      type: 'staff_letter',
                      title: 'Official Staff Joining Letter',
                      subject: 'SUB: OFFICIAL LETTER OF APPOINTMENT',
                      bodyContent:
                        'We are pleased to confirm your appointment with Qiyam Business Solutions as Field Technician. You will be reporting to the Calicut HQ branch. Your duty hours are 9:00 AM to 6:00 PM, Monday through Saturday.',
                    })
                  );
                }}
                onClick={() =>
                  setDoc({
                    ...doc,
                    type: 'staff_letter',
                    title: 'Official Staff Joining Letter',
                    subject: 'SUB: OFFICIAL LETTER OF APPOINTMENT',
                    bodyContent:
                      'We are pleased to confirm your appointment with Qiyam Business Solutions as Field Technician. You will be reporting to the Calicut HQ branch. Your duty hours are 9:00 AM to 6:00 PM, Monday through Saturday.',
                  })
                }
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-grab active:cursor-grabbing hover:border hover:border-emerald-500 transition-all"
              >
                Joining Letter
              </button>
              <button
                type="button"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-template',
                    JSON.stringify({
                      type: 'invoice',
                      title: 'Tax Invoice & GST Bill',
                      referenceNumber: 'INV-2024-0521',
                      subject: 'TAX INVOICE - COMMERCIAL SERVICES',
                      bodyContent:
                        'Invoice for Air Conditioning Maintenance & System Overhaul. Payment terms: 100% advance or same-day UPI transfer upon job completion.',
                    })
                  );
                }}
                onClick={() =>
                  setDoc({
                    ...doc,
                    type: 'invoice',
                    title: 'Tax Invoice & GST Bill',
                    referenceNumber: 'INV-2024-0521',
                    subject: 'TAX INVOICE - COMMERCIAL SERVICES',
                    bodyContent:
                      'Invoice for Air Conditioning Maintenance & System Overhaul. Payment terms: 100% advance or same-day UPI transfer upon job completion.',
                  })
                }
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-grab active:cursor-grabbing hover:border hover:border-blue-500 transition-all"
              >
                Tax Invoice
              </button>
              <button
                type="button"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-template',
                    JSON.stringify({
                      type: 'quotation',
                      title: 'Commercial Quotation',
                      referenceNumber: 'QUO-2024-0112',
                      subject: 'ESTIMATE & PRICE QUOTATION',
                      bodyContent:
                        'Formal proposal and quotation for annual MEP facilities maintenance, parts replacement warranty, and priority 24/7 breakdown support.',
                    })
                  );
                }}
                onClick={() =>
                  setDoc({
                    ...doc,
                    type: 'quotation',
                    title: 'Commercial Quotation',
                    referenceNumber: 'QUO-2024-0112',
                    subject: 'ESTIMATE & PRICE QUOTATION',
                    bodyContent:
                      'Formal proposal and quotation for annual MEP facilities maintenance, parts replacement warranty, and priority 24/7 breakdown support.',
                  })
                }
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-grab active:cursor-grabbing hover:border hover:border-purple-500 transition-all"
              >
                Quotation
              </button>
              <button
                type="button"
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    'application/pdf-template',
                    JSON.stringify({
                      type: 'voucher',
                      title: 'Expense Reimbursement Voucher',
                      referenceNumber: 'EXP-VOUCHER-088',
                      subject: 'PETROL & TOOL REIMBURSEMENT VOUCHER',
                      bodyContent:
                        'Approved reimbursement for field service expenses, vehicle fuel allowance, and authorized spare part acquisitions.',
                    })
                  );
                }}
                onClick={() =>
                  setDoc({
                    ...doc,
                    type: 'voucher',
                    title: 'Expense Reimbursement Voucher',
                    referenceNumber: 'EXP-VOUCHER-088',
                    subject: 'PETROL & TOOL REIMBURSEMENT VOUCHER',
                    bodyContent:
                      'Approved reimbursement for field service expenses, vehicle fuel allowance, and authorized spare part acquisitions.',
                  })
                }
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-grab active:cursor-grabbing hover:border hover:border-amber-500 transition-all"
              >
                Expense Slip
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Center Live A4 Canvas Area */}
        <div
          className="flex-1 bg-slate-950 p-6 overflow-auto flex flex-col items-center justify-start"
          onMouseMove={isPreviewMode ? undefined : handleMouseMoveCanvas}
          onMouseUp={isPreviewMode ? undefined : handleMouseUpCanvas}
          onClick={() => !isPreviewMode && setSelectedElementId(null)}
          onDragOver={isPreviewMode ? undefined : (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
            setIsDragOverCanvas(true);
          }}
          onDragLeave={isPreviewMode ? undefined : () => setIsDragOverCanvas(false)}
          onDrop={isPreviewMode ? undefined : handleDropOnCanvas}
        >
          {/* Top Preview Mode Floating Control Bar */}
          {isPreviewMode && (
            <div className="sticky top-0 z-50 w-full max-w-2xl mb-6 flex items-center justify-between px-5 py-3 bg-slate-900/95 border border-blue-500/40 text-white rounded-2xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <span>PDF Output Preview</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                      Exact Print View
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Showing clean document output as it will download / print. All edit boxes and buttons are hidden.
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPreviewMode(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold cursor-pointer border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Back to Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdf}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download / Print PDF</span>
                </button>
              </div>
            </div>
          )}

          <div
            ref={canvasRef}
            style={{
              width: '794px',
              minHeight: '1123px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
            className={`bg-white text-slate-900 shadow-2xl rounded-sm p-12 relative select-none transition-all ${
              !isPreviewMode && isDragOverCanvas
                ? 'ring-4 ring-emerald-500/70 ring-offset-4 ring-offset-slate-950 scale-[1.01]'
                : ''
            } ${
              !isPreviewMode && showGrid
                ? 'bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:20px_20px]'
                : ''
            }`}
          >
            {/* Watermark Layer */}
            {doc.showWatermark && (
              <div
                style={{ opacity: doc.watermarkOpacity || 0.08 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              >
                <div className="text-7xl font-black text-slate-950 -rotate-35 uppercase tracking-widest text-center whitespace-nowrap">
                  {doc.watermarkText || 'CONFIDENTIAL'}
                </div>
              </div>
            )}

            {/* Document Header / Letterhead */}
            {isPreviewMode ? (
              <div className="border-b-2 border-slate-300 pb-5 text-center relative z-10">
                <div className="font-extrabold text-xl text-slate-900 tracking-wider text-center">{doc.companyName}</div>
                <div className="text-xs text-slate-500 text-center mt-1">
                  {doc.companyAddress} • Ph: {doc.companyPhone || '+91 94963 00233'}
                </div>
              </div>
            ) : (
              <div className="border-b-2 border-slate-300 pb-5 text-center relative z-10 group/sec rounded-lg transition-all hover:bg-slate-50/50 p-2">
                <div className="absolute -top-3 right-2 opacity-60 group-hover/sec:opacity-100 flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 transition-all pointer-events-none">
                  <Edit3 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Editable Header</span>
                </div>
                <input
                  type="text"
                  value={doc.companyName}
                  onChange={(e) => setDoc({ ...doc, companyName: e.target.value })}
                  className="font-extrabold text-xl text-slate-900 tracking-wider text-center w-full focus:bg-slate-50 focus:outline-none rounded px-2 hover:bg-slate-50/50 transition-colors"
                  title="Click to edit Company Name"
                />
                <input
                  type="text"
                  value={doc.companyAddress}
                  onChange={(e) => setDoc({ ...doc, companyAddress: e.target.value })}
                  className="text-xs text-slate-500 text-center w-full focus:bg-slate-50 focus:outline-none rounded px-2 mt-1 hover:bg-slate-50/50 transition-colors"
                  title="Click to edit Company Address & Contact"
                />
              </div>
            )}

            {/* Ref Number & Date */}
            {isPreviewMode ? (
              <div className="flex justify-between items-center text-xs text-slate-600 mt-6 mb-6 relative z-10">
                <div>
                  <span className="font-semibold text-slate-400 mr-1">Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{doc.referenceNumber}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 mr-1">Date:</span>
                  <span className="font-bold text-slate-800">{doc.dateStr}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center text-xs text-slate-600 mt-6 mb-6 relative z-10">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-400">Ref:</span>
                  <input
                    type="text"
                    value={doc.referenceNumber}
                    onChange={(e) => setDoc({ ...doc, referenceNumber: e.target.value })}
                    className="font-mono font-bold text-slate-800 focus:bg-slate-50 focus:outline-none rounded px-1 w-52 hover:bg-slate-50/50 transition-colors"
                    title="Click to edit Reference Number"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-slate-400">Date:</span>
                  <input
                    type="text"
                    value={doc.dateStr}
                    onChange={(e) => setDoc({ ...doc, dateStr: e.target.value })}
                    className="font-bold text-slate-800 focus:bg-slate-50 focus:outline-none rounded px-1 w-32 text-right hover:bg-slate-50/50 transition-colors"
                    title="Click to edit Date"
                  />
                </div>
              </div>
            )}

            {/* Recipient Details */}
            {isPreviewMode ? (
              <div className="text-xs space-y-1 mb-6 relative z-10 text-slate-800">
                <div className="text-slate-500">To,</div>
                <div className="font-bold text-sm text-slate-900">{doc.recipientName}</div>
                <div className="text-slate-600">{doc.recipientRole || 'Employee'} ({doc.recipientId || ''})</div>
              </div>
            ) : (
              <div className="text-xs space-y-1 mb-6 relative z-10">
                <div className="text-slate-500">To,</div>
                <input
                  type="text"
                  value={doc.recipientName}
                  onChange={(e) => setDoc({ ...doc, recipientName: e.target.value })}
                  className="font-bold text-sm text-slate-900 focus:bg-slate-50 focus:outline-none rounded px-1 w-full block hover:bg-slate-50/50 transition-colors"
                  title="Click to edit Recipient Name"
                />
                <input
                  type="text"
                  value={doc.recipientRole || ''}
                  onChange={(e) => setDoc({ ...doc, recipientRole: e.target.value })}
                  className="text-slate-600 focus:bg-slate-50 focus:outline-none rounded px-1 w-full block text-xs hover:bg-slate-50/50 transition-colors"
                  title="Click to edit Recipient Designation & ID"
                />
              </div>
            )}

            {/* Subject Line */}
            {isPreviewMode ? (
              <div className="mb-6 relative z-10 text-center">
                <div className="font-extrabold text-sm text-slate-900 underline tracking-wide inline-block">{doc.subject || 'OFFICIAL LETTER'}</div>
              </div>
            ) : (
              <div className="mb-6 relative z-10">
                <input
                  type="text"
                  value={doc.subject || ''}
                  onChange={(e) => setDoc({ ...doc, subject: e.target.value })}
                  className="font-extrabold text-sm text-slate-900 text-center underline tracking-wide w-full focus:bg-slate-50 focus:outline-none rounded px-2 hover:bg-slate-50/50 transition-colors"
                  title="Click to edit Subject"
                />
              </div>
            )}

            {/* Body Content */}
            {isPreviewMode ? (
              <div className="relative z-10 mb-8 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {doc.bodyContent}
              </div>
            ) : (
              <div className="relative z-10 mb-8 group/body rounded-lg transition-all hover:bg-slate-50/30 p-1 border border-transparent hover:border-slate-300">
                <div className="absolute -top-3 right-2 opacity-60 group-hover/body:opacity-100 flex items-center gap-1 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 transition-all pointer-events-none">
                  <Edit3 className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Editable Body Text</span>
                </div>
                <textarea
                  rows={6}
                  value={doc.bodyContent}
                  onChange={(e) => setDoc({ ...doc, bodyContent: e.target.value })}
                  className="w-full text-xs text-slate-800 leading-relaxed focus:bg-slate-50 focus:outline-none rounded-lg p-2 resize-y border border-transparent hover:border-slate-200 transition-colors"
                  title="Click to edit Document Body Text"
                />
              </div>
            )}

            {/* Absolute Draggable Elements Layer */}
            {doc.elements.map((el) => {
              const isSelected = el.id === selectedElementId;

              return (
                <div
                  key={el.id}
                  style={{
                    position: 'absolute',
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: el.width ? `${el.width}px` : 'auto',
                    height: el.height ? `${el.height}px` : 'auto',
                    zIndex: 20,
                  }}
                  onMouseDown={isPreviewMode ? undefined : (e) => handleMouseDownElement(e, el.id)}
                  onDoubleClick={isPreviewMode ? undefined : (e) => {
                    e.stopPropagation();
                    setEditingElementId(el.id);
                  }}
                  className={
                    isPreviewMode
                      ? 'select-none pointer-events-none'
                      : `group cursor-move transition-shadow ${
                          isSelected
                            ? 'ring-2 ring-emerald-500 ring-offset-2 rounded-lg'
                            : 'hover:ring-1 hover:ring-slate-400/50'
                        }`
                  }
                  title={isPreviewMode ? undefined : 'Drag to reposition • Double-click to edit'}
                >
                  {/* Floating Action Bar: Constantly visible on all elements when NOT in preview mode */}
                  {!isPreviewMode && (
                    <div
                      className={`absolute ${
                        el.y < 38 ? 'top-full mt-1.5' : '-top-9'
                      } left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-xl shadow-xl border z-50 select-none pointer-events-auto whitespace-nowrap backdrop-blur-md transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white border-emerald-500 ring-2 ring-emerald-500/40 scale-105 shadow-emerald-950/50'
                          : 'bg-slate-900/95 text-slate-200 border-slate-700/90 hover:bg-slate-900 hover:border-slate-500 hover:scale-102'
                      }`}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingElementId(el.id);
                          setSelectedElementId(el.id);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                        title="Edit element content"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>

                      {el.type === 'logo' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLogoUploadTargetId(el.id);
                            logoFileInputRef.current?.click();
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                          title="Upload company icon / logo file (PNG, JPG, SVG)"
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload Icon</span>
                        </button>
                      )}

                      <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteElement(el.id);
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-600/90 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer transition-all shadow-xs"
                        title="Delete element"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}

                  {/* Element Renderers */}
                  {el.type === 'seal' && (
                    <div
                      style={{ borderColor: el.color || '#059669', color: el.color || '#059669' }}
                      className="w-full h-full border-4 border-dashed rounded-full flex flex-col items-center justify-center text-center p-2 font-black text-[10px] tracking-wider uppercase -rotate-6 shadow-xs bg-white/60 backdrop-blur-xs select-none pointer-events-none"
                    >
                      <span>{el.sealTitle || '★ OFFICIAL ★'}</span>
                      <span className="text-[9px] font-bold">
                        {el.sealSubtext || (el.sealType === 'paid' ? 'PAID & SETTLED' : el.sealType === 'approved' ? 'APPROVED' : 'VERIFIED SEAL')}
                      </span>
                      <span className="text-[7px]">{el.sealBottomText || 'GOVT REGD KL'}</span>
                    </div>
                  )}

                  {el.type === 'signature' && (
                    <div className="w-full h-full pointer-events-none select-none">
                      {el.signatureType === 'custom_drawn' && el.content ? (
                        <img src={el.content} alt="Drawn Signature" className="w-full h-full object-contain" />
                      ) : (
                        <div>
                          <div className="font-serif italic text-2xl text-slate-900 border-b border-slate-400 pb-1">
                            {el.signeeName || (el.signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta')}
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 mt-1">
                            {el.signeeRole || (el.signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {el.type === 'logo' && (
                    el.imageUrl || (el.content && el.content.startsWith('data:image')) ? (
                      <div className="w-full h-full rounded-2xl overflow-hidden bg-white/95 p-1 flex items-center justify-center shadow-lg pointer-events-none select-none border border-slate-200 ring-2 ring-emerald-500/20">
                        <img
                          src={el.imageUrl || el.content}
                          alt="Company Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        style={{ background: el.color || 'linear-gradient(135deg, #059669, #0d9488)' }}
                        className="w-full h-full rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg pointer-events-none select-none ring-2 ring-white/30"
                      >
                        {el.logoText || el.content || 'Q'}
                      </div>
                    )
                  )}

                  {el.type === 'qr' && (
                    <div className="w-full h-full p-2 bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center pointer-events-none select-none">
                      <div className="text-3xl leading-none">▦</div>
                      <span className="text-[7px] font-bold text-emerald-600 mt-1">{el.qrLabel || 'VERIFIED'}</span>
                    </div>
                  )}

                  {el.type === 'text' && (
                    <div
                      style={{
                        fontSize: `${el.fontSize || 12}px`,
                        fontWeight: el.isBold ? 700 : 400,
                        color: el.color || '#1e293b',
                      }}
                      className={
                        isPreviewMode
                          ? 'p-0'
                          : 'p-1.5 bg-white/90 rounded border border-dashed border-slate-300 min-w-[120px]'
                      }
                    >
                      {el.content || 'Editable text block'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Action Bar in Preview Mode */}
          {isPreviewMode && (
            <div className="mt-6 mb-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsPreviewMode(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Return to Edit Mode</span>
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print Clean PDF</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Element & Document Inspector */}
        {!isPreviewMode && (
          <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 space-y-4 overflow-y-auto shrink-0 text-xs select-none">
          {/* Dual Tabs: Selected Element vs Document Details */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              type="button"
              onClick={() => setInspectorTab('element')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                inspectorTab === 'element'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Selected Element
            </button>
            <button
              type="button"
              onClick={() => setInspectorTab('document')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                inspectorTab === 'document'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Document Details
            </button>
          </div>

          {inspectorTab === 'element' ? (
            <div>
              {selectedElement ? (
                <div className="space-y-3.5 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                    <span className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{selectedElement.type} Element</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDuplicateElement(selectedElement.id)}
                        className="text-slate-400 hover:text-white text-[11px] font-semibold cursor-pointer p-1 rounded hover:bg-slate-700"
                        title="Duplicate element"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold cursor-pointer p-1 rounded hover:bg-rose-500/20"
                        title="Delete element"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEditingElementId(selectedElement.id)}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Open Full Editor</span>
                  </button>

                  {/* Position & Size */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <label className="text-slate-400 block mb-1">X Position (px)</label>
                      <input
                        type="number"
                        value={selectedElement.x}
                        onChange={(e) => updateSelectedElement({ x: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Y Position (px)</label>
                      <input
                        type="number"
                        value={selectedElement.y}
                        onChange={(e) => updateSelectedElement({ y: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Width (px)</label>
                      <input
                        type="number"
                        value={selectedElement.width || 100}
                        onChange={(e) => updateSelectedElement({ width: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Height (px)</label>
                      <input
                        type="number"
                        value={selectedElement.height || 60}
                        onChange={(e) => updateSelectedElement({ height: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  {/* Signature-Specific Properties */}
                  {selectedElement.type === 'signature' && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div>
                        <label className="text-slate-400 block mb-1">Signee Name</label>
                        <input
                          type="text"
                          value={selectedElement.signeeName || (selectedElement.signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta')}
                          onChange={(e) => updateSelectedElement({ signeeName: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Designation / Role</label>
                        <input
                          type="text"
                          value={selectedElement.signeeRole || (selectedElement.signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director')}
                          onChange={(e) => updateSelectedElement({ signeeRole: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Seal-Specific Properties */}
                  {selectedElement.type === 'seal' && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div>
                        <label className="text-slate-400 block mb-1">Seal Heading</label>
                        <input
                          type="text"
                          value={selectedElement.sealTitle || '★ OFFICIAL ★'}
                          onChange={(e) => updateSelectedElement({ sealTitle: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Seal Subtext</label>
                        <input
                          type="text"
                          value={selectedElement.sealSubtext || 'VERIFIED SEAL'}
                          onChange={(e) => updateSelectedElement({ sealSubtext: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">Seal Color</label>
                        <div className="flex gap-2">
                          {['#059669', '#0284c7', '#dc2626', '#d97706', '#7c3aed', '#0f172a'].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => updateSelectedElement({ color: col })}
                              style={{ backgroundColor: col }}
                              className={`w-6 h-6 rounded-full border-2 ${
                                selectedElement.color === col ? 'border-white scale-110' : 'border-transparent'
                              } cursor-pointer transition-transform`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text-Specific Properties */}
                  {selectedElement.type === 'text' && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div>
                        <label className="text-slate-400 block mb-1">Text Content</label>
                        <textarea
                          rows={2}
                          value={selectedElement.content || ''}
                          onChange={(e) => updateSelectedElement({ content: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 block mb-1">Size (px)</label>
                          <input
                            type="number"
                            min="10"
                            max="36"
                            value={selectedElement.fontSize || 12}
                            onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 block mb-1">Weight</label>
                          <button
                            type="button"
                            onClick={() => updateSelectedElement({ isBold: !selectedElement.isBold })}
                            className={`w-full py-1 rounded text-xs font-bold border cursor-pointer ${
                              selectedElement.isBold
                                ? 'bg-emerald-600 border-emerald-500 text-white'
                                : 'bg-slate-900 border-slate-700 text-slate-300'
                            }`}
                          >
                            {selectedElement.isBold ? 'Bold' : 'Normal'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Logo-Specific Properties */}
                  {selectedElement.type === 'logo' && (
                    <div className="space-y-3 pt-2 border-t border-slate-700">
                      {/* Upload Company Icon File */}
                      <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-slate-300 font-bold text-[11px] flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Company Icon / Logo</span>
                          </label>
                          {selectedElement.imageUrl && (
                            <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded">
                              File Active
                            </span>
                          )}
                        </div>

                        {selectedElement.imageUrl || (selectedElement.content && selectedElement.content.startsWith('data:image')) ? (
                          <div className="space-y-2">
                            <div className="w-full h-16 bg-white/95 rounded-lg border border-slate-600 flex items-center justify-center p-1.5">
                              <img
                                src={selectedElement.imageUrl || selectedElement.content}
                                alt="Logo Preview"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setLogoUploadTargetId(selectedElement.id);
                                  logoFileInputRef.current?.click();
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Change File</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSelectedElement({ imageUrl: undefined, content: selectedElement.logoText || 'Q' });
                                  addToast('Reset logo to emblem initials', 'info');
                                }}
                                className="py-1 px-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-[10px] font-semibold cursor-pointer transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setLogoUploadTargetId(selectedElement.id);
                              logoFileInputRef.current?.click();
                            }}
                            className="w-full py-2 px-2.5 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Icon (PNG/JPG)</span>
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Emblem Initials (Fallback)</label>
                        <input
                          type="text"
                          maxLength={6}
                          value={selectedElement.logoText || (selectedElement.content && !selectedElement.content.startsWith('data:image') ? selectedElement.content : 'Q')}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateSelectedElement({
                              logoText: val,
                              content: selectedElement.imageUrl ? selectedElement.content : val,
                            });
                          }}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                          placeholder="e.g. Q, QV, QBS"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Theme Color</label>
                        <div className="flex gap-2">
                          {['#059669', '#0284c7', '#7c3aed', '#dc2626', '#0f172a'].map((col) => (
                            <button
                              key={col}
                              type="button"
                              onClick={() => updateSelectedElement({ color: col })}
                              style={{ backgroundColor: col }}
                              className={`w-6 h-6 rounded-full border-2 ${
                                selectedElement.color === col ? 'border-white scale-110' : 'border-transparent'
                              } cursor-pointer transition-transform`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QR-Specific Properties */}
                  {selectedElement.type === 'qr' && (
                    <div className="space-y-2 pt-2 border-t border-slate-700">
                      <div>
                        <label className="text-slate-400 block mb-1">Verification Label</label>
                        <input
                          type="text"
                          value={selectedElement.qrLabel || 'VERIFIED'}
                          onChange={(e) => updateSelectedElement({ qrLabel: e.target.value })}
                          className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-slate-400 text-center">
                    <p className="font-semibold text-slate-300 mb-1">No Element Selected</p>
                    <p className="text-[11px]">
                      Click any element on the document to edit its properties, or drag elements from the left palette onto the page.
                    </p>
                  </div>

                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 space-y-2">
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">
                      Quick Add to Document
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddSeal('official_circle')}
                        className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-left text-[11px] font-medium cursor-pointer"
                      >
                        + Official Seal
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSignature('director')}
                        className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-left text-[11px] font-medium cursor-pointer"
                      >
                        + Signature
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLogo}
                        className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-left text-[11px] font-medium cursor-pointer"
                      >
                        + Logo
                      </button>
                      <button
                        type="button"
                        onClick={handleAddQr}
                        className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-200 text-left text-[11px] font-medium cursor-pointer"
                      >
                        + QR Code
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Document Details Tab */
            <div className="space-y-3 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <span className="font-bold text-emerald-400 uppercase text-[11px] flex items-center gap-1.5 border-b border-slate-700 pb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Document Details</span>
              </span>

              <div>
                <label className="text-slate-400 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={doc.title}
                  onChange={(e) => setDoc({ ...doc, title: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Company Letterhead Name</label>
                <input
                  type="text"
                  value={doc.companyName}
                  onChange={(e) => setDoc({ ...doc, companyName: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Company Address</label>
                <input
                  type="text"
                  value={doc.companyAddress}
                  onChange={(e) => setDoc({ ...doc, companyAddress: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Ref Number</label>
                  <input
                    type="text"
                    value={doc.referenceNumber}
                    onChange={(e) => setDoc({ ...doc, referenceNumber: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Date</label>
                  <input
                    type="text"
                    value={doc.dateStr}
                    onChange={(e) => setDoc({ ...doc, dateStr: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Recipient Name</label>
                <input
                  type="text"
                  value={doc.recipientName}
                  onChange={(e) => setDoc({ ...doc, recipientName: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Subject</label>
                <input
                  type="text"
                  value={doc.subject || ''}
                  onChange={(e) => setDoc({ ...doc, subject: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                />
              </div>

              {/* Watermark Controls */}
              <div className="pt-2 border-t border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Watermark</label>
                  <button
                    type="button"
                    onClick={() => setDoc({ ...doc, showWatermark: !doc.showWatermark })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      doc.showWatermark ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {doc.showWatermark ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                {doc.showWatermark && (
                  <>
                    <input
                      type="text"
                      value={doc.watermarkText || 'CONFIDENTIAL'}
                      onChange={(e) => setDoc({ ...doc, watermarkText: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs"
                    />
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                        <span>Opacity</span>
                        <span>{Math.round((doc.watermarkOpacity || 0.08) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.30"
                        step="0.01"
                        value={doc.watermarkOpacity || 0.08}
                        onChange={(e) => setDoc({ ...doc, watermarkOpacity: Number(e.target.value) })}
                        className="w-full cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      {/* Quick Edit Element Modal */}
      {editingElement && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setEditingElementId(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white capitalize">
                    Edit {editingElement.type === 'signature' ? 'Signature' : editingElement.type === 'seal' ? 'Official Seal' : editingElement.type === 'qr' ? 'QR Code' : editingElement.type === 'logo' ? 'Logo' : 'Text Block'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Update content and appearance</p>
                </div>
              </div>
              <button
                onClick={() => setEditingElementId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Signature Edit Controls */}
            {editingElement.type === 'signature' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Signee Name
                  </label>
                  <input
                    type="text"
                    value={editingElement.signeeName || (editingElement.signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta')}
                    onChange={(e) => updateEditingElement({ signeeName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter name (e.g. Rahul V. Mehta)"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 self-center mr-1">Quick Name:</span>
                    {[
                      { name: 'Rahul V. Mehta', role: 'Operations Director' },
                      { name: 'S. Sharma', role: 'HR & Admin Manager' },
                      { name: 'Mohammed Al-Rashid', role: 'Managing Director' },
                      { name: 'Dr. K. Narayanan', role: 'Authorized Signatory' },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => updateEditingElement({ signeeName: preset.name, signeeRole: preset.role })}
                        className="text-[10px] px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={editingElement.signeeRole || (editingElement.signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director')}
                    onChange={(e) => updateEditingElement({ signeeRole: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Operations Director, Branch Manager"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Signature Style
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => updateEditingElement({ signatureType: 'director' })}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        editingElement.signatureType === 'director' || !editingElement.signatureType
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-serif italic text-base">Rahul</div>
                      <div className="text-[10px]">Cursive</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateEditingElement({ signatureType: 'manager' })}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        editingElement.signatureType === 'manager'
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-sans italic font-bold text-base">Sharma</div>
                      <div className="text-[10px]">Modern</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDrawingSig(true);
                      }}
                      className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                        editingElement.signatureType === 'custom_drawn'
                          ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                          : 'border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <PenTool className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                      <div className="text-[10px]">Draw Hand</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Seal Edit Controls */}
            {editingElement.type === 'seal' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Seal Top Heading
                  </label>
                  <input
                    type="text"
                    value={editingElement.sealTitle || '★ OFFICIAL ★'}
                    onChange={(e) => updateEditingElement({ sealTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. ★ OFFICIAL ★"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['★ OFFICIAL ★', '★ APPROVED ★', '★ PAID ★', '★ VERIFIED ★', '★ CONFIDENTIAL ★'].map((title) => (
                      <button
                        key={title}
                        type="button"
                        onClick={() => updateEditingElement({ sealTitle: title })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        {title}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Seal Center Text
                  </label>
                  <input
                    type="text"
                    value={
                      editingElement.sealSubtext ||
                      (editingElement.sealType === 'paid' ? 'PAID & SETTLED' : editingElement.sealType === 'approved' ? 'APPROVED' : 'VERIFIED SEAL')
                    }
                    onChange={(e) => updateEditingElement({ sealSubtext: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. VERIFIED SEAL, PAID & SETTLED"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['VERIFIED SEAL', 'PAID & SETTLED', 'MANAGEMENT SANCTIONED', 'AUDITED & CLEARED', 'ORIGINAL COPY'].map((sub) => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => updateEditingElement({ sealSubtext: sub })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Seal Bottom Note
                  </label>
                  <input
                    type="text"
                    value={editingElement.sealBottomText || 'GOVT REGD KL'}
                    onChange={(e) => updateEditingElement({ sealBottomText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. GOVT REGD KL, QIYAM VENTURES"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Seal Stamp Color
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { col: '#059669', name: 'Emerald Green' },
                      { col: '#0284c7', name: 'Sapphire Blue' },
                      { col: '#dc2626', name: 'Crimson Red' },
                      { col: '#d97706', name: 'Amber Gold' },
                      { col: '#7c3aed', name: 'Royal Purple' },
                      { col: '#0f172a', name: 'Dark Slate' },
                    ].map((c) => (
                      <button
                        key={c.col}
                        type="button"
                        title={c.name}
                        onClick={() => updateEditingElement({ color: c.col })}
                        style={{ backgroundColor: c.col }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          editingElement.color === c.col ? 'border-white scale-110 shadow-lg' : 'border-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Text Block Edit Controls */}
            {editingElement.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={3}
                    value={editingElement.content || ''}
                    onChange={(e) => updateEditingElement({ content: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="Enter custom text..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Font Size ({editingElement.fontSize || 12}px)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="36"
                      value={editingElement.fontSize || 12}
                      onChange={(e) => updateEditingElement({ fontSize: Number(e.target.value) })}
                      className="w-full cursor-pointer accent-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Text Style
                    </label>
                    <button
                      type="button"
                      onClick={() => updateEditingElement({ isBold: !editingElement.isBold })}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        editingElement.isBold
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {editingElement.isBold ? 'Bold (Active)' : 'Normal Weight'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    {['#1e293b', '#059669', '#0284c7', '#dc2626', '#d97706', '#64748b'].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => updateEditingElement({ color: col })}
                        style={{ backgroundColor: col }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          editingElement.color === col ? 'border-white scale-110 shadow-lg' : 'border-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Logo Edit Controls */}
            {editingElement.type === 'logo' && (
              <div className="space-y-4">
                {/* Upload Logo Image File */}
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-indigo-400" />
                        <span>Upload Company Icon / Logo File</span>
                      </label>
                      <p className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, JPEG, SVG, WebP</p>
                    </div>
                    {(editingElement.imageUrl || (editingElement.content && editingElement.content.startsWith('data:image'))) && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Active File
                      </span>
                    )}
                  </div>

                  {editingElement.imageUrl || (editingElement.content && editingElement.content.startsWith('data:image')) ? (
                    <div className="space-y-2">
                      <div className="w-full h-24 bg-white/95 rounded-xl border-2 border-dashed border-indigo-500/50 flex items-center justify-center p-2">
                        <img
                          src={editingElement.imageUrl || editingElement.content}
                          alt="Company Logo Preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLogoUploadTargetId(editingElement.id);
                            logoFileInputRef.current?.click();
                          }}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Another File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            updateEditingElement({ imageUrl: undefined, content: editingElement.logoText || 'Q' });
                            addToast('Removed icon image. Using emblem letter.', 'info');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Remove File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setLogoUploadTargetId(editingElement.id);
                        logoFileInputRef.current?.click();
                      }}
                      className="border-2 border-dashed border-slate-600 hover:border-indigo-500/80 bg-slate-800/60 hover:bg-indigo-950/20 rounded-xl p-4 text-center cursor-pointer transition-all group"
                    >
                      <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                        Click here to upload your company logo file
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Recommended: PNG or SVG with transparent background</p>
                    </div>
                  )}
                </div>

                {/* Fallback Letter Initials */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Emblem Letter or Initials (Used if no file is uploaded)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editingElement.logoText || (editingElement.content && !editingElement.content.startsWith('data:image') ? editingElement.content : 'Q')}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateEditingElement({
                        logoText: val,
                        content: editingElement.imageUrl ? editingElement.content : val,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. Q, QV, QBS"
                  />
                </div>

                {/* Color Palette */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Emblem Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { col: '#059669', name: 'Emerald' },
                      { col: '#0284c7', name: 'Blue' },
                      { col: '#7c3aed', name: 'Purple' },
                      { col: '#0f172a', name: 'Dark' },
                      { col: '#dc2626', name: 'Red' },
                    ].map((c) => (
                      <button
                        key={c.col}
                        type="button"
                        onClick={() => updateEditingElement({ color: c.col })}
                        style={{ backgroundColor: c.col }}
                        className={`w-7 h-7 rounded-full border-2 cursor-pointer ${
                          editingElement.color === c.col ? 'border-white scale-110 shadow-lg' : 'border-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Edit Controls */}
            {editingElement.type === 'qr' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Verification Badge Label
                  </label>
                  <input
                    type="text"
                    value={editingElement.qrLabel || 'VERIFIED'}
                    onChange={(e) => updateEditingElement({ qrLabel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. VERIFIED, SCAN TO CHECK"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['VERIFIED', 'SCAN TO AUTH', 'SECURE QR', 'OFFICIAL'].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => updateEditingElement({ qrLabel: lbl })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer"
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dimensions & Position controls */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Width (px)</label>
                <input
                  type="number"
                  value={editingElement.width || 100}
                  onChange={(e) => updateEditingElement({ width: Math.max(30, Number(e.target.value)) })}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Height (px)</label>
                <input
                  type="number"
                  value={editingElement.height || 100}
                  onChange={(e) => updateEditingElement({ height: Math.max(30, Number(e.target.value)) })}
                  className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  handleDeleteElement(editingElement.id);
                  setEditingElementId(null);
                }}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Element</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDuplicateElement(editingElement.id);
                    setEditingElementId(null);
                  }}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingElementId(null);
                    addToast('Element updated successfully!', 'success');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Drawing Modal */}
      {isDrawingSig && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Draw Your Signature</h3>
              <button
                onClick={() => setIsDrawingSig(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">Draw your signature with your mouse or finger inside the box:</p>

            <div className="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 p-1">
              <canvas
                ref={sigCanvasRef}
                width={320}
                height={140}
                onMouseDown={(e) => {
                  const ctx = sigCanvasRef.current?.getContext('2d');
                  if (!ctx) return;
                  ctx.beginPath();
                  ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  setIsSigEmpty(false);
                }}
                onMouseMove={(e) => {
                  if (e.buttons !== 1) return;
                  const ctx = sigCanvasRef.current?.getContext('2d');
                  if (!ctx) return;
                  ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                  ctx.stroke();
                }}
                className="w-full h-[140px] cursor-crosshair"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  const ctx = sigCanvasRef.current?.getContext('2d');
                  if (ctx && sigCanvasRef.current) {
                    ctx.clearRect(0, 0, sigCanvasRef.current.width, sigCanvasRef.current.height);
                    setIsSigEmpty(true);
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Clear
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawingSig(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDrawnSig}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Apply Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdvancedPdfEditorModal: React.FC = () => {
  const { isPdfEditorOpen, pdfEditorDocument } = useQiyamStore();

  if (!isPdfEditorOpen || !pdfEditorDocument) return null;

  return (
    <AdvancedPdfEditorContent
      key={`${pdfEditorDocument.type}-${pdfEditorDocument.referenceNumber || ''}-${pdfEditorDocument.title || ''}`}
      initialDoc={pdfEditorDocument}
    />
  );
};
