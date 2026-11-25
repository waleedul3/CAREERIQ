import React from 'react';

export function BrandMark({
  onClick,
  light = false,
}: {
  onClick?: () => void;
  light?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded-md"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#1D4ED8] text-xs font-bold tracking-tight text-white font-display">
        CQ
      </span>
      <span
        className={`text-lg font-bold tracking-tight font-display ${
          light ? 'text-white' : 'text-slate-900 dark:text-slate-100'
        }`}
      >
        CareerIQ
      </span>
    </button>
  );
}
