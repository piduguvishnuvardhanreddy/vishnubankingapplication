import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { Card } from './ui/Card';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#10b981', '#ef4444']; // Emerald (Income), Red (Expense)

export const TransactionBarChart = ({ data }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

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
        <Card className="p-6 h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Activity</h3>
            <div className="h-[300px] w-full min-h-[300px]">
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `$${value}`}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                cursor={{ fill: '#f1f5f9' }}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="credit" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar dataKey="debit" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No transaction data available
                    </div>
                )}
            </div>
        </Card>
    );
};

export const TransactionPieChart = ({ data }) => {
    const pieData = useMemo(() => {
        if (!data || data.length === 0) return [];

        let totalIncome = 0;
        let totalExpense = 0;

        data.forEach(item => {
            if (item._id.type === 'credit') totalIncome += item.total;
            if (item._id.type === 'debit') totalExpense += item.total;
        });

        return [
            { name: 'Income', value: totalIncome },
            { name: 'Expenses', value: totalExpense }
        ].filter(d => d.value > 0);
    }, [data]);

    return (
        <Card className="p-6 h-[400px]">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Income vs Expenses</h3>
            <div className="h-[300px] w-full flex items-center justify-center min-h-[300px]">
                {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        No chart data available
                    </div>
                )}
            </div>
        </Card>
    );
};

// Default export for backward compatibility if needed, but we used named exports now
export const AnalyticsChart = TransactionBarChart;
