import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, ArrowRight } from 'lucide-react';
import api from '../lib/axios';
import { pageVariants, cardVariants } from '../animations';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { AnalyticsChart } from '../components/AnalyticsChart';

export const DashboardPage = () => {
    const [account, setAccount] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountRes, analyticsRes] = await Promise.all([
                    api.get('/accounts/my-account'),
                    api.get('/transactions/analytics')
                ]);
                setAccount(accountRes.data.data.account);
                setAnalytics(analyticsRes.data.data.stats);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-slate-500">Loading dashboard...</div>;

    const StatCard = ({ label, value, icon: Icon, colorClass }) => (
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass-card p-6 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-24 h-24" />
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorClass} bg-opacity-20`}>
                <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-slate-500">{label}</p>
            </div>
        </motion.div>
    );

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Welcome back to your financial overview</p>
                </div>
                <Link to="/transfer">
                    <Button className="shadow-lg shadow-primary-500/20">
                        <ArrowUpRight className="w-4 h-4 mr-2" /> New Transfer
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Available Balance"
                    value={`$${account?.balance?.toLocaleString() || '0.00'}`}
                    icon={Wallet}
                    colorClass="bg-indigo-100 text-indigo-600"
                />
                <StatCard
                    label="Monthly Savings"
                    value="$1,250.00"
                    icon={ArrowDownLeft}
                    colorClass="bg-emerald-100 text-emerald-600"
                />
                <StatCard
                    label="Monthly Expenses"
                    value="$840.50"
                    icon={ArrowUpRight}
                    colorClass="bg-rose-100 text-rose-600"
                />
            </div>

            {/* Analytics Section */}
            {analytics.length > 0 && (
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                    <AnalyticsChart data={analytics} />
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                            <Link to="/history" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">View All</Link>
                        </div>
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <div className="bg-slate-50 p-4 rounded-full mb-3">
                                <CreditCard className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-medium">No recent transactions</p>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="bg-gradient-to-b from-white to-slate-50">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
                        <div className="space-y-4">
                            <Link to="/transfer" className="block">
                                <Button variant="secondary" className="w-full justify-between h-14 bg-white hover:border-primary-200 group">
                                    <span className="flex items-center"><ArrowUpRight className="mr-3 text-rose-500 bg-rose-50 p-1 rounded w-6 h-6" /> Send Money</span>
                                    <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                </Button>
                            </Link>
                            <Link to="/request" className="block">
                                <Button variant="secondary" className="w-full justify-between h-14 bg-white hover:border-primary-200 group">
                                    <span className="flex items-center"><ArrowDownLeft className="mr-3 text-emerald-500 bg-emerald-50 p-1 rounded w-6 h-6" /> Request Money</span>
                                    <ArrowDownLeft className="w-4 h-4 text-slate-300 transition-colors" />
                                </Button>
                            </Link>
                            <Link to="/balance" className="block">
                                <Button variant="secondary" className="w-full justify-between h-14 bg-white hover:border-primary-200 group">
                                    <span className="flex items-center"><Wallet className="mr-3 text-indigo-500 bg-indigo-50 p-1 rounded w-6 h-6" /> Check Balance</span>
                                    <ArrowRight className="w-4 h-4 text-slate-300 transition-colors" />
                                </Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </motion.div>
    );
};
