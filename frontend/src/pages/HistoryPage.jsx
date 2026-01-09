import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';
import { FilterBar } from '../components/FilterBar';
import { useNotification } from '../context/NotificationContext';

export const HistoryPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [accountId, setAccountId] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        startDate: '',
        endDate: ''
    });

    const { showError } = useNotification();

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (filters.type !== 'all') queryParams.append('type', filters.type);
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);

            const [histRes, accRes] = await Promise.all([
                api.get(`/transactions/history?${queryParams.toString()}`),
                api.get('/accounts/my-account')
            ]);
            setTransactions(histRes.data.data.transactions);
            setAccountId(accRes.data.data.account._id);
        } catch (err) {
            console.error(err);
            showError('Failed to load history');
        } finally {
            setLoading(false);
        }
    }, [filters, showError]);

    // Debounce fetch for search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHistory();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchHistory]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setFilters({
            search: '',
            type: 'all',
            startDate: '',
            endDate: ''
        });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                    <p className="text-gray-500">View your recent financial activity</p>
                </div>
                <button onClick={fetchHistory} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                    <RefreshCcw className="w-5 h-5" />
                </button>
            </div>

            <FilterBar filters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

            <Card className="overflow-hidden p-0">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No transactions found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <div key={tx._id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(tx.type === 'deposit' || (tx.type === 'transfer' && tx.toAccount?._id === accountId)) ? 'bg-green-100 text-green-600' :
                                        (tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.fromAccount?._id === accountId)) ? 'bg-red-100 text-red-600' :
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                        {(tx.type === 'deposit' || (tx.type === 'transfer' && tx.toAccount?._id === accountId)) ? <ArrowDownLeft className="w-5 h-5" /> :
                                            (tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.fromAccount?._id === accountId)) ? <ArrowUpRight className="w-5 h-5" /> :
                                                <RefreshCcw className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 capitalize">{tx.type}</p>
                                        <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                                    </div>
                                </div>
                                <div className={`font-bold ${(tx.type === 'deposit' || (tx.type === 'transfer' && tx.toAccount?._id === accountId)) ? 'text-green-600' :
                                    (tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.fromAccount?._id === accountId)) ? 'text-red-600' :
                                        'text-gray-900'
                                    }`}>
                                    {(tx.type === 'deposit' || (tx.type === 'transfer' && tx.toAccount?._id === accountId)) ? '+' :
                                        (tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.fromAccount?._id === accountId)) ? '-' : ''}
                                    ${Number(tx.amount).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </motion.div>
    );
};
