import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Lock, CreditCard } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../context/NotificationContext';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const ProfilePage = () => {
    const { user: authUser } = useAuth();
    const { showSuccess, showError } = useNotification();

    // Profile State
    const [profile, setProfile] = useState({ name: '', email: '', role: '' });
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loadingPass, setLoadingPass] = useState(false);

    // Account data
    const [account, setAccount] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profRes, accRes] = await Promise.all([
                    api.get('/users/profile'),
                    api.get('/accounts/my-account')
                ]);
                setProfile(profRes.data.data.user);
                setAccount(accRes.data.data.account);
            } catch (err) {
                console.error(err);
                if (authUser) setProfile(authUser);
            }
        };
        fetchData();
    }, [authUser]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoadingProfile(true);
        try {
            await api.patch('/users/profile', { name: profile.name, email: profile.email });
            showSuccess('Profile updated successfully');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return showError('New passwords do not match');
        }
        setLoadingPass(true);
        try {
            await api.post('/users/change-password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            showSuccess('Password changed successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoadingPass(false);
        }
    };

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-4xl mx-auto py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
                <p className="text-slate-500 mt-2">Manage your profile and security preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <Card className="h-fit">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                            <User className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">Profile Information</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <Input
                            label="Full Name"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            icon={User}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            icon={Mail}
                        />
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500 font-medium">Account Role</span>
                            </div>
                            <span className="text-sm font-bold text-slate-700 capitalize">{profile.role}</span>
                        </div>

                        <Button type="submit" isLoading={loadingProfile} className="w-full">
                            Update Profile
                        </Button>
                    </form>
                </Card>

                {/* Security & Account Status */}
                <div className="space-y-8">
                    <Card>
                        <div className="flex items-center mb-6">
                            <div className="p-3 bg-emerald-100 rounded-lg mr-4">
                                <Lock className="w-6 h-6 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Security</h2>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                placeholder="••••••••"
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                placeholder="••••••••"
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                placeholder="••••••••"
                            />
                            <Button type="submit" variant="secondary" isLoading={loadingPass} className="w-full">
                                Change Password
                            </Button>
                        </form>
                    </Card>

                    {account && (
                        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="p-2 bg-white/10 rounded-lg mr-3">
                                        <CreditCard className="w-5 h-5 text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold">Account Status</h2>
                                </div>
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase rounded-full border border-emerald-500/30">
                                    Active
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-slate-400 text-sm mb-1">Account Number</p>
                                    <p className="text-2xl font-mono tracking-wider">{account.accountNumber}</p>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                                    <div>
                                        <p className="text-slate-400 text-sm">Current Balance</p>
                                        <p className="text-xl font-bold">${account.balance?.toLocaleString()}</p>
                                    </div>
                                    <Shield className="w-12 h-12 text-white/5" />
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
