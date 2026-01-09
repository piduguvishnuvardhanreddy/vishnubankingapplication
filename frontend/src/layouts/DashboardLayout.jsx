import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, History, LogOut, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center px-4 py-3.5 mb-1 rounded-xl transition-all duration-200 group ${active
            ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 shadow-sm border border-primary-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
    >
        <Icon className={`w-5 h-5 mr-3 transition-colors ${active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
        <span className="font-medium">{label}</span>
    </Link>
);

export const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: ArrowRightLeft, label: 'Transfer', to: '/transfer' },
        { icon: History, label: 'History', to: '/history' },
    ];

    if (user?.role === 'admin') {
        navItems.push({ icon: ShieldCheck, label: 'Admin Panel', to: '/admin' });
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                <div className="p-8">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-primary-500/30">B</div>
                        BankApp
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Menu</p>
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            {...item}
                            active={location.pathname === item.to}
                        />
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100">
                    <div className="flex items-center p-3 mb-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold mr-3 border-2 border-white shadow-sm">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2.5 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-red-600 transition-colors group"
                    >
                        <LogOut className="w-5 h-5 mr-3 group-hover:text-red-600 transition-colors" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50">
                <div className="container mx-auto px-8 py-10 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
