import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { useNotification } from '../context/NotificationContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const TransferPage = () => {
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const { showSuccess, showError } = useNotification();

    const handleTransfer = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/transactions/transfer', { toEmail: email, amount: Number(amount) });
            showSuccess('Transfer completed successfully!');
            setEmail('');
            setAmount('');
        } catch (err) {
            showError(err.response?.data?.message || err.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Transfer Funds</h1>
                <p className="text-slate-500 mt-2">Securely send money to friends and family instantly</p>
            </div>

            <Card className="border-t-4 border-t-primary-500 shadow-xl shadow-primary-500/5">
                <form onSubmit={handleTransfer} className="space-y-6">
                    <Input
                        label="Recipient Email"
                        type="email"
                        placeholder="receiver@bank.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="py-3"
                    />

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

                    <div className="pt-4">
                        <Button type="submit" className="w-full text-lg h-12 shadow-primary-500/40" isLoading={loading}>
                            Send Money <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Transfers are encrypted and secure.
                </p>
            </div>
        </motion.div>
    );
};
