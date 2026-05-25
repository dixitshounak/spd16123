import React from "react";

const Skeleton = ({ className = "", lines = 1 }) => {
  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`skeleton h-4 ${i === lines - 1 ? "w-3/4" : "w-full"} ${className}`}
          />
        ))}
      </div>
    );
  }
  return <div className={`skeleton ${className}`} />;
};

export const SkeletonCard = () => (
  <div className="card p-5 space-y-4">
    <div className="skeleton h-48 rounded-xl w-full" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton lines={2} />
    <div className="flex gap-2">
      <div className="skeleton h-6 w-16 rounded-full" />
      <div className="skeleton h-6 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonTrip = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
  </div>
);

export default Skeleton;
