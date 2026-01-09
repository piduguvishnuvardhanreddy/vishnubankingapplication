import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';

export const BalancePage = () => {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await api.get('/accounts/my-account');
                setBalance(res.data.data.account.balance);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBalance();
    }, []);

    if (loading) return <div className="p-8 text-slate-500 text-center">Loading balance...</div>;

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-lg mx-auto py-12">
            <Card className="text-center py-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 border-0">
                <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                    <Wallet className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-sm font-medium text-indigo-100 uppercase tracking-wider mb-2">Total Available Balance</h1>
                <div className="text-5xl font-bold tracking-tight">
                    ${balance?.toLocaleString() || '0.00'}
                </div>
            </Card>
        </motion.div>
    );
};
