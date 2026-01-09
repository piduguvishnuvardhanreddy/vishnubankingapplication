import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { pageVariants } from '../animations';
import { Card } from '../components/ui/Card';

export const AdminPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        api.get('/admin/users').then(res => setUsers(res.data.data.users)).catch(console.error);
    }, []);

    return (
        <motion.div variants={pageVariants} initial="initial" animate="animate">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
            <Card>
                <h3 className="font-bold text-lg mb-4">Registered Users</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                <th className="pb-3">Name</th>
                                <th className="pb-3">Email</th>
                                <th className="pb-3">Role</th>
                                <th className="pb-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u._id} className="text-sm">
                                    <td className="py-3 font-medium text-gray-900">{u.name}</td>
                                    <td className="py-3 text-gray-600">{u.email}</td>
                                    <td className="py-3">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </motion.div>
    );
};
