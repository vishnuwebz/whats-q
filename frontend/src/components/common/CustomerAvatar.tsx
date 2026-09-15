import React, { useState } from 'react';
import { Conversation } from '@/types';
import { useQiyamStore } from '@/store/useQiyamStore';

interface CustomerAvatarProps {
  conversation?: Conversation | null;
  name?: string;
  avatar?: string;
  phone?: string;
  id?: string | number;
  isOnline?: boolean;
  lastSeen?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Computes first and last letter for the DP initials when no real photo exists.
 * - Single word like "Habeeb" -> "HB" (first letter 'H', last letter 'B')
 * - Multiple words like "Amit Sharma" -> "AS" (first letter 'A', last letter of last word 'S')
 */
export function getContactInitials(name?: string, phone?: string): string {
  if (!name || name.trim() === '' || name.trim().toLowerCase() === 'whatsapp customer') {
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length >= 2) return (digits[0] + digits[digits.length - 1]).toUpperCase();
    }
    return 'WA';
  }

  // Remove trailing punctuation (e.g. "Habeeb!!" -> "Habeeb") and non-word characters
  const clean = name.trim().replace(/[^\w\s]/gi, '').trim();
  if (!clean) return 'WA';

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    // Multi-word: First letter of first word + First letter of last word
    const firstWord = parts[0];
    const lastWord = parts[parts.length - 1];
    return (firstWord[0] + lastWord[0]).toUpperCase();
  } else {
    // Single word: First letter + Last letter of the name (e.g. "Habeeb" -> "HB")
    const word = parts[0];
    if (word.length >= 2) {
      return (word[0] + word[word.length - 1]).toUpperCase();
    }
    return word[0].toUpperCase();
  }
}

/**
 * Consistent gradient backgrounds for customer initials badges
 */
export function getAvatarGradient(name?: string, phone?: string): string {
  const seed = (name || phone || 'Customer').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const gradients = [
    'from-emerald-500 to-teal-700',
    'from-blue-500 to-indigo-700',
    'from-purple-500 to-violet-700',
    'from-rose-500 to-pink-700',
    'from-amber-500 to-orange-700',
    'from-cyan-500 to-blue-700',
    'from-teal-500 to-emerald-800',
    'from-violet-500 to-purple-800',
  ];
  const idx = Math.abs(hash) % gradients.length;
  return gradients[idx];
}

export const CustomerAvatar: React.FC<CustomerAvatarProps> = ({
  conversation,
  name,
  avatar,
  phone,
  id,
  isOnline: propIsOnline,
  lastSeen: propLastSeen,
  size = 'md',
  showPresence = true,
  className = '',
  onClick,
}) => {
  const onlineUsers = useQiyamStore((s) => s.onlineUsers);
  const typingUsers = useQiyamStore((s) => s.typingUsers);

  const contactName = conversation?.contact_name || name || 'Customer';
  const contactPhone = conversation?.phone_number || phone || '';
  const rawAvatar = conversation?.avatar || avatar || '';
  const convId = conversation?.id || id;

  // Real-time online/offline presence resolution
  const userPresence = convId ? onlineUsers[String(convId)] : undefined;
  const isTyping = convId ? typingUsers[String(convId)] : false;

  // User is online if actively typing or recorded as online in presence state / conversation model
  const isOnline = Boolean(
    isTyping ||
    (propIsOnline !== undefined ? propIsOnline : (userPresence?.isOnline ?? conversation?.is_online ?? false))
  );

  const lastSeen = propLastSeen || userPresence?.lastSeen || conversation?.last_seen || 'Recently';

  const [imgFailed, setImgFailed] = useState(false);

  // Check whether avatar is a genuine custom WhatsApp DP URL (and not empty or a dummy placeholder)
  const isRealAvatar = Boolean(
    rawAvatar &&
    rawAvatar.trim().length > 0 &&
    !rawAvatar.includes('undefined') &&
    !rawAvatar.includes('ui-avatars.com') &&
    !rawAvatar.includes('unsplash.com') && // exclude stock template photos so first/last letter badge displays
    !imgFailed
  );

  const initials = getContactInitials(contactName, contactPhone);
  const gradient = getAvatarGradient(contactName, contactPhone);

  const sizeClasses = {
    sm: {
      container: 'w-8 h-8 text-[11px]',
      dot: 'w-2 h-2 ring-1.5',
      dotPos: 'bottom-0 right-0',
    },
    md: {
      container: 'w-10 h-10 text-xs',
      dot: 'w-2.5 h-2.5 ring-2',
      dotPos: 'bottom-0 right-0',
    },
    lg: {
      container: 'w-12 h-12 text-sm',
      dot: 'w-3 h-3 ring-2',
      dotPos: 'bottom-0 right-0',
    },
    xl: {
      container: 'w-20 h-20 text-xl font-extrabold',
      dot: 'w-4 h-4 ring-2.5',
      dotPos: 'bottom-1 right-1',
    },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`relative shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* 1. Real WhatsApp DP or First/Last Letter Initials Fallback */}
      {isRealAvatar ? (
        <img
          src={rawAvatar}
          alt={contactName}
          onError={() => setImgFailed(true)}
          className={`${sizeClasses.container} rounded-full object-cover ring-1 ring-slate-200 shadow-2xs`}
        />
      ) : (
        <div
          title={`${contactName} (${initials})`}
          className={`${sizeClasses.container} rounded-full bg-gradient-to-tr ${gradient} text-white font-bold flex items-center justify-center tracking-wider ring-1 ring-white/20 shadow-2xs uppercase`}
        >
          {initials}
        </div>
      )}

      {/* 2. Real-Time Online / Offline Dot Indicator */}
      {showPresence && (
        <span
          title={isOnline ? 'Online on WhatsApp' : `Offline (${lastSeen})`}
          className={`${sizeClasses.dot} ${sizeClasses.dotPos} rounded-full ring-white absolute shadow-2xs transition-colors duration-300 ${
            isOnline ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
};
