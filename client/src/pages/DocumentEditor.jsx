import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Send, Loader2, Save, X, Pencil, Type, Undo, Redo, Upload, Trash2, Check, ChevronLeft, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import { api } from '../utils/api';
import { getApiUrl } from '../config/api';
import Canvas from '../components/DocumentEditor/Canvas';
import FieldsPanel from '../components/DocumentEditor/FieldsPanel';
import PropertiesSidebar from '../components/DocumentEditor/PropertiesSidebar';
import '../styles/DocumentEditor.css';

const DocumentEditor = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const [docData, setDocData] = useState(null);
    const saveTimeoutRef = useRef(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [activeTool, setActiveTool] = useState('pencil');
    const [activeColor, setActiveColor] = useState('#000000');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

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

    // Recipient Modal State
    const [showRecipientModal, setShowRecipientModal] = useState(false);
    const [recipientForm, setRecipientForm] = useState({
        documentName: '',
        recipientName: '',
        recipientEmail: '',
        senderName: '',
        senderEmail: ''
    });
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);

    // Draw Tab State
    const signatureCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        fetchDocument();
    }, [documentId]);

    // Handle History Initialization
    useEffect(() => {
        if (docData && history.length === 0) {
            const initialSnapshot = { docData: JSON.parse(JSON.stringify(docData)), fields: JSON.parse(JSON.stringify(fields)) };
            setHistory([initialSnapshot]);
            setHistoryIndex(0);
        }
    }, [docData, fields]);

    const pushToHistory = (newDocData, newFields) => {
        const snapshot = {
            docData: JSON.parse(JSON.stringify(newDocData)),
            fields: JSON.parse(JSON.stringify(newFields))
        };
        
        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            // Limit history to 50 steps
            if (newHistory.length >= 50) newHistory.shift();
            newHistory.push(snapshot);
            return newHistory;
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    };

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            const prevState = history[prevIndex];
            setDocData(prevState.docData);
            setFields(prevState.fields);
            setHistoryIndex(prevIndex);
            autoSave(prevState.docData);
        }
    }, [history, historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            const nextState = history[nextIndex];
            setDocData(nextState.docData);
            setFields(nextState.fields);
            setHistoryIndex(nextIndex);
            autoSave(nextState.docData);
        }
    }, [history, historyIndex]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleUndo, handleRedo]);

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

    // Helper to convert legacy HTML Preview into editable blocks for Canva-like editing
    const convertHtmlToBlocks = async (url) => {
        try {
            console.log('🔄 Deep-scanning HTML for blocks from:', url);
            const token = localStorage.getItem('token');
            const response = await fetch(getApiUrl(url), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const body = doc.body;
            
            let yOffset = 40; 
            const margin = 60;
            const pageWidth = 816;
            const contentWidth = pageWidth - (margin * 2);
            const blocks = [];

            // 1. Extract and inject CSS from the original template
            const styles = doc.querySelectorAll('style');
            styles.forEach((styleTag, sIdx) => {
                const id = `doc-injected-style-${sIdx}`;
                if (!document.getElementById(id)) {
                    const newStyle = document.createElement('style');
                    newStyle.id = id;
                    newStyle.textContent = styleTag.textContent;
                    document.head.appendChild(newStyle);
                }
            });

            // 2. Clean up script/style tags from body before capturing innerHTML
            const internalStyles = doc.querySelectorAll('style');
            internalStyles.forEach(node => node.remove());

            const contentHTML = body.innerHTML;

            // 3. Create a single, unified master block wrapping the entire document content
            blocks.push({
                id: `gen-block-main`,
                type: 'text',
                content: contentHTML.trim(),
                x: 0,
                y: 0,
                width: pageWidth,
                height: 'auto', // Allow native browser flow for the entire height
                style: { 
                    lineHeight: '1.6',
                    marginBottom: '0px',
                    padding: '60px' // Add the margin internally so the block occupies the full canvas
                }
            });

            return blocks;
        } catch (err) {
            console.error('❌ HTML conversion failed:', err);
            return [];
        }
    };

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const editorResponse = await api.get(`/document-editor/${documentId}`);
            if (editorResponse.success) {
                const doc = editorResponse.data;
                const autofill = editorResponse.autofillMap || {};
                
                // 1. Process Autofill for Fields
                const updatedFields = (doc.fields || []).map(field => {
                    const mappingKey = field.label?.toLowerCase().replace(/\s+/g, '_');
                    const autofillValue = autofill[mappingKey] || autofill[field.label];
                    if (!field.value && autofillValue) return { ...field, value: autofillValue, completed: true };
                    return field;
                });

                // 2. Process Blocks
                let updatedPages = (doc.pages || []).map(page => ({
                    ...page,
                    blocks: (page.blocks || []).map(block => {
                        if (block.type === 'text' && block.content) {
                            let newContent = block.content;
                            Object.entries(autofill).forEach(([key, val]) => {
                                const regex = new RegExp(`{{${key}}}`, 'g');
                                if (newContent.includes(`{{${key}}}`)) newContent = newContent.replace(regex, val);
                            });
                            return { ...block, content: newContent };
                        }
                        return block;
                    })
                }));

                // 3. Fallback/Conversion for AI generated legacy documents
                if ((updatedPages.length === 0 || updatedPages[0]?.blocks?.length === 0) && doc.content) {
                    const token = localStorage.getItem('token') || '';
                    const previewUrl = `/api/documents/${doc._id || doc.id}/preview?token=${token}`;
                    
                    // Convert the HTML into individual blocks!
                    const generatedBlocks = await convertHtmlToBlocks(previewUrl);
                    
                    updatedPages = [{
                        id: 'page-1',
                        width: 816,
                        height: Math.max(1056, generatedBlocks.reduce((acc, b) => Math.max(acc, b.y + b.height), 0) + 100),
                        blocks: generatedBlocks
                    }];
                }

                setDocData({ ...doc, pages: updatedPages });
                setFields(updatedFields);
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
            pushToHistory(docData, updated);
            autoSave(updated);
            return updated;
        });
    };

    const handleFieldSelect = (block) => {
        if (!block) {
            setSelectedBlockId(null);
            return;
        }
        setSelectedBlockId(block.id);
    };

    const handleBlockAction = (block) => {
        if (!block) return;
        
        setSelectedBlockId(block.id);

        // If signature or initials field is selected
        if (block.type === 'signature' || block.type === 'initials') {
            setCurrentSignatureField(block);
            setShowSignatureModal(true);
        } else if (block.type === 'image') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        handleUpdateBlock(block.id, { content: event.target.result });
                    };
                    reader.readAsDataURL(file);
                }
            };
            fileInput.click();
        }
    };

    const updateField = (fieldId, updates) => {
        setFields(prev => {
            const newFields = prev.map(f =>
                (f.id === fieldId || f._id === fieldId) ? { ...f, ...updates } : f
            );
            pushToHistory(docData, newFields);
            autoSave(newFields);
            return newFields;
        });
    };

    const deleteField = (fieldId) => {
        setFields(prev => {
            const newFields = prev.filter(f => f.id !== fieldId && f._id !== fieldId);
            pushToHistory(docData, newFields);
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

        // Update the block with signature data
        const blockId = currentSignatureField?.id;
        if (blockId) {
            handleUpdateBlock(blockId, {
                content: signatureValue,
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
        window.document.addEventListener('mousemove', handleResizeMove);
        window.document.addEventListener('mouseup', handleResizeEnd);
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
        window.document.removeEventListener('mousemove', handleResizeMove);
        window.document.removeEventListener('mouseup', handleResizeEnd);
    };

    const [selectedBlockId, setSelectedBlockId] = useState(null);
    const [zoom, setZoom] = useState(1);

    const handleUpdateBlock = (blockId, updates) => {
        setDocData(prev => {
            const newPages = prev.pages.map(page => ({
                ...page,
                blocks: page.blocks.map(block => 
                    block.id === blockId ? { ...block, ...updates } : block
                )
            }));
            const updated = { ...prev, pages: newPages };
            pushToHistory(updated, fields);
            autoSave(updated);
            return updated;
        });
    };

    const handleDeleteBlock = (blockId) => {
        setDocData(prev => {
            const newPages = prev.pages.map(page => ({
                ...page,
                blocks: page.blocks.filter(block => block.id !== blockId)
            }));
            const updated = { ...prev, pages: newPages };
            pushToHistory(updated, fields);
            autoSave(updated);
            return updated;
        });
        setSelectedBlockId(null);
    };

    const handleAddBlock = (type, x = 100, y = 100, pageId = null) => {
        const targetPageId = pageId || docData?.pages?.[0]?.id;
        
        const newBlock = {
            id: 'block-' + Date.now(),
            type,
            x: x,
            y: y,
            width: type === 'image' ? 300 : (type === 'signature' ? 200 : 200),
            height: type === 'image' ? 200 : (type === 'signature' ? 80 : 50),
            content: type === 'text' ? 'New Text Block' : '',
            style: {
                fontSize: '16px',
                color: '#1e293b',
                fontFamily: 'Inter, sans-serif'
            }
        };

        setDocData(prev => {
            const newPages = prev.pages.map(page => {
                if (page.id === targetPageId) {
                    return { ...page, blocks: [...(page.blocks || []), newBlock] };
                }
                return page;
            });
            const updated = { ...prev, pages: newPages };
            pushToHistory(updated, fields);
            return updated;
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
            await api.put(`/document-editor/${documentId}`, docData);
            alert('Document saved successfully!');
        } catch (err) {
            console.error('Error saving document:', err);
            setError('Failed to save document');
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            
            // Grab the actual rendered editor page from the DOM
            const editorPage = document.querySelector('.document-pages-container');
            if (!editorPage) throw new Error('Could not find document pages');

            // Clone to avoid mutating the real DOM
            const clone = editorPage.cloneNode(true);
            
            // Clean up UI-only elements (selection dashed borders, resize handles)
            clone.querySelectorAll('.block-border, .resize-handle').forEach(el => el.remove());

            // Generate full HTML payload including styles
            const styles = Array.from(document.querySelectorAll('style'))
                .map(s => s.outerHTML)
                .join('\n');

            const finalHtml = `
                ${styles}
                <div style="background: #e8eaed; min-height: 100vh; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 40px;">
                    ${clone.innerHTML}
                </div>
            `;

            const response = await fetch(getApiUrl(`/api/document-editor/${documentId}/pdf`), {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ html: finalHtml })
            });

            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeDocument?.title || 'document'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleOpenRecipientModal = () => {
        setRecipientForm(prev => ({
            ...prev,
            documentName: safeDocument?.title || 'Document'
        }));
        setSendSuccess(false);
        setShowRecipientModal(true);
    };

    const handleSendWithRecipients = async () => {
        if (!recipientForm.recipientEmail) {
            alert('Please enter the recipient email.');
            return;
        }
        try {
            setSending(true);
            // Save first to capture latest edits
            await api.put(`/document-editor/${documentId}`, docData);
            // Then send
            await api.post(`/document-editor/${documentId}/send`, {
                ...docData,
                recipients: [{
                    name: recipientForm.recipientName,
                    email: recipientForm.recipientEmail,
                    role: 'signer'
                }],
                sender: {
                    name: recipientForm.senderName,
                    email: recipientForm.senderEmail
                },
                documentName: recipientForm.documentName
            });
            setSendSuccess(true);
        } catch (err) {
            console.error('Error sending document:', err);
            alert('Failed to send document. Please try again.');
        } finally {
            setSending(false);
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
    const safeDocument = docData || {
        id: documentId,
        title: 'Untitled Document',
        pages: [{ id: 'page-1', width: 816, height: 1056, blocks: [] }]
    };

    // Keep iframe correctly sized
    const handleHtmlIframeLoad = (e) => {
        try {
            const iframeDoc = e.target.contentWindow.document;
            const scrollHeight = iframeDoc.body.scrollHeight;
            if (scrollHeight > 1056) {
               // Notify the canvas to resize the page by updating the safeDocument in state
               setDocData(prev => {
                   if (!prev) return prev;
                   const updated = { ...prev };
                   updated.pages = updated.pages.map(p => {
                       if (p.id === 'page-1') {
                           return { 
                               ...p, 
                               height: scrollHeight + 100,
                               blocks: p.blocks.map(b => b.type === 'html' ? { ...b, height: scrollHeight + 100 } : b)
                           };
                       }
                       return p;
                   });
                   return updated;
               });
            }
        } catch (err) {}
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
                <div className="zoom-controls">
                    <button className="zoom-btn" title="Undo (Cmd+Z)" disabled={historyIndex <= 0} onClick={handleUndo}>
                        <Undo size={16} />
                    </button>
                    <button className="zoom-btn" title="Redo (Cmd+Shift+Z)" disabled={historyIndex >= history.length - 1} onClick={handleRedo}>
                        <Redo size={16} />
                    </button>
                    <div className="zoom-divider" />
                    <button className="zoom-btn" onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}>-</button>
                    <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                    <button className="btn-secondary" onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}>+</button>
                    <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-secondary" onClick={handleDownload}>
                        <ChevronDown size={16} />
                        Download
                    </button>
                    <button className="btn-primary" onClick={handleOpenRecipientModal}>
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
                    onSelectBlock={handleFieldSelect}
                    onBlockAction={handleBlockAction}
                    onUpdateBlock={handleUpdateBlock}
                    onDeleteBlock={handleDeleteBlock}
                    onAddBlock={handleAddBlock}
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
            {/* Recipient Modal */}
            {showRecipientModal && (
                <div className="signature-modal-overlay" onClick={() => setShowRecipientModal(false)}>
                    <div className="signature-modal" style={{ maxWidth: 580, width: '95%' }} onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="signature-modal-header">
                            {sendSuccess ? (
                                <h2 style={{ color: '#16a34a' }}>✅ Document Sent!</h2>
                            ) : (
                                <h2>Add document recipients</h2>
                            )}
                            <button className="close-modal-btn" onClick={() => setShowRecipientModal(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {sendSuccess ? (
                            <div style={{ padding: '32px', textAlign: 'center' }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
                                <p style={{ color: '#374151', fontSize: 15, marginBottom: 8 }}>
                                    Your document has been sent to <strong>{recipientForm.recipientEmail}</strong>.
                                </p>
                                <p style={{ color: '#6b7280', fontSize: 13 }}>They will receive an email with a link to review and sign.</p>
                                <button className="btn-primary" style={{ marginTop: 24, width: '100%' }} onClick={() => navigate('/dashboard/documents')}>
                                    Back to Documents
                                </button>
                            </div>
                        ) : (
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <p style={{ color: '#6b7280', fontSize: 13, marginTop: -8 }}>
                                    This template includes roles, which help assign fields to recipients automatically.
                                </p>

                                {/* Document Name */}
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#374151' }}>
                                        Document name <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={recipientForm.documentName}
                                        onChange={e => setRecipientForm(prev => ({ ...prev, documentName: e.target.value }))}
                                        style={{
                                            width: '100%', padding: '10px 14px', border: '2px solid #16a34a',
                                            borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>

                                {/* Recipient Block */}
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, borderLeft: '4px solid #f97316' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Add recipient</span>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: '#f97316', background: '#fff7ed', padding: '2px 8px', borderRadius: 20, letterSpacing: 1 }}>CLIENT</span>
                                    </div>
                                    <input type="text" placeholder="Recipient name"
                                        value={recipientForm.recipientName}
                                        onChange={e => setRecipientForm(prev => ({ ...prev, recipientName: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                    <input type="email" placeholder="Recipient email *"
                                        value={recipientForm.recipientEmail}
                                        onChange={e => setRecipientForm(prev => ({ ...prev, recipientEmail: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Sender Block */}
                                <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, borderLeft: '4px solid #6366f1' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Add recipient</span>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 20, letterSpacing: 1 }}>SENDER</span>
                                    </div>
                                    <input type="text" placeholder="Your name"
                                        value={recipientForm.senderName}
                                        onChange={e => setRecipientForm(prev => ({ ...prev, senderName: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                    <input type="email" placeholder="Your email"
                                        value={recipientForm.senderEmail}
                                        onChange={e => setRecipientForm(prev => ({ ...prev, senderEmail: e.target.value }))}
                                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>

                                {/* Footer Actions */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                                    <button style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', padding: 0 }}
                                        onClick={() => setShowRecipientModal(false)}>
                                        Skip
                                    </button>
                                    <button className="btn-primary" onClick={handleSendWithRecipients} disabled={sending}
                                        style={{ minWidth: 120, justifyContent: 'center' }}>
                                        {sending ? <Loader2 size={16} className="spinner" /> : <Send size={14} />}
                                        {sending ? 'Sending...' : 'Continue'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentEditor;
