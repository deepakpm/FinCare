import React, { useMemo } from 'react';
import { Landmark, Banknote, PiggyBank, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { useAppContext } from '../../context/AppContext';
import './BudgetingView.css';

const DEFAULT_LIMITS: Record<string, number> = {
    'Rent & Utilities': 2500,
    'Dining & Groceries': 800,
    'Entertainment': 600,
    'Subscriptions': 200,
};

export function BudgetingView() {
    const { state } = useAppContext();

    const { categories, totalBudget, spentSoFar } = useMemo(() => {
        const spent: Record<string, number> = {
            'Rent & Utilities': 0,
            'Dining & Groceries': 0,
            'Entertainment': 0,
            'Subscriptions': 0,
        };

        if (state.transactions) {
            state.transactions.filter(t => t.type === 'DEBIT').forEach(t => {
                const cat = t.category || '';
                if (cat.includes('Rent') || cat.includes('Utilities')) spent['Rent & Utilities'] += t.amount;
                else if (cat.includes('Dining') || cat.includes('Groceries')) spent['Dining & Groceries'] += t.amount;
                else if (cat.includes('Entertainment')) spent['Entertainment'] += t.amount;
                else if (cat.includes('SaaS') || cat.includes('Subscription')) spent['Subscriptions'] += t.amount;
            });
        }

        const catsArray = Object.keys(DEFAULT_LIMITS).map(name => ({
            name,
            spent: spent[name],
            limit: DEFAULT_LIMITS[name],
            over: spent[name] > DEFAULT_LIMITS[name]
        }));

        const totalBudgetCalc = Object.values(DEFAULT_LIMITS).reduce((a, b) => a + b, 0);
        const spentSoFarCalc = Object.values(spent).reduce((a, b) => a + b, 0);

        return { categories: catsArray, totalBudget: totalBudgetCalc, spentSoFar: spentSoFarCalc };
    }, [state.transactions]);

    const remaining = totalBudget - spentSoFar;
    const currency = state.insights?.currency || '$';
    const formatCurr = (v: number) => {
        const symbol = currency.length > 1 ? `${currency} ` : currency;
        return `${symbol}${Math.abs(v).toFixed(2)}`;
    };

    return (
        <div className="budgeting-view animate-fade-in">
            <div className="budget-header">
                <button className="btn-primary ml-auto flex items-center gap-2">
                    <Plus size={16} /> New Budget
                </button>
            </div>

            <div className="budget-metrics-grid">
                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Total Budget</span>
                        <Landmark size={20} className="text-accent" />
                    </div>
                    <span className="metric-value">{formatCurr(totalBudget)}</span>
                    <span className="trend-positive text-sm">↗ +8% from last month</span>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Spent So Far</span>
                        <Banknote size={20} className="text-warning" />
                    </div>
                    <span className="metric-value">{formatCurr(spentSoFar)}</span>
                    <span className="text-muted text-sm">{((spentSoFar / totalBudget) * 100).toFixed(1)}% of total limit</span>
                </div>

                <div className="metric-card">
                    <div className="metric-header">
                        <span className="metric-title">Remaining Safe-to-Spend</span>
                        <PiggyBank size={20} className="text-accent" />
                    </div>
                    <span className={clsx('metric-value', remaining < 0 ? 'text-danger' : 'text-accent')}>{formatCurr(remaining)}</span>
                    <span className="text-muted text-sm">Expected surplus: $450.00</span>
                </div>
            </div>

            <div className="budget-layout">
                <div className="budget-main">
                    <div className="panel chart-panel">
                        <div className="panel-header flex justify-between">
                            <h3>Monthly Spending vs Targets</h3>
                            <div className="chart-legend">
                                <span className="legend-item"><span className="dot dot-actual"></span> Actual</span>
                                <span className="legend-item"><span className="dot dot-budget"></span> Budget</span>
                            </div>
                        </div>
                        <div className="chart-placeholder">
                            <div className="mock-chart">Bar Chart placeholder (Dual bars per category)</div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel-header">
                            <h3>Budget Progress by Category</h3>
                        </div>
                        <div className="category-progress-list">
                            {categories.map((cat, idx) => {
                                const percent = Math.min((cat.spent / cat.limit) * 100, 100);
                                return (
                                    <div key={idx} className="progress-item">
                                        <div className="progress-header">
                                            <span className="font-medium text-primary">{cat.name}</span>
                                            <span className="text-secondary">{currency}{cat.spent} / {currency}{cat.limit}</span>
                                        </div>
                                        <div className="progress-bar-bg">
                                            <div
                                                className={clsx('progress-bar-fill', cat.over ? 'fill-danger' : 'fill-accent')}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        {cat.over && (
                                            <span className="text-xs text-danger mt-1">Budget exceeded by ${cat.spent - cat.limit}.00</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="budget-sidebar">
                    <div className="panel">
                        <div className="panel-header">
                            <h3>Set Limits</h3>
                            <p>Adjust your monthly spending caps to stay on track.</p>
                        </div>

                        <div className="limits-form">
                            <div className="input-group">
                                <label>HOUSING LIMIT</label>
                                <div className="input-with-icon">
                                    <span>$</span>
                                    <input type="number" defaultValue={2500} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>FOOD LIMIT</label>
                                <div className="input-with-icon">
                                    <span>$</span>
                                    <input type="number" defaultValue={800} />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>PERSONAL CARE</label>
                                <div className="input-with-icon">
                                    <span>$</span>
                                    <input type="number" defaultValue={300} />
                                </div>
                            </div>

                            <button className="btn-secondary w-full mt-4">Update Monthly Limits</button>
                        </div>
                    </div>

                    <div className="panel savings-goal-panel">
                        <div className="panel-header">
                            <h3>Savings Goal</h3>
                        </div>
                        <div className="flex justify-between items-center my-4">
                            <span className="font-medium text-primary">European Summer</span>
                            <span className="font-bold text-primary">$3,400 / $5,000</span>
                        </div>
                        <div className="progress-bar-bg mb-4">
                            <div className="progress-bar-fill fill-accent" style={{ width: '68%' }}></div>
                        </div>

                        <div className="goal-status-box">
                            <TrendingUp size={16} className="text-accent" />
                            <div className="ml-2 flex-grow">
                                <div className="font-bold text-sm text-primary">On Track</div>
                                <div className="text-xs text-muted">Completion: Aug 2024</div>
                            </div>
                            <span className="text-muted">›</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Importing TrendingUp directly here to avoid missing import
import { TrendingUp } from 'lucide-react';
