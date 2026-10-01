import React, { useState, useEffect } from 'react';
import { Conversation } from '@/types';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { Trash2, X, MessageSquare, ShieldAlert, AlertOctagon, Loader2, RotateCcw } from 'lucide-react';

interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onConfirmDelete: (id: string | number, permanent?: boolean) => Promise<void>;
  isPermanent?: boolean;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onConfirmDelete,
  isPermanent = false,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPermanentMode, setIsPermanentMode] = useState(isPermanent);

  // Sync mode whenever modal opens or props change
  useEffect(() => {
    setIsPermanentMode(Boolean(isPermanent || conversation?.is_deleted));
  }, [isOpen, isPermanent, conversation?.is_deleted]);

  if (!isOpen || !conversation) return null;

  const contactName = conversation.contact_name || 'Customer';
  const phoneNumber = conversation.phone_number || 'Unknown Number';
  const messageCount = conversation.messages?.length || 0;

  const handleDelete = () => {
    // Instantly close modal — 0ms wait for snappy user experience
    onClose();
    // Fire deletion optimistically in background
    onConfirmDelete(conversation.id, isPermanentMode).catch((e) => {
      console.error('Failed to delete conversation:', e);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Warning Icon Badge */}
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 ring-8 shadow-xs transition-colors ${
              isPermanentMode
                ? 'bg-rose-50 border-rose-200 text-rose-600 ring-rose-50/60'
                : 'bg-amber-50 border-amber-200 text-amber-600 ring-amber-50/60'
            }`}
          >
            <Trash2 className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="text-center space-y-1.5 mb-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isPermanentMode ? 'Delete Permanently?' : 'Move to Trash?'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {isPermanentMode
                ? 'Are you sure you want to permanently delete this chat? All message history will be purged completely and cannot be recovered.'
                : 'Are you sure you want to move this conversation to Trash? You can retrieve it anytime from the Trash tab.'}
            </p>
          </div>

          {/* Conversation Summary Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-4 space-y-2.5">
            <div className="flex items-center gap-3">
              <CustomerAvatar conversation={conversation} size="md" showPresence={false} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {contactName}
                  </h4>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {conversation.category || 'Lead'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {phoneNumber}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Total Messages:</span>
              </span>
              <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200/70">
                {messageCount} {messageCount === 1 ? 'message' : 'messages'}
              </span>
            </div>

            {conversation.service_needed && (
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span className="text-slate-400">Service:</span>
                <span className="font-semibold text-slate-800">
                  {conversation.service_needed}
                </span>
              </div>
            )}
          </div>

          {/* Contextual Notice Banner */}
          {isPermanentMode ? (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-50/90 border border-rose-200/90 text-rose-950 text-xs mb-6">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold text-rose-900">Permanent Purge &amp; Fresh Start:</span>{' '}
                This conversation and its entire chat transcript will be permanently erased. If{' '}
                <strong>{contactName}</strong> starts to chat again, it will be added as a{' '}
                <strong>fresh new chat</strong> with zero past messages.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs mb-6">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Safe Archival:</span> This conversation will be removed from your active inbox and moved to the Trash tab. All previous messages remain safely preserved. You can retrieve it at any time.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center disabled:opacity-50"
            >
              {conversation.is_deleted ? 'Keep in Trash' : 'Keep Conversation'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className={`flex-1 py-2.5 px-4 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98] ${
                isPermanentMode
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-700/25'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-700/25'
              }`}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isPermanentMode ? 'Deleting...' : 'Moving...'}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{isPermanentMode ? 'Delete Permanently' : 'Move to Trash'}</span>
                </>
              )}
            </button>
          </div>

          {/* Switch Mode Link if in regular Move-to-Trash mode */}
          {!conversation.is_deleted && !isPermanent && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setIsPermanentMode(!isPermanentMode)}
                className="text-[11px] text-slate-400 hover:text-rose-600 transition-colors underline cursor-pointer"
              >
                {isPermanentMode
                  ? '← Switch to Move to Trash instead'
                  : 'Permanently delete this chat instead (skip Trash)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
