import React from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating = 0, reviewCount, size = 'sm', showNumber = true }) => {
  const stars = [1, 2, 3, 4, 5];
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center text-amber-400">
        {stars.map((s) => (
          <Star
            key={s}
            className={`${starSizes[size] || 'w-4 h-4'} ${
              s <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating ? rating.toFixed(1) : 'New'}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-slate-500 font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
