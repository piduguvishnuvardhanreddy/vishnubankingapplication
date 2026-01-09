import React, { forwardRef } from 'react';
import { cn } from './Button'; // reuse cn

export const Input = forwardRef(({ label, error, className, ...props }, ref) => {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    "w-full px-4 py-2.5 bg-white border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200",
                    error
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
                        : "border-slate-200 focus:border-primary-500 focus:ring-primary-500/10 hover:border-slate-300",
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
