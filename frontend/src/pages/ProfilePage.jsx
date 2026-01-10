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
    const [profile, setProfile] = useState({ name: '', email: '', profilePicture: null });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Password State
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loadingPass, setLoadingPass] = useState(false);

    // PIN State
    const [pins, setPins] = useState({ current: '', new: '', confirm: '' });
    const [loadingPin, setLoadingPin] = useState(false);

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
                if (profRes.data.data.user.profilePicture) {
                    // Ensure full URL if needed, depending on how you want to serve it. 
                    // Ideally backend sends full URL or frontend prepends API_BASE
                }
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
            const formData = new FormData();
            formData.append('name', profile.name);
            formData.append('email', profile.email);
            if (selectedFile) {
                formData.append('profilePicture', selectedFile);
            }

            const res = await api.patch('/users/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update local state with returned user data to get the new image URL
            setProfile(res.data.data.user);
            setSelectedFile(null); // Reset selection
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

    const handleChangePin = async (e) => {
        e.preventDefault();
        if (pins.new !== pins.confirm) {
            return showError('New PINs do not match');
        }
        if (pins.new.length < 4 || pins.new.length > 6) {

            return showError('PIN must be 4-6 digits');
        }
        setLoadingPin(true);
        try {
            await api.post('/users/change-pin', {
                currentPin: pins.current,
                newPin: pins.new
            });
            showSuccess('PIN updated successfully');
            setPins({ current: '', new: '', confirm: '' });
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to update PIN');
        } finally {
            setLoadingPin(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Helper to constructing image URL
    // If profilePicture is just "uploads/filename.jpg", we need authentication details or public access.
    // Since we made /uploads static, we can access it via http://localhost:5000/uploads/...
    // NOTE: In production, use env variable for base URL.
    const getAvatarSrc = () => {
        if (previewUrl) return previewUrl;
        if (profile.profilePicture) {
            // Assuming backend runs on same host/port logic or we use VITE_API_URL base
            // A simple way is to rely on the backend returning a relative path, and prepending the API base
            // But for now let's assume standard localhost dev environment or relative
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            // Remove /api from base if it exists to get root
            const rootUrl = baseUrl.replace('/api', '');
            return `${rootUrl}/${profile.profilePicture}`;
        }
        return null;
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

                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-4 border-white shadow-lg">
                                {getAvatarSrc() ? (
                                    <img src={getAvatarSrc()} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-indigo-600">
                                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-colors">
                                <User className="w-4 h-4" />
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Click icon to change avatar</p>
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
                            Save Changes
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

                        <div className="space-y-8">
                            {/* Change Password */}
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Change Password</h3>
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                    placeholder="••••••••"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="New Password"
                                        type="password"
                                        value={passwords.new}
                                        onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                        placeholder="••••"
                                    />
                                    <Input
                                        label="Confirm"
                                        type="password"
                                        value={passwords.confirm}
                                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                        placeholder="••••"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" isLoading={loadingPass} className="w-full">
                                    Update Password
                                </Button>
                            </form>

                            {/* Change PIN */}
                            <form onSubmit={handleChangePin} className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900 border-b pb-2">Transaction PIN</h3>
                                <Input
                                    label="Current PIN"
                                    type="password"
                                    value={pins.current}
                                    onChange={(e) => setPins({ ...pins, current: e.target.value })}
                                    maxLength={6}
                                    placeholder="Old PIN"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="New PIN"
                                        type="password"
                                        value={pins.new}
                                        onChange={(e) => setPins({ ...pins, new: e.target.value })}
                                        maxLength={6}
                                        placeholder="New"
                                    />
                                    <Input
                                        label="Confirm"
                                        type="password"
                                        value={pins.confirm}
                                        onChange={(e) => setPins({ ...pins, confirm: e.target.value })}
                                        maxLength={6}
                                        placeholder="Confirm"
                                    />
                                </div>
                                <Button type="submit" variant="secondary" isLoading={loadingPin} className="w-full">
                                    Update PIN
                                </Button>
                            </form>
                        </div>
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
