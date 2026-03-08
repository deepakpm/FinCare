import React, { useCallback, useState } from 'react';
import { UploadCloud, File, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import './UploadZone.css';

interface UploadZoneProps {
    onFileUpload: (file: File) => void;
    isUploading?: boolean;
}

export function UploadZone({ onFileUpload, isUploading = false }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateAndProcessFile = (file: File) => {
        setError(null);
        const validTypes = ['application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
            setError('Unsupported file type. Please upload a PDF, CSV, or Excel file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('File is too large. Maximum size is 10MB.');
            return;
        }
        onFileUpload(file);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndProcessFile(e.dataTransfer.files[0]);
        }
    }, [onFileUpload]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndProcessFile(e.target.files[0]);
        }
    };

    return (
        <div
            className={clsx('upload-zone', isDragging && 'dragging', isUploading && 'uploading')}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="upload-icon-wrapper">
                <UploadCloud size={32} className="upload-icon" />
            </div>

            <h2>Upload Statements</h2>
            <p className="upload-desc">
                Drag and drop your PDF, CSV, or Excel files here. We<br />
                support all major banks and financial institutions.
            </p>

            {error && (
                <div className="upload-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {isUploading ? (
                <div className="upload-progress">
                    <div className="spinner"></div>
                    <span>Processing statement with AI...</span>
                </div>
            ) : (
                <div className="upload-actions">
                    <label className="btn-primary">
                        Browse Files
                        <input
                            type="file"
                            className="hidden-input"
                            accept=".pdf,.csv,.xlsx"
                            onChange={handleFileInput}
                        />
                    </label>
                    <button className="btn-secondary">Link Bank Account</button>
                </div>
            )}

            <div className="upload-footer">
                <span>🔒 Secure 256-bit encryption</span>
                <span>📄 PDF, CSV, XLSX</span>
            </div>
        </div>
    );
}
