import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Send, Loader2, Save, X, Pencil, Type, Upload, Trash2, Check } from 'lucide-react';
import { api } from '../utils/api';
import DocumentPreview from '../components/DocumentEditor/DocumentPreview';
import FieldsPanel from '../components/DocumentEditor/FieldsPanel';
import DrawingTools from '../components/DocumentEditor/DrawingTools';
import '../styles/DocumentEditor.css';

const DocumentEditor = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [activeTool, setActiveTool] = useState('pencil');
    const [activeColor, setActiveColor] = useState('#000000');
    
    // Signature Modal State
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureTab, setSignatureTab] = useState('draw'); // 'draw', 'type', 'upload'
    const [signatureData, setSignatureData] = useState(null);
    const [currentSignatureField, setCurrentSignatureField] = useState(null);
    
    // Type Tab State
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('Brush Script MT, cursive');
    const [signatureColor, setSignatureColor] = useState('#000000');
    
    // Upload Tab State
    const [uploadedImage, setUploadedImage] = useState(null);
    
    // Draw Tab State
    const signatureCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, [documentId]);
    
    // Initialize signature canvas when modal opens
    useEffect(() => {
        if (showSignatureModal && signatureTab === 'draw' && signatureCanvasRef.current) {
            const canvas = signatureCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [showSignatureModal, signatureTab]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/document-editor/${documentId}`);
            if (response.success) {
                setDocument(response.data);
                setFields(response.data.fields || []);
            }
        } catch (err) {
            console.error('Error fetching document:', err);
            setError('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldDrop = (fieldData, position, page) => {
        const newField = {
            fieldType: fieldData.type,
            label: fieldData.label,
            page,
            position,
            size: {
                width: 200,
                height: fieldData.type === 'signature' ? 60 : 40
            },
            properties: {
                required: false,
                assignedTo: 'CLIENT', // Default assignment
                defaultValue: '',
                validation: {}
            }
        };

        setFields(prev => [...prev, newField]);
        autoSave([...fields, newField]);
    };

    const handleFieldSelect = (field) => {
        setSelectedField(field);
        
        // If signature field is selected, open signature modal
        if (field.fieldType === 'signature') {
            setCurrentSignatureField(field);
            setShowSignatureModal(true);
        }
    };
    
    // Signature Canvas Drawing Functions
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
        
        e.preventDefault(); // Prevent scrolling on touch devices
        
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
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
            // Get canvas data as image
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
        
        // Update the field with signature data
        setFields(prev => prev.map(f => 
            f === currentSignatureField 
                ? { ...f, value: signatureValue, completed: true }
                : f
        ));
        
        // Close modal and reset
        setShowSignatureModal(false);
        setSignatureData(signatureValue);
        resetSignatureModal();
    };
    
    const resetSignatureModal = () => {
        setTypedName('');
        setUploadedImage(null);
        if (signatureCanvasRef.current) {
            clearSignatureCanvas();
        }
    };
    
    const closeSignatureModal = () => {
        setShowSignatureModal(false);
        setCurrentSignatureField(null);
        resetSignatureModal();
    };

    const autoSave = async (updatedFields) => {
        try {
            await api.put(`/document-editor/${documentId}/fields`, { fields: updatedFields });
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put(`/document-editor/${documentId}`, {
                fields,
                status: 'draft'
            });
            alert('Document saved successfully!');
        } catch (err) {
            console.error('Error saving document:', err);
            setError('Failed to save document');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        try {
            setSaving(true);
            await api.post(`/document-editor/${documentId}/send`, {
                fields
            });
            alert('Document sent successfully!');
            navigate('/dashboard/documents');
        } catch (err) {
            console.error('Error sending document:', err);
            setError('Failed to send document');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="editor-loading">
                <Loader2 className="spinner" size={48} />
                <p>Loading document editor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="editor-error">
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="document-editor">
            {/* Header */}
            <div className="editor-header">
                <h1 className="editor-title">{document?.title || 'Untitled Document'}</h1>
                <div className="editor-actions">
                    <button 
                        className="btn-secondary" 
                        onClick={() => {
                            setCurrentSignatureField({ fieldType: 'signature' });
                            setShowSignatureModal(true);
                        }}
                        style={{ background: '#F97316', color: 'white', border: 'none' }}
                    >
                        <Pencil size={16} />
                        Test Signature Modal
                    </button>
                    <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-secondary">
                        <Eye size={16} />
                        Preview
                    </button>
                    <button className="btn-primary" onClick={handleSend}>
                        <Send size={16} />
                        Review and Send
                    </button>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="editor-main">
                {/* Document Preview (Left) */}
                <DocumentPreview
                    document={document}
                    fields={fields}
                    onFieldDrop={handleFieldDrop}
                    onFieldSelect={handleFieldSelect}
                />

                {/* Fields Panel (Right) */}
                <div className="right-sidebar">
                    <FieldsPanel
                        onFieldDragStart={(field) => console.log('Dragging field:', field)}
                        onSignatureClick={(field) => {
                            setCurrentSignatureField({ fieldType: field.type });
                            setShowSignatureModal(true);
                        }}
                    />
                    <DrawingTools
                        onToolSelect={setActiveTool}
                        activeTool={activeTool}
                        onColorChange={setActiveColor}
                        activeColor={activeColor}
                    />
                </div>
            </div>
            
            {/* Signature Creation Modal */}
            {showSignatureModal && (
                <div className="signature-modal-overlay" onClick={closeSignatureModal}>
                    <div className="signature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="signature-modal-header">
                            <h2>Create Signature</h2>
                            <button className="close-modal-btn" onClick={closeSignatureModal}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Tabs */}
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
                        
                        {/* Tab Content */}
                        <div className="signature-modal-content">
                            {/* Draw Tab */}
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
                            
                            {/* Type Tab */}
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
                            
                            {/* Upload Tab */}
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
                        
                        {/* Modal Actions */}
                        <div className="signature-modal-actions">
                            <button className="btn-cancel" onClick={closeSignatureModal}>
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

export default DocumentEditor;
