import React from 'react';
import {
    LayoutDashboard,
    FileText,
    BarChart2,
    Wallet,
    Settings
} from 'lucide-react';
import { clsx } from 'clsx';
import './Sidebar.css';

interface SidebarProps {
    activeView: string;
    setActiveView: (view: string) => void;
}

const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'statements', label: 'Statements', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'budgeting', label: 'Budgeting', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-icon">
                    <BarChart2 size={20} color="white" />
                </div>
                <div>
                    <h2 className="logo-title">WealthScan</h2>
                    <p className="logo-subtitle">Financial Analyzer</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            className={clsx('nav-item', isActive && 'active')}
                            onClick={() => setActiveView(item.id)}
                        >
                            <Icon size={20} className="nav-icon" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile-mini">
                    <div className="avatar">JD</div>
                    <div className="user-info">
                        <span className="user-name">John Doe</span>
                        <span className="user-type">Pro Account</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
