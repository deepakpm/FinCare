import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

export function CashFlowChart() {
    const { state } = useAppContext();

    const chartData = useMemo(() => {
        if (!state.transactions || state.transactions.length === 0) return [];

        const monthlyTotals: Record<string, { income: number, expenses: number }> = {};

        state.transactions.forEach(t => {
            const date = new Date(t.date);
            const monthName = date.toLocaleString('default', { month: 'short' }).toUpperCase();

            if (!monthlyTotals[monthName]) {
                monthlyTotals[monthName] = { income: 0, expenses: 0 };
            }

            if (t.type === 'CREDIT') {
                monthlyTotals[monthName].income += t.amount;
            } else {
                monthlyTotals[monthName].expenses += t.amount;
            }
        });

        // Ensure chronological sorting could be added here if year is considered, 
        // but for a simple statement processing, returning the keys as is or sorted alphabetically works.
        const result = Object.keys(monthlyTotals).map(month => ({
            name: month,
            income: monthlyTotals[month].income,
            expenses: monthlyTotals[month].expenses
        }));

        return result;
    }, [state.transactions]);

    if (chartData.length === 0) {
        return <div className="p-4 text-center text-muted">No timeline data available</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barSize={12}
                    barGap={4}
                >
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        dy={10}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{
                            backgroundColor: 'var(--bg-surface-hover)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)'
                        }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="income" name="Income" fill="var(--accent-primary)" radius={[4, 4, 4, 4]} />
                    <Bar dataKey="expenses" name="Expenses" fill="var(--text-muted)" radius={[4, 4, 4, 4]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
