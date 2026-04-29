import React from 'react';
import clsx from 'clsx';

export default function StatusBadge({ status, type = 'status' }) {
  const getStyles = () => {
    if (type === 'severity') {
      switch (status) {
        case 'critical': return 'bg-[var(--accent-coral)]/20 text-[var(--accent-coral)] border-[var(--accent-coral)]/50 breathing-badge';
        case 'moderate': return 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border-[var(--accent-amber)]/50';
        case 'minor': return 'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border-[var(--accent-green)]/50';
        default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      }
    }
    
    switch (status) {
      case 'reported': return 'bg-[var(--accent-coral)]/20 text-[var(--accent-coral)] border-[var(--accent-coral)]/50';
      case 'assigned': return 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border-[var(--accent-amber)]/50';
      case 'rescued': return 'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border-[var(--accent-green)]/50';
      case 'closed': return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
      case 'available': return 'bg-[var(--accent-teal)]/20 text-[var(--accent-teal)] border-[var(--accent-teal)]/50';
      case 'claimed': return 'bg-[var(--accent-amber)]/20 text-[var(--accent-amber)] border-[var(--accent-amber)]/50';
      case 'delivered': return 'bg-[var(--accent-green)]/20 text-[var(--accent-green)] border-[var(--accent-green)]/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <span className={clsx(
      "px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border backdrop-blur-md",
      getStyles()
    )}>
      {status}
    </span>
  );
}
