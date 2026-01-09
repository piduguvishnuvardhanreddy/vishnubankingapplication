import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card } from './ui/Card';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const AnalyticsChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Transform data: [{_id: {month, year, type}, total}] -> [{name: 'Jan', credit: 100, debit: 50}]
        const processed = {};

        data.forEach(item => {
            const key = `${months[item._id.month - 1]} ${item._id.year}`;
            if (!processed[key]) {
                processed[key] = { name: key, credit: 0, debit: 0 };
            }
            processed[key][item._id.type] = item.total;
        });

        return Object.values(processed);
    }, [data]);

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Transaction Overview</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip
                            formatter={(value) => [`$${value}`, undefined]}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="credit" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="debit" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
