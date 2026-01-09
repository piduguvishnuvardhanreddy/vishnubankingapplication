import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Button = ({
    children,
    variant = 'primary',
    isLoading = false,
    className,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";

    const variants = {
        primary: "bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:to-indigo-500 border border-transparent",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
        danger: "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/30",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100/50 hover:text-slate-900",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], className)}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {children}
        </button>
    );
};
