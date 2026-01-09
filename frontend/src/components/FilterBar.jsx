import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export const FilterBar = ({ filters, onFilterChange, onReset }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 mb-6 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
            <div className="flex-1">
                <Input
                    label="Search Amount"
                    placeholder="e.g. 50"
                    icon={Search}
                    value={filters.search}
                    onChange={(e) => onFilterChange('search', e.target.value)}
                />
            </div>

            <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Type</label>
                <div className="relative">
                    <select
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 appearance-none"
                        value={filters.type}
                        onChange={(e) => onFilterChange('type', e.target.value)}
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposit</option>
                        <option value="withdrawal">Withdrawal</option>
                        <option value="transfer">Transfer</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            <div className="w-full md:w-40">
                <Input
                    label="From Date"
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => onFilterChange('startDate', e.target.value)}
                />
            </div>

            <div className="w-full md:w-40">
                <Input
                    label="To Date"
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => onFilterChange('endDate', e.target.value)}
                />
            </div>

            <div className="pb-0.5">
                <Button variant="secondary" onClick={onReset} className="h-[42px] px-3">
                    <X className="w-5 h-5 text-slate-500" />
                </Button>
            </div>
        </div>
    );
};
