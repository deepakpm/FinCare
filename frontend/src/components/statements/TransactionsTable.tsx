import React from 'react';
import './TransactionsTable.css';

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    badgeColor: string;
    debit: string;
    credit: string;
    balance: string;
}

interface TransactionsTableProps {
    data: Transaction[];
}

export function TransactionsTable({ data }: TransactionsTableProps) {
    return (
        <div className="transactions-table-container">
            <table className="transactions-table">
                <thead>
                    <tr>
                        <th>DATE</th>
                        <th>DESCRIPTION</th>
                        <th>CATEGORY</th>
                        <th>DEBIT</th>
                        <th>CREDIT</th>
                        <th>BALANCE</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((tx) => (
                        <tr key={tx.id}>
                            <td className="text-secondary">{tx.date}</td>
                            <td className="font-medium text-primary">{tx.description}</td>
                            <td>
                                <span className="category-badge" style={{ backgroundColor: `${tx.badgeColor}20`, color: tx.badgeColor }}>
                                    ✦ {tx.category}
                                </span>
                            </td>
                            <td className="text-primary">{tx.debit}</td>
                            <td className="text-accent">{tx.credit}</td>
                            <td className="text-secondary">{tx.balance}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="table-pagination">
                <span className="text-sm text-muted">Showing 1 to 5 of 142 transactions</span>
                <div className="pagination-controls">
                    <button className="page-btn disabled">‹</button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn">2</button>
                    <button className="page-btn">3</button>
                    <button className="page-btn">›</button>
                </div>
            </div>
        </div>
    );
}
