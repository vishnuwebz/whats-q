import React, { useState } from 'react';
import { Conversation } from '@/types';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { Trash2, X, MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';

interface DeleteConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onConfirmDelete: (id: string | number) => Promise<void>;
}

export const DeleteConversationModal: React.FC<DeleteConversationModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !conversation) return null;

  const contactName = conversation.contact_name || 'Customer';
  const phoneNumber = conversation.phone_number || 'Unknown Number';
  const messageCount = conversation.messages?.length || 0;

  const handleDelete = () => {
    // Instantly close modal — 0ms wait for snappy user experience
    onClose();
    // Fire deletion optimistically in background
    onConfirmDelete(conversation.id).catch((e) => {
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
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-red-50/50 shadow-xs">
            <Trash2 className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="text-center space-y-1.5 mb-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Delete Conversation?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Are you sure you want to permanently delete this chat thread? This is useful for clearing test chats, duplicates, or spam conversations.
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

          {/* Warning Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs mb-6">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Permanent Deletion:</span> All messages, timeline notes, and attachments associated with this chat will be removed from your shared inbox and database. This cannot be undone.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center disabled:opacity-50"
            >
              Keep Conversation
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-700/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Conversation</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
