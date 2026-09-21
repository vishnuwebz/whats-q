import React, { useState, useEffect } from 'react';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  AlertTriangle,
  Trash2,
  Unlink,
  Info,
  LogOut,
  X,
  Loader2,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

export const GlobalGeneralConfirmationModal: React.FC = () => {
  const { generalConfirmation, closeGeneralConfirmation } = useQiyamStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && generalConfirmation && !isSubmitting) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generalConfirmation, isSubmitting]);

  if (!generalConfirmation) return null;

  const {
    title = 'Are you sure?',
    message,
    description,
    variant = 'danger',
    icon = 'trash',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    itemBadge,
    onConfirm,
    onCancel,
  } = generalConfirmation;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm();
    } catch (err) {
      console.error('Error during confirmation execution:', err);
    } finally {
      setIsSubmitting(false);
      closeGeneralConfirmation();
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    if (onCancel) {
      onCancel();
    }
    closeGeneralConfirmation();
  };

  // Select header icon
  const renderIcon = () => {
    const iconClass = 'w-6 h-6 stroke-[2.2]';
    switch (icon) {
      case 'unlink':
        return <Unlink className={iconClass} />;
      case 'alert':
        return <AlertTriangle className={iconClass} />;
      case 'info':
        return <Info className={iconClass} />;
      case 'logout':
        return <LogOut className={iconClass} />;
      case 'trash':
      default:
        return <Trash2 className={iconClass} />;
    }
  };

  // Styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          topBar: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500',
          iconBg: 'bg-amber-50 border-amber-200 text-amber-600',
          confirmBtn:
            'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20 focus:ring-amber-500',
        };
      case 'info':
      case 'primary':
        return {
          topBar: 'bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500',
          iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-600',
          confirmBtn:
            'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 focus:ring-emerald-500',
        };
      case 'danger':
      default:
        return {
          topBar: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600',
          iconBg: 'bg-rose-50 border-rose-200 text-rose-600',
          confirmBtn:
            'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20 focus:ring-rose-500',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-[999999] overflow-y-auto p-4 flex items-center justify-center min-h-screen bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md my-auto bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Gradient Bar */}
        <div className={`h-1.5 w-full ${styles.topBar}`} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          className="absolute top-3.5 right-3.5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50 z-10"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 flex flex-col items-center text-center">
          {/* Main Animated Icon Header */}
          <div className="relative mb-3.5">
            <div
              className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-xs transition-transform ${styles.iconBg}`}
            >
              {renderIcon()}
            </div>
            {variant === 'danger' && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 border-2 border-white" />
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
            {title}
          </h3>

          {/* Primary Message */}
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-normal">
            {message}
          </p>

          {/* Target Item Badge (e.g. Phone line details) */}
          {itemBadge && (
            <div className="w-full mt-4 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 flex items-center gap-3 text-left shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm truncate">
                    {itemBadge.label || 'WhatsApp Line'}
                  </span>
                  {itemBadge.badgeText && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 tracking-wide">
                      {itemBadge.badgeText}
                    </span>
                  )}
                </div>
                {itemBadge.sublabel && (
                  <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                    {itemBadge.sublabel}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Optional secondary description or consequence warning */}
          {description && (
            <div className="w-full mt-3 px-3 py-2 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-2 text-left">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 leading-relaxed font-medium">
                {description}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="w-full mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all cursor-pointer disabled:opacity-50 hover:border-slate-300"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.confirmBtn}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmLabel}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
