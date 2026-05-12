'use client';

import * as React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-[#151821] ${className}`}
      >
        <div
          className="h-full w-full flex-1 bg-gradient-to-r from-[#FF9F0A] to-[#7B61FF] transition-all duration-500 ease-in-out shadow-[0_0_15px_rgba(255,159,10,0.3)]"
          style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
