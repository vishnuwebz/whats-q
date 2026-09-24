import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Phone, Check, Globe } from 'lucide-react';

export interface CountryItem {
  iso: string;
  name: string;
  dialCode: string;
  flag: string;
  mask: string; // 'X' represents a digit
  maxDigits: number;
  sample: string;
}

export const COUNTRIES: CountryItem[] = [
  // Primary / Default
  { iso: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', mask: 'XXXXX XXXXX', maxDigits: 10, sample: '94963 00233' },
  // GCC & Middle East
  { iso: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', mask: 'XX XXX XXXX', maxDigits: 9, sample: '50 123 4567' },
  { iso: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', mask: 'XX XXX XXXX', maxDigits: 9, sample: '50 123 4567' },
  { iso: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', mask: 'XXXX XXXX', maxDigits: 8, sample: '3312 3456' },
  { iso: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', mask: 'XXXX XXXX', maxDigits: 8, sample: '9123 4567' },
  { iso: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', mask: 'XXXX XXXX', maxDigits: 8, sample: '9123 4567' },
  { iso: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', mask: 'XXXX XXXX', maxDigits: 8, sample: '3612 3456' },
  // Americas
  { iso: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', mask: 'XXX XXX XXXX', maxDigits: 10, sample: '202 555 0143' },
  { iso: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', mask: 'XXX XXX XXXX', maxDigits: 10, sample: '416 555 0192' },
  { iso: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', mask: 'XXX XXX XXXX', maxDigits: 10, sample: '55 1234 5678' },
  { iso: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', mask: 'XX XXXXX XXXX', maxDigits: 11, sample: '11 91234 5678' },
  // Europe
  { iso: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', mask: 'XXXX XXXXXX', maxDigits: 10, sample: '7911 123456' },
  { iso: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', mask: 'XXX XXXXXXX', maxDigits: 11, sample: '151 23456789' },
  { iso: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', mask: 'X XX XX XX XX', maxDigits: 9, sample: '6 12 34 56 78' },
  { iso: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', mask: 'XXX XXXXXXX', maxDigits: 10, sample: '312 3456789' },
  { iso: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', mask: 'XXX XX XX XX', maxDigits: 9, sample: '612 34 56 78' },
  { iso: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', mask: 'X XX XX XX XX', maxDigits: 9, sample: '6 12 34 56 78' },
  { iso: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', mask: 'XX XXX XXXX', maxDigits: 9, sample: '79 123 4567' },
  { iso: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', mask: 'XX XXX XXXX', maxDigits: 9, sample: '85 123 4567' },
  { iso: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', mask: 'XX XXX XXXX', maxDigits: 9, sample: '70 123 4567' },
  { iso: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', mask: 'XXX XX XXX', maxDigits: 8, sample: '412 34 567' },
  { iso: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', mask: 'XXX XXX XXXX', maxDigits: 10, sample: '532 123 4567' },
  // Asia & Oceania
  { iso: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', mask: 'XXXX XXXX', maxDigits: 8, sample: '8123 4567' },
  { iso: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', mask: 'XX XXX XXXX', maxDigits: 10, sample: '12 345 6789' },
  { iso: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', mask: 'XXX XXX XXX', maxDigits: 9, sample: '412 345 678' },
  { iso: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', mask: 'XXX XXX XXX', maxDigits: 9, sample: '21 123 4567' },
  { iso: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', mask: 'XXX XXXX XXXX', maxDigits: 11, sample: '812 3456 7890' },
  { iso: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', mask: 'XXX XXX XXXX', maxDigits: 10, sample: '917 123 4567' },
  { iso: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', mask: 'XX XXX XXXX', maxDigits: 9, sample: '81 234 5678' },
  { iso: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', mask: 'XX XXX XXXX', maxDigits: 9, sample: '91 234 5678' },
  { iso: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', mask: 'XXX XXXXXXX', maxDigits: 10, sample: '300 1234567' },
  { iso: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', mask: 'XXXX XXXXXX', maxDigits: 10, sample: '1712 345678' },
  { iso: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', mask: 'XX XXX XXXX', maxDigits: 9, sample: '71 234 5678' },
  { iso: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', mask: 'XX XXXX XXXX', maxDigits: 10, sample: '98 1234 5678' },
  { iso: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', mask: 'XXX XXXX', maxDigits: 7, sample: '791 2345' },
  { iso: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', mask: 'XX XXXX XXXX', maxDigits: 10, sample: '90 1234 5678' },
  { iso: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', mask: 'XX XXXX XXXX', maxDigits: 10, sample: '10 1234 5678' },
  { iso: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', mask: 'XXX XXXX XXXX', maxDigits: 11, sample: '138 0013 8000' },
  { iso: 'HK', name: 'Hong Kong', dialCode: '+852', flag: '🇭🇰', mask: 'XXXX XXXX', maxDigits: 8, sample: '9123 4567' },
  // Africa
  { iso: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', mask: 'XX XXXX XXXX', maxDigits: 10, sample: '10 1234 5678' },
  { iso: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', mask: 'XX XXX XXXX', maxDigits: 9, sample: '82 123 4567' },
  { iso: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', mask: 'XXX XXX XXXX', maxDigits: 10, sample: '802 123 4567' },
  { iso: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', mask: 'XXX XXXXXX', maxDigits: 9, sample: '712 345678' },
  { iso: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', mask: 'XX XXX XXXX', maxDigits: 9, sample: '61 234 5678' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // India (+91)

/**
 * Strips non-digits
 */
export function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

/**
 * Format digits according to a mask (e.g. 'XXXXX XXXXX')
 */
export function formatWithMask(digits: string, mask: string): string {
  if (!digits) return '';
  let result = '';
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    const maskChar = mask[i];
    if (maskChar === 'X') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += maskChar;
    }
  }

  // If there are remaining digits that exceed the mask length, append them with a space
  if (digitIndex < digits.length) {
    result += ' ' + digits.slice(digitIndex);
  }

  return result.trim();
}

/**
 * Detects country and returns extracted national digits
 */
export function parsePhoneInput(
  rawInput: string,
  preferredCountryIso = 'IN'
): { country: CountryItem; nationalDigits: string } {
  if (!rawInput) {
    const defaultCountry = COUNTRIES.find((c) => c.iso === preferredCountryIso) || DEFAULT_COUNTRY;
    return { country: defaultCountry, nationalDigits: '' };
  }

  const trimmed = rawInput.trim();
  const digitsOnly = cleanDigits(trimmed);

  // If input starts with '+', check matching dial codes (sorted longest dialCode first)
  if (trimmed.startsWith('+')) {
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sortedCountries) {
      if (trimmed.startsWith(c.dialCode)) {
        const remaining = trimmed.slice(c.dialCode.length);
        return { country: c, nationalDigits: cleanDigits(remaining).slice(0, c.maxDigits) };
      }
    }
  }

  // Check if digits start with dial code without '+' (e.g. '919496300233' or '971501234567')
  const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  for (const c of sortedCountries) {
    const codeDigits = cleanDigits(c.dialCode);
    if (digitsOnly.startsWith(codeDigits) && digitsOnly.length > codeDigits.length + 5) {
      const remaining = digitsOnly.slice(codeDigits.length);
      return { country: c, nationalDigits: remaining.slice(0, c.maxDigits) };
    }
  }

  // Local number with leading zero e.g. 09496300233
  let national = digitsOnly;
  if (national.startsWith('0') && national.length > 10) {
    national = national.slice(1);
  }

  const preferred = COUNTRIES.find((c) => c.iso === preferredCountryIso) || DEFAULT_COUNTRY;
  return {
    country: preferred,
    nationalDigits: national.slice(0, preferred.maxDigits),
  };
}

export interface CountryPhoneInputProps {
  value?: string;
  onChange?: (value: string, rawDigits?: string, countryCode?: string) => void;
  defaultCountry?: string; // ISO code, default 'IN'
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  autoFocus?: boolean;
  error?: string;
  showIcon?: boolean;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value = '',
  onChange,
  defaultCountry = 'IN',
  placeholder,
  required = false,
  disabled = false,
  name,
  id,
  className = '',
  inputClassName = '',
  buttonClassName = '',
  size = 'md',
  variant = 'light',
  autoFocus = false,
  error,
  showIcon = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  // Parse initial or incoming value
  const parsed = useMemo(() => {
    return parsePhoneInput(value, defaultCountry);
  }, [value, defaultCountry]);

  const [selectedCountry, setSelectedCountry] = useState<CountryItem>(parsed.country);
  const [nationalDigits, setNationalDigits] = useState<string>(parsed.nationalDigits);

  // Sync state whenever parsed incoming value changes
  useEffect(() => {
    setSelectedCountry(parsed.country);
    setNationalDigits(parsed.nationalDigits);
  }, [parsed.country.iso, parsed.nationalDigits]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filtered countries based on search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.iso.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Format the national number for display
  const formattedDisplay = useMemo(() => {
    return formatWithMask(nationalDigits, selectedCountry.mask);
  }, [nationalDigits, selectedCountry]);

  // Emit change to parent
  const emitChange = (newDigits: string, country: CountryItem) => {
    const formatted = formatWithMask(newDigits, country.mask);
    const fullNumber = newDigits ? `${country.dialCode} ${formatted}` : '';
    if (onChange) {
      onChange(fullNumber, newDigits, country.dialCode);
    }
  };

  const handleCountrySelect = (country: CountryItem) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');
    // re-slice national digits if needed
    const truncatedDigits = nationalDigits.slice(0, country.maxDigits);
    setNationalDigits(truncatedDigits);
    emitChange(truncatedDigits, country);
    phoneInputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    
    // Check if user pasted a number with a country code (+...)
    if (inputVal.startsWith('+')) {
      const detected = parsePhoneInput(inputVal, selectedCountry.iso);
      setSelectedCountry(detected.country);
      setNationalDigits(detected.nationalDigits);
      emitChange(detected.nationalDigits, detected.country);
      return;
    }

    // Normal typing: extract raw digits and apply limits
    let raw = cleanDigits(inputVal);
    // If user starts with 0 and enters full 10/11 digits, strip leading 0
    if (raw.startsWith('0') && raw.length > selectedCountry.maxDigits) {
      raw = raw.slice(1);
    }
    const truncated = raw.slice(0, selectedCountry.maxDigits);
    setNationalDigits(truncated);
    emitChange(truncated, selectedCountry);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Dynamic styling based on size and variant
  const sizeClasses = {
    sm: 'text-xs py-1.5 px-2.5 rounded-lg',
    md: 'text-xs py-2 px-3 rounded-xl',
    lg: 'text-sm py-2.5 px-3.5 rounded-xl',
  }[size];

  const isDark = variant === 'dark';

  return (
    <div className={`relative flex flex-col ${className}`} ref={dropdownRef}>
      <div
        className={`flex items-center transition-all ${
          isDark
            ? 'bg-slate-900/90 border border-slate-700 text-white focus-within:border-emerald-500'
            : 'bg-white border border-slate-200 text-slate-800 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 shadow-2xs'
        } ${sizeClasses} ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
      >
        {/* Country Selector Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 pr-2.5 mr-2 border-r select-none transition cursor-pointer shrink-0 ${
            isDark
              ? 'border-slate-700 text-slate-200 hover:text-white'
              : 'border-slate-200 text-slate-700 hover:text-slate-900'
          } ${buttonClassName}`}
          title={`${selectedCountry.name} (${selectedCountry.dialCode}) - Click to change country`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-base leading-none select-none drop-shadow-xs" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono font-bold text-xs tracking-tight">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </button>

        {/* Optional phone icon */}
        {showIcon && (
          <Phone
            className={`w-3.5 h-3.5 mr-2 shrink-0 ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          />
        )}

        {/* National Number Input */}
        <input
          ref={phoneInputRef}
          type="tel"
          name={name}
          id={id}
          value={formattedDisplay}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || selectedCountry.sample}
          required={required}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`w-full bg-transparent font-mono outline-none tracking-wide text-xs placeholder:text-slate-400 ${
            isDark ? 'text-white' : 'text-slate-900 font-semibold'
          } ${inputClassName}`}
          autoComplete="tel-national"
        />

        {/* National digit count indicator on focus or length */}
        {nationalDigits.length > 0 && (
          <div className="shrink-0 text-[10px] font-mono text-slate-400 px-1 select-none">
            {nationalDigits.length}/{selectedCountry.maxDigits}
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-red-500 mt-1 font-medium">{error}</p>}

      {/* Modern Country Code Dropdown */}
      {isOpen && (
        <div
          className={`absolute left-0 top-full mt-1.5 z-50 w-72 max-w-[90vw] rounded-2xl border shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-slate-900 border-slate-700 text-white shadow-slate-950/80'
              : 'bg-white border-slate-200 text-slate-800 shadow-slate-900/10'
          }`}
          role="listbox"
        >
          {/* Search Box */}
          <div className={`p-2.5 border-b ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'}`}>
            <div
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-white'
                  : 'bg-white border-slate-200 text-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code (+91, UAE...)"
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Select Pill Header */}
          <div className={`px-2.5 py-1.5 border-b flex items-center gap-1 overflow-x-auto text-[10px] ${
            isDark ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50/50 text-slate-500'
          }`}>
            <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400 mr-1 shrink-0">Popular:</span>
            {[COUNTRIES[0], COUNTRIES[1], COUNTRIES[2], COUNTRIES[7], COUNTRIES[11]].map((topC) => (
              <button
                key={topC.iso}
                type="button"
                onClick={() => handleCountrySelect(topC)}
                className={`px-1.5 py-0.5 rounded-md font-mono shrink-0 transition flex items-center gap-1 ${
                  selectedCountry.iso === topC.iso
                    ? 'bg-emerald-500 text-white font-bold'
                    : isDark
                    ? 'hover:bg-slate-800 text-slate-300'
                    : 'hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{topC.flag}</span>
                <span>{topC.dialCode}</span>
              </button>
            ))}
          </div>

          {/* Country List Scroll Area */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100/30 text-xs">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No matching country found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.iso === selectedCountry.iso;
                return (
                  <button
                    key={`${c.iso}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? isDark
                          ? 'bg-emerald-950/40 text-emerald-300 font-semibold'
                          : 'bg-emerald-50/70 text-emerald-800 font-semibold'
                        : isDark
                        ? 'hover:bg-slate-800/80 text-slate-200'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base select-none shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-400">
                      <span className="font-bold text-slate-500">{c.dialCode}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryPhoneInput;
