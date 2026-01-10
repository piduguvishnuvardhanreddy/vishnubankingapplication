import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';
import { useNotification } from '../context/NotificationContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const BalancePage = () => {
    const [balance, setBalance] = useState(null);
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const { showError } = useNotification();

    const handleCheckBalance = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/accounts/balance-secure', { pin });
            setBalance(res.data.data.balance);
            setPin('');
        } catch (err) {
            showError(err.response?.data?.message || err.message || 'Failed to check balance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-lg mx-auto py-12">
            {!balance && balance !== 0 ? (
                <Card className="shadow-xl py-8">
                    <div className="text-center mb-6">
                        <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Check Balance</h1>
                        <p className="text-slate-500 mt-2">Enter your PIN to view available balance</p>
                    </div>

                    <form onSubmit={handleCheckBalance} className="space-y-6">
                        <Input
                            type="password"
                            placeholder="Enter 4-digit PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            required
                            minLength={4}
                            maxLength={6}
                            className="text-center text-2xl tracking-widest"
                            autoFocus
                        />
                        <Button type="submit" className="w-full text-lg h-12" isLoading={loading}>
                            View Balance
                        </Button>
                    </form>
                </Card>
            ) : (
                <Card className="text-center py-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-500/30 border-0">
                    <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-sm font-medium text-indigo-100 uppercase tracking-wider mb-2">Total Available Balance</h1>
                    <div className="text-5xl font-bold tracking-tight mb-8">
                        ${balance.toLocaleString()}
                    </div>
                    <Button
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white border-0"
                        onClick={() => setBalance(null)}
                    >
                        Check Again
                    </Button>
                </Card>
            )}
        </motion.div>
    );
};
