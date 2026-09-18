import React from 'react';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 48 48" className={className} fill="none">
    <circle cx="24" cy="24" r="24" fill="#25D366" />
    <path
      fill="#FFFFFF"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M24 8.5C15.44 8.5 8.5 15.44 8.5 24c0 3.01.86 5.82 2.35 8.2L8.5 39.5l7.55-2.28A15.42 15.42 0 0024 39.5c8.56 0 15.5-6.94 15.5-15.5S32.56 8.5 24 8.5zm8.93 21.8c-.37 1.04-1.84 1.91-2.58 2.03-.7.12-1.6.17-2.58-.14-.6-.19-1.38-.45-2.39-.89-4.24-1.84-7-6.14-7.21-6.42-.21-.29-1.74-2.31-1.74-4.41s1.1-3.13 1.49-3.55c.39-.42.85-.53 1.13-.53.28 0 .57 0 .81.02.26.01.61-.1.95.72.37.89 1.25 3.06 1.36 3.28.11.23.19.49.04.78-.14.28-.22.46-.43.71-.21.25-.45.56-.64.75-.22.21-.44.44-.19.87.25.42 1.11 1.83 2.38 2.96 1.63 1.45 3.01 1.9 3.44 2.11.43.21.68.18.93-.11.25-.28 1.07-1.25 1.36-1.68.28-.43.57-.36.96-.21.39.14 2.49 1.18 2.92 1.39.43.21.71.32.81.49.11.18.11 1.03-.26 2.07z"
    />
  </svg>
);

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <circle cx="24" cy="24" r="24" fill="#FFFFFF" />
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export const SlackIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 127 127" className={className}>
    <path
      d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z"
      fill="#E01E5A"
    />
    <path
      d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.6c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H14C6.7 60.2.8 54.3.8 47c0-7.3 5.9-13.2 13.2-13.2H47z"
      fill="#36C5F0"
    />
    <path
      d="M99.8 47c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.8V47zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2V47z"
      fill="#2EB67D"
    />
    <path
      d="M80 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8H80zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80z"
      fill="#ECB22E"
    />
  </svg>
);

export const ZohoIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    {/* Red Block Z */}
    <rect x="6" y="6" width="50" height="50" rx="12" fill="#E42528" />
    <path
      d="M21 21h20l-14 20h14"
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Green Block O */}
    <rect x="64" y="6" width="50" height="50" rx="12" fill="#00A859" />
    <circle cx="89" cy="31" r="10" stroke="#FFFFFF" strokeWidth="5" fill="none" />
    {/* Blue Block H */}
    <rect x="6" y="64" width="50" height="50" rx="12" fill="#008BD0" />
    <path
      d="M21 78v22M41 78v22M21 89h20"
      stroke="#FFFFFF"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Yellow Block O */}
    <rect x="64" y="64" width="50" height="50" rx="12" fill="#F7A800" />
    <circle cx="89" cy="89" r="10" stroke="#FFFFFF" strokeWidth="5" fill="none" />
  </svg>
);

export const QuickBooksIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <circle cx="60" cy="60" r="58" fill="#2CA01C" />
    <path
      fill="#FFFFFF"
      d="M48 38c-8.8 0-16 7.2-16 16s7.2 16 16 16c3.8 0 7.3-1.3 10-3.6V76H48v7h17c4.4 0 8-3.6 8-8V38h-7v7.4c-2.7-4.4-7.5-7.4-13-7.4zm0 25c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9zm24-25c-5.5 0-10.3 3-13 7.4V38h-7v48h7v-7.4c2.7 2.3 6.2 3.6 10 3.6 8.8 0 16-7.2 16-16s-7.2-16-16-16zm0 25c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z"
    />
  </svg>
);

export const ShopifyIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <path
      fill="#95BF47"
      d="M87.5 28.5L78.2 24.2c-1.3-.6-2.8-.2-3.6 1l-1.3 1.8-6.1-4.7c-.8-.6-1.9-.9-2.9-.7l-15.6 3.6c-1.1.3-2 1.1-2.4 2.2L34.2 60.5c-.3.8-.2 1.8.3 2.5l30.8 41.2c.7.9 1.8 1.5 3 1.5.3 0 .7 0 1-.1 1.5-.4 2.6-1.6 2.8-3.1l17.4-71c.2-.9-.1-1.9-.9-2.5l-1.1-.5z"
    />
    <path
      fill="#5E8E3E"
      d="M74.6 25.2l-1.3 1.8-11.8 2.7V22l8.8-2c.9-.2 1.8 0 2.5.5 1 .7 1.6 1.8 1.8 3v1.7z"
    />
    <path
      fill="#FFFFFF"
      d="M62.5 50.8c-7.7.8-13.6 5.8-13.6 12.3 0 11.2 16.5 10.9 16.5 17.6 0 3.4-3.1 5.4-6.8 5.4-5.3 0-9-3.2-9-3.2l-1.6 6.8s4.3 2.6 10.6 2.6c9 0 14.5-5.6 14.5-12.7 0-11.9-16.5-11.4-16.5-17.7 0-3 2.6-4.9 6-4.9 4.3 0 7.3 2.3 7.3 2.3l1.7-6.2c-.1-.1-3.6-2.3-9.1-2.3z"
    />
  </svg>
);

