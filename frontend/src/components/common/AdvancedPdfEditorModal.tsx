import React, { useState, useRef, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import { PdfEditorDocument, PdfCanvasElement } from '@/types';
import {
  Printer, Download, X, Move, Plus, Trash2, RotateCcw,
  CheckCircle2, ShieldCheck, Award, FileText, Image as ImageIcon,
  Edit3, ZoomIn, ZoomOut, Grid, Eye, Sparkles, PenTool,
  QrCode, Stamp, Layers, Sliders, Type, Check, RefreshCw
} from 'lucide-react';

export const AdvancedPdfEditorModal: React.FC = () => {
  const { isPdfEditorOpen, pdfEditorDocument, closePdfEditor, addToast } = useQiyamStore();

  if (!isPdfEditorOpen || !pdfEditorDocument) return null;

  // Local document state
  const [doc, setDoc] = useState<PdfEditorDocument>(pdfEditorDocument);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isDrawingSig, setIsDrawingSig] = useState<boolean>(false);

  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isSigEmpty, setIsSigEmpty] = useState(true);

  // Sync when pdfEditorDocument changes
  useEffect(() => {
    if (pdfEditorDocument) {
      setDoc(pdfEditorDocument);
    }
  }, [pdfEditorDocument]);

  // Selected element helper
  const selectedElement = doc.elements.find((el) => el.id === selectedElementId) || null;

  // Handle Drag Start
  const handleMouseDownElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedElementId(id);
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

  // Add Elements
  const handleAddSeal = (sealType: PdfCanvasElement['sealType'] = 'official_circle') => {
    const newId = `seal-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'seal',
      sealType,
      x: 550,
      y: 750,
      width: 110,
      height: 110,
      color: sealType === 'official_circle' ? '#059669' : sealType === 'paid' ? '#0284c7' : '#dc2626',
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    addToast('Official seal added! Drag to position.', 'info');
  };

  const handleAddSignature = (signatureType: PdfCanvasElement['signatureType'] = 'director') => {
    const newId = `sig-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'signature',
      signatureType,
      x: 80,
      y: 800,
      width: 150,
      height: 55,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    addToast('Signature added! Drag anywhere.', 'info');
  };

  const handleAddLogo = () => {
    const newId = `logo-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'logo',
      x: 40,
      y: 35,
      width: 56,
      height: 56,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
    addToast('Company logo added to canvas.', 'info');
  };

  const handleAddQr = () => {
    const newId = `qr-${Date.now()}`;
    const newElement: PdfCanvasElement = {
      id: newId,
      type: 'qr',
      x: 640,
      y: 35,
      width: 65,
      height: 65,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setSelectedElementId(newId);
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
    addToast('Editable text block added.', 'info');
  };

  const handleDeleteElement = (id: string) => {
    setDoc((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
    }));
    if (selectedElementId === id) setSelectedElementId(null);
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
      x: 100,
      y: 820,
      width: 140,
      height: 50,
    };
    setDoc((prev) => ({ ...prev, elements: [...prev.elements, newElement] }));
    setIsDrawingSig(false);
    setSelectedElementId(newId);
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
                      <span>★ OFFICIAL ★</span>
                      <span style="font-size: 8px;">VERIFIED SEAL</span>
                      <span style="font-size: 7px;">GOVT REGD</span>
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
                      ${el.signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta'}
                    </div>
                    <div style="font-size: 10px; font-weight: 700; color: #475569; margin-top: 3px;">
                      ${el.signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director'}
                    </div>
                  </div>
                `;
              }
              if (el.type === 'logo') {
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; background: linear-gradient(135deg, #059669, #0d9488); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 900; font-size: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    Q
                  </div>
                `;
              }
              if (el.type === 'qr') {
                return `
                  <div class="canvas-element" style="left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px; border: 1px solid #cbd5e1; padding: 4px; border-radius: 8px; background: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div style="font-size: 28px; line-height: 1;">▦</div>
                    <div style="font-size: 7px; font-weight: 700; color: #059669; margin-top: 2px;">VERIFIED</div>
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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Studio Control Bar */}
      <div className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0 gap-3 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Edit3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">2026+ Visual PDF Studio</span>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                DRAG & DROP
              </span>
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
        <div className="w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 select-none text-xs">
          <div>
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2.5">
              Add Drag-and-Drop Elements
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => handleAddSeal('official_circle')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-emerald-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Stamp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Official Seal</div>
                    <div className="text-[10px] text-slate-400">Government / Company Stamp</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={() => handleAddSeal('paid')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-blue-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Paid & Verified Stamp</div>
                    <div className="text-[10px] text-slate-400">UPI / Cash Settled Seal</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-blue-400" />
              </button>

              <button
                onClick={() => handleAddSignature('director')}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-purple-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Director Signature</div>
                    <div className="text-[10px] text-slate-400">Digital Signatory</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-purple-400" />
              </button>

              <button
                onClick={handleStartDrawSig}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-amber-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Draw Your Signature</div>
                    <div className="text-[10px] text-slate-400">Interactive drawing pad</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-amber-400" />
              </button>

              <button
                onClick={handleAddLogo}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-emerald-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Company Logo</div>
                    <div className="text-[10px] text-slate-400">Qiyam Emerald Emblem</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                onClick={handleAddQr}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-teal-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Security QR Code</div>
                    <div className="text-[10px] text-slate-400">Digital verification badge</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-teal-400" />
              </button>

              <button
                onClick={handleAddCustomText}
                className="w-full p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center justify-between text-left cursor-pointer transition-all hover:border-cyan-500"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Type className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-200">Custom Text Block</div>
                    <div className="text-[10px] text-slate-400">Freeform movable text</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Quick Preset Document Switcher */}
          <div className="pt-3 border-t border-slate-800">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[10px] mb-2">
              Preset Templates
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              <button
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-pointer"
              >
                Joining Letter
              </button>
              <button
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-pointer"
              >
                Tax Invoice
              </button>
              <button
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-pointer"
              >
                Quotation
              </button>
              <button
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
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 text-left cursor-pointer"
              >
                Expense Slip
              </button>
            </div>
          </div>
        </div>

        {/* Center Live A4 Canvas Area */}
        <div
          className="flex-1 bg-slate-950 p-6 overflow-auto flex items-start justify-center"
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          onClick={() => setSelectedElementId(null)}
        >
          <div
            ref={canvasRef}
            style={{
              width: '794px',
              minHeight: '1123px',
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
            className={`bg-white text-slate-900 shadow-2xl rounded-sm p-12 relative select-none transition-shadow ${
              showGrid
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
            <div className="border-b-2 border-slate-300 pb-5 text-center relative z-10">
              <input
                type="text"
                value={doc.companyName}
                onChange={(e) => setDoc({ ...doc, companyName: e.target.value })}
                className="font-extrabold text-xl text-slate-900 tracking-wider text-center w-full focus:bg-slate-50 focus:outline-none rounded px-2"
              />
              <input
                type="text"
                value={doc.companyAddress}
                onChange={(e) => setDoc({ ...doc, companyAddress: e.target.value })}
                className="text-xs text-slate-500 text-center w-full focus:bg-slate-50 focus:outline-none rounded px-2 mt-1"
              />
            </div>

            {/* Ref Number & Date */}
            <div className="flex justify-between items-center text-xs text-slate-600 mt-6 mb-6 relative z-10">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-400">Ref:</span>
                <input
                  type="text"
                  value={doc.referenceNumber}
                  onChange={(e) => setDoc({ ...doc, referenceNumber: e.target.value })}
                  className="font-mono font-bold text-slate-800 focus:bg-slate-50 focus:outline-none rounded px-1 w-52"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-400">Date:</span>
                <input
                  type="text"
                  value={doc.dateStr}
                  onChange={(e) => setDoc({ ...doc, dateStr: e.target.value })}
                  className="font-bold text-slate-800 focus:bg-slate-50 focus:outline-none rounded px-1 w-32 text-right"
                />
              </div>
            </div>

            {/* Recipient Details */}
            <div className="text-xs space-y-1 mb-6 relative z-10">
              <div className="text-slate-500">To,</div>
              <input
                type="text"
                value={doc.recipientName}
                onChange={(e) => setDoc({ ...doc, recipientName: e.target.value })}
                className="font-bold text-sm text-slate-900 focus:bg-slate-50 focus:outline-none rounded px-1 w-full block"
              />
              <input
                type="text"
                value={doc.recipientRole || ''}
                onChange={(e) => setDoc({ ...doc, recipientRole: e.target.value })}
                className="text-slate-600 focus:bg-slate-50 focus:outline-none rounded px-1 w-full block text-xs"
              />
            </div>

            {/* Subject Line */}
            <div className="mb-6 relative z-10">
              <input
                type="text"
                value={doc.subject || ''}
                onChange={(e) => setDoc({ ...doc, subject: e.target.value })}
                className="font-extrabold text-sm text-slate-900 text-center underline tracking-wide w-full focus:bg-slate-50 focus:outline-none rounded px-2"
              />
            </div>

            {/* Body Content */}
            <div className="relative z-10 mb-8">
              <textarea
                rows={6}
                value={doc.bodyContent}
                onChange={(e) => setDoc({ ...doc, bodyContent: e.target.value })}
                className="w-full text-xs text-slate-800 leading-relaxed focus:bg-slate-50 focus:outline-none rounded-lg p-2 resize-y border border-transparent hover:border-slate-200"
              />
            </div>

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
                  onMouseDown={(e) => handleMouseDownElement(e, el.id)}
                  className={`group cursor-move transition-shadow ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 ring-offset-2 rounded-lg'
                      : 'hover:ring-1 hover:ring-slate-400/50'
                  }`}
                >
                  {/* Delete Button for Selected Element */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteElement(el.id);
                      }}
                      className="absolute -top-3 -right-3 p-1 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 cursor-pointer z-30"
                      title="Delete element"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  {/* Element Renderers */}
                  {el.type === 'seal' && (
                    <div
                      style={{ borderColor: el.color || '#059669', color: el.color || '#059669' }}
                      className="w-full h-full border-4 border-dashed rounded-full flex flex-col items-center justify-center text-center p-2 font-black text-[10px] tracking-wider uppercase -rotate-6 shadow-xs bg-white/60 backdrop-blur-xs select-none pointer-events-none"
                    >
                      <span>★ OFFICIAL ★</span>
                      <span className="text-[9px] font-bold">
                        {el.sealType === 'paid' ? 'PAID & SETTLED' : el.sealType === 'approved' ? 'APPROVED' : 'VERIFIED SEAL'}
                      </span>
                      <span className="text-[7px]">GOVT REGD KL</span>
                    </div>
                  )}

                  {el.type === 'signature' && (
                    <div className="w-full h-full pointer-events-none select-none">
                      {el.signatureType === 'custom_drawn' && el.content ? (
                        <img src={el.content} alt="Drawn Signature" className="w-full h-full object-contain" />
                      ) : (
                        <div>
                          <div className="font-serif italic text-2xl text-slate-900 border-b border-slate-400 pb-1">
                            {el.signatureType === 'manager' ? 'S. Sharma' : 'Rahul V. Mehta'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-600 mt-1">
                            {el.signatureType === 'manager' ? 'HR & Admin Manager' : 'Operations Director'}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {el.type === 'logo' && (
                    <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-black text-2xl text-white shadow-lg pointer-events-none select-none ring-2 ring-white/30">
                      Q
                    </div>
                  )}

                  {el.type === 'qr' && (
                    <div className="w-full h-full p-2 bg-white rounded-xl border border-slate-300 shadow-xs flex flex-col items-center justify-center pointer-events-none select-none">
                      <div className="text-3xl leading-none">▦</div>
                      <span className="text-[7px] font-bold text-emerald-600 mt-1">VERIFIED</span>
                    </div>
                  )}

                  {el.type === 'text' && (
                    <div
                      style={{
                        fontSize: `${el.fontSize || 12}px`,
                        fontWeight: el.isBold ? 700 : 400,
                        color: el.color || '#1e293b',
                      }}
                      className="p-1.5 bg-white/80 rounded border border-dashed border-slate-300 min-w-[120px]"
                    >
                      {el.content || 'Editable text block'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Element & Document Inspector */}
        <div className="w-72 bg-slate-900 border-l border-slate-800 p-4 space-y-5 overflow-y-auto shrink-0 text-xs select-none">
          <div>
            <h4 className="font-bold text-slate-300 text-xs flex items-center gap-1.5 mb-3">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Inspector & Properties</span>
            </h4>

            {selectedElement ? (
              <div className="space-y-3.5 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-white uppercase text-[10px]">
                    Element: {selectedElement.type}
                  </span>
                  <button
                    onClick={() => handleDeleteElement(selectedElement.id)}
                    className="text-red-400 hover:text-red-300 text-[11px] font-semibold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <label className="text-slate-400 block mb-1">X Position</label>
                    <input
                      type="number"
                      value={selectedElement.x}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          elements: doc.elements.map((el) =>
                            el.id === selectedElement.id ? { ...el, x: Number(e.target.value) } : el
                          ),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Y Position</label>
                    <input
                      type="number"
                      value={selectedElement.y}
                      onChange={(e) =>
                        setDoc({
                          ...doc,
                          elements: doc.elements.map((el) =>
                            el.id === selectedElement.id ? { ...el, y: Number(e.target.value) } : el
                          ),
                        })
                      }
                      className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                    />
                  </div>
                </div>

                {selectedElement.type === 'seal' && (
                  <div>
                    <label className="text-slate-400 block mb-1">Seal Color</label>
                    <div className="flex gap-2">
                      {['#059669', '#dc2626', '#0284c7', '#d97706'].map((col) => (
                        <button
                          key={col}
                          onClick={() =>
                            setDoc({
                              ...doc,
                              elements: doc.elements.map((el) =>
                                el.id === selectedElement.id ? { ...el, color: col } : el
                              ),
                            })
                          }
                          style={{ backgroundColor: col }}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedElement.color === col ? 'border-white' : 'border-transparent'
                          } cursor-pointer`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <div>
                      <label className="text-slate-400 block mb-1">Text Content</label>
                      <input
                        type="text"
                        value={selectedElement.content || ''}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            elements: doc.elements.map((el) =>
                              el.id === selectedElement.id ? { ...el, content: e.target.value } : el
                            ),
                          })
                        }
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 block mb-1">Font Size (px)</label>
                      <input
                        type="number"
                        min="10"
                        max="32"
                        value={selectedElement.fontSize || 12}
                        onChange={(e) =>
                          setDoc({
                            ...doc,
                            elements: doc.elements.map((el) =>
                              el.id === selectedElement.id ? { ...el, fontSize: Number(e.target.value) } : el
                            ),
                          })
                        }
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 text-slate-400 text-center">
                Click any seal, signature, logo, or text on the canvas to inspect and edit properties.
              </div>
            )}
          </div>

          {/* Watermark Controls */}
          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <h4 className="font-bold text-slate-300 text-[11px]">Watermark Settings</h4>
            <div>
              <label className="text-slate-400 block text-[10px] mb-1">Watermark Text</label>
              <input
                type="text"
                value={doc.watermarkText || 'CONFIDENTIAL'}
                onChange={(e) => setDoc({ ...doc, watermarkText: e.target.value })}
                className="w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="text-slate-400 block text-[10px] mb-1">Opacity</label>
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
          </div>
        </div>
      </div>

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
