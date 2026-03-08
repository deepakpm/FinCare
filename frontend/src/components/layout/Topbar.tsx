import React from 'react';
import { CircleDollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import './Topbar.css';

interface TopbarProps {
    activeView: string;
    setActiveView: (view: string) => void;
    hasData: boolean;
}

export function Topbar({ activeView, setActiveView, hasData }: TopbarProps) {
    return (
        <header className="topbar minimal-topbar">
            <div className="topbar-left">
                <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
                    <CircleDollarSign size={24} />
                    WealthScan
                </div>
            </div>

            {hasData && (
                <div className="topbar-center" style={{ display: 'flex', gap: '24px' }}>
                    <button
                        className={clsx('minimal-tab', activeView === 'statements' && 'active')}
                        onClick={() => setActiveView('statements')}
                    >
                        Report
                    </button>
                    <button
                        className={clsx('minimal-tab', activeView === 'dashboard' && 'active')}
                        onClick={() => setActiveView('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={clsx('minimal-tab', activeView === 'analytics' && 'active')}
                        onClick={() => setActiveView('analytics')}
                    >
                        Analytics
                    </button>
                    <button
                        className={clsx('minimal-tab', activeView === 'budgeting' && 'active')}
                        onClick={() => setActiveView('budgeting')}
                    >
                        Budgeting
                    </button>
                </div>
            )}

            <div className="topbar-right">
                {/* Empty, clean, no profile or auth icons */}
            </div>
        </header>
    );
}
