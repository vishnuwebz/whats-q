import React, { useState, useRef } from 'react';
import { Conversation } from '@/types';
import { CustomerAvatar, getContactInitials, getAvatarGradient } from '@/components/common/CustomerAvatar';
import { apiClient } from '@/api/client';
import { useQiyamStore } from '@/store/useQiyamStore';
import {
  X, Camera, Upload, Link2, Trash2, CheckCircle2, AlertCircle,
  Sparkles, RefreshCw, ShieldAlert, Image as ImageIcon
} from 'lucide-react';

interface CustomerAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export const CustomerAvatarModal: React.FC<CustomerAvatarModalProps> = ({
  isOpen,
  onClose,
  conversation,
}) => {
  const { applyRealtimeConversation, addToast } = useQiyamStore();
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const contactName = conversation.contact_name || 'Customer';
  const phoneNumber = conversation.phone_number || '';
  const currentAvatar = conversation.avatar || '';
  const hasCustomAvatar = Boolean(
    currentAvatar &&
    currentAvatar.trim().length > 0 &&
    !currentAvatar.includes('unsplash.com') &&
    !currentAvatar.includes('ui-avatars.com')
  );

  const initials = getContactInitials(contactName, phoneNumber);
  const gradient = getAvatarGradient(contactName, phoneNumber);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file size must be less than 5 MB.');
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an image file first.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const res = await apiClient.postFormData(`/conversations/${conversation.id}/sync_profile_picture/`, formData);

      if (res && res.status === 'ok') {
        applyRealtimeConversation({
          id: conversation.id,
          avatar: res.avatar,
        });
        addToast(`Profile picture for ${contactName} updated successfully!`, 'success');
        onClose();
      } else {
        setErrorMessage(res?.error || 'Failed to upload profile picture. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while uploading.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveUrl = async () => {
    const trimmed = imageUrl.trim();
    if (!trimmed) {
      setErrorMessage('Please enter a valid image URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post(`/conversations/${conversation.id}/sync_profile_picture/`, {
        avatar: trimmed,
      });

      if (res && res.status === 'ok') {
        applyRealtimeConversation({
          id: conversation.id,
          avatar: res.avatar,
        });
        addToast(`Profile picture for ${contactName} updated!`, 'success');
        onClose();
      } else {
        setErrorMessage(res?.error || 'Failed to save avatar URL.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating avatar URL.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAvatar = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await apiClient.post(`/conversations/${conversation.id}/sync_profile_picture/`, {
        action: 'clear',
      });

      if (res && res.status === 'ok') {
        applyRealtimeConversation({
          id: conversation.id,
          avatar: '',
        });
        addToast(`Reset to initials fallback avatar (${initials})`, 'info');
        onClose();
      } else {
        setErrorMessage(res?.error || 'Failed to reset profile picture.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resetting avatar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-xl">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">WhatsApp Profile Picture (DP)</h3>
              <p className="text-xs text-slate-500">Manage real customer DP or fallback initials badge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Current Avatar & Customer Overview */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-150">
            <div className="relative">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-500 shadow-md"
                />
              ) : (
                <CustomerAvatar
                  conversation={conversation}
                  size="xl"
                  showPresence={true}
                />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-slate-900 truncate">{contactName}</h4>
              <p className="text-xs text-slate-500 font-mono">{phoneNumber}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  hasCustomAvatar
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                }`}>
                  <Sparkles size={11} />
                  {hasCustomAvatar ? 'Custom WhatsApp Photo Set' : `Initials Badge Fallback (${initials})`}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Note Explaining Meta Cloud API Behavior */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex gap-3 text-xs text-amber-900">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-950">Why wasn't the personal DP fetched automatically?</p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Meta's <strong>WhatsApp Cloud API</strong> strictly omits personal customer profile pictures from webhook payloads to comply with global data privacy regulations (GDPR), even when customer WhatsApp privacy is set to <em>"Everyone"</em>.
              </p>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Uploading or pasting their WhatsApp picture below permanently syncs it across WhatsQ. If no picture is set, WhatsQ automatically shows the smart <strong>First &amp; Last Letter ({initials})</strong> initials badge with a live online dot.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tab Selection */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setActiveTab('upload'); setErrorMessage(null); }}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Upload size={14} />
              <span>Upload Photo File</span>
            </button>
            <button
              onClick={() => { setActiveTab('url'); setErrorMessage(null); }}
              className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'url'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Link2 size={14} />
              <span>Paste Image Link</span>
            </button>
          </div>

          {/* Tab Content: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  filePreview
                    ? 'border-emerald-300 bg-emerald-50/30'
                    : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'
                }`}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-2">
                  <ImageIcon size={22} />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB • Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-700">Click to choose image or drag &amp; drop</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                  </div>
                )}
              </div>

              <button
                disabled={!selectedFile || isSubmitting}
                onClick={handleSaveUpload}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Uploading &amp; Syncing DP...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Save as WhatsApp Profile Picture</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Tab Content: Direct URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Direct Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <button
                disabled={!imageUrl.trim() || isSubmitting}
                onClick={handleSaveUrl}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Apply DP Link</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Fallback Option: Reset to Initials Badge */}
          {hasCustomAvatar && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Use Initials Badge</p>
                <p className="text-[11px] text-slate-400">Reverts to the first &amp; last letter avatar ({initials})</p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClearAvatar}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Remove Custom Photo</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
