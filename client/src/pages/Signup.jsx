import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, User, Mail, Lock, CheckCircle2, X } from 'lucide-react';

const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#7C3AED" />
        <path d="M10 12L16 6L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Signup() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                const data = await response.json();
                setError(data.message || 'Signup failed');
            }
        } catch (err) {
            setError('Error connecting to backend server');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="landing-page login-page-container">
            {/* Mesh Background */}
            <div className="bg-glow glow-1" />
            <div className="bg-glow glow-2" />

            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="auth-header">
                    <Link to="/" className="auth-logo-group">
                        <LogoIcon />
                        <span className="logo-text">MM Docs</span>
                    </Link>
                    <h1>Create your account</h1>
                    <p>Start generating professional documents in seconds.</p>
                </div>

                {error && (
                    <motion.div
                        className="auth-error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <span>{error}</span>
                        <div className="auth-error-close" onClick={() => setError(null)}>
                            <X size={14} />
                        </div>
                    </motion.div>
                )}

                {isSuccess ? (
                    <motion.div
                        className="success-state"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <CheckCircle2 size={64} color="#7C3AED" />
                        <h2>Success!</h2>
                        <p>Your account has been created. Redirecting to login...</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <label><User size={16} /> Full Name</label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label><Mail size={16} /> Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="input-group">
                            <label><Lock size={16} /> Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Get Started'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </motion.div>
        </div>
    );
}
