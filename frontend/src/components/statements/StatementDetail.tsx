import React, { useState } from 'react';
import { Search, SlidersHorizontal, ArrowDownToLine, RefreshCw, Sparkles, Send } from 'lucide-react';
import { TransactionsTable } from './TransactionsTable';
import { FullAnalysisModal } from '../dashboard/FullAnalysisModal';
import './StatementDetail.css';

const mockTransactions = [
    { id: 1, date: 'Jul 24, 2023', description: 'Amazon.com Marketplace', category: 'Shopping', badgeColor: 'var(--info)', debit: '$124.99', credit: '—', balance: '$4,520.12' },
    { id: 2, date: 'Jul 22, 2023', description: 'Starbucks Coffee #241', category: 'Dining', badgeColor: 'var(--warning)', debit: '$5.45', credit: '—', balance: '$4,645.11' },
    { id: 3, date: 'Jul 21, 2023', description: 'Stripe / OpenAI Subscription', category: 'SaaS', badgeColor: '#8b5cf6', debit: '$20.00', credit: '—', balance: '$4,650.56' },
    { id: 4, date: 'Jul 18, 2023', description: 'Direct Deposit - TechCorp', category: 'Income', badgeColor: 'var(--accent-primary)', debit: '—', credit: '$3,450.00', balance: '$4,670.56' },
    { id: 5, date: 'Jul 15, 2023', description: 'Netflix.com Payment', category: 'SaaS', badgeColor: '#8b5cf6', debit: '$15.99', credit: '—', balance: '$1,220.56' },
];

interface StatementDetailProps {
    data?: any;
    onBack?: () => void;
}

export function StatementDetail({ data, onBack }: StatementDetailProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const transactions = data?.transactions || mockTransactions;
    const insights = data?.insights || {};

    // Map backend transactions to frontend table format if real data is provided
    const currency = insights.currency || '$';
    const symbol = currency.length > 1 ? `${currency} ` : currency;

    const formattedTransactions = transactions.map((t: any, index: number) => {
        if (t.id) return t; // Already formatted (mock)
        return {
            id: index + 1,
            date: t.date,
            description: t.description,
            category: t.category,
            badgeColor: t.type === 'CREDIT' ? 'var(--accent-primary)' : 'var(--info)',
            debit: t.type === 'DEBIT' ? `${symbol}${t.amount.toFixed(2)}` : '—',
            credit: t.type === 'CREDIT' ? `${symbol}${t.amount.toFixed(2)}` : '—',
            balance: t.balance ? `${symbol}${t.balance.toFixed(2)}` : '—'
        };
    });

    return (
        <div className="statement-detail animate-fade-in">
            <div className="detail-header">
                <div>
                    <span className="breadcrumb" onClick={onBack}>STATEMENTS</span>
                    <span className="breadcrumb-separator">›</span>
                    <span className="breadcrumb-current">{data?.filename ? data.filename.toUpperCase() : 'STATEMENT_JULY_2023.PDF'}</span>
                    <h2>{data?.filename || 'Bank of America - July'}</h2>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary"><ArrowDownToLine size={16} /> Export CSV</button>
                    <button className="btn-primary"><RefreshCw size={16} /> Re-run AI</button>
                </div>
            </div>

            {/* Detail Metrics */}
            <div className="detail-metrics-grid">
                <div className="metric-card">
                    <span className="metric-title">Total Transactions</span>
                    <span className="metric-value">{insights.totalTransactions || formattedTransactions.length}</span>
                    <span className="trend-positive text-sm">↗ +12% vs last month</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">Largest Transaction</span>
                    <span className="metric-value">{insights.largestTransaction?.description || 'N/A'}</span>
                    <span className="text-muted text-sm">{insights.largestTransaction?.amount ? `$${insights.largestTransaction.amount.toFixed(2)}` : ''}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-title">Categorization</span>
                    <span className="metric-value">AI Processed</span>
                    <span className="text-muted text-sm">Via Gemini 2.5 Flash</span>
                </div>
            </div>

            <div className="table-layout">
                {/* Main Table Area */}
                <div className="table-main-area">
                    <div className="table-controls">
                        <div className="search-bar">
                            <Search size={16} className="text-muted" />
                            <input type="text" placeholder="Filter transactions..." className="search-input" />
                        </div>

                        {/* AI Query Box */}
                        <div className="ai-query-box">
                            <div className="ai-input-wrapper">
                                <Sparkles size={16} className="text-accent" />
                                <input type="text" placeholder="Ask about your finances..." />
                                <button className="send-btn">SEND ➢</button>
                            </div>
                        </div>

                        <div className="filter-group">
                            <button className="filter-btn">Date Range</button>
                            <button className="filter-btn">Category</button>
                            <button className="filter-btn"><SlidersHorizontal size={14} /> Sort</button>
                        </div>
                    </div>

                    <TransactionsTable data={formattedTransactions} />
                </div>

                {/* AI Insights Right Panel */}
                <div className="detail-sidebar">
                    <div className="sidebar-header">
                        <h3>AI Insights</h3>
                    </div>

                    {insights.largestTransaction && (
                        <div className="insight-card warning">
                            <span className="text-xs font-bold text-danger">⚠️ LARGEST EXPENSE</span>
                            <h4>{insights.largestTransaction.description}</h4>
                            <p className="text-sm text-muted">Amounted to {insights.currency || '$'}{insights.largestTransaction.amount.toFixed(2)}</p>
                        </div>
                    )}

                    {insights.subscriptionAlerts?.map((alert: string, i: number) => (
                        <div key={i} className="insight-card info">
                            <span className="text-xs font-bold text-info">🔄 SUBSCRIPTION DETECTED</span>
                            <h4>{alert}</h4>
                            <p className="text-sm text-muted">Detected as a recurring payment.</p>
                        </div>
                    ))}

                    {insights.savingsTip && (
                        <div className="insight-card mt-4 p-4 border rounded shadow-sm">
                            <span className="text-xs font-bold text-accent">💡 SAVINGS TIP</span>
                            <p className="text-sm text-muted mt-2">{insights.savingsTip}</p>
                        </div>
                    )}

                    <button className="btn-primary w-full mt-4" onClick={() => setIsModalOpen(true)}>View Full Analysis</button>
                </div>
            </div>

            <FullAnalysisModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
