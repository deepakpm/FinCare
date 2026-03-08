import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import './AnalyticsView.css';

export function AnalyticsView() {
    const { state } = useAppContext();
    const currency = state.insights?.currency || '$';

    const { dailyData, radarData, dayOfWeekData } = useMemo(() => {
        if (!state.transactions || state.transactions.length === 0) {
            return { dailyData: [], radarData: [], dayOfWeekData: [] };
        }

        const dailyMap: Record<string, { income: number, expense: number }> = {};
        const catMap: Record<string, number> = {};

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dowMap: Record<string, number> = {
            'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0, 'Friday': 0, 'Saturday': 0
        };

        state.transactions.forEach(t => {
            // Daily Trend
            const d = new Date(t.date);
            const dateStr = t.date; // assuming YYYY-MM-DD
            if (!dailyMap[dateStr]) dailyMap[dateStr] = { income: 0, expense: 0 };

            if (t.type === 'CREDIT') {
                dailyMap[dateStr].income += t.amount;
            } else {
                dailyMap[dateStr].expense += t.amount;

                // Radar Category
                catMap[t.category] = (catMap[t.category] || 0) + t.amount;

                // Day of Week
                if (!isNaN(d.getTime())) {
                    dowMap[daysOfWeek[d.getDay()]] += t.amount;
                }
            }
        });

        const dailyArr = Object.keys(dailyMap).sort().map(date => ({
            date: date.substring(5), // MM-DD
            Income: dailyMap[date].income,
            Expense: dailyMap[date].expense
        }));

        const radarArr = Object.keys(catMap).map(cat => ({
            category: cat,
            amount: catMap[cat]
        })).sort((a, b) => b.amount - a.amount).slice(0, 6); // Top 6 for nice radar

        const maxRadar = Math.max(...radarArr.map(r => r.amount), 1);
        const normalizedRadar = radarArr.map(r => ({
            category: r.category,
            amount: r.amount,
            fullMark: maxRadar
        }));

        const dowArr = daysOfWeek.map(day => ({
            day: day.substring(0, 3), // Sun, Mon, etc.
            amount: dowMap[day]
        }));

        return { dailyData: dailyArr, radarData: normalizedRadar, dayOfWeekData: dowArr };
    }, [state.transactions]);

    const formatCurr = (value: number) => {
        const symbol = currency.length > 1 ? `${currency} ` : currency;
        return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    };

    if (dailyData.length === 0) {
        return (
            <div className="analytics-view empty-state animate-fade-in">
                <div className="empty-message">
                    <h3>No Data Available</h3>
                    <p>Upload a statement to generate analytics.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-view animate-fade-in">
            <div className="analytics-header">
                <h2>Advanced Analytics</h2>
                <p className="text-muted">Deep dive into your spending and income patterns over time.</p>
            </div>

            <div className="analytics-layout">
                {/* Daily Trend Area Chart */}
                <div className="panel full-width-panel">
                    <div className="panel-header">
                        <h3>Daily Cash Flow Trend</h3>
                    </div>
                    <div className="chart-container" style={{ height: 350 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--danger)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--danger)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurr} />
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-surface-hover)', borderColor: 'var(--border-color)', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: any) => [formatCurr(value as number), undefined]}
                                />
                                <Area type="monotone" dataKey="Income" stroke="var(--accent-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="Expense" stroke="var(--danger)" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-grid">
                    {/* Category Radar Chart */}
                    <div className="panel split-panel">
                        <div className="panel-header">
                            <h3>Spending Footprint</h3>
                            <p className="text-xs text-muted">Top 6 categories</p>
                        </div>
                        <div className="chart-container" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="var(--border-color)" />
                                    <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                                    <Radar name="Expenses" dataKey="amount" stroke="var(--info)" fill="var(--info)" fillOpacity={0.5} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-surface-hover)', borderColor: 'var(--border-color)', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value: any) => [formatCurr(value as number), "Spent"]}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Day of Week Bar Chart */}
                    <div className="panel split-panel">
                        <div className="panel-header">
                            <h3>Intensity by Day of Week</h3>
                            <p className="text-xs text-muted">Total expenses</p>
                        </div>
                        <div className="chart-container" style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dayOfWeekData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                    <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatCurr} />
                                    <Tooltip
                                        cursor={{ fill: 'var(--bg-surface-hover)' }}
                                        contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: '#fff' }}
                                        formatter={(value: any) => [formatCurr(value as number), "Spent"]}
                                    />
                                    <Bar dataKey="amount" fill="var(--warning)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
