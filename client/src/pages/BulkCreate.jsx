import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

const BulkCreate = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const [template, setTemplate] = useState(null);
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (templateId) {
            fetchTemplate();
        }
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            const res = await api.get(`/templates/${templateId}`);
            if (res.success) setTemplate(res.data);
        } catch (err) {
            setError("Failed to load template details.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === "text/csv") {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please upload a valid CSV file.");
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('templateId', templateId);

            const response = await fetch(`${api.API_BASE_URL || '/api'}/bulk/generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setResult(data);
            } else {
                throw new Error(data.message || "Bulk generation failed");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>;

    return (
        <div style={{ backgroundColor: '#F8F9FB', minHeight: '100vh', padding: '32px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button 
                    onClick={() => navigate('/dashboard/templates')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', marginBottom: '24px' }}
                >
                    <ArrowLeft size={20} /> Back to Templates
                </button>

                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#EEF2FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 16px auto' }}>
                            <FileSpreadsheet size={32} color="#4F46E5" />
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>Bulk Create {template?.name}</h1>
                        <p style={{ color: '#6B7280', marginTop: '8px' }}>Upload a CSV file to generate multiple documents at once.</p>
                    </div>

                    {!result ? (
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div style={{ border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                                <input 
                                    type="file" 
                                    accept=".csv" 
                                    onChange={handleFileChange} 
                                    id="csv-upload" 
                                    style={{ display: 'none' }} 
                                />
                                <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                                    <Upload size={40} color="#9CA3AF" style={{ marginBottom: '16px' }} />
                                    <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                                        {file ? file.name : "Click to upload CSV"}
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>
                                        Ensure columns match template fields: {template?.requiredFields.map(f => f.fieldName).join(', ')}
                                    </p>
                                </label>
                            </div>

                            {error && (
                                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <AlertCircle size={16} color="#DC2626" />
                                    <p style={{ color: '#DC2626', fontSize: '14px', margin: 0 }}>{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSubmit}
                                disabled={!file || processing}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    backgroundColor: file && !processing ? '#F97316' : '#E5E7EB',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    cursor: file && !processing ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {processing ? 'Processing Documents...' : 'Generate Documents'}
                            </button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <CheckCircle2 size={64} color="#10B981" style={{ margin: '0 auto 16px auto' }} />
                            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#111827' }}>Bulk Content Generated!</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '24px 0' }}>
                                <div style={{ padding: '16px', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1px solid #DCFCE7' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#16A34A' }}>{result.successCount}</div>
                                    <div style={{ fontSize: '12px', color: '#15803D' }}>Success</div>
                                </div>
                                <div style={{ padding: '16px', backgroundColor: '#FEF2F2', borderRadius: '12px', border: '1px solid #FECACA' }}>
                                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#DC2626' }}>{result.failureCount}</div>
                                    <div style={{ fontSize: '12px', color: '#991B1B' }}>Failed</div>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard')}
                                style={{ width: '100%', padding: '14px', backgroundColor: '#111827', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                View My Documents
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkCreate;
