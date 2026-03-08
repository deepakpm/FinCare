import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAppContext } from '../../context/AppContext';

const COLORS = ['var(--accent-primary)', 'var(--danger)', 'var(--info)', 'var(--warning)', 'var(--accent-secondary)'];

export function ExpenseCategoriesChart() {
    const { state } = useAppContext();

    const chartData = useMemo(() => {
        if (!state.transactions || state.transactions.length === 0) return [];

        const expenses = state.transactions.filter(t => t.type === 'DEBIT');
        const sums: Record<string, number> = {};
        let total = 0;

        expenses.forEach(t => {
            sums[t.category] = (sums[t.category] || 0) + t.amount;
            total += t.amount;
        });

        // Convert to array and calculate percentage
        return Object.keys(sums)
            .map((cat, idx) => ({
                name: cat,
                value: sums[cat],
                percentage: Math.round((sums[cat] / total) * 100),
                color: COLORS[idx % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value); // largest first
    }, [state.transactions]);

    if (chartData.length === 0) {
        return <div className="p-4 text-center text-muted">No expense data available</div>;
    }

    const totalExpenseValue = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div style={{ width: '100%', height: 250, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '200px', height: '200px', flexShrink: 0, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={4}
                        >
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'var(--bg-surface-hover)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{state.insights?.currency || '$'}{totalExpenseValue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total</div>
                </div>
            </div>

            {/* Legend */}
            <div style={{ flex: 1, paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '100%' }}>
                {chartData.map((item: any, index: number) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '8px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }}></span>
                            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</span>
                        </div>
                        <span style={{ fontWeight: 600, flexShrink: 0 }}>{item.percentage}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
