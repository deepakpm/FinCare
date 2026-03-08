import React, { useState, useEffect } from 'react';
import { Topbar } from './Topbar';
import { Dashboard } from '../dashboard/Dashboard';
import { StatementsView } from '../statements/StatementsView';
import { AnalyticsView } from '../analytics/AnalyticsView';
import { BudgetingView } from '../budgeting/BudgetingView';
import { SettingsView } from '../settings/SettingsView';
import { useAppContext } from '../../context/AppContext';
import './AppShell.css';

interface AppShellProps {
    children?: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    // Default to statements which is our upload page
    const [activeView, setActiveView] = useState('statements');
    const { state } = useAppContext();
    const hasData = Boolean(state.transactions && state.transactions.length > 0);

    // Reset to statements if data is cleared
    useEffect(() => {
        if (!hasData) {
            setActiveView('statements');
        }
    }, [hasData]);

    return (
        <div className="app-shell no-sidebar">
            <div className="main-wrapper">
                <Topbar
                    activeView={activeView}
                    setActiveView={setActiveView}
                    hasData={hasData}
                />
                <main className="main-content">
                    <div className="content-inner max-w-7xl mx-auto w-full">
                        {/* Simple rudimentary routing based on activeView state */}
                        {activeView === 'dashboard' && <Dashboard />}
                        {activeView === 'statements' && <StatementsView />}
                        {activeView === 'analytics' && <AnalyticsView />}
                        {activeView === 'budgeting' && <BudgetingView />}
                        {activeView === 'settings' && <SettingsView />}

                        {activeView !== 'dashboard' && children}
                    </div>
                </main>
            </div>
        </div>
    );
}
