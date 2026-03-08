import React from 'react';
import { X, Sparkles, AlertTriangle, TrendingDown, Info } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { clsx } from 'clsx';
import './FullAnalysisModal.css';

interface FullAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FullAnalysisModal({ isOpen, onClose }: FullAnalysisModalProps) {
    const { state } = useAppContext();
    const insights = state.insights;
    const currency = insights?.currency || '$';

    if (!isOpen) return null;

    const formatCurr = (amount: number) => {
        const symbol = currency.length > 1 ? `${currency} ` : currency;
        return `${symbol}${Math.abs(amount).toFixed(2)}`;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-accent" />
                        <h2>WealthScan Intelligence Report</h2>
                    </div>
                    <button className="icon-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {!insights ? (
                        <div className="p-8 text-center text-muted">
                            <p>No AI analysis available for this statement yet.</p>
                        </div>
                    ) : (
                        <div className="analysis-sections">

                            {/* Executive Summary */}
                            <section className="analysis-section">
                                <h3 className="section-title">Executive Summary</h3>
                                <p className="section-text text-muted">
                                    We analyzed <strong>{state.transactions.length}</strong> transactions spanning this statement period.
                                    Your spending is highly concentrated in <strong>{insights.topCategories?.[0] || 'various categories'}</strong>.
                                </p>
                            </section>

                            {/* Recommendations / Tips */}
                            {insights.savingsTip && (
                                <section className="analysis-section">
                                    <h3 className="section-title flex items-center gap-2"><TrendingDown className="text-accent" size={18} /> Primary Recommendation</h3>
                                    <div className="insight-card success border border-accent/20">
                                        <p>{insights.savingsTip}</p>
                                    </div>
                                </section>
                            )}

                            {/* Subscriptions */}
                            {insights.subscriptionAlerts && insights.subscriptionAlerts.length > 0 && (
                                <section className="analysis-section">
                                    <h3 className="section-title flex items-center gap-2"><AlertTriangle className="text-warning" size={18} /> Recurring Charges Detected</h3>
                                    <div className="subscriptions-list">
                                        {insights.subscriptionAlerts.map((sub, idx) => (
                                            <div key={idx} className="subscription-item">
                                                <Info size={16} className="text-info" />
                                                <span>{sub}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Deep Dive Grid */}
                            <section className="analysis-section pt-4">
                                <h3 className="section-title">Data Points</h3>
                                <div className="data-points-grid">
                                    <div className="data-point-card">
                                        <span className="text-sm text-muted block mb-1">Total Transactions Processed</span>
                                        <span className="text-xl font-bold">{insights.totalTransactions || state.transactions.length}</span>
                                    </div>
                                    <div className="data-point-card">
                                        <span className="text-sm text-muted block mb-1">Largest Single Output</span>
                                        <span className="text-xl font-bold">{insights.largestTransaction?.description || 'N/A'}</span>
                                        <span className="block text-sm text-danger mt-1">{insights.largestTransaction ? formatCurr(insights.largestTransaction.amount) : ''}</span>
                                    </div>
                                    <div className="data-point-card md:col-span-2">
                                        <span className="text-sm text-muted block mb-2">Top Spending Vectors</span>
                                        <div className="flex gap-2 flex-wrap">
                                            {insights.topCategories?.map((cat, idx) => (
                                                <span key={idx} className="category-badge border border-gray-700 bg-surface">{cat}</span>
                                            ))}
                                            {(!insights.topCategories || insights.topCategories.length === 0) && (
                                                <span className="text-sm">Not enough data to determine top vectors.</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
