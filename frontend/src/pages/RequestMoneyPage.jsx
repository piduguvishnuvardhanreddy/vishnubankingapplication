import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, CheckCircle, ShieldCheck } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RequestMoneyPage = () => {
    const [email, setEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            await api.post('/transactions/request', { fromEmail: email, amount: Number(amount) });
            setMsg({ type: 'success', text: 'Request sent successfully!' });
            setEmail('');
            setAmount('');
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.message || 'Request failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Request Money</h1>
                <p className="text-slate-500 mt-2">Ask friends or family for funds securely</p>
            </div>

            <Card className="border-t-4 border-t-emerald-500 shadow-xl shadow-emerald-500/5">
                {msg.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl mb-6 flex items-center ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}
                    >
                        {msg.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : null}
                        {msg.text}
                    </motion.div>
                )}

                <form onSubmit={handleRequest} className="space-y-6">
                    <Input
                        label="Payer Email"
                        type="email"
                        placeholder="payer@bank.com"
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
                        <Button type="submit" variant="secondary" className="w-full text-lg h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300" isLoading={loading}>
                            <ArrowDownLeft className="mr-2 w-5 h-5" /> Send Request
                        </Button>
                    </div>
                </form>
            </Card>

            <div className="mt-8 text-center">
                <p className="text-xs text-slate-400">
                    <ShieldCheck className="w-3 h-3 inline mr-1" />
                    Requests are secure and instant.
                </p>
            </div>
        </motion.div>
    );
};
