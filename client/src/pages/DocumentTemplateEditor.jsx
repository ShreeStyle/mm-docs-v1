import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ZoomIn, ZoomOut, Undo, Redo, Save, Download, Send,
    FileText, Edit3, Image as ImageIcon, Type, Square,
    ChevronDown, User, Eye, Settings, PenTool, Calendar,
    Upload, CheckSquare, Circle, CreditCard, Stamp, Users, X,
    Trash2, Check, Pencil, Copy, Clipboard, Scissors, Search,
    Link, Table, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Bold, Italic, Underline, Palette, List, ListOrdered,
    Maximize, Grid, Moon, Sun, Printer, FolderOpen, FilePlus,
    MessageSquare, Share2, Crown, Plus, Minus,
    Mail, Link2, Info, FileCheck, History, CheckCircle, Star, Shield, Building
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
    
    // Element dragging and resizing on canvas
    const [isDraggingElement, setIsDraggingElement] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isResizingElement, setIsResizingElement] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });
    
    // Modal states
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [signatureTab, setSignatureTab] = useState('draw'); // 'draw', 'type', 'upload'
    const [signatureText, setSignatureText] = useState('');
    const [signatureColor, setSignatureColor] = useState('#000000');
    const [currentSignatureElement, setCurrentSignatureElement] = useState(null);
    
    // Draw Tab State
    const signatureCanvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    
    // Type Tab State
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('Brush Script MT, cursive');
    
    // Upload Tab State
    const [uploadedImage, setUploadedImage] = useState(null);
    
    // Sidebar states
    const [showAllFields, setShowAllFields] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    
    // Menu dropdown states
    const [activeMenu, setActiveMenu] = useState(null);
    const [showFileMenu, setShowFileMenu] = useState(false);
    const [showEditMenu, setShowEditMenu] = useState(false);
    const [showInsertMenu, setShowInsertMenu] = useState(false);
    const [showViewMenu, setShowViewMenu] = useState(false);
    const [showFormatMenu, setShowFormatMenu] = useState(false);
    
    // Feature modals
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [showSaveAsModal, setShowSaveAsModal] = useState(false);
    const [showFindReplaceModal, setShowFindReplaceModal] = useState(false);
    const [showInsertImageModal, setShowInsertImageModal] = useState(false);
    const [showInsertTableModal, setShowInsertTableModal] = useState(false);
    const [showInsertLinkModal, setShowInsertLinkModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showLetterGenModal, setShowLetterGenModal] = useState(false);
    
    // Clipboard and formatting states
    const [clipboard, setClipboard] = useState(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [fontFamily, setFontFamily] = useState('Arial');
    const [fontSize, setFontSize] = useState(14);
    const [textColor, setTextColor] = useState('#000000');
    const [textAlign, setTextAlign] = useState('left');
    const [pageLayout, setPageLayout] = useState('single');
    
    // Document formatting states
    const [selectedText, setSelectedText] = useState('');
    const [textFormat, setTextFormat] = useState({
        fontFamily: 'Arial',
        fontSize: 14,
        bold: false,
        italic: false,
        underline: false,
        color: '#000000',
        backgroundColor: 'transparent',
        align: 'left'
    });
    
    // View states
    const [showGrid, setShowGrid] = useState(false);
    const [showRuler, setShowRuler] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [fullScreen, setFullScreen] = useState(false);
    
    // Collaboration states
    const [collaborators, setCollaborators] = useState([]);
    const [comments, setComments] = useState([]);
    
    // Letter of Recommendation fields
    const [lorData, setLorData] = useState({
        candidateName: '',
        position: '',
        skills: '',
        relationship: '',
        recommendation: ''
    });
    
    // Additional formatting states
    const [highlightColor, setHighlightColor] = useState('#FFFF00');
    const [trackChanges, setTrackChanges] = useState(false);

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
    
    // Canvas initialization for signature modal
    useEffect(() => {
        if (showSignatureModal && signatureTab === 'draw' && signatureCanvasRef.current) {
            const canvas = signatureCanvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [showSignatureModal, signatureTab]);
    
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
    
    // Signature modal handlers
    const handleSignatureSave = () => {
        let signatureValue = null;
        
        if (signatureTab === 'draw') {
            const canvas = signatureCanvasRef.current;
            signatureValue = canvas.toDataURL();
        } else if (signatureTab === 'type') {
            if (!typedName) {
                alert('Please enter your name');
                return;
            }
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
                    value: signatureValue,
                    completed: true
                };
                
                setElements([...elements, newElement]);
                setSelectedElement(newElement);
            }
        } else {
            // Update existing element on canvas
            handleElementValueChange(currentSignatureElement.id, signatureValue);
        }
        
        // Reset and close
        setShowSignatureModal(false);
        setTypedName('');
        setUploadedImage(null);
        setSignatureText('');
        setCurrentSignatureElement(null);
        if (signatureCanvasRef.current) {
            clearSignatureCanvas();
        }
    };
    
    const handleSignatureCancel = () => {
        setShowSignatureModal(false);
        setTypedName('');
        setUploadedImage(null);
        setSignatureText('');
        setCurrentSignatureElement(null);
        if (signatureCanvasRef.current) {
            clearSignatureCanvas();
        }
    };
    
    // Sidebar resize handlers
    const handleResizeStart = (e) => {
        e.preventDefault();
        setIsResizingSidebar(true);
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
    };
    
    const handleResizeMove = (e) => {
        if (isResizingSidebar) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 260 && newWidth <= 480) {
                setSidebarWidth(newWidth);
            }
        }
    };
    
    const handleResizeEnd = () => {
        setIsResizingSidebar(false);
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
    };
    
    // Element dragging on canvas
    const handleElementMouseDown = (e, element) => {
        if (e.button !== 0) return; // Only left click
        e.stopPropagation();
        
        const canvas = e.currentTarget.parentElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.offsetWidth / rect.width;
        const scaleY = canvas.offsetHeight / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        setSelectedElement(element);
        setDragOffset({
            x: mouseX - element.x,
            y: mouseY - element.y
        });
        setIsDraggingElement(true);
    };

    const handleElementMouseMove = (e) => {
        if (!isDraggingElement || !selectedElement) return;
        
        const canvas = document.querySelector('.document-page.active .page-content');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.offsetWidth / rect.width;
        const scaleY = canvas.offsetHeight / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        const newX = Math.max(0, Math.min(canvas.offsetWidth - selectedElement.width, mouseX - dragOffset.x));
        const newY = Math.max(0, Math.min(canvas.offsetHeight - selectedElement.height, mouseY - dragOffset.y));
        
        setElements(prevElements =>
            prevElements.map(el =>
                el.id === selectedElement.id
                    ? { ...el, x: newX, y: newY }
                    : el
            )
        );
        
        setSelectedElement(prev => ({ ...prev, x: newX, y: newY }));
    };

    const handleElementMouseUp = () => {
        if (isDraggingElement) {
            setIsDraggingElement(false);
        }
    };

    // Element resizing
    const handleResizeElementMouseDown = (e, element, handle) => {
        e.stopPropagation();
        e.preventDefault();
        
        const canvas = e.currentTarget.parentElement.parentElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.offsetWidth / rect.width;
        const scaleY = canvas.offsetHeight / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        setIsResizingElement(true);
        setResizeHandle(handle);
        setResizeStart({
            x: mouseX,
            y: mouseY,
            width: element.width,
            height: element.height,
            elementX: element.x,
            elementY: element.y
        });
        setSelectedElement(element);
    };

    const handleResizeElementMouseMove = (e) => {
        if (!isResizingElement || !selectedElement || !resizeHandle) return;
        
        const canvas = document.querySelector('.document-page.active .page-content');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.offsetWidth / rect.width;
        const scaleY = canvas.offsetHeight / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        const deltaX = mouseX - resizeStart.x;
        const deltaY = mouseY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.elementX;
        let newY = resizeStart.elementY;
        
        const minSize = 40;
        
        switch (resizeHandle) {
            case 'se': // bottom-right
                newWidth = Math.max(minSize, resizeStart.width + deltaX);
                newHeight = Math.max(minSize, resizeStart.height + deltaY);
                break;
            case 'sw': // bottom-left
                newWidth = Math.max(minSize, resizeStart.width - deltaX);
                newHeight = Math.max(minSize, resizeStart.height + deltaY);
                newX = resizeStart.elementX + (resizeStart.width - newWidth);
                break;
            case 'ne': // top-right
                newWidth = Math.max(minSize, resizeStart.width + deltaX);
                newHeight = Math.max(minSize, resizeStart.height - deltaY);
                newY = resizeStart.elementY + (resizeStart.height - newHeight);
                break;
            case 'nw': // top-left
                newWidth = Math.max(minSize, resizeStart.width - deltaX);
                newHeight = Math.max(minSize, resizeStart.height - deltaY);
                newX = resizeStart.elementX + (resizeStart.width - newWidth);
                newY = resizeStart.elementY + (resizeStart.height - newHeight);
                break;
        }
        
        // Ensure within canvas bounds
        if (newX < 0) {
            newWidth += newX;
            newX = 0;
        }
        if (newY < 0) {
            newHeight += newY;
            newY = 0;
        }
        if (newX + newWidth > canvas.offsetWidth) {
            newWidth = canvas.offsetWidth - newX;
        }
        if (newY + newHeight > canvas.offsetHeight) {
            newHeight = canvas.offsetHeight - newY;
        }
        
        setElements(prevElements =>
            prevElements.map(el =>
                el.id === selectedElement.id
                    ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight }
                    : el
            )
        );
        
        setSelectedElement(prev => ({ ...prev, x: newX, y: newY, width: newWidth, height: newHeight }));
    };

    const handleResizeElementMouseUp = () => {
        if (isResizingElement) {
            setIsResizingElement(false);
            setResizeHandle(null);
        }
    };

    // Canvas click to deselect
    const handleCanvasClick = (e) => {
        if (e.target.classList.contains('page-content') || e.target.classList.contains('document-page')) {
            setSelectedElement(null);
        }
    };

    // Delete selected element
    const handleDeleteElement = () => {
        if (selectedElement) {
            setElements(prevElements => prevElements.filter(el => el.id !== selectedElement.id));
            setSelectedElement(null);
        }
    };

    // Listen for element drag/resize
    useEffect(() => {
        if (isDraggingElement) {
            document.addEventListener('mousemove', handleElementMouseMove);
            document.addEventListener('mouseup', handleElementMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleElementMouseMove);
                document.removeEventListener('mouseup', handleElementMouseUp);
            };
        }
    }, [isDraggingElement, selectedElement, dragOffset]);

    useEffect(() => {
        if (isResizingElement) {
            document.addEventListener('mousemove', handleResizeElementMouseMove);
            document.addEventListener('mouseup', handleResizeElementMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleResizeElementMouseMove);
                document.removeEventListener('mouseup', handleResizeElementMouseUp);
            };
        }
    }, [isResizingElement, selectedElement, resizeHandle, resizeStart]);

    // Listen for Delete key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !showSignatureModal) {
                e.preventDefault();
                handleDeleteElement();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, showSignatureModal]);
    
    // Toggle show more/less fields
    const toggleShowAllFields = () => {
        setShowAllFields(!showAllFields);
    };
    
    // ==================== MENU HANDLERS ====================
    
    // Close all menus
    const closeAllMenus = () => {
        setActiveMenu(null);
        setShowFileMenu(false);
        setShowEditMenu(false);
        setShowInsertMenu(false);
        setShowViewMenu(false);
        setShowFormatMenu(false);
    };
    
    // Toggle menu
    const toggleMenu = (menuName) => {
        if (activeMenu === menuName) {
            closeAllMenus();
        } else {
            closeAllMenus();
            setActiveMenu(menuName);
            switch(menuName) {
                case 'file': setShowFileMenu(true); break;
                case 'edit': setShowEditMenu(true); break;
                case 'insert': setShowInsertMenu(true); break;
                case 'view': setShowViewMenu(true); break;
                case 'format': setShowFormatMenu(true); break;
            }
        }
    };
    
    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.navbar-menu') && !e.target.closest('.menu-dropdown')) {
                closeAllMenus();
            }
        };
        document.addEventListener('click', handleClickOutside);
       return () => document.removeEventListener('click', handleClickOutside);
    }, []);
    
    // FILE MENU HANDLERS
    const handleNewDocument = () => {
        if (window.confirm('Create a new document? Unsaved changes will be lost.')) {
            setDocumentName('Untitled Document');
            setElements([]);
            setHistory([]);
            setHistoryIndex(-1);
            closeAllMenus();
        }
    };
    
    const handleOpenDocument = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.txt,.html';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        setDocumentName(data.name || 'Imported Document');
                        setElements(data.elements || []);
                        alert('Document loaded successfully!');
                    } catch (error) {
                        alert('Error loading document');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
        closeAllMenus();
    };
    
    const handleSaveDocument = () => {
        const documentData = {
            name: documentName,
            elements,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(`document_${templateId}`, JSON.stringify(documentData));
        alert('Document saved successfully!');
        closeAllMenus();
    };
    
    const handleSaveAs = () => {
        const newName = prompt('Enter document name:', documentName);
        if (newName) {
            setDocumentName(newName);
            handleSaveDocument();
        }
        closeAllMenus();
    };
    
    const handleExport = (format) => {
        setShowExportModal(true);
        closeAllMenus();
    };
    
    const handlePrint = () => {
        window.print();
        closeAllMenus();
    };
    
    const handleCloseDocument = () => {
        if (window.confirm('Close document? Unsaved changes will be lost.')) {
            navigate('/dashboard/templates');
        }
        closeAllMenus();
    };
    
    // EDIT MENU HANDLERS
    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setElements(history[historyIndex - 1]);
        }
        closeAllMenus();
    };
    
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setElements(history[historyIndex + 1]);
        }
        closeAllMenus();
    };
    const handleCut = () => {
        if (selectedElement) {
            setClipboard(selectedElement);
            setElements(elements.filter(el => el.id !== selectedElement.id));
            setSelectedElement(null);
        }
        closeAllMenus();
    };
    
    const handleCopy = () => {
        if (selectedElement) {
            setClipboard({...selectedElement});
        }
        closeAllMenus();
    };
    
    const handlePaste = () => {
        if (clipboard) {
            const newElement = {
                ...clipboard,
                id: Date.now(),
                x: clipboard.x + 20,
                y: clipboard.y + 20
            };
            setElements([...elements, newElement]);
        }
        closeAllMenus();
    };
    
    const handleDelete = () => {
        if (selectedElement) {
            handleDeleteElement();
        }
        closeAllMenus();
    };
    
    const handleSelectAll = () => {
        // Select all elements on current page
        const pageElements = elements.filter(el => el.page === currentPage);
        if (pageElements.length >  0) {
            setSelectedElement(pageElements[0]);
        }
        closeAllMenus();
    };
    
    const handleFindReplace = () => {
        setShowFindReplaceModal(true);
        closeAllMenus();
    };
    
    // INSERT MENU HANDLERS
    const handleInsertImage = () => {
        setShowInsertImageModal(true);
        closeAllMenus();
    };
    
    const handleInsertTextBox = () => {
        const newElement = {
            id: Date.now(),
            type: 'textbox',
            name: 'Text Box',
            x: 100,
            y:  100,
            width: 200,
            height: 100,
            page: currentPage,
            value: 'Enter text here...',
            completed: false
        };
        setElements([...elements, newElement]);
        closeAllMenus();
    };
    
    const handleInsertTable = () => {
        setShowInsertTableModal(true);
        closeAllMenus();
    };
    
    const handleInsertLink = () => {
        setShowInsertLinkModal(true);
        closeAllMenus();
    };
    
    const handleInsertSignature = () => {
        setCurrentSignatureElement({ 
            type: 'signature', 
            name: 'Signature', 
            fromSidebar: true 
        });
        setShowSignatureModal(true);
        closeAllMenus();
    };
    
    const handleInsertComment = () => {
        setShowCommentModal(true);
        closeAllMenus();
    };
    
    // VIEW MENU HANDLERS
    const handleZoomIn = () => {
        setZoom(Math.min(zoom + 10, 200));
        closeAllMenus();
    };
    
    const handleZoomOut = () => {
        setZoom(Math.max(zoom - 10, 50));
        closeAllMenus();
    };
    
    const handleZoomReset = () => {
        setZoom(100);
        closeAllMenus();
    };
    
    const handleToggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullScreen(true);
        } else {
            document.exitFullscreen();
            setFullScreen(false);
        }
        closeAllMenus();
    };
    
    const handleToggleGrid = () => {
        setShowGrid(!showGrid);
        closeAllMenus();
    };
    
    const handleToggleRuler = () => {
        setShowRuler(!showRuler);
        closeAllMenus();
    };
    
    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.body.classList.toggle('dark-mode');
        closeAllMenus();
    };
    
    const handleChangeLayout = (layout) => {
        setPageLayout(layout);
        closeAllMenus();
    };
    
    // FORMAT MENU HANDLERS
    const applyFormat = (formatType, value) => {
        // This would apply formatting to selected text/element
        switch(formatType) {
            case 'bold':
                setIsBold(!isBold);
                break;
            case 'italic':
                setIsItalic(!isItalic);
                break;
            case 'underline':
                setIsUnderline(!isUnderline);
                break;
            case 'fontFamily':
                setFontFamily(value);
                break;
            case 'fontSize':
                setFontSize(value);
                break;
            case 'textColor':
                setTextColor(value);
                break;
            case 'textAlign':
                setTextAlign(value);
                break;
        }
        closeAllMenus();
    };
    
    // COLLABORATION HANDLERS
    const handleInvite = () => {
        setShowInviteModal(true);
    };
    
    const handleReview = () => {
        setShowReviewModal(true);
    };
    
    const handleUpgrade = () => {
        setShowUpgradeModal(true);
    };
    
    // LETTER OF RECOMMENDATION GENERATOR
    const handleGenerateLetterOfRec = () => {
        setShowLetterGenModal(true);
    };
    
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyboardShortcuts = (e) => {
            if (showSignatureModal || showInviteModal || showReviewModal) return;
            
            // Ctrl/Cmd + Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z = Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                handleRedo();
            }
            // Ctrl/Cmd + X = Cut
            if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
                e.preventDefault();
                handleCut();
            }
            // Ctrl/Cmd + C = Copy
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                handleCopy();
            }
            // Ctrl/Cmd + V = Paste
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                handlePaste();
            }
            // Ctrl/Cmd + S = Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveDocument();
            }
            // Ctrl/Cmd + F = Find
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                handleFindReplace();
            }
            // Ctrl/Cmd + A = Select All
            if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
                e.preventDefault();
                handleSelectAll();
            }
        };
        
        window.addEventListener('keydown', handleKeyboardShortcuts);
        return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
    }, [elements, selectedElement, clipboard, showSignatureModal]);

    // Toggle show more/less fields (duplicate removed)

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
                    // Check if value is an image (data URL) or text object
                    if (typeof element.value === 'string' && element.value.startsWith('data:image')) {
                        // It's a drawn or uploaded signature (image)
                        return (
                            <img 
                                src={element.value} 
                                alt={element.type}
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'contain',
                                    pointerEvents: 'none'
                                }}
                            />
                        );
                    } else if (typeof element.value === 'object' && element.value.type === 'text') {
                        // It's a typed signature
                        return (
                            <div className="field-completed" style={{ 
                                fontFamily: element.value.font || 'Brush Script MT, cursive',
                                fontSize: element.type === 'signature' ? '24px' : '18px',
                                color: element.value.color || '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                pointerEvents: 'none'
                            }}>
                                {element.value.text}
                            </div>
                        );
                    } else {
                        // Fallback for simple text
                        return (
                            <div className="field-completed" style={{ 
                                fontFamily: 'Brush Script MT, cursive',
                                fontSize: '18px',
                                color: signatureColor
                            }}>
                                {element.value}
                            </div>
                        );
                    }
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
                    <PenTool size={14} style={{ marginRight: '4px' }} />
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
                    {/* FILE MENU */}
                    <div className="menu-item-wrapper">
                        <button className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`} onClick={() => toggleMenu('file')}>
                            File
                        </button>
                        {showFileMenu && (
                            <div className="menu-dropdown">
                                <button className="menu-dropdown-item" onClick={handleNewDocument}>
                                    <FilePlus size={16} />
                                    <span>New Document</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleOpenDocument}>
                                    <FolderOpen size={16} />
                                    <span>Open...</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleSaveDocument}>
                                    <Save size={16} />
                                    <span>Save</span>
                                    <kbd>Ctrl+S</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleSaveAs}>
                                    <Save size={16} />
                                    <span>Save As...</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={() => handleExport('pdf')}>
                                    <Download size={16} />
                                    <span>Export as PDF</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={() => handleExport('docx')}>
                                    <Download size={16} />
                                    <span>Export as DOCX</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handlePrint}>
                                    <Printer size={16} />
                                    <span>Print</span>
                                    <kbd>Ctrl+P</kbd>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleCloseDocument}>
                                    <X size={16} />
                                    <span>Close</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* EDIT MENU */}
                    <div className="menu-item-wrapper">
                        <button className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`} onClick={() => toggleMenu('edit')}>
                            Edit
                        </button>
                        {showEditMenu && (
                            <div className="menu-dropdown">
                                <button className="menu-dropdown-item" onClick={handleUndo}>
                                    <Undo size={16} />
                                    <span>Undo</span>
                                    <kbd>Ctrl+Z</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleRedo}>
                                    <Redo size={16} />
                                    <span>Redo</span>
                                    <kbd>Ctrl+Y</kbd>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleCut}>
                                    <Scissors size={16} />
                                    <span>Cut</span>
                                    <kbd>Ctrl+X</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleCopy}>
                                    <Copy size={16} />
                                    <span>Copy</span>
                                    <kbd>Ctrl+C</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handlePaste}>
                                    <Clipboard size={16} />
                                    <span>Paste</span>
                                    <kbd>Ctrl+V</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleDelete}>
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                    <kbd>Del</kbd>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleSelectAll}>
                                    <CheckSquare size={16} />
                                    <span>Select All</span>
                                    <kbd>Ctrl+A</kbd>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleFindReplace}>
                                    <Search size={16} />
                                    <span>Find and Replace</span>
                                    <kbd>Ctrl+F</kbd>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* INSERT MENU */}
                    <div className="menu-item-wrapper">
                        <button className={`menu-item ${activeMenu === 'insert' ? 'active' : ''}`} onClick={() => toggleMenu('insert')}>
                            Insert
                        </button>
                        {showInsertMenu && (
                            <div className="menu-dropdown">
                                <button className="menu-dropdown-item" onClick={handleInsertImage}>
                                    <ImageIcon size={16} />
                                    <span>Image</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertTextBox}>
                                    <Type size={16} />
                                    <span>Text Box</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertTable}>
                                    <Table size={16} />
                                    <span>Table</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertLink}>
                                    <Link size={16} />
                                    <span>Hyperlink</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleInsertSignature}>
                                    <PenTool size={16} />
                                    <span>Signature</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertComment}>
                                    <MessageSquare size={16} />
                                    <span>Comment</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleGenerateLetterOfRec}>
                                    <FileText size={16} />
                                    <span>Letter of Recommendation</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* VIEW MENU */}
                    <div className="menu-item-wrapper">
                        <button className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`} onClick={() => toggleMenu('view')}>
                            View
                        </button>
                        {showViewMenu && (
                            <div className="menu-dropdown">
                                <button className="menu-dropdown-item" onClick={handleZoomIn}>
                                    <ZoomIn size={16} />
                                    <span>Zoom In</span>
                                    <kbd>+</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleZoomOut}>
                                    <ZoomOut size={16} />
                                    <span>Zoom Out</span>
                                    <kbd>-</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleZoomReset}>
                                    <Eye size={16} />
                                    <span>Reset Zoom</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleToggleFullScreen}>
                                    <Maximize size={16} />
                                    <span>Full Screen</span>
                                    <kbd>F11</kbd>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={() => handleChangeLayout('page')}>
                                    <FileText size={16} />
                                    <span>Page Layout</span>
                                    {pageLayout === 'page' && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={() => handleChangeLayout('continuous')}>
                                    <FileText size={16} />
                                    <span>Continuous</span>
                                    {pageLayout === 'continuous' && <Check size={14} />}
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleToggleGrid}>
                                    <Grid size={16} />
                                    <span>Show Grid</span>
                                    {showGrid && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={handleToggleRuler}>
                                    <Square size={16} />
                                    <span>Show Ruler</span>
                                    {showRuler && <Check size={14} />}
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleToggleDarkMode}>
                                    {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                                    <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* FORMAT MENU */}
                    <div className="menu-item-wrapper">
                        <button className={`menu-item ${activeMenu === 'format' ? 'active' : ''}`} onClick={() => toggleMenu('format')}>
                            Format
                        </button>
                        {showFormatMenu && (
                            <div className="menu-dropdown">
                                <button className="menu-dropdown-item" onClick={() => applyFormat('bold')}>
                                    <Bold size={16} />
                                    <span>Bold</span>
                                    <kbd>Ctrl+B</kbd>
                                    {isBold && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('italic')}>
                                    <Italic size={16} />
                                    <span>Italic</span>
                                    <kbd>Ctrl+I</kbd>
                                    {isItalic && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('underline')}>
                                    <Underline size={16} />
                                    <span>Underline</span>
                                    <kbd>Ctrl+U</kbd>
                                    {isUnderline && <Check size={14} />}
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('textAlign', 'left')}>
                                    <AlignLeft size={16} />
                                    <span>Align Left</span>
                                    {textAlign === 'left' && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('textAlign', 'center')}>
                                    <AlignCenter size={16} />
                                    <span>Align Center</span>
                                    {textAlign === 'center' && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('textAlign', 'right')}>
                                    <AlignRight size={16} />
                                    <span>Align Right</span>
                                    {textAlign === 'right' && <Check size={14} />}
                                </button>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('textAlign', 'justify')}>
                                    <AlignJustify size={16} />
                                    <span>Justify</span>
                                    {textAlign === 'justify' && <Check size={14} />}
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('list', 'bullet')}>
                                    <List size={16} />
                                    <span>Bullet List</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={() => applyFormat('list', 'numbered')}>
                                    <ListOrdered size={16} />
                                    <span>Numbered List</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item">
                                    <Palette size={16} />
                                    <span>Text Color</span>
                                     <input 
                                        type="color" 
                                        value={textColor}
                                        onChange={(e) => applyFormat('textColor', e.target.value)}
                                        className="color-input"
                                    />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="navbar-actions">
                    <button className="action-btn secondary" onClick={handleInvite}>
                        <User size={14} />
                        <span>Invite</span>
                    </button>
                    <button className="action-btn primary" onClick={handleReview}>
                        <Send size={14} />
                        <span>Review</span>
                    </button>
                    <button className="action-btn premium" onClick={handleUpgrade}>
                        <Crown size={14} />
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
                                <div className="page-content" onClick={handleCanvasClick}>
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
                                                    height: element.height,
                                                    cursor: isDraggingElement && selectedElement?.id === element.id ? 'grabbing' : 'grab'
                                                }}
                                                onMouseDown={(e) => handleElementMouseDown(e, element)}
                                                onClick={(e) => handleElementClick(element, e)}
                                            >
                                                {renderFieldContent(element)}
                                                {selectedElement?.id === element.id && (
                                                    <>
                                                        <div className="element-controls">
                                                            <button 
                                                                className="delete-element-btn"
                                                                onClick={handleElementDelete}
                                                                title="Delete (Press Delete key)"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                        {/* Resize handles */}
                                                        <div 
                                                            className="resize-handle resize-handle-nw"
                                                            onMouseDown={(e) => handleResizeElementMouseDown(e, element, 'nw')}
                                                        />
                                                        <div 
                                                            className="resize-handle resize-handle-ne"
                                                            onMouseDown={(e) => handleResizeElementMouseDown(e, element, 'ne')}
                                                        />
                                                        <div 
                                                            className="resize-handle resize-handle-sw"
                                                            onMouseDown={(e) => handleResizeElementMouseDown(e, element, 'sw')}
                                                        />
                                                        <div 
                                                            className="resize-handle resize-handle-se"
                                                            onMouseDown={(e) => handleResizeElementMouseDown(e, element, 'se')}
                                                        />
                                                    </>
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
                        
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleSignatureCancel}>
                                Cancel
                            </button>
                            <button 
                                className="btn-accept" 
                                onClick={handleSignatureSave}
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
            
            {/* INVITE MODAL */}
            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="invite-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowInviteModal(false)}>
                            <X size={20} />
                        </button>
                        
                        <div className="invite-modal-header">
                            <div className="invite-icon">
                                <Users size={28} />
                            </div>
                            <h2>Invite to Document</h2>
                            <p>Share this document with your team</p>
                        </div>

                        <div className="invite-modal-body">
                            <div className="invite-form">
                                <label className="invite-label">Email addresses</label>
                                <div className="invite-input-wrapper">
                                    <Mail size={18} />
                                    <input 
                                        type="email" 
                                        placeholder="colleague@company.com, team@company.com..."
                                        className="invite-email-input"
                                    />
                                </div>
                                
                                <label className="invite-label">Access level</label>
                                <div className="role-options">
                                    <div className="role-option">
                                        <input type="radio" name="role" id="viewer" defaultChecked />
                                        <label htmlFor="viewer">
                                            <Eye size={16} />
                                            <div>
                                                <strong>Viewer</strong>
                                                <span>Can view only</span>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="role-option">
                                        <input type="radio" name="role" id="commenter" />
                                        <label htmlFor="commenter">
                                            <MessageSquare size={16} />
                                            <div>
                                                <strong>Commenter</strong>
                                                <span>Can view and comment</span>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="role-option">
                                        <input type="radio" name="role" id="editor" />
                                        <label htmlFor="editor">
                                            <Edit3 size={16} />
                                            <div>
                                                <strong>Editor</strong>
                                                <span>Can view and edit</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button className="invite-send-btn" onClick={() => {
                                    alert('Invitation sent successfully!');
                                    setShowInviteModal(false);
                                }}>
                                    <Send size={18} />
                                    Send Invitation
                                </button>
                            </div>

                            <div className="invite-divider">
                                <span>or share link</span>
                            </div>

                            <div className="share-link-container">
                                <div className="share-link-box">
                                    <Link2 size={18} />
                                    <input 
                                        type="text" 
                                        value={`${window.location.origin}/doc/${templateId}`}
                                        readOnly
                                        className="share-link-field"
                                    />
                                    <button className="copy-link-btn" onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/doc/${templateId}`);
                                        alert('Link copied to clipboard!');
                                    }}>
                                        <Copy size={16} />
                                        Copy
                                    </button>
                                </div>
                                <p className="share-link-note">
                                    <Info size={14} />
                                    Anyone with the link can view this document
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* REVIEW MODAL */}
            {showReviewModal && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowReviewModal(false)}>
                            <X size={20} />
                        </button>
                        
                        <div className="review-modal-header">
                            <div className="review-icon">
                                <FileCheck size={28} />
                            </div>
                            <h2>Document Review</h2>
                            <p>Manage comments, track changes, and review history</p>
                        </div>

                        <div className="review-modal-body">
                            <div className="review-actions-grid">
                                <button className="review-action-card" onClick={() => {
                                    setShowCommentModal(true);
                                    setShowReviewModal(false);
                                }}>
                                    <div className="action-card-icon comment">
                                        <MessageSquare size={24} />
                                    </div>
                                    <h3>Add Comment</h3>
                                    <p>Leave feedback on document</p>
                                </button>

                                <button className="review-action-card" onClick={() => {
                                    setTrackChanges(!trackChanges);
                                    alert(`Track Changes ${!trackChanges ? 'enabled' : 'disabled'}`);
                                }}>
                                    <div className={`action-card-icon track ${trackChanges ? 'active' : ''}`}>
                                        <Edit3 size={24} />
                                    </div>
                                    <h3>{trackChanges ? 'Stop' : 'Track'} Changes</h3>
                                    <p>{trackChanges ? 'Currently tracking' : 'Monitor all edits'}</p>
                                </button>

                                <button className="review-action-card">
                                    <div className="action-card-icon history">
                                        <History size={24} />
                                    </div>
                                    <h3>Version History</h3>
                                    <p>View previous versions</p>
                                </button>

                                <button className="review-action-card">
                                    <div className="action-card-icon approve">
                                        <CheckCircle size={24} />
                                    </div>
                                    <h3>Approve Document</h3>
                                    <p>Mark as reviewed</p>
                                </button>
                            </div>

                            <div className="comments-section">
                                <div className="comments-header">
                                    <h3>
                                        <MessageSquare size={18} />
                                        Comments
                                    </h3>
                                    <span className="comments-count">{comments.length}</span>
                                </div>
                                
                                <div className="comments-list-container">
                                    {comments.length === 0 ? (
                                        <div className="no-comments-state">
                                            <MessageSquare size={48} />
                                            <p>No comments yet</p>
                                            <span>Start a conversation about this document</span>
                                        </div>
                                    ) : (
                                        comments.map((comment, idx) => (
                                            <div key={idx} className="comment-card">
                                                <div className="comment-avatar">
                                                    {comment.author.charAt(0)}
                                                </div>
                                                <div className="comment-content">
                                                    <div className="comment-meta">
                                                        <strong>{comment.author}</strong>
                                                        <span className="comment-time">{comment.date}</span>
                                                    </div>
                                                    <p className="comment-text">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* UPGRADE MODAL */}
            {showUpgradeModal && (
                <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
                    <div className="upgrade-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setShowUpgradeModal(false)}>
                            <X size={20} />
                        </button>
                        
                        <div className="upgrade-modal-header">
                            <div className="upgrade-icon">
                                <Crown size={32} />
                            </div>
                            <h2>Upgrade Your Plan</h2>
                            <p>Choose the perfect plan for your needs</p>
                        </div>

                        <div className="pricing-cards-container">
                            {/* FREE PLAN */}
                            <div className="pricing-card-modern">
                                <div className="plan-badge free">Current</div>
                                <div className="plan-header">
                                    <h3>Free</h3>
                                    <div className="plan-price">
                                        <span className="price-amount">$0</span>
                                        <span className="price-period">/month</span>
                                    </div>
                                    <p className="plan-description">Perfect for getting started</p>
                                </div>
                                <div className="plan-features">
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>3 documents per month</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Basic templates</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Email support</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>PDF export</span>
                                    </div>
                                </div>
                                <button className="plan-cta disabled">
                                    Current Plan
                                </button>
                            </div>

                            {/* PRO PLAN */}
                            <div className="pricing-card-modern featured">
                                <div className="plan-badge popular">
                                    <Star size={14} />
                                    Most Popular
                                </div>
                                <div className="plan-header">
                                    <h3>Professional</h3>
                                    <div className="plan-price">
                                        <span className="price-amount">$19</span>
                                        <span className="price-period">/month</span>
                                    </div>
                                    <p className="plan-description">For professionals and teams</p>
                                </div>
                                <div className="plan-features">
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span><strong>Unlimited</strong> documents</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>All premium templates</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Team collaboration</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Advanced export (PDF, DOCX)</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Priority support</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Version history</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Custom branding</span>
                                    </div>
                                </div>
                                <button className="plan-cta primary">
                                    <Crown size={18} />
                                    Upgrade to Pro
                                </button>
                                <span className="plan-trial">14-day free trial, cancel anytime</span>
                            </div>

                            {/* ENTERPRISE PLAN */}
                            <div className="pricing-card-modern">
                                <div className="plan-badge enterprise">Enterprise</div>
                                <div className="plan-header">
                                    <h3>Enterprise</h3>
                                    <div className="plan-price">
                                        <span className="price-amount">$49</span>
                                        <span className="price-period">/month</span>
                                    </div>
                                    <p className="plan-description">For large organizations</p>
                                </div>
                                <div className="plan-features">
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span><strong>Everything in Pro</strong></span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Dedicated account manager</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>API access</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Custom integrations</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>SSO / SAML</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>Advanced security</span>
                                    </div>
                                    <div className="feature-item">
                                        <CheckCircle size={18} />
                                        <span>SLA guarantee</span>
                                    </div>
                                </div>
                                <button className="plan-cta secondary">
                                    <Building size={18} />
                                    Contact Sales
                                </button>
                            </div>
                        </div>

                        <div className="pricing-footer">
                            <Shield size={16} />
                            <span>All plans include 256-bit SSL encryption and GDPR compliance</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* LETTER OF RECOMMENDATION GENERATOR */}
            {showLetterGenModal && (
                <div className="modal-overlay" onClick={() => setShowLetterGenModal(false)}>
                    <div className="feature-modal letter-gen-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Generate Letter of Recommendation</h2>
                            <button className="modal-close" onClick={() => setShowLetterGenModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Candidate Name</label>
                                <input type="text" placeholder="John Doe" className="form-input" id="candidateName" />
                            </div>
                            <div className="form-group">
                                <label>Position/Role</label>
                                <input type="text" placeholder="Software Engineer" className="form-input" id="candidateRole" />
                            </div>
                            <div className="form-group">
                                <label>Key Skills</label>
                                <input type="text" placeholder="Leadership, Communication, Technical expertise" className="form-input" id="candidateSkills" />
                            </div>
                            <div className="form-group">
                                <label>Your Relationship</label>
                                <input type="text" placeholder="Manager, Colleague, Professor" className="form-input" id="relationship" />
                            </div>
                            <div className="form-group">
                                <label>Additional Notes</label>
                                <textarea placeholder="Any specific achievements or qualities..." className="form-textarea" id="additionalNotes" rows="4"></textarea>
                            </div>
                            <button className="btn-primary" onClick={() => {
                                const name = document.getElementById('candidateName').value;
                                const role = document.getElementById('candidateRole').value;
                                const skills = document.getElementById('candidateSkills').value;
                                const relationship = document.getElementById('relationship').value;
                                const notes = document.getElementById('additionalNotes').value;
                                
                                const letterText = `

LETTER OF RECOMMENDATION

To Whom It May Concern,

I am writing to enthusiastically recommend ${name} for the position of ${role}. As their ${relationship}, I have had the pleasure of working closely with them and can confidently attest to their exceptional qualities and capabilities.

${name} has consistently demonstrated outstanding ${skills}. Their dedication to excellence and their ability to tackle complex challenges have made them an invaluable asset to our team.

Throughout our time working together, ${name} has shown remarkable ${skills}. ${notes ? notes : 'They have consistently exceeded expectations and shown strong commitment to their work.'}

I highly recommend ${name} for any position they pursue. They will undoubtedly be a tremendous asset to any organization fortunate enough to have them.

Please feel free to contact me if you require any additional information.

Sincerely,
[Your Name]
[Your Title]
[Contact Information]
                                `.trim();
                                
                                // Insert letter into document
                                const newElement = {
                                    id: Date.now(),
                                    type: 'textbox',
                                    name: 'Letter of Recommendation',
                                    x: 50,
                                    y: 50,
                                    width: 600,
                                    height: 800,
                                    page: currentPage,
                                    value: letterText,
                                    completed: true
                                };
                                setElements([...elements, newElement]);
                                setShowLetterGenModal(false);
                                alert('Letter generated and added to document!');
                            }}>
                                <FileText size={16} />
                                Generate Letter
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* EXPORT MODAL */}
            {showExportModal && (
                <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Export Document</h2>
                            <button className="modal-close" onClick={() => setShowExportModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="export-options">
                                <button className="export-option" onClick={() => {
                                    alert('Exporting as PDF...');
                                    setShowExportModal(false);
                                }}>
                                    <Download size={32} />
                                    <span>PDF</span>
                                    <small>Best for sharing</small>
                                </button>
                                <button className="export-option" onClick={() => {
                                    alert('Exporting as DOCX...');
                                    setShowExportModal(false);
                                }}>
                                    <Download size={32} />
                                    <span>DOCX</span>
                                    <small>Microsoft Word</small>
                                </button>
                                <button className="export-option" onClick={() => {
                                    const docData = {
                                        name: documentName,
                                        elements,
                                        createdAt: new Date().toISOString()
                                    };
                                    const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${documentName}.json`;
                                    a.click();
                                    setShowExportModal(false);
                                }}>
                                    <Download size={32} />
                                    <span>JSON</span>
                                    <small>Raw data</small>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* FIND AND REPLACE MODAL */}
            {showFindReplaceModal && (
                <div className="modal-overlay" onClick={() => setShowFindReplaceModal(false)}>
                    <div className="feature-modal find-replace-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Find and Replace</h2>
                            <button className="modal-close" onClick={() => setShowFindReplaceModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="form-group">
                                <label>Find</label>
                                <input type="text" placeholder="Search text..." className="form-input" id="findText" />
                            </div>
                            <div className="form-group">
                                <label>Replace with</label>
                                <input type="text" placeholder="Replacement text..." className="form-input" id="replaceText" />
                            </div>
                            <div className="find-replace-actions">
                                <button className="btn-secondary" onClick={() => alert('Finding next...')}>
                                    Find Next
                                </button>
                                <button className="btn-secondary" onClick={() => alert('Replacing...')}>
                                    Replace
                                </button>
                                <button className="btn-primary" onClick={() => alert('Replacing all...')}>
                                    Replace All
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* INSERT IMAGE MODAL */}
            {showInsertImageModal && (
                <div className="modal-overlay" onClick={() => setShowInsertImageModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Insert Image</h2>
                            <button className="modal-close" onClick={() => setShowInsertImageModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="upload-area-large">
                                <input
                                    type="file"
                                    id="image-upload"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                const newElement = {
                                                    id: Date.now(),
                                                    type: 'image',
                                                    name: 'Image',
                                                    x: 100,
                                                    y: 100,
                                                    width: 200,
                                                    height: 200,
                                                    page: currentPage,
                                                    value: event.target.result,
                                                    completed: true
                                                };
                                                setElements([...elements, newElement]);
                                                setShowInsertImageModal(false);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                                <label htmlFor="image-upload" className="upload-label-large">
                                    <ImageIcon size={48} />
                                    <span>Click to upload image</span>
                                    <small>PNG, JPG, GIF up to 10MB</small>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentTemplateEditor;
