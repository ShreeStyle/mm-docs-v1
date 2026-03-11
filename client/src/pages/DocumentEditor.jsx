import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Send, Loader2, Save, X, Pencil, Type, Upload, Trash2, Check, ChevronDown } from 'lucide-react';
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
    const [selectedFieldId, setSelectedFieldId] = useState(null);
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
            id: 'new-' + Date.now(), // Unique ID for frontend tracking
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

        setFields(prev => {
            const updated = [...prev, newField];
            autoSave(updated);
            return updated;
        });
    };

    const handleFieldSelect = (field) => {
        setSelectedField(field);
        setSelectedFieldId(field.id || field._id);
        const fieldId = field.id || field._id;

        // If signature or initials field is selected, open signature modal
        if (field.fieldType === 'signature' || field.fieldType === 'initials') {
            setCurrentSignatureField(field);
            setShowSignatureModal(true);
        } else if (field.fieldType === 'textfield' || field.fieldType === 'text') {
            const newValue = prompt('Enter text:', field.value || '');
            if (newValue !== null) {
                updateField(fieldId, { value: newValue, completed: true });
            }
        } else if (field.fieldType === 'checkbox' || field.fieldType === 'radio') {
            updateField(fieldId, { value: !field.value, completed: true });
        } else if (field.fieldType === 'dropdown') {
            const options = ['Option 1', 'Option 2', 'Option 3'];
            const selected = prompt(`Select one (${options.join(', ')}):`, field.value || options[0]);
            if (selected) updateField(fieldId, { value: selected, completed: true });
        } else if (field.fieldType === 'card' || field.fieldType === 'card-details') {
            const cardNum = prompt('Enter card number (last 4 digits):', '1234');
            if (cardNum) updateField(fieldId, { value: cardNum, completed: true });
        } else if (field.fieldType === 'fileupload' || field.fieldType === 'file-upload') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        updateField(fieldId, { value: event.target.result, completed: true });
                    };
                    reader.readAsDataURL(file);
                }
            };
            fileInput.click();
        } else if (field.fieldType === 'stamp') {
            const stampText = prompt('Enter stamp text:', 'APPROVED');
            if (stampText) updateField(fieldId, { value: stampText, completed: true });
        }
    };

    const updateField = (fieldId, updates) => {
        setFields(prev => {
            const newFields = prev.map(f =>
                (f.id === fieldId || f._id === fieldId) ? { ...f, ...updates } : f
            );
            autoSave(newFields);
            return newFields;
        });
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
        updateField(currentSignatureField.id || currentSignatureField._id, {
            value: signatureValue,
            completed: true
        });

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

    const saveTimeoutRef = useRef(null);

    const autoSave = useCallback((updatedFields) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await api.put(`/document-editor/${documentId}/fields`, { fields: updatedFields });
            } catch (err) {
                console.error('Auto-save failed:', err);
            }
        }, 1000); // 1-second debounce
    }, [documentId]);

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
                    onFieldSelect={(field) => {
                        setSelectedFieldId(field.id || field._id);
                        handleFieldSelect(field);
                    }}
                    onFieldUpdate={updateField}
                    selectedFieldId={selectedFieldId}
                />

                {/* Fields Panel (Right) */}
                <div className="right-sidebar">
                    <FieldsPanel
                        onFieldDragStart={(field) => console.log('Dragging field:', field)}
                        onFieldClick={(field) => {
                            const newField = {
                                id: 'new-' + Date.now(),
                                fieldType: field.type,
                                label: field.label,
                                position: { x: 50, y: 50 }, // Default position
                                page: 1, // Default page
                                size: { width: 120, height: 40 },
                                properties: { assignedTo: 'CLIENT' }
                            };
                            setFields(prev => {
                                const updated = [...prev, newField];
                                autoSave(updated);
                                return updated;
                            });

                            if (field.type === 'signature' || field.type === 'initials') {
                                setCurrentSignatureField(newField);
                                setShowSignatureModal(true);
                            }
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
                            <h2>{currentSignatureField?.fieldType === 'initials' ? 'Initials' : 'Signature'}</h2>
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
                                <div className="signature-tab-content">
                                    <div className="signature-controls-top">
                                        <button className="clear-link" onClick={clearSignatureCanvas}>
                                            Clear
                                        </button>

                                        <div className="color-picker">
                                            {['#000000', '#2563eb', '#dc2626'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`color-btn ${signatureColor === color ? 'active' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setSignatureColor(color)}
                                                >
                                                    {signatureColor === color && <Check size={14} color="white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="signature-preview-container">
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
                                        <div className="signature-baseline"></div>
                                    </div>
                                </div>
                            )}

                            {/* Type Tab */}
                            {signatureTab === 'type' && (
                                <div className="signature-tab-content">
                                    <div className="signature-controls-top">
                                        <button className="choose-font-dropdown">
                                            Choose font <ChevronDown size={14} />
                                        </button>

                                        <div className="color-picker">
                                            {['#000000', '#2563eb', '#dc2626'].map(color => (
                                                <button
                                                    key={color}
                                                    className={`color-btn ${signatureColor === color ? 'active' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setSignatureColor(color)}
                                                >
                                                    {signatureColor === color && <Check size={14} color="white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="signature-preview-container">
                                        <input
                                            type="text"
                                            className="signature-input"
                                            placeholder={currentSignatureField?.fieldType === 'initials' ? "Enter your initials" : "Enter your full name"}
                                            value={typedName}
                                            onChange={(e) => setTypedName(e.target.value)}
                                            style={{
                                                fontFamily: selectedFont,
                                                color: signatureColor,
                                                fontSize: '48px',
                                                border: 'none',
                                                background: 'transparent',
                                                textAlign: 'center',
                                                width: '100%',
                                                outline: 'none'
                                            }}
                                        />
                                        <div className="signature-baseline"></div>
                                    </div>

                                    {/* Style Selection - Show actual font preview */}
                                    <div className="font-options" style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {[
                                            { name: 'Brush Script MT, cursive', label: 'Style 1' },
                                            { name: 'Lucida Handwriting, cursive', label: 'Style 2' },
                                            { name: 'Bradley Hand, cursive', label: 'Style 3' }
                                        ].map(font => (
                                            <button
                                                key={font.name}
                                                className={`signature-tab ${selectedFont === font.name ? 'active' : ''}`}
                                                style={{
                                                    borderBottom: selectedFont === font.name ? '3px solid #16a34a' : 'none',
                                                    padding: '10px 20px',
                                                    borderRadius: 0,
                                                    height: 'auto',
                                                    fontFamily: font.name,
                                                    fontSize: '20px',
                                                    color: selectedFont === font.name ? '#111827' : '#64748b'
                                                }}
                                                onClick={() => setSelectedFont(font.name)}
                                            >
                                                {typedName || (currentSignatureField?.fieldType === 'initials' ? 'JD' : 'John Doe')}
                                            </button>
                                        ))}
                                    </div>
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

                        <div className="disclaimer-container">
                            <p className="disclaimer-text">
                                By electronically signing this document, I agree that my signature and initials are the equivalent of my handwritten signature and are considered originals on all documents, including legally binding contracts. I also agree to the <a href="#">Master Services Agreement</a> and <a href="#">Privacy Policy</a>.
                            </p>
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
                                    (signatureTab === 'draw' && !isDrawing && !signatureCanvasRef.current?.toDataURL().includes('base64')) ||
                                    (signatureTab === 'type' && !typedName) ||
                                    (signatureTab === 'upload' && !uploadedImage)
                                }
                            >
                                Accept and sign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentEditor;
