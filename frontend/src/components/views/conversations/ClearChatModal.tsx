import React, { useState } from 'react';
import { Conversation } from '@/types';
import { CustomerAvatar } from '@/components/common/CustomerAvatar';
import { RotateCcw, X, MessageSquare, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

interface ClearChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation | null;
  onConfirmClear: (id: string | number) => Promise<void>;
}

export const ClearChatModal: React.FC<ClearChatModalProps> = ({
  isOpen,
  onClose,
  conversation,
  onConfirmClear,
}) => {
  const [isClearing, setIsClearing] = useState(false);

  if (!isOpen || !conversation) return null;

  const contactName = conversation.contact_name || 'Customer';
  const phoneNumber = conversation.phone_number || 'Unknown Number';
  const messageCount = conversation.messages?.length || 0;

  const handleClear = () => {
    // Instantly close modal for snappy UI feel
    onClose();
    // Execute chat clearance optimistically
    onConfirmClear(conversation.id).catch((e) => {
      console.error('Failed to clear conversation chat:', e);
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
          disabled={isClearing}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-7">
          {/* Header Icon Badge */}
          <div className="w-14 h-14 rounded-2xl border bg-amber-50 border-amber-200 text-amber-600 ring-8 ring-amber-50/60 shadow-xs flex items-center justify-center mx-auto mb-4">
            <RotateCcw className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="text-center space-y-1.5 mb-5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Clear Complete Chat?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              Start a fresh new conversation from scratch with <span className="font-semibold text-slate-700">{contactName}</span>.
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
                <span>Messages to be cleared:</span>
              </span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                {messageCount} {messageCount === 1 ? 'message' : 'messages'}
              </span>
            </div>

            {conversation.lead_owner && conversation.lead_owner !== 'Unassigned' && (
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span className="text-slate-400">Assigned Agent:</span>
                <span className="font-semibold text-slate-800">
                  {conversation.lead_owner}
                </span>
              </div>
            )}
          </div>

          {/* Explanation Banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-950 text-xs mb-6">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-amber-900">Fresh Conversation Start:</span>{' '}
              All previous chat messages will be wiped clean. The customer contact stays active in your inbox, and any incoming or outgoing messages will begin as a brand new discussion from scratch.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isClearing}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer text-center disabled:opacity-50"
            >
              Keep Messages
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isClearing}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-amber-700/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Chat &amp; Start Fresh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
