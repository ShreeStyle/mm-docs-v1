import React, { useState, useRef, useEffect } from 'react';
import { X, Pencil, Type, Upload, Trash2, Check } from 'lucide-react';
import '../styles/DocumentEditor.css';

const SignatureTest = () => {
    const [showSignatureModal, setShowSignatureModal] = useState(true);
    const [signatureTab, setSignatureTab] = useState('draw');
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('Brush Script MT, cursive');
    const [signatureColor, setSignatureColor] = useState('#000000');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [savedSignature, setSavedSignature] = useState(null);
    
    const signatureCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    useEffect(() => {
        if (showSignatureModal && signatureTab === 'draw' && signatureCanvasRef.current) {
            const canvas = signatureCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [showSignatureModal, signatureTab]);
    
    const startDrawing = (e) => {
        const canvas = signatureCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };
    
    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        
        const canvas = signatureCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        
        const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
        const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
        
        ctx.strokeStyle = signatureColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
    };
    
    const stopDrawing = () => {
        setIsDrawing(false);
    };
    
    const clearSignatureCanvas = () => {
        const canvas = signatureCanvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    const handleUploadSignature = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleApplySignature = () => {
        let signatureValue = null;
        
        if (signatureTab === 'draw') {
            const canvas = signatureCanvasRef.current;
            signatureValue = canvas.toDataURL();
        } else if (signatureTab === 'type') {
            signatureValue = {
                type: 'text',
                text: typedName,
                font: selectedFont,
                color: signatureColor
            };
        } else if (signatureTab === 'upload') {
            signatureValue = uploadedImage;
        }
        
        if (!signatureValue) {
            alert('Please create a signature first');
            return;
        }
        
        setSavedSignature(signatureValue);
        alert('Signature saved! Check below the modal.');
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                    Signature Modal Test Page
                </h1>
                <p style={{ marginBottom: '2rem', color: '#64748b' }}>
                    This page demonstrates the signature creation modal with all three methods.
                </p>
                
                <button 
                    onClick={() => setShowSignatureModal(true)}
                    style={{
                        padding: '1rem 2rem',
                        background: '#F97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        marginBottom: '2rem'
                    }}
                >
                    Open Signature Modal
                </button>
                
                {savedSignature && (
                    <div style={{ 
                        background: 'white', 
                        padding: '2rem', 
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        marginTop: '2rem'
                    }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Saved Signature:</h2>
                        {typeof savedSignature === 'string' ? (
                            <img src={savedSignature} alt="Signature" style={{ maxWidth: '100%', border: '1px solid #e2e8f0' }} />
                        ) : (
                            <div 
                                style={{ 
                                    fontFamily: savedSignature.font,
                                    color: savedSignature.color,
                                    fontSize: '48px',
                                    fontStyle: 'italic',
                                    padding: '1rem'
                                }}
                            >
                                {savedSignature.text}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {showSignatureModal && (
                <div className="signature-modal-overlay" onClick={() => setShowSignatureModal(false)}>
                    <div className="signature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="signature-modal-header">
                            <h2>Create Signature</h2>
                            <button className="close-modal-btn" onClick={() => setShowSignatureModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="signature-tabs">
                            <button 
                                className={`signature-tab ${signatureTab === 'draw' ? 'active' : ''}`}
                                onClick={() => setSignatureTab('draw')}
                            >
                                <Pencil size={16} />
                                Draw
                            </button>
                            <button 
                                className={`signature-tab ${signatureTab === 'type' ? 'active' : ''}`}
                                onClick={() => setSignatureTab('type')}
                            >
                                <Type size={16} />
                                Type
                            </button>
                            <button 
                                className={`signature-tab ${signatureTab === 'upload' ? 'active' : ''}`}
                                onClick={() => setSignatureTab('upload')}
                            >
                                <Upload size={16} />
                                Upload
                            </button>
                        </div>
                        
                        <div className="signature-modal-content">
                            {signatureTab === 'draw' && (
                                <div className="signature-draw-tab">
                                    <p className="tab-instruction">Draw your signature below using your mouse or touch device</p>
                                    
                                    <div className="signature-color-picker" style={{ marginBottom: '1rem' }}>
                                        <label>Pen Color:</label>
                                        <div className="color-options">
                                            {['#000000', '#0000FF', '#1E40AF', '#7C3AED', '#DC2626'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`color-btn ${signatureColor === color ? 'selected' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setSignatureColor(color)}
                                                >
                                                    {signatureColor === color && <Check size={14} color="white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <canvas
                                        ref={signatureCanvasRef}
                                        width={600}
                                        height={200}
                                        className="signature-canvas"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                    <button className="clear-canvas-btn" onClick={clearSignatureCanvas}>
                                        <Trash2 size={16} />
                                        Clear
                                    </button>
                                </div>
                            )}
                            
                            {signatureTab === 'type' && (
                                <div className="signature-type-tab">
                                    <p className="tab-instruction">Type your name and select a signature style</p>
                                    
                                    <input
                                        type="text"
                                        className="signature-name-input"
                                        placeholder="Enter your full name"
                                        value={typedName}
                                        onChange={(e) => setTypedName(e.target.value)}
                                    />
                                    
                                    {typedName && (
                                        <>
                                            <div className="signature-preview-label">Preview:</div>
                                            <div className="signature-font-preview-container">
                                                <div className="font-options">
                                                    {[
                                                        { name: 'Brush Script MT, cursive', label: 'Style 1' },
                                                        { name: 'Lucida Handwriting, cursive', label: 'Style 2' },
                                                        { name: 'Bradley Hand, cursive', label: 'Style 3' },
                                                        { name: 'Courier New, monospace', label: 'Style 4' },
                                                        { name: 'Georgia, serif', label: 'Style 5' }
                                                    ].map(font => (
                                                        <div
                                                            key={font.name}
                                                            className={`font-option ${selectedFont === font.name ? 'selected' : ''}`}
                                                            onClick={() => setSelectedFont(font.name)}
                                                        >
                                                            <div 
                                                                className="font-preview"
                                                                style={{ 
                                                                    fontFamily: font.name,
                                                                    color: signatureColor,
                                                                    fontSize: '32px',
                                                                    fontStyle: 'italic'
                                                                }}
                                                            >
                                                                {typedName}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="signature-color-picker">
                                                <label>Signature Color:</label>
                                                <div className="color-options">
                                                    {['#000000', '#0000FF', '#1E40AF', '#7C3AED', '#DC2626'].map(color => (
                                                        <button
                                                            key={color}
                                                            className={`color-btn ${signatureColor === color ? 'selected' : ''}`}
                                                            style={{ backgroundColor: color }}
                                                            onClick={() => setSignatureColor(color)}
                                                        >
                                                            {signatureColor === color && <Check size={14} color="white" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            
                            {signatureTab === 'upload' && (
                                <div className="signature-upload-tab">
                                    <p className="tab-instruction">Upload an image of your signature (PNG, JPG)</p>
                                    
                                    {!uploadedImage ? (
                                        <div className="upload-area">
                                            <input
                                                type="file"
                                                id="signature-upload"
                                                accept="image/png,image/jpeg,image/jpg"
                                                onChange={handleUploadSignature}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="signature-upload" className="upload-label">
                                                <Upload size={40} />
                                                <span>Click to upload signature image</span>
                                                <span className="upload-hint">PNG or JPG (Max 5MB)</span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div className="uploaded-signature-preview">
                                            <img src={uploadedImage} alt="Uploaded signature" />
                                            <button 
                                                className="remove-upload-btn"
                                                onClick={() => setUploadedImage(null)}
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="signature-modal-actions">
                            <button className="btn-cancel" onClick={() => setShowSignatureModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="btn-apply"
                                onClick={handleApplySignature}
                                disabled={
                                    (signatureTab === 'type' && !typedName) ||
                                    (signatureTab === 'upload' && !uploadedImage)
                                }
                            >
                                <Check size={16} />
                                Apply Signature
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignatureTest;
