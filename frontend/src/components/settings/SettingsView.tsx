import React from 'react';
import { Edit2 } from 'lucide-react';
import './SettingsView.css';

export function SettingsView() {
    return (
        <div className="settings-view animate-fade-in">
            <div className="settings-header">
                <p className="text-muted text-sm mt-1">Manage your account settings and app preferences</p>
            </div>

            <div className="settings-section">
                <h3>Profile</h3>
                <div className="panel profile-panel">
                    <div className="profile-avatar-large relative">
                        <div className="avatar bg-white"></div>
                        <button className="edit-avatar-btn">
                            <Edit2 size={12} />
                        </button>
                    </div>
                    <div className="profile-fields">
                        <div className="input-group flex-1">
                            <label>FULL NAME</label>
                            <input type="text" defaultValue="Alex Thompson" className="settings-input" />
                        </div>
                        <div className="input-group flex-1">
                            <label>EMAIL ADDRESS</label>
                            <input type="email" defaultValue="alex.thompson@example.com" className="settings-input" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h3>Account</h3>
                <div className="panel account-panel">
                    <div className="account-row border-b">
                        <div className="flex items-center gap-4">
                            <div className="icon-box bg-accent-light text-accent">★</div>
                            <div>
                                <div className="font-bold text-sm text-primary">Pro Plan</div>
                                <div className="text-xs text-muted">$19.99/month, billed annually</div>
                            </div>
                        </div>
                        <button className="btn-outline-small">Upgrade Plan</button>
                    </div>
                    <div className="account-row">
                        <div className="flex items-center gap-4">
                            <div className="icon-box bg-surface-hover text-secondary">💳</div>
                            <div>
                                <div className="font-bold text-sm text-primary">Payment Method</div>
                                <div className="text-xs text-muted">Visa ending in •••• 4242</div>
                            </div>
                        </div>
                        <button className="text-btn text-accent">Edit</button>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h3>Security</h3>
                <div className="panel security-panel">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="icon-box bg-warning-light text-warning">🛡️</div>
                            <div>
                                <div className="font-bold text-sm text-primary">Two-Factor Authentication</div>
                                <div className="text-xs text-muted">Add an extra layer of security to your account</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted">Off</span>
                            <div className="toggle-switch"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h3>App Preferences</h3>
                <div className="preferences-grid">
                    <div className="panel preference-card">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-secondary">💵</span>
                            <span className="font-bold text-sm text-primary">Preferred Currency</span>
                        </div>
                        <select className="settings-select" defaultValue="USD">
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="EUR">EUR (€) - Euro</option>
                            <option value="GBP">GBP (£) - British Pound</option>
                        </select>
                    </div>

                    <div className="panel preference-card">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-secondary">🌙</span>
                            <span className="font-bold text-sm text-primary">Appearance</span>
                        </div>
                        <div className="theme-toggle">
                            <button className="theme-btn text-muted">☀️ Light</button>
                            <button className="theme-btn active">🌙 Dark</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-footer">
                <button className="text-btn text-muted mr-4">Cancel</button>
                <button className="btn-primary">Save Changes</button>
            </div>

            <div className="danger-zone mt-8 pt-8 border-t border-color">
                <button className="text-btn text-danger font-bold text-sm flex items-center gap-2">
                    <span>🗑️</span> Delete Account
                </button>
            </div>
        </div>
    );
}
