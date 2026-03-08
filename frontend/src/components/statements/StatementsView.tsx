import React, { useState } from 'react';
import axios from 'axios';
import { UploadZone } from './UploadZone';
import { StatementDetail } from './StatementDetail';
import { FileText, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import './StatementsView.css';

export function StatementsView() {
    const { state, setStatementData, clearData } = useAppContext();
    const [isUploading, setIsUploading] = useState(false);

    const handleFileUpload = async (file: File) => {
        setIsUploading(true);
        clearData(); // Reset previous context data

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('http://localhost:3001/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("Upload response:", res.data);
            setStatementData(res.data.filename, res.data.transactions, res.data.insights);
            setIsUploading(false);
        } catch (error) {
            setIsUploading(false);
            console.error("Upload Error:", error);
            alert("Failed to process document. Please ensure the backend is running and GEMINI_API_KEY is set.");
        }
    };

    const hasData = state.transactions && state.transactions.length > 0;

    return (
        <div className="statements-view animate-fade-in">
            {hasData ? (
                <StatementDetail
                    data={{ transactions: state.transactions, insights: state.insights, filename: state.filename }}
                    onBack={() => clearData()}
                />
            ) : (
                <div className="upload-container">
                    <UploadZone onFileUpload={handleFileUpload} isUploading={isUploading} />
                </div>
            )}

            {/* Financial Overview Cards underneath the mock upload zone as shown in ref image 3 */}
            {!hasData && (
                <div className="financial-overview-section">
                    <div className="section-header">
                        <h3>Financial Overview</h3>
                        <button className="text-btn">View Detailed Report</button>
                    </div>
                    <div className="overview-grid">
                        <div className="overview-card empty-state">
                            <span className="card-label">Total Income</span>
                            <div className="card-value-row">
                                <span className="card-value text-accent">--</span>
                            </div>
                        </div>
                        <div className="overview-card empty-state">
                            <span className="card-label">Total Expenses</span>
                            <div className="card-value-row">
                                <span className="card-value text-warning">--</span>
                            </div>
                        </div>
                        <div className="overview-card empty-state">
                            <span className="card-label">Net Savings</span>
                            <div className="card-value-row">
                                <span className="card-value text-accent">--</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
