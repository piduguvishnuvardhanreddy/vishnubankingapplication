import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in (persistence)
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // We assume /accounts/my-account or a dedicated /auth/me endpoint exists.
            // Since I didn't create /auth/me, I'll use /accounts/my-account to validate session implicitly
            // OR I should ideally have a /auth/me. 
            // Let's use /accounts/my-account as a proxy for "am I logged in" for now or create /auth/me quickly in backend.
            // Actually, let's just try to access a protected route or rely on login state.
            // Better: Create a quick verify endpoint in backend logic or just use explicit Login.
            // Strategy: User starts as null. Login sets user. Refresh: we lose user state in memory. 
            // We need a way to restore it. 
            // I will implement a check using /accounts/my-account from accountRoutes. This returns account info + implied user content if I populate it.
            // But accountRoutes returns `data: { account }`. 
            // I need User info (name, role).
            // Let's update backend to support /auth/me or just fetch user info.
            // I will assume for now we don't persist heavily or I'll add a /auth/me endpoint in a sec? 
            // No, I will use `localStorage` to store basic user info (Name, Role) as a fallback cache, but `httpOnly` cookie handles the security.
            // NOTE: Storing role in localStorage is insecure for Access Control, but OK for UI logic (showing Admin link).
            // Real security is on Backend.

            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Auth check failed", error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        setUser(res.data.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.data.user)); // Cache user info
        return res.data;
    };

    const register = async (name, email, password) => {
        const res = await api.post('/auth/register', { name, email, password });
        setUser(res.data.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        return res.data;
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch (e) { /* ignore */ }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

