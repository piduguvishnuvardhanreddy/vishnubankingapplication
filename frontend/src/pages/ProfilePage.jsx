import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';

export const ProfilePage = () => {
    const { user } = useAuth();

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
                <p className="text-slate-500 mt-2">Manage your personal information</p>
            </div>

            <Card className="space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Full Name</p>
                        <p className="text-lg font-medium text-slate-900">{user?.name}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Email Address</p>
                        <p className="text-lg font-medium text-slate-900">{user?.email}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Role</p>
                        <p className="text-lg font-medium text-slate-900 capitalize">{user?.role}</p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};
