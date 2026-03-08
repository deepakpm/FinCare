import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface Transaction {
    id?: number;
    amount: number;
    balance?: number;
    category: string;
    date: string;
    description: string;
    type: 'DEBIT' | 'CREDIT';
}

export interface Insights {
    largestTransaction?: { amount: number; description: string };
    savingsTip?: string;
    subscriptionAlerts?: string[];
    topCategories?: string[];
    totalTransactions?: number;
    currency?: string;
}

export interface AppState {
    filename: string | null;
    transactions: Transaction[];
    insights: Insights | null;
}

interface AppContextType {
    state: AppState;
    setStatementData: (filename: string, transactions: Transaction[], insights: Insights) => void;
    clearData: () => void;
}

const defaultState: AppState = {
    filename: null,
    transactions: [],
    insights: null,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>(defaultState);

    const setStatementData = (filename: string, transactions: Transaction[], insights: Insights) => {
        setState({ filename, transactions, insights });
    };

    const clearData = () => {
        setState(defaultState);
    };

    return (
        <AppContext.Provider value={{ state, setStatementData, clearData }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