export const RazorpayIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <rect width="120" height="120" rx="26" fill="#0C2340" />
    <path
      fill="#3395FF"
      d="M32 94l19.5-35.8h17.6L49.5 94H32zm20.8-38.2L73 18H52.5L32 55.8h20.8zm11-18.4L78 28.5 68.2 46.2 88 18H63.8z"
    />
    <path
      fill="#528FF0"
      d="M52.8 55.8h17.6L50.8 92.5 42 94l21.8-38.2z"
    />
  </svg>
);

export const WooCommerceIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <rect width="120" height="120" rx="26" fill="#7F54B3" />
    {/* Speech tail and bubble */}
    <path
      fill="#FFFFFF"
      d="M20 34c0-7.7 6.3-14 14-14h52c7.7 0 14 6.3 14 14v36c0 7.7-6.3 14-14 14H46l-16 14V84h-2c-4.4 0-8-3.6-8-8V34z"
    />
    {/* Stylized WOO letters inside */}
    <path
      fill="#7F54B3"
      d="M36 44l3.5 18 5-14 4.5 14 3.5-18h4.5l-6 24h-4.5l-4.5-14-4.5 14H33l-6-24h5zm32 12c0-7.2 4.8-12.5 11.5-12.5S91 48.8 91 56s-4.8 12.5-11.5 12.5S68 63.2 68 56zm17 0c0-4.4-2.2-7.5-5.5-7.5s-5.5 3.1-5.5 7.5 2.2 7.5 5.5 7.5 5.5-3.1 5.5-7.5z"
    />
  </svg>
);

export const StripeIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <rect width="120" height="120" rx="26" fill="#635BFF" />
    <path
      fill="#FFFFFF"
      d="M55.8 45.4c0-3.6 3-4.9 8-4.9 7.1 0 16.1 2.2 23.2 6.1V27.4c-7.9-3.4-16.1-4.7-23.2-4.7-18.7 0-31.1 9.8-31.1 26.2 0 25.5 35 21.4 35 32.4 0 4.2-3.7 5.6-9.1 5.6-8 0-18.2-3.3-26.3-7.8v19.4c8.9 3.8 18 5.4 26.3 5.4 19.3 0 32.5-9.5 32.5-26.4-.1-27.5-35.3-22.6-35.3-32.1z"
    />
  </svg>
);

export const ZapierIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <rect width="120" height="120" rx="26" fill="#FF4A00" />
    <path
      fill="#FFFFFF"
      d="M52 24h16v24h-16zM52 72h16v24h-16zM24 52h24v16H24zM72 52h24v16H72zM36.4 30.7l11.3 11.3-11.3 11.3-11.3-11.3zM83.6 77.9l11.3 11.3-11.3 11.3-11.3-11.3zM36.4 89.3l-11.3-11.3 11.3-11.3 11.3 11.3zM83.6 42l-11.3-11.3 11.3-11.3 11.3 11.3z"
    />
  </svg>
);

export const HubSpotIcon: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 120 120" className={className}>
    <rect width="120" height="120" rx="26" fill="#FF7A59" />
    <circle cx="85" cy="40" r="10" fill="#FFFFFF" />
    <circle cx="60" cy="65" r="15" fill="#FFFFFF" />
    <circle cx="88" cy="80" r="8" fill="#FFFFFF" />
    <path d="M60 40v40M60 65l28 15M60 65l25-25" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
  </svg>
);

interface IntegrationIconProps {
  slug?: string;
  name?: string;
  className?: string;
}

export const IntegrationIcon: React.FC<IntegrationIconProps> = ({
  slug = '',
  name = '',
  className = 'w-full h-full',
}) => {
  const key = `${slug} ${name}`.toLowerCase();

  if (key.includes('whatsapp') || key.includes('meta')) {
    return <WhatsAppIcon className={className} />;
  }
  if (key.includes('google') || key.includes('gmail') || key.includes('calendar') || key.includes('drive')) {
    return <GoogleIcon className={className} />;
  }
  if (key.includes('slack')) {
    return <SlackIcon className={className} />;
  }
  if (key.includes('zoho')) {
    return <ZohoIcon className={className} />;
  }
  if (key.includes('quickbooks') || key.includes('intuit')) {
    return <QuickBooksIcon className={className} />;
  }
  if (key.includes('shopify')) {
    return <ShopifyIcon className={className} />;
  }
  if (key.includes('razorpay')) {
    return <RazorpayIcon className={className} />;
  }
  if (key.includes('woocommerce') || key.includes('wordpress')) {
    return <WooCommerceIcon className={className} />;
  }
  if (key.includes('stripe')) {
    return <StripeIcon className={className} />;
  }
  if (key.includes('zapier')) {
    return <ZapierIcon className={className} />;
  }
  if (key.includes('hubspot')) {
    return <HubSpotIcon className={className} />;
  }

  // Modern fallback badge with first letter
  const firstLetter = (name || slug || '?')[0].toUpperCase();
  return (
    <div className={`rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white font-bold flex items-center justify-center shadow-xs ${className}`}>
      <span className="text-sm font-bold">{firstLetter}</span>
    </div>
  );
};
