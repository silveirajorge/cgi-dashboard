"use client";

import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  nota: number; // 0-100
  size?: number;
}

export function StarRating({ nota, size = 14 }: StarRatingProps) {
  const starValue = nota / 20; // 0-5
  const full = Math.floor(starValue);
  const fraction = starValue - full;
  const hasHalf = fraction >= 0.25 && fraction < 0.75;
  const adjustedFull = fraction >= 0.75 ? full + 1 : full;

  return (
    <span className="inline-flex gap-0.5" style={{ color: "#eab308" }}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < adjustedFull) {
          return <Star key={i} size={size} fill="#eab308" />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} size={size} fill="#eab308" />;
        }
        return <Star key={i} size={size} fill="transparent" stroke="#eab308" />;
      })}
    </span>
  );
}
