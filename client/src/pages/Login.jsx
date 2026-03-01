import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LogoIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 10L28 4V24C28 26.2091 26.2091 28 24 28H8C5.79086 28 4 26.2091 4 24V4L10 10L16 4Z" fill="#7C3AED" />
        <path d="M10 12L16 6L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = email/password, 2 = OTP verification
    const [formData, setFormData] = useState({
        email: 'demo@test.com',
        password: 'demo123'
    });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [devOTP, setDevOTP] = useState(''); // For development mode

    // Handle Step 1: Email and Password Login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            if (data.requiresOTP) {
                console.log('✅ OTP sent to email:', data.email);
                // Store dev OTP if available (development mode only)
                if (data.devOTP) {
                    setDevOTP(data.devOTP);
                    console.log('🔐 Dev OTP:', data.devOTP);
                }
                setStep(2); // Move to OTP verification step
            }
            
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Error connecting to backend');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP input change
    const handleOTPChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    // Handle OTP input keydown
    const handleOTPKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    // Handle Step 2: OTP Verification
    const handleOTPSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Please enter all 6 digits');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: formData.email,
                    otp: otpString
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            console.log('✅ Login successful:', data);
            
            login(data.user, data.token);
            navigate('/product');
            
        } catch (error) {
            console.error('OTP verification error:', error);
            setError(error.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setIsLoading(true);
        setError('');
        setOtp(['', '', '', '', '', '']);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to resend OTP');
            }

            if (data.devOTP) {
                setDevOTP(data.devOTP);
                console.log('🔐 New Dev OTP:', data.devOTP);
            }

            alert('New OTP sent to your email!');
            
        } catch (error) {
            console.error('Resend OTP error:', error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="landing-page login-page-container">
            {/* Mesh Background */}
            <div className="bg-glow glow-1" />
            <div className="bg-glow glow-3" />

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
                    
                    {step === 1 ? (
                        <>
                            <h1>Welcome back</h1>
                            <p>Enter your details to access your documents.</p>
                        </>
                    ) : (
                        <>
                            <Shield size={40} style={{ color: '#7C3AED', margin: '0 auto' }} />
                            <h1>Verify Your Identity</h1>
                            <p>We've sent a 6-digit code to {formData.email}</p>
                            {devOTP && (
                                <div style={{
                                    background: '#fff3cd',
                                    padding: '10px',
                                    borderRadius: '6px',
                                    marginTop: '10px',
                                    fontSize: '12px',
                                    color: '#856404'
                                }}>
                                    <strong>Development Mode:</strong> Your OTP is <code style={{
                                        background: '#fff',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold'
                                    }}>{devOTP}</code>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {error && (
                    <div style={{
                        background: '#fee',
                        color: '#c00',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '20px',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleLoginSubmit} className="auth-form">
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
                            <div className="label-row">
                                <label><Lock size={16} /> Password</label>
                                <Link to="#" className="forgot-pass">Forgot?</Link>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Continue'}
                            {!isLoading && <ArrowRight size={18} />}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOTPSubmit} className="auth-form">
                        <div className="input-group">
                            <label style={{ textAlign: 'center', marginBottom: '15px' }}>
                                Enter Verification Code
                            </label>
                            <div style={{
                                display: 'flex',
                                gap: '10px',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOTPChange(index, e.target.value)}
                                        onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            textAlign: 'center',
                                            fontSize: '24px',
                                            fontWeight: 'bold',
                                            borderRadius: '8px',
                                            border: '2px solid #e0e0e0',
                                            outline: 'none',
                                            transition: 'all 0.2s'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#7C3AED';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e0e0e0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                            {!isLoading && <Shield size={18} />}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={isLoading}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#7C3AED',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px'
                                }}
                            >
                                Resend OTP
                            </button>
                            <span style={{ margin: '0 10px', color: '#ccc' }}>|</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setOtp(['', '', '', '', '', '']);
                                    setError('');
                                    setDevOTP('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#666',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px'
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}

                <div className="auth-footer">
                    New to MM Docs? <Link to="/signup">Register</Link>
                </div>
            </motion.div>
        </div>
    );
}
