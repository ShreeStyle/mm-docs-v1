import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    Upload, Palette, Type, FileText, Globe, Mail, Phone, MapPin, 
    Save, RotateCcw, AlertCircle, CheckCircle, Trash2, Eye, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getApiUrl, BASE_URL } from '../config/api';
import '../styles/BrandSettings.css';

const AVAILABLE_FONTS = [
    'Inter',
    'Poppins',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Raleway',
    'Nunito',
    'Work Sans',
    'Plus Jakarta Sans'
];

export default function BrandSettings() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [showPreview, setShowPreview] = useState(false);
    
    const [brandKit, setBrandKit] = useState({
        brandName: 'My Company',
        logo: '',
        primaryColor: '#7C3AED',
        secondaryColor: '#64748B',
        accentColor: '#3B82F6',
        fontFamily: 'Inter',
        description: '',
        footer: {
            website: '',
            email: '',
            phone: '',
            address: '',
            customText: ''
        }
    });
    
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');

    // Fetch existing brand kit
    useEffect(() => {
        fetchBrandKit();
    }, []);

    const fetchBrandKit = async () => {
        try {
            const response = await fetch(getApiUrl('/api/brand-kit'), {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setBrandKit({
                    ...data,
                    footer: data.footer || {
                        website: '',
                        email: '',
                        phone: '',
                        address: '',
                        customText: ''
                    }
                });  
                if (data.logo) {
                    setLogoPreview(`${BASE_URL}${data.logo}`);
                }
            }
        } catch (error) {
            console.error('Error fetching brand kit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage({ type: 'error', text: 'Please select an image file' });
                return;
            }
            
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
                return;
            }
            
            setLogoFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field, value) => {
        setBrandKit(prev => ({ ...prev, [field]: value }));
    };

    const handleFooterChange = (field, value) => {
        setBrandKit(prev => ({
            ...prev,
            footer: { ...prev.footer, [field]: value }
        }));
    };

    const saveBrandKit = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });
        
        try {
            const formData = new FormData();
            
            // Add logo if changed
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            
            // Add other fields
            formData.append('brandName', brandKit.brandName);
            formData.append('primaryColor', brandKit.primaryColor);
            formData.append('secondaryColor', brandKit.secondaryColor);
            formData.append('accentColor', brandKit.accentColor);
            formData.append('fontFamily', brandKit.fontFamily);
            formData.append('description', brandKit.description);
            formData.append('footer', JSON.stringify(brandKit.footer));
            
            const response = await fetch(getApiUrl('/api/brand-kit'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                const data = await response.json();
                setBrandKit({
                    ...data,
                    footer: data.footer || brandKit.footer
                });
                if (data.logo) {
                    setLogoPreview(`${BASE_URL}${data.logo}`);
                }
                setLogoFile(null);
                setMessage({ type: 'success', text: 'Brand Kit saved successfully!' });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.message || 'Failed to save Brand Kit' });
            }
        } catch (error) {
            console.error('Error saving brand kit:', error);
            setMessage({ type: 'error', text: 'Error saving Brand Kit' });
        } finally {
            setSaving(false);
        }
    };

    const resetBrandKit = async () => {
        if (!window.confirm('Are you sure you want to reset your brand kit to default settings?')) {
            return;
        }
        
        setSaving(true);
        try {
            const response = await fetch(getApiUrl('/api/brand-kit/reset'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setBrandKit({
                    ...data,
                    footer: data.footer || {
                        website: '',
                        email: '',
                        phone: '',
                        address: '',
                        customText: ''
                    }
                });
                setLogoPreview(data.logo ? `${BASE_URL}${data.logo}` : '');
                setLogoFile(null);
                setMessage({ type: 'success', text: 'Brand Kit reset to default' });
            }
        } catch (error) {
            console.error('Error resetting brand kit:', error);
            setMessage({ type: 'error', text: 'Error resetting Brand Kit' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="brand-settings-loading">
                <div className="spinner"></div>
                <p>Loading Brand Settings...</p>
            </div>
        );
    }

    return (
        <div className="brand-settings-container">
            <div className="brand-settings-header">
                <div>
                    <button 
                        className="btn-back"
                        onClick={() => navigate('/dashboard')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            marginBottom: '16px',
                            backgroundColor: 'transparent',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            color: '#6B7280',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#F9FAFB';
                            e.target.style.borderColor = '#D1D5DB';
                            e.target.style.color = '#374151';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.color = '#6B7280';
                        }}
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                    <h1>Brand Settings</h1>
                    <p>Customize your brand identity that will be applied to all your documents</p>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-preview"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <Eye size={18} />
                        {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                </div>
            </div>

            {message.text && (
                <motion.div 
                    className={`message ${message.type}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </motion.div>
            )}

            <div className="brand-settings-content">
                <div className="settings-panel">
                    {/* Brand Name */}
                    <div className="setting-section">
                        <div className="section-header">
                            <FileText size={20} />
                            <h3>Brand Name</h3>
                        </div>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Enter your company name"
                            value={brandKit.brandName}
                            onChange={(e) => handleInputChange('brandName', e.target.value)}
                        />
                    </div>

                    {/* Logo Upload */}
                    <div className="setting-section">
                        <div className="section-header">
                            <Upload size={20} />
                            <h3>Logo</h3>
                        </div>
                        <div className="logo-upload-area">
                            {logoPreview ? (
                                <div className="logo-preview-container">
                                    <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                                    <button 
                                        className="btn-change-logo"
                                        onClick={() => document.getElementById('logo-input').click()}
                                    >
                                        Change Logo
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="logo-upload-placeholder"
                                    onClick={() => document.getElementById('logo-input').click()}
                                >
                                    <Upload size={32} />
                                    <p>Click to upload logo</p>
                                    <span className="upload-hint">PNG, JPG, SVG up to 5MB</span>
                                </div>
                            )}
                            <input
                                id="logo-input"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Colors */}
                    <div className="setting-section">
                        <div className="section-header">
                            <Palette size={20} />
                            <h3>Brand Colors</h3>
                        </div>
                        <div className="colors-grid">
                            <div className="color-input-group">
                                <label>Primary Color</label>
                                <div className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        value={brandKit.primaryColor}
                                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={brandKit.primaryColor}
                                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                                        className="color-hex-input"
                                        placeholder="#7C3AED"
                                    />
                                </div>
                            </div>
                            
                            <div className="color-input-group">
                                <label>Secondary Color</label>
                                <div className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        value={brandKit.secondaryColor}
                                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={brandKit.secondaryColor}
                                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                                        className="color-hex-input"
                                        placeholder="#64748B"
                                    />
                                </div>
                            </div>
                            
                            <div className="color-input-group">
                                <label>Accent Color</label>
                                <div className="color-picker-wrapper">
                                    <input
                                        type="color"
                                        value={brandKit.accentColor}
                                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                                        className="color-picker"
                                    />
                                    <input
                                        type="text"
                                        value={brandKit.accentColor}
                                        onChange={(e) => handleInputChange('accentColor', e.target.value)}
                                        className="color-hex-input"
                                        placeholder="#3B82F6"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Font */}
                    <div className="setting-section">
                        <div className="section-header">
                            <Type size={20} />
                            <h3>Typography</h3>
                        </div>
                        <select
                            className="select-field"
                            value={brandKit.fontFamily}
                            onChange={(e) => handleInputChange('fontFamily', e.target.value)}
                        >
                            {AVAILABLE_FONTS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>
                                    {font}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div className="setting-section">
                        <div className="section-header">
                            <FileText size={20} />
                            <h3>Brand Description</h3>
                        </div>
                        <textarea
                            className="textarea-field"
                            placeholder="Brief description of your brand (optional)"
                            value={brandKit.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Footer Details */}
                    <div className="setting-section">
                        <div className="section-header">
                            <Globe size={20} />
                            <h3>Footer Details</h3>
                        </div>
                        <div className="footer-inputs">
                            <div className="input-with-icon">
                                <Globe size={18} />
                                <input
                                    type="text"
                                    placeholder="Website"
                                    value={brandKit.footer.website}
                                    onChange={(e) => handleFooterChange('website', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            
                            <div className="input-with-icon">
                                <Mail size={18} />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={brandKit.footer.email}
                                    onChange={(e) => handleFooterChange('email', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            
                            <div className="input-with-icon">
                                <Phone size={18} />
                                <input
                                    type="tel"
                                    placeholder="Phone"
                                    value={brandKit.footer.phone}
                                    onChange={(e) => handleFooterChange('phone', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            
                            <div className="input-with-icon">
                                <MapPin size={18} />
                                <input
                                    type="text"
                                    placeholder="Address"
                                    value={brandKit.footer.address}
                                    onChange={(e) => handleFooterChange('address', e.target.value)}
                                    className="input-field"
                                />
                            </div>
                            
                            <textarea
                                className="textarea-field"
                                placeholder="Custom footer text (optional)"
                                value={brandKit.footer.customText}
                                onChange={(e) => handleFooterChange('customText', e.target.value)}
                                rows={2}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="settings-actions">
                        <button 
                            className="btn-save"
                            onClick={saveBrandKit}
                            disabled={saving}
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Brand Kit'}
                        </button>
                        
                        <button 
                            className="btn-reset"
                            onClick={resetBrandKit}
                            disabled={saving}
                        >
                            <RotateCcw size={18} />
                            Reset to Default
                        </button>
                    </div>
                </div>

                {/* Live Preview */}
                {showPreview && (
                    <motion.div 
                        className="preview-panel"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h3>Live Preview</h3>
                        <div 
                            className="preview-document"
                            style={{
                                fontFamily: brandKit.fontFamily,
                                '--preview-primary': brandKit.primaryColor,
                                '--preview-secondary': brandKit.secondaryColor,
                                '--preview-accent': brandKit.accentColor
                            }}
                        >
                            {/* Header */}
                            <div className="preview-header">
                                {logoPreview && (
                                    <img src={logoPreview} alt="Logo" className="preview-logo" />
                                )}
                                <h2 style={{ color: brandKit.primaryColor }}>{brandKit.brandName}</h2>
                            </div>

                            {/* Content Sample */}
                            <div className="preview-content">
                                <h3 style={{ color: brandKit.primaryColor }}>Sample Document</h3>
                                <p style={{ color: brandKit.secondaryColor }}>
                                    This is how your documents will look with your brand settings applied.
                                </p>
                                
                                <table className="preview-table">
                                    <thead style={{ backgroundColor: brandKit.primaryColor }}>
                                        <tr>
                                            <th>Item</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Service 1</td>
                                            <td>Sample description</td>
                                            <td style={{ color: brandKit.primaryColor, fontWeight: 'bold' }}>$100</td>
                                        </tr>
                                        <tr style={{ backgroundColor: '#f9fafb' }}>
                                            <td>Service 2</td>
                                            <td>Sample description</td>
                                            <td style={{ color: brandKit.primaryColor, fontWeight: 'bold' }}>$200</td>
                                        </tr>
                                    </tbody>
                                </table>
                                
                                <div className="preview-highlight" style={{ 
                                    borderLeft: `4px solid ${brandKit.accentColor}`,
                                    backgroundColor: `${brandKit.accentColor}15`
                                }}>
                                    <p style={{ color: brandKit.accentColor, fontWeight: '600' }}>
                                        Important Note
                                    </p>
                                    <p style={{ color: brandKit.secondaryColor }}>
                                        This is how highlighted content will appear in your documents.
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="preview-footer" style={{ borderTop: `2px solid ${brandKit.primaryColor}` }}>
                                {brandKit.footer.website && <p>🌐 {brandKit.footer.website}</p>}
                                {brandKit.footer.email && <p>✉️ {brandKit.footer.email}</p>}
                                {brandKit.footer.phone && <p>📞 {brandKit.footer.phone}</p>}
                                {brandKit.footer.address && <p>📍 {brandKit.footer.address}</p>}
                                {brandKit.footer.customText && <p className="custom-text">{brandKit.footer.customText}</p>}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
