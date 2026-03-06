import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ZoomIn, ZoomOut, Undo, Redo, Save, Download, Send,
    FileText, Edit3, Image as ImageIcon, Type, Square,
    ChevronDown, User, Eye, Settings, PenTool, Calendar,
    Upload, CheckSquare, Circle, CreditCard, Stamp, Users, X
} from 'lucide-react';
import { api } from '../utils/api';
import '../styles/DocumentTemplateEditor.css';

const DocumentTemplateEditor = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);

    // State management
    const [template, setTemplate] = useState(null);
    const [documentName, setDocumentName] = useState('Untitled Document');
    const [isEditingName, setIsEditingName] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [zoom, setZoom] = useState(100);
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedField, setDraggedField] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    
    // Modal states
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureTab, setSignatureTab] = useState('type'); // 'draw', 'type', 'upload'
    const [signatureText, setSignatureText] = useState('');
    const [signatureColor, setSignatureColor] = useState('#000000');
    const [currentSignatureElement, setCurrentSignatureElement] = useState(null);
    
    // Sidebar states
    const [showAllFields, setShowAllFields] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isResizing, setIsResizing] = useState(false);

    // User info
    const [userInfo] = useState({
        name: 'Dhanashree r',
        email: 'dhanashreetrambadiya@gmail.com',
        role: 'Signer',
        initials: 'DR'
    });

    // Fillable fields library
    const topFields = [
        { id: 'signature', name: 'Signature', icon: PenTool, color: '#f97316' },
        { id: 'initials', name: 'Initials', icon: Type, color: '#f97316' },
        { id: 'textfield', name: 'Text field', icon: Type, color: '#f97316' },
        { id: 'date', name: 'Date', icon: Calendar, color: '#f97316' }
    ];
    
    const moreFields = [
        { id: 'fileupload', name: 'File upload', icon: Upload, color: '#f97316' },
        { id: 'radio', name: 'Radio buttons', icon: Circle, color: '#f97316' },
        { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, color: '#f97316' },
        { id: 'dropdown', name: 'Dropdown', icon: ChevronDown, color: '#f97316' },
        { id: 'card', name: 'Card details', icon: CreditCard, color: '#f97316' },
        { id: 'stamp', name: 'Stamp', icon: Stamp, color: '#f97316' }
    ];
    
    const allFields = [...topFields, ...moreFields];

    // Load template
    useEffect(() => {
        loadTemplate();
        
        // Cleanup on unmount
        return () => {
            document.removeEventListener('mousemove', handleResizeMove);
            document.removeEventListener('mouseup', handleResizeEnd);
        };
    }, [templateId]);

    const loadTemplate = async () => {
        try {
            const response = await api.get(`/templates/${templateId}`);
            if (response.success) {
                setTemplate(response.data);
                setDocumentName(response.data.name);
                setTotalPages(response.data.pages || 1);
            }
        } catch (error) {
            console.error('Error loading template:', error);
        }
    };

    // Zoom controls
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleZoomReset = () => setZoom(100);

    // Undo/Redo
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setElements(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setElements(history[historyIndex + 1]);
        }
    };

    // Drag and drop field from sidebar
    const handleFieldDragStart = (field) => {
        setDraggedField(field);
    };
    
    // Click handler for sidebar fields
    const handleFieldClick = (field) => {
        // For signature and initials, open modal first
        if (field.id === 'signature' || field.id === 'initials') {
            setCurrentSignatureElement({ 
                type: field.id, 
                name: field.name, 
                fromSidebar: true 
            });
            setShowSignatureModal(true);
        } else {
            // For other fields, place directly on canvas at center
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = rect.width / 2 - 100; // Center horizontally
                const y = rect.height / 2 - 20; // Center vertically
                
                const newElement = {
                    id: Date.now(),
                    type: field.id,
                    name: field.name,
                    x: x,
                    y: y,
                    width: 200,
                    height: 40,
                    page: currentPage,
                    recipient: null,
                    required: false,
                    value: '',
                    completed: false
                };
                
                setElements([...elements, newElement]);
                setSelectedElement(newElement);
            }
        }
    };

    const handleCanvasDrop = (e) => {
        e.preventDefault();
        if (!draggedField) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newElement = {
            id: Date.now(),
            type: draggedField.id,
            name: draggedField.name,
            x: x,
            y: y,
            width: 200,
            height: draggedField.id === 'signature' ? 60 : 40,
            page: currentPage,
            recipient: null,
            required: false,
            value: '', // Store field value
            completed: false
        };

        setElements([...elements, newElement]);
        setDraggedField(null);
        
        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push([...elements, newElement]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleCanvasDragOver = (e) => {
        e.preventDefault();
    };

    // Element selection and manipulation
    const handleElementClick = (element, e) => {
        e.stopPropagation();
        setSelectedElement(element);
        
        // Open signature modal for signature or initials fields
        if ((element.type === 'signature' || element.type === 'initials') && !element.completed) {
            setCurrentSignatureElement(element);
            setShowSignatureModal(true);
        }
    };

    const handleElementDelete = (e) => {
        e.stopPropagation();
        if (selectedElement) {
            setElements(elements.filter(el => el.id !== selectedElement.id));
            setSelectedElement(null);
        }
    };
    
    // Update element value
    const handleElementValueChange = (elementId, value) => {
        setElements(elements.map(el => 
            el.id === elementId ? { ...el, value, completed: true } : el
        ));
    };
    
    // Signature modal handlers
    const handleSignatureSave = () => {
        if (!currentSignatureElement || !signatureText) return;
        
        // If signature was added from sidebar, create new element on canvas
        if (currentSignatureElement.fromSidebar) {
            const canvas = canvasRef.current;
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                const x = rect.width / 2 - 100; // Center horizontally
                const y = rect.height / 2 - 30; // Center vertically
                
                const newElement = {
                    id: Date.now(),
                    type: currentSignatureElement.type,
                    name: currentSignatureElement.name,
                    x: x,
                    y: y,
                    width: 200,
                    height: currentSignatureElement.type === 'signature' ? 60 : 40,
                    page: currentPage,
                    recipient: null,
                    required: false,
                    value: signatureText,
                    completed: true
                };
                
                setElements([...elements, newElement]);
                setSelectedElement(newElement);
            }
        } else {
            // Update existing element on canvas
            handleElementValueChange(currentSignatureElement.id, signatureText);
        }
        
        setShowSignatureModal(false);
        setSignatureText('');
        setCurrentSignatureElement(null);
    };
    
    const handleSignatureCancel = () => {
        setShowSignatureModal(false);
        setSignatureText('');
        setCurrentSignatureElement(null);
    };
    
    // Sidebar resize handlers
    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };
    
    const handleResizeMove = (e) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 260 && newWidth <= 480) {
                setSidebarWidth(newWidth);
            }
        }
    };
    
    const handleResizeEnd = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    // Toggle show more/less fields
    const toggleShowAllFields = () => {
        setShowAllFields(!showAllFields);
    };

    // Document name editing
    const handleNameClick = () => {
        setIsEditingName(true);
    };

    const handleNameChange = (e) => {
        setDocumentName(e.target.value);
    };

    const handleNameBlur = () => {
        setIsEditingName(false);
    };
    
    // Render interactive field content
    const renderFieldContent = (element) => {
        if (element.completed && element.value) {
            switch (element.type) {
                case 'signature':
                case 'initials':
                    return (
                        <div className="field-completed" style={{ 
                            fontFamily: 'Brush Script MT, cursive',
                            fontSize: '18px',
                            color: signatureColor
                        }}>
                            {element.value}
                        </div>
                    );
                case 'textfield':
                    return <input type="text" value={element.value} onChange={(e) => handleElementValueChange(element.id, e.target.value)} className="field-input" onClick={(e) => e.stopPropagation()} />;
                case 'date':
                    return <input type="date" value={element.value} onChange={(e) => handleElementValueChange(element.id, e.target.value)} className="field-input" onClick={(e) => e.stopPropagation()} />;
                case 'checkbox':
                    return <input type="checkbox" checked={element.value} onChange={(e) => handleElementValueChange(element.id, e.target.checked)} onClick={(e) => e.stopPropagation()} />;
                default:
                    return <div className="element-content">{element.name}</div>;
            }
        }
        
        // Show placeholder for empty fields - clickable for signature
        if (element.type === 'signature' || element.type === 'initials') {
            return (
                <div className="element-content signature-placeholder">
                    {element.name}
                </div>
            );
        }
        
        return (
            <div className="element-content">{element.name}</div>
        );
    };

    return (
        <div className="template-editor">
            {/* Top Navigation Bar */}
            <header className="editor-navbar">
                <div className="navbar-left">
                    <button className="back-button" onClick={() => navigate('/dashboard/templates')}>
                        <FileText size={20} />
                    </button>
                    
                    {isEditingName ? (
                        <input
                            type="text"
                            value={documentName}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            autoFocus
                            className="document-name-input"
                        />
                    ) : (
                        <h1 className="document-name" onClick={handleNameClick}>
                            {documentName}
                        </h1>
                    )}
                    
                    <span className="document-status">Draft</span>
                </div>

                <div className="navbar-menu">
                    <button className="menu-item">File</button>
                    <button className="menu-item">Edit</button>
                    <button className="menu-item">Insert</button>
                    <button className="menu-item">View</button>
                    <button className="menu-item">Format</button>
                </div>

                <div className="navbar-actions">
                    <button className="action-btn secondary">
                        <User size={14} />
                        <span>Invite</span>
                    </button>
                    <button className="action-btn primary">
                        <Send size={14} />
                        <span>Review</span>
                    </button>
                    <button className="action-btn premium">
                        <span>Upgrade</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="editor-main">
                {/* Left Toolbar */}
                <aside className="left-toolbar">
                    <button className="toolbar-btn" title="Undo" onClick={handleUndo}>
                        <Undo size={20} />
                    </button>
                    <button className="toolbar-btn" title="Redo" onClick={handleRedo}>
                        <Redo size={20} />
                    </button>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-btn" title="Zoom In" onClick={handleZoomIn}>
                        <ZoomIn size={20} />
                    </button>
                    <button className="toolbar-btn active" onClick={handleZoomReset}>
                        {zoom}%
                    </button>
                    <button className="toolbar-btn" title="Zoom Out" onClick={handleZoomOut}>
                        <ZoomOut size={20} />
                    </button>
                    <div className="toolbar-divider"></div>
                    <button className="toolbar-btn" title="Text">
                        <Type size={20} />
                    </button>
                    <button className="toolbar-btn" title="Image">
                        <ImageIcon size={20} />
                    </button>
                    <button className="toolbar-btn" title="Shape">
                        <Square size={20} />
                    </button>
                </aside>

                {/* Canva-Style Canvas Workspace */}
                <div className="canvas-workspace">
                    <div className="canvas-container" style={{ transform: `scale(${zoom / 100})` }}>
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div
                                key={pageIndex}
                                ref={pageIndex === 0 ? canvasRef : null}
                                className={`document-page ${currentPage === pageIndex + 1 ? 'active' : ''}`}
                                onDrop={handleCanvasDrop}
                                onDragOver={handleCanvasDragOver}
                                onClick={() => setCurrentPage(pageIndex + 1)}
                            >
                                {/* Page Number Indicator */}
                                <div className="page-indicator">
                                    Page {pageIndex + 1} of {totalPages}
                                </div>

                                {/* Document Content */}
                                <div className="page-content">
                                    {pageIndex === 0 && (
                                        <>
                                            <div className="document-header">
                                                <h1 className="document-title">Agency Agreement</h1>
                                                <p className="document-date">Date: [Date]</p>
                                            </div>

                                            <div className="document-body">
                                                <p className="document-text">
                                                    This Agreement is entered into on <span className="variable">[Date]</span> between 
                                                    <span className="variable"> [Client.Company]</span> ("Client") and 
                                                    <span className="variable"> [Sender.Company]</span> ("Agency").
                                                </p>

                                                <h2 className="section-title">1. Scope of Services</h2>
                                                <p className="document-text">
                                                    The Agency agrees to provide the following services to the Client:
                                                </p>
                                                <ul className="document-list">
                                                    <li>Marketing and advertising services</li>
                                                    <li>Brand strategy development</li>
                                                    <li>Creative content production</li>
                                                </ul>

                                                <h2 className="section-title">2. Terms and Conditions</h2>
                                                <p className="document-text">
                                                    Both parties agree to the following terms...
                                                </p>

                                                <h2 className="section-title">3. Signatures</h2>
                                                <div className="signature-section">
                                                    <div className="signature-block">
                                                        <p><strong>Client:</strong> <span className="variable">[Client.FirstName] [Client.LastName]</span></p>
                                                        <div className="signature-line"></div>
                                                    </div>
                                                    <div className="signature-block">
                                                        <p><strong>Agency:</strong> <span className="variable">[Sender.FirstName] [Sender.LastName]</span></p>
                                                        <div className="signature-line"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Render draggable elements on this page */}
                                    {elements
                                        .filter(el => el.page === pageIndex + 1)
                                        .map(element => (
                                            <div
                                                key={element.id}
                                                className={`canvas-element ${selectedElement?.id === element.id ? 'selected' : ''} ${element.completed ? 'completed' : ''}`}
                                                style={{
                                                    left: element.x,
                                                    top: element.y,
                                                    width: element.width,
                                                    height: element.height
                                                }}
                                                onClick={(e) => handleElementClick(element, e)}
                                            >
                                                {renderFieldContent(element)}
                                                {selectedElement?.id === element.id && (
                                                    <div className="element-controls">
                                                        <button onClick={handleElementDelete}>×</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar - Fields Library */}
                <aside className="fields-sidebar" style={{ width: `${sidebarWidth}px` }}>
                    {/* Resize Handle */}
                    <div 
                        className="sidebar-resize-handle"
                        onMouseDown={handleResizeStart}
                    />
                    
                    {/* User Profile Section */}
                    <div className="sidebar-user-profile">
                        <div className="user-avatar">{userInfo.initials}</div>
                        <div className="user-details">
                            <div className="user-name">
                                {userInfo.name} <span className="user-role">{userInfo.role}</span> <span className="user-you">YOU</span>
                            </div>
                            <div className="user-email">{userInfo.email}</div>
                        </div>
                        <ChevronDown size={16} className="user-expand" />
                    </div>
                    
                    <div className="sidebar-header">
                        <h3>Add Fillable Fields</h3>
                    </div>

                    <div className="fields-list">
                        {/* Top 4 Fields - Always Visible */}
                        {topFields.map(field => {
                            const Icon = field.icon;
                            return (
                                <div
                                    key={field.id}
                                    className="field-item"
                                    draggable
                                    onDragStart={() => handleFieldDragStart(field)}
                                    onClick={() => handleFieldClick(field)}
                                >
                                    <div className="field-icon" style={{ backgroundColor: `${field.color}20`, color: field.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="field-name">{field.name}</span>
                                    <div className="field-drag-handle">
                                        <div className="drag-dots">⋮⋮</div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Additional Fields - Show/Hide */}
                        {showAllFields && moreFields.map(field => {
                            const Icon = field.icon;
                            return (
                                <div
                                    key={field.id}
                                    className="field-item"
                                    draggable
                                    onDragStart={() => handleFieldDragStart(field)}
                                    onClick={() => handleFieldClick(field)}
                                >
                                    <div className="field-icon" style={{ backgroundColor: `${field.color}20`, color: field.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <span className="field-name">{field.name}</span>
                                    <div className="field-drag-handle">
                                        <div className="drag-dots">⋮⋮</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* Show More Button - Outside fields list */}
                    <div className="show-more-container">
                        <button className="show-more-btn" onClick={toggleShowAllFields}>
                            <ChevronDown 
                                size={14} 
                                style={{ 
                                    transform: showAllFields ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease'
                                }} 
                            />
                            {showAllFields ? 'Show less' : 'Show more'}
                        </button>
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-section">
                        <button className="sidebar-action-btn">
                            <Users size={18} />
                            Manage Recipients
                        </button>
                        <button className="sidebar-action-btn">
                            <Eye size={18} />
                            Review Data
                        </button>
                    </div>
                </aside>
            </div>

            {/* Bottom Status Bar */}
            <footer className="editor-footer">
                <div className="footer-left">
                    <span>Page {currentPage} of {totalPages}</span>
                </div>
                <div className="footer-right">
                    <button className="footer-btn">
                        <Save size={16} />
                        Auto-saved
                    </button>
                </div>
            </footer>
            
            {/* Signature Modal */}
            {showSignatureModal && (
                <div className="modal-overlay" onClick={handleSignatureCancel}>
                    <div className="signature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Signature</h2>
                            <button className="modal-close" onClick={handleSignatureCancel}>
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="modal-tabs">
                            <button 
                                className={`tab-btn ${signatureTab === 'draw' ? 'active' : ''}`}
                                onClick={() => setSignatureTab('draw')}
                            >
                                Draw
                            </button>
                            <button 
                                className={`tab-btn ${signatureTab === 'type' ? 'active' : ''}`}
                                onClick={() => setSignatureTab('type')}
                            >
                                Type
                            </button>
                            <button 
                                className={`tab-btn ${signatureTab === 'upload' ? 'active' : ''}`}
                                onClick={() => setSignatureTab('upload')}
                            >
                                Upload
                            </button>
                        </div>
                        
                        <div className="modal-content">
                            {signatureTab === 'type' && (
                                <div className="signature-type-section">
                                    <div className="font-selector">
                                        <label>Choose font</label>
                                        <div className="color-picker">
                                            <button 
                                                className={`color-btn ${signatureColor === '#000000' ? 'active' : ''}`}
                                                style={{ background: '#000000' }}
                                                onClick={() => setSignatureColor('#000000')}
                                            />
                                            <button 
                                                className={`color-btn ${signatureColor === '#3b82f6' ? 'active' : ''}`}
                                                style={{ background: '#3b82f6' }}
                                                onClick={() => setSignatureColor('#3b82f6')}
                                            />
                                            <button 
                                                className={`color-btn ${signatureColor === '#ef4444' ? 'active' : ''}`}
                                                style={{ background: '#ef4444' }}
                                                onClick={() => setSignatureColor('#ef4444')}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="signature-preview">
                                        <input
                                            type="text"
                                            value={signatureText}
                                            onChange={(e) => setSignatureText(e.target.value)}
                                            placeholder="Type your signature"
                                            className="signature-input"
                                            style={{
                                                fontFamily: 'Brush Script MT, cursive',
                                                fontSize: '32px',
                                                color: signatureColor
                                            }}
                                        />
                                    </div>
                                    
                                    <div className="signature-agreement">
                                        <p>By electronically signing this document, I agree that my signature and initials are the equivalent of my handwritten signature and are considered originals on all documents, including legally binding contracts. I also agree to the <a href="#">Master Services Agreement</a> and <a href="#">Privacy Policy</a>.</p>
                                    </div>
                                </div>
                            )}
                            
                            {signatureTab === 'draw' && (
                                <div className="signature-draw-section">
                                    <p>Draw functionality coming soon...</p>
                                </div>
                            )}
                            
                            {signatureTab === 'upload' && (
                                <div className="signature-upload-section">
                                    <p>Upload functionality coming soon...</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleSignatureCancel}>
                                Cancel
                            </button>
                            <button className="btn-accept" onClick={handleSignatureSave} disabled={!signatureText}>
                                Accept and sign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentTemplateEditor;
