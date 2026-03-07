import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function HealthCheck() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(getApiUrl('/api/health'));
            const data = await response.json();
            
            if (response.ok) {
                setHealth(data);
            } else {
                setError('Health check failed');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading health check...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>System Health Check</h1>
            
            {error && (
                <div style={{ background: '#fee', color: '#c00', padding: '10px', marginBottom: '20px' }}>
                    Error: {error}
                </div>
            )}
            
            {health && (
                <div style={{ background: '#efe', color: '#060', padding: '10px' }}>
                    <pre>{JSON.stringify(health, null, 2)}</pre>
                </div>
            )}
            
            <button onClick={checkHealth} style={{ marginTop: '20px', padding: '10px 20px' }}>
                Refresh
            </button>
        </div>
    );
}
