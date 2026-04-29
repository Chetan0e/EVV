import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import clsx from 'clsx';
import StatusBadge from './StatusBadge';

export default function RescueCard({ report }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden rescue-card flex flex-col h-full">
      <div className="relative h-48 w-full">
        <img 
          src={report.images[0] || 'https://via.placeholder.com/400x300?text=Rescue'} 
          alt="Rescue" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <StatusBadge status={report.status} type="status" />
          <StatusBadge status={report.severity} type="severity" />
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold capitalize text-[var(--text-primary)]">
            {report.animal?.type || 'Animal'} Rescue
          </h3>
          <span className="mono-stats text-sm text-[var(--accent-teal)]">#{report._id.slice(-6)}</span>
        </div>
        
        <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2 flex-1">
          {report.animal?.description || 'No description provided.'}
        </p>
        
        <div className="space-y-2 mt-auto pt-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <MapPin className="w-4 h-4 text-[var(--accent-amber)]" />
            <span className="truncate">{report.location?.address || 'Unknown Location'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="w-4 h-4 text-[var(--accent-teal)]" />
            <span>{new Date(report.createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        {report.status === 'reported' && (
          <button className="mt-4 w-full bg-[var(--accent-teal)]/10 text-[var(--accent-teal)] border border-[var(--accent-teal)]/30 py-2 rounded-xl font-medium hover:bg-[var(--accent-teal)]/20 transition-colors">
            Respond to Rescue
          </button>
        )}
      </div>
    </div>
  );
}
