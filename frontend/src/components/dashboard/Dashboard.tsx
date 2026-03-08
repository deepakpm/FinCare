import React, { useState } from 'react';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { clsx } from 'clsx';
import { CashFlowChart } from './CashFlowChart';
import { ExpenseCategoriesChart } from './ExpenseCategoriesChart';
import { TopMerchantsList } from './TopMerchantsList';
import { FullAnalysisModal } from './FullAnalysisModal';
import { useAppContext } from '../../context/AppContext';
import './Dashboard.css';

interface MetricCardProps {
    title: string;
    value: string;
    trend: string;
    isPositive: boolean;
    icon: React.ElementType;
}

export function MetricCard({ title, value, trend, isPositive, icon: Icon }: MetricCardProps) {
    return (
        <div className="metric-card">
            <div className="metric-header">
                <span className="metric-title">{title}</span>
                <div className={clsx('metric-trend', isPositive ? 'trend-positive' : 'trend-negative')}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span>{trend}</span>
                </div>
            </div>
            <div className="metric-body">
                <span className="metric-value">{value}</span>
                <div className="metric-icon-wrapper">
                    <Icon size={24} className={isPositive ? 'icon-positive' : (title === 'Net Savings' ? 'icon-info' : 'icon-negative')} />
                </div>
            </div>
            <div className={clsx('metric-bar', isPositive ? 'bar-positive' : (title === 'Net Savings' ? 'bar-info' : 'bar-negative'))}></div>
        </div>
    );
}

export function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { state } = useAppContext();
    const transactions = state.transactions;
    const currency = state.insights?.currency || '$';

    const totalIncome = transactions
        .filter((t: any) => t.type === 'CREDIT')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t: any) => t.type === 'DEBIT')
        .reduce((sum: number, t: any) => sum + t.amount, 0);

    const netSavings = totalIncome - totalExpenses;

    const formatCurrency = (amount: number) => {
        // If the currency is a recognizable code like USD, prepend it or format nicely.
        // For simplicity, we just safely prepend it. 
        const symbol = currency.length > 1 ? `${currency} ` : currency;
        return `${symbol}${Math.abs(amount).toFixed(2)}`;
    };

    return (
        <div className="dashboard animate-fade-in">
            {/* Top Metrics Row */}
            <div className="metrics-grid">
                <MetricCard
                    title="Total Income"
                    value={transactions.length > 0 ? formatCurrency(totalIncome) : '--'}
                    trend={transactions.length > 0 ? "Current Period" : ""}
                    isPositive={true}
                    icon={TrendingUp}
                />
                <MetricCard
                    title="Total Expenses"
                    value={transactions.length > 0 ? formatCurrency(totalExpenses) : '--'}
                    trend={transactions.length > 0 ? "Current Period" : ""}
                    isPositive={false}
                    icon={TrendingDown}
                />
                <MetricCard
                    title="Net Savings"
                    value={transactions.length > 0 ? formatCurrency(netSavings) : '--'}
                    trend={transactions.length > 0 ? "Current Period" : ""}
                    isPositive={netSavings >= 0}
                    icon={PiggyBank}
                />
            </div>

            <div className="dashboard-grid">
                {/* Main Chart Area */}
                <div className="panel chart-panel">
                    <div className="panel-header">
                        <h3>Cash Flow Overview</h3>
                        <p>Comparing income and expenses over the last 6 months</p>
                    </div>
                    <div className="chart-placeholder">
                        <CashFlowChart />
                    </div>
                </div>

                {/* AI Insights Sidebar */}
                <div className="panel insights-panel relative">
                    <div className="panel-header">
                        <h3>AI Insights</h3>
                    </div>
                    <div className="insights-list">
                        {state.insights?.subscriptionAlerts && state.insights.subscriptionAlerts.length > 0 ? (
                            state.insights.subscriptionAlerts.map((alert: string, idx: number) => (
                                <div key={idx} className="insight-card warning">
                                    <span className="insight-icon">⚠️</span>
                                    <div>
                                        <strong>Subscription Alert:</strong>
                                        <p>{alert}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="insight-card warning">
                                <span className="insight-icon">⚠️</span>
                                <div>
                                    <strong>Subscription Alert:</strong>
                                    <p>We detected 3 new monthly charges for streaming services totaling <span className="text-danger">{currency}45.99</span>.</p>
                                </div>
                            </div>
                        )}

                        {state.insights?.savingsTip ? (
                            <div className="insight-card success">
                                <span className="insight-icon">💡</span>
                                <div>
                                    <strong>Savings Tip:</strong>
                                    <p>{state.insights.savingsTip}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="insight-card success">
                                <span className="insight-icon">💡</span>
                                <div>
                                    <strong>Savings Tip:</strong>
                                    <p>Your food spending is 15% higher than usual. Cutting dining out could save you <span className="text-accent">{currency}320</span> this month.</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="full-width-btn outline-btn mt-auto" onClick={() => setIsModalOpen(true)}>View Full Intelligence Report</button>
                </div>
            </div>

            <div className="dashboard-grid bottom-grid">
                <div className="panel">
                    <div className="panel-header">
                        <h3>Expense Categories</h3>
                    </div>
                    <ExpenseCategoriesChart />
                </div>

                <div className="panel">
                    <div className="panel-header">
                        <h3>Top Merchants</h3>
                    </div>
                    <TopMerchantsList />
                </div>
            </div>

            <FullAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
