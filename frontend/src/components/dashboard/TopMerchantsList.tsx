import React, { useMemo } from 'react';
import { ShoppingCart, Coffee, Car, FileText } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './TopMerchantsList.css';

export function TopMerchantsList() {
    const { state } = useAppContext();

    const topMerchants = useMemo(() => {
        if (!state.transactions || state.transactions.length === 0) return [];

        const debitTx = state.transactions.filter(t => t.type === 'DEBIT');
        const sums: Record<string, { count: number, amount: number }> = {};

        debitTx.forEach(t => {
            const name = t.description || 'Unknown';
            if (!sums[name]) sums[name] = { count: 0, amount: 0 };
            sums[name].count += 1;
            sums[name].amount += t.amount;
        });

        return Object.keys(sums)
            .map(name => ({
                name,
                transactions: sums[name].count,
                amount: sums[name].amount,
                icon: FileText
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // top 5
    }, [state.transactions]);

    if (topMerchants.length === 0) {
        return <div className="p-4 text-center text-muted">No merchant data available</div>;
    }

    return (
        <div className="merchants-list">
            {topMerchants.map((merchant, idx) => {
                const Icon = merchant.icon;
                return (
                    <div key={idx} className="merchant-item">
                        <div className="merchant-icon">
                            <Icon size={20} />
                        </div>
                        <div className="merchant-info">
                            <span className="merchant-name">{merchant.name}</span>
                            <span className="merchant-tx">{merchant.transactions} transactions</span>
                        </div>
                        <div className="merchant-amount">{state.insights?.currency || '$'}{merchant.amount.toFixed(2)}</div>
                    </div>
                );
            })}
        </div>
    );
}
