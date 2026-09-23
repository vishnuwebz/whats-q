import React from 'react';

interface Props {
  className?: string;
  variant?: 'card' | 'inline' | 'stacked';
}

/**
 * "People Power Progress" Inspirational Signature Brand Badge
 * Authentically styled with custom handwriting cursive font (Caveat / Dancing Script)
 * matching official reference designs.
 */
export const PeoplePowerProgressBadge: React.FC<Props> = ({
  className = '',
  variant = 'card',
}) => {
  if (variant === 'inline') {
    return (
      <div className={`text-center flex flex-col items-center justify-center ${className}`}>
        <p className="font-quote text-slate-800 text-xl sm:text-2xl font-bold leading-tight select-none tracking-wide">
          “People Power Progress”
        </p>
        <div className="w-14 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-1" />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`bg-white/95 backdrop-blur-xs px-5 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center shrink-0 ${className}`}
      >
        <div className="text-center font-quote text-slate-800 text-2xl sm:text-3xl font-bold leading-none select-none tracking-wide">
          <span className="block">“People</span>
          <span className="block mt-0.5">Power Progress”</span>
        </div>
        <div className="w-14 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-1.5" />
      </div>
    );
  }

  // Default Card variant
  return (
    <div
      className={`bg-white/95 backdrop-blur-xs px-5 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center shrink-0 ${className}`}
    >
      <div className="text-center font-quote text-slate-800 text-xl sm:text-2xl font-bold leading-tight select-none tracking-wide">
        <span className="hidden sm:block">
          <span className="block">“People</span>
          <span className="block -mt-0.5">Power Progress”</span>
        </span>
        <span className="sm:hidden block">“People Power Progress”</span>
      </div>
      <div className="w-14 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mt-1.5" />
    </div>
  );
};
