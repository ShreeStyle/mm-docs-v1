import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Send, Loader2, Save, X, Pencil, Type, Upload, Trash2, Check, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { api } from '../utils/api';
import Canvas from '../components/DocumentEditor/Canvas';
import FieldsPanel from '../components/DocumentEditor/FieldsPanel';
import PropertiesSidebar from '../components/DocumentEditor/PropertiesSidebar';
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
    const [handwritingFonts] = useState([
        'Brush Script MT, cursive',
        'Lucida Handwriting, cursive',
        'Bradley Hand, cursive',
        'Dancing Script, cursive',
        'Pacifico, cursive',
        'Caveat, cursive',
        'Satisfy, cursive',
        'Great Vibes, cursive'
    ]);

    // Sidebar Resizing State
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);

    // Upload Tab State
    const [uploadedImage, setUploadedImage] = useState(null);

    // Draw Tab State
    const signatureCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, [documentId]);

    // Initialize signature canvas when modal opens
    const canvasInitialized = useRef(false);
    useEffect(() => {
        if (showSignatureModal && signatureTab === 'draw' && signatureCanvasRef.current && !canvasInitialized.current) {
            const canvas = signatureCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvasInitialized.current = true;
        }
        if (!showSignatureModal) {
            canvasInitialized.current = false;
        }
    }, [showSignatureModal, signatureTab]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/document-editor/${documentId}`);
            if (response.success) {
                const doc = response.data;
                const autofill = response.autofillMap || {};
                
                console.log('📦 Fetched document:', doc.title);
                console.log('🤖 Applying autofill map:', Object.keys(autofill).length, 'keys');

                // 1. Apply autofill to fields that are empty
                const updatedFields = (doc.fields || []).map(field => {
                    const mappingKey = field.label?.toLowerCase().replace(/\s+/g, '_');
                    const autofillValue = autofill[mappingKey] || autofill[field.label];
                    
                    if (!field.value && autofillValue) {
                        console.log(`✨ Autofilling field [${field.label}] with:`, autofillValue);
                        return { ...field, value: autofillValue, completed: true };
                    }
                    return field;
                });

                // 2. Apply autofill to block content (Handlebars-style placeholders)
                const updatedPages = (doc.pages || []).map(page => ({
                    ...page,
                    blocks: (page.blocks || []).map(block => {
                        if (block.type === 'text' && block.content) {
                            let newContent = block.content;
                            // Simple regex to find and replace {{key}} with autofill[key]
                            Object.entries(autofill).forEach(([key, val]) => {
                                const regex = new RegExp(`{{${key}}}`, 'g');
                                if (newContent.includes(`{{${key}}}`)) {
                                    console.log(`✨ Replacing {{${key}}} in block with:`, val);
                                    newContent = newContent.replace(regex, val);
                                }
                            });
                            return { ...block, content: newContent };
                        }
                        return block;
                    })
                }));

                setDocument({ ...doc, pages: updatedPages });
                setFields(updatedFields);

                // If changes were made, auto-save a few seconds later
                // handleSave(); // Optional: or just let auto-save handle it
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

    const deleteField = (fieldId) => {
        setFields(prev => {
            const newFields = prev.filter(f => f.id !== fieldId && f._id !== fieldId);
            autoSave(newFields);
            return newFields;
        });
        setSelectedField(null);
        setSelectedFieldId(null);
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
        const fieldId = currentSignatureField?.id || currentSignatureField?._id;
        if (fieldId) {
            updateField(fieldId, {
                value: signatureValue,
                completed: true
            });
        }

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

    // Sidebar resize handlers
    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizingSidebar(true);
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };

    const handleResizeMove = (e) => {
        // Since it's a right sidebar, width = screen - mouseX
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 280 && newWidth <= 480) {
            setSidebarWidth(newWidth);
        }
    };

    const handleResizeEnd = () => {
        setIsResizingSidebar(false);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };

    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [zoom, setZoom] = useState(1);

    const handleUpdateBlock = (blockId, updates) => {
        setDocument(prev => {
            const newPages = prev.pages.map(page => ({
                ...page,
                blocks: page.blocks.map(block => 
                    block.id === blockId ? { ...block, ...updates } : block
                )
            }));
            const updated = { ...prev, pages: newPages };
            autoSave(updated);
            return updated;
        });
    };

    const handleDeleteBlock = (blockId) => {
        setDocument(prev => {
            const newPages = prev.pages.map(page => ({
                ...page,
                blocks: page.blocks.filter(block => block.id !== blockId)
            }));
            const updated = { ...prev, pages: newPages };
            autoSave(updated);
            return updated;
        });
        setSelectedBlockId(null);
    };

    const handleAddBlock = (type, pageId = document.pages[0].id) => {
        const newBlock = {
            id: 'block-' + Date.now(),
            type,
            x: 100,
            y: 100,
            width: type === 'image' ? 300 : 200,
            height: type === 'image' ? 200 : 50,
            content: type === 'text' ? 'New Text Block' : '',
            style: {
                fontSize: '16px',
                color: '#1e293b'
            }
        };

        setDocument(prev => {
            const newPages = prev.pages.map(page => 
                page.id === pageId 
                    ? { ...page, blocks: [...page.blocks, newBlock] }
                    : page
            );
            return { ...prev, pages: newPages };
        });
        setSelectedBlockId(newBlock.id);
    };

    const autoSave = useCallback((updatedDoc) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await api.put(`/document-editor/${documentId}`, updatedDoc);
            } catch (err) {
                console.error('Auto-save failed:', err);
            }
        }, 1000);
    }, [documentId]);

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put(`/document-editor/${documentId}`, document);
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
            await api.post(`/document-editor/${documentId}/send`, document);
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

    // Default document initialization if none exists
    const safeDocument = document || {
        id: documentId,
        title: 'Untitled Document',
        pages: [{ id: 'page-1', width: 816, height: 1056, blocks: [] }]
    };

    const selectedBlock = safeDocument.pages.flatMap(p => p.blocks).find(b => b.id === selectedBlockId);

    return (
        <div className="document-editor">
            {/* Header */}
            <div className="editor-header">
                <div className="header-left">
                    <button className="btn-back" onClick={() => navigate('/dashboard/documents')}>
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="editor-title">{safeDocument.title}</h1>
                </div>
                <div className="editor-actions">
                    <button className="btn-secondary" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>-</button>
                    <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                    <button className="btn-secondary" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}>+</button>
                    <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-primary" onClick={handleSend}>
                        <Send size={16} />
                        Review and Send
                    </button>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="editor-main">
                {/* Canvas Area (Center) */}
                <Canvas
                    document={safeDocument}
                    selectedBlockId={selectedBlockId}
                    onSelectBlock={setSelectedBlockId}
                    onUpdateBlock={handleUpdateBlock}
                    onDeleteBlock={handleDeleteBlock}
                    zoom={zoom}
                />

                {/* Sidebar (Right) */}
                <div 
                    className={`right-sidebar ${isResizingSidebar ? 'resizing' : ''}`}
                    style={{ width: `${sidebarWidth}px` }}
                >
                    <div className="sidebar-resize-handle" onMouseDown={handleResizeStart} />
                    
                    {selectedBlock ? (
                        <PropertiesSidebar 
                            block={selectedBlock} 
                            onUpdate={handleUpdateBlock} 
                        />
                    ) : (
                        <FieldsPanel
                            onAddBlock={handleAddBlock}
                        />
                    )}
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
                                    <div className="font-options" style={{ 
                                        marginTop: '20px', 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(2, 1fr)', 
                                        gap: '12px', 
                                        maxHeight: '200px', 
                                        overflowY: 'auto',
                                        padding: '10px'
                                    }}>
                                        {handwritingFonts.map((font, index) => (
                                            <button
                                                key={font}
                                                className={`signature-font-option ${selectedFont === font ? 'active' : ''}`}
                                                style={{
                                                    padding: '15px',
                                                    border: selectedFont === font ? '2px solid #F97316' : '1px solid #e2e8f0',
                                                    borderRadius: '8px',
                                                    background: selectedFont === font ? '#fff7ed' : 'white',
                                                    fontFamily: font,
                                                    fontSize: '24px',
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    color: '#1e293b'
                                                }}
                                                onClick={() => setSelectedFont(font)}
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
                                    (signatureTab === 'draw' && !signatureCanvasRef.current) ||
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
