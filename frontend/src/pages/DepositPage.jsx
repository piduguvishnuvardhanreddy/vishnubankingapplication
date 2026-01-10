
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { useNotification } from '../context/NotificationContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const DepositPage = () => {
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);

    const { showSuccess, showError } = useNotification();

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions/deposit', { amount: Number(amount), pin });
            showSuccess('Deposit successful! Balance updated.');
            setAmount('');
            setPin('');
        } catch (err) {
            showError(err.response?.data?.message || err.message || 'Deposit failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Deposit Funds</h1>
                <p className="text-slate-500 mt-2">Add money to your account securely</p>
            </div>

            <Card className="border-t-4 border-t-emerald-500 shadow-xl shadow-emerald-500/5">
                <form onSubmit={handleDeposit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                                className="pl-8 py-3 text-lg font-medium"
                            />
                        </div>
                    </div>

                    <Input
                        label="Transaction PIN"
                        type="password"
                        placeholder="Enter your PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        required
                        minLength={4}
                        maxLength={6}
                        className="py-3"
                    />

                    <div className="pt-4">
                        <Button type="submit" variant="secondary" className="w-full text-lg h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/40" isLoading={loading}>
                            Deposit Funds <ArrowDownLeft className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Deposits are secure and instantly reflected.
                </p>
            </div>
        </motion.div>
    );
};
