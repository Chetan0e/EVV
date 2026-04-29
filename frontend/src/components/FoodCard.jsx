import React from 'react';
import { MapPin, Clock, Scale } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function FoodCard({ food, onClaim }) {
  const isAvailable = food.status === 'available';

  return (
    <div className="glass-panel rounded-2xl overflow-hidden rescue-card flex flex-col h-full">
      <div className="relative h-40 w-full">
        <img 
          src={food.images[0] || 'https://via.placeholder.com/400x300?text=Food'} 
          alt="Food Donation" 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <StatusBadge status={food.status} />
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold capitalize text-[var(--text-primary)] mb-2">
          {food.foodDescription}
        </h3>
        
        <div className="space-y-3 mt-auto pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <Scale className="w-4 h-4 text-[var(--accent-teal)]" />
            <span>{food.quantity}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <MapPin className="w-4 h-4 text-[var(--accent-amber)]" />
            <span className="truncate">{food.location?.address || 'Unknown Location'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="w-4 h-4 text-[var(--accent-coral)]" />
            <span>Expires in: {food.expiresIn} hours</span>
          </div>
        </div>
        
        {isAvailable && onClaim && (
          <button 
            onClick={() => onClaim(food._id)}
            className="mt-4 w-full bg-[var(--accent-teal)] text-black py-2 rounded-xl font-bold magnetic-btn hover:bg-teal-400"
          >
            Claim Food
          </button>
        )}
      </div>
    </div>
  );
}
