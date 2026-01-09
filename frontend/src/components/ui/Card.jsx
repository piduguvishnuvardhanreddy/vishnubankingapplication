import React from 'react';
import { cn } from './Button';

export const Card = ({ children, className, ...props }) => {
    return (
        <div className={cn("glass-card rounded-2xl p-6 relative overflow-hidden", className)} {...props}>
            {children}
        </div>
    );
};
