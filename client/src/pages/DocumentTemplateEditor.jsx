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
    Mail, Link2, Info, FileCheck, History, CheckCircle, Star, Shield, Building,
    Clock, HelpCircle, Play, Database, Maximize2
} from 'lucide-react';
import { api } from '../utils/api';
import '../styles/DocumentTemplateEditor.css';

const DocumentTemplateEditor = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const isRestoringFromHistory = useRef(false);
    const historyRef = useRef({ history: [], index: -1 });

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
    const [showInviteDropdown, setShowInviteDropdown] = useState(false);
    const [showReviewDropdown, setShowReviewDropdown] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [openStampId, setOpenStampId] = useState(null);

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
    const [showInsertVideoModal, setShowInsertVideoModal] = useState(false);
    const [showPricingTableModal, setShowPricingTableModal] = useState(false);
    const [showQuoteBuilderModal, setShowQuoteBuilderModal] = useState(false);
    const [showTOCModal, setShowTOCModal] = useState(false);

    // Table insertion states
    const [tableRows, setTableRows] = useState(3);
    const [tableColumns, setTableColumns] = useState(3);

    // Invitation states
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteAccessLevel, setInviteAccessLevel] = useState('viewer');
    const [isSendingInvite, setIsSendingInvite] = useState(false);

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
        { id: 'text', name: 'Text field', icon: Type, color: '#f97316' },
        { id: 'date', name: 'Date', icon: Calendar, color: '#f97316' }
    ];

    const moreFields = [
        { id: 'file-upload', name: 'File upload', icon: Upload, color: '#f97316' },
        { id: 'radio', name: 'Radio buttons', icon: Circle, color: '#f97316' },
        { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, color: '#f97316' },
        { id: 'dropdown', name: 'Dropdown', icon: ChevronDown, color: '#f97316' },
        { id: 'card-details', name: 'Card details', icon: CreditCard, color: '#f97316' },
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

    // Initialize history with empty state on mount
    useEffect(() => {
        if (historyRef.current.history.length === 0) {
            const initialState = JSON.parse(JSON.stringify(elements));
            historyRef.current = { history: [initialState], index: 0 };
            setHistory([initialState]);
            setHistoryIndex(0);
            console.log('History initialized with empty state');
        }
    }, []);

    // Track element changes in history (for undo/redo)
    useEffect(() => {
        // Skip if restoring from history
        if (isRestoringFromHistory.current) {
            isRestoringFromHistory.current = false;
            return;
        }

        const currentHistory = historyRef.current.history;
        const currentIndex = historyRef.current.index;

        // Check if this is a duplicate of the last history entry
        if (currentHistory.length > 0 && currentIndex >= 0) {
            const lastEntry = currentHistory[currentIndex];
            if (JSON.stringify(lastEntry) === JSON.stringify(elements)) {
                return; // Skip duplicate
            }
        }

        // Create a new history entry, discarding any "future" history after current index
        const newHistory = currentHistory.slice(0, currentIndex + 1);
        newHistory.push(JSON.parse(JSON.stringify(elements)));

        // Limit history to 50 entries
        if (newHistory.length > 50) {
            newHistory.shift();
        }

        const newIndex = newHistory.length - 1;

        // Update ref (source of truth)
        historyRef.current = { history: newHistory, index: newIndex };

        // Update state for UI (button disabled states)
        setHistory(newHistory);
        setHistoryIndex(newIndex);

        console.log('History updated:', { length: newHistory.length, index: newIndex });
    }, [elements]);

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
        } else if (field.id === 'file-upload') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.onchange = (ev) => {
                const file = ev.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const canvas = canvasRef.current;
                        if (canvas) {
                            const rect = canvas.getBoundingClientRect();
                            const x = rect.width / 2 - 100;
                            const y = rect.height / 2 - 100;

                            const newElement = {
                                id: Date.now(),
                                type: 'image', // Use image type since we are reading it as data URL
                                name: 'Uploaded File',
                                x: x,
                                y: y,
                                width: 200,
                                height: 200,
                                page: currentPage,
                                value: event.target.result,
                                completed: true
                            };

                            setElements(prev => [...prev, newElement]);
                            setSelectedElement(newElement);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            fileInput.click();
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
                    value: field.id === 'dropdown' ? 'Option 1' : '',
                    options: field.id === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : [],
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
            value: draggedField.id === 'dropdown' ? 'Option 1' : '', // Store field value
            options: draggedField.id === 'dropdown' ? ['Option 1', 'Option 2', 'Option 3'] : [],
            completed: false
        };

        setElements([...elements, newElement]);
        setDraggedField(null);
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

    const handleEditOptions = (element) => {
        const currentOptions = element.options || ['Option 1', 'Option 2', 'Option 3'];
        const val = prompt('Enter options separated by commas:', currentOptions.join(', '));
        if (val !== null) {
            const newOptions = val.split(',').map(o => o.trim()).filter(o => o !== '');
            if (newOptions.length > 0) {
                const updatedElements = elements.map(el =>
                    el.id === element.id ? { ...el, options: newOptions, value: newOptions[0] } : el
                );
                setElements(updatedElements);
                addToHistory(updatedElements);
            }
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
            // Don't delete element if user is typing in an input/textarea
            const activeElement = document.activeElement;
            const isTyping = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );

            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement && !showSignatureModal && !isTyping) {
                e.preventDefault();
                handleDeleteElement();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement, showSignatureModal]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showInviteDropdown || showReviewDropdown) {
                const target = event.target;
                const isDropdown = target.closest('.action-dropdown-wrapper');
                if (!isDropdown) {
                    setShowInviteDropdown(false);
                    setShowReviewDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showInviteDropdown, showReviewDropdown]);

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
        setShowInviteDropdown(false);
        setShowReviewDropdown(false);
    };

    // Toggle menu
    const toggleMenu = (menuName) => {
        if (activeMenu === menuName) {
            closeAllMenus();
        } else {
            closeAllMenus();
            setActiveMenu(menuName);
            switch (menuName) {
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
            historyRef.current = { history: [], index: -1 };
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
        const currentIndex = historyRef.current.index;
        const currentHistory = historyRef.current.history;

        console.log('Undo clicked:', { currentIndex, historyLength: currentHistory.length });

        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            const restoredElements = JSON.parse(JSON.stringify(currentHistory[newIndex]));

            console.log('Undoing to index:', newIndex, 'Elements:', restoredElements.length);

            // Update ref first
            historyRef.current.index = newIndex;

            // Set flag to prevent useEffect from adding to history
            isRestoringFromHistory.current = true;

            // Restore elements
            setElements(restoredElements);
            setHistoryIndex(newIndex);
        } else {
            console.log('Cannot undo - at beginning of history');
        }
        closeAllMenus();
    };

    const handleRedo = () => {
        const currentIndex = historyRef.current.index;
        const currentHistory = historyRef.current.history;

        console.log('Redo clicked:', { currentIndex, historyLength: currentHistory.length });

        if (currentIndex < currentHistory.length - 1) {
            const newIndex = currentIndex + 1;
            const restoredElements = JSON.parse(JSON.stringify(currentHistory[newIndex]));

            console.log('Redoing to index:', newIndex, 'Elements:', restoredElements.length);

            // Update ref first
            historyRef.current.index = newIndex;

            // Set flag to prevent useEffect from adding to history
            isRestoringFromHistory.current = true;

            // Restore elements
            setElements(restoredElements);
            setHistoryIndex(newIndex);
        } else {
            console.log('Cannot redo - at end of history');
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
            setClipboard({ ...selectedElement });
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
        if (pageElements.length > 0) {
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
            y: 100,
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
        switch (formatType) {
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

    // NEW HANDLERS FOR ENHANCED FILE MENU
    const handleRename = () => {
        setIsEditingName(true);
        closeAllMenus();
    };

    const handleConvertToTemplate = async () => {
        try {
            const documentId = templateId; // Using templateId as documentId
            const response = await api.post(`/documents/${documentId}/convert-to-template`);
            if (response.success) {
                alert(`✅ ${response.message}`);
                // Optionally navigate to templates page
                // navigate('/templates');
            }
        } catch (error) {
            console.error('Error converting to template:', error);
            alert('❌ Failed to convert document to template');
        }
        closeAllMenus();
    };

    const handleMakeCopy = async () => {
        try {
            const documentId = templateId; // Using templateId as documentId
            const response = await api.post(`/documents/${documentId}/copy`);
            if (response.success) {
                alert(`✅ ${response.message}`);
                // Optionally navigate to the new document
                // navigate(`/document-editor/${response.document._id}`);
            }
        } catch (error) {
            console.error('Error copying document:', error);
            alert('❌ Failed to copy document');
        }
        closeAllMenus();
    };

    const handleWorkflowSetup = () => {
        alert('Workflow setup - Premium feature!');
        closeAllMenus();
    };

    const handleESignature = () => {
        alert('E-signature and verification');
        closeAllMenus();
    };

    const handleRecipients = () => {
        alert('Manage recipients');
        closeAllMenus();
    };

    const handleDocumentSettings = () => {
        alert('Document settings');
        closeAllMenus();
    };

    const handleMove = () => {
        alert('Move document to folder');
        closeAllMenus();
    };

    const handleArchive = async () => {
        if (window.confirm('Archive this document?')) {
            try {
                const documentId = templateId; // Using templateId as documentId
                const response = await api.put(`/documents/${documentId}/archive`);
                if (response.success) {
                    alert(`✅ ${response.message}`);
                    // Navigate back to documents list
                    navigate('/documents');
                }
            } catch (error) {
                console.error('Error archiving document:', error);
                alert('❌ Failed to archive document');
            }
        }
        closeAllMenus();
    };

    const handleDownload = (format) => {
        alert(`Downloading as ${format}...`);
        closeAllMenus();
    };

    // NEW HANDLERS FOR ENHANCED INSERT MENU
    const handleInsertDocument = () => {
        alert('Insert document');
        closeAllMenus();
    };

    const handleInsertCoverPage = () => {
        const newElement = {
            id: Date.now(),
            type: 'cover-page',
            name: 'Cover Page',
            x: 50,
            y: 50,
            width: 700,
            height: 900,
            page: 1,
            value: {
                title: documentName,
                subtitle: 'Document Subtitle',
                author: userInfo.name,
                date: new Date().toLocaleDateString()
            },
            completed: false
        };
        setElements([...elements, newElement]);
        alert('✅ Cover page added!');
        closeAllMenus();
    };

    const handleInsertBlankPage = () => {
        setTotalPages(totalPages + 1);
        alert('Blank page added!');
        closeAllMenus();
    };

    const handleInsertAttachment = () => {
        alert('Insert attachment - Premium feature!');
        closeAllMenus();
    };

    const handleAddFrom = () => {
        alert('Add from library');
        closeAllMenus();
    };

    const handleFillableFields = () => {
        alert('Fillable fields');
        closeAllMenus();
    };

    const handleInsertVideo = () => {
        setShowInsertVideoModal(true);
        closeAllMenus();
    };

    const handleInsertPricingTable = () => {
        setShowPricingTableModal(true);
        closeAllMenus();
    };

    const handleInsertQuoteBuilder = () => {
        setShowQuoteBuilderModal(true);
        closeAllMenus();
    };

    const handleInsertTOC = () => {
        setShowTOCModal(true);
        closeAllMenus();
    };

    const handleInsertPageBreak = () => {
        const newElement = {
            id: Date.now(),
            type: 'page-break',
            name: 'Page Break',
            x: 50,
            y: 100,
            width: 700,
            height: 2,
            page: currentPage,
            value: null,
            completed: true
        };
        setElements([...elements, newElement]);
        setTotalPages(totalPages + 1);
        alert('✅ Page break inserted');
        closeAllMenus();
    };

    // NEW HANDLERS FOR ENHANCED VIEW MENU
    const handleAllVariables = () => {
        alert('Show all variables');
        closeAllMenus();
    };

    const handleContentLibrary = () => {
        alert('Content library - Premium feature!');
        closeAllMenus();
    };

    const handlePagesPreview = () => {
        alert('Pages preview');
        closeAllMenus();
    };

    const handleResolvedComments = () => {
        alert('Resolved comments/suggestions');
        closeAllMenus();
    };

    const handleReviewData = () => {
        alert('Review data');
        closeAllMenus();
    };

    const handleFullScreenPreview = () => {
        handleToggleFullScreen();
    };

    // NEW HANDLERS FOR ENHANCED FORMAT MENU
    const handleStyleMenu = () => {
        alert('Style menu');
        closeAllMenus();
    };

    const handleFontMenu = () => {
        alert('Font selection');
        closeAllMenus();
    };

    const handleTextSizeMenu = () => {
        alert('Text size selection');
        closeAllMenus();
    };

    const handleFormattingMenu = () => {
        alert('Formatting options');
        closeAllMenus();
    };

    const handleAlignTextMenu = () => {
        alert('Align text options');
        closeAllMenus();
    };

    const handleBulletsMenu = () => {
        alert('Bullets and numbering');
        closeAllMenus();
    };

    const handleIndentMenu = () => {
        alert('Indent options');
        closeAllMenus();
    };

    const handleLineSpacingMenu = () => {
        alert('Line spacing');
        closeAllMenus();
    };

    const handleBorderStyles = () => {
        alert('Border styles');
        closeAllMenus();
    };

    const handleInsertLinkFormat = () => {
        setShowInsertLinkModal(true);
        closeAllMenus();
    };

    const handleClearFormatting = () => {
        setIsBold(false);
        setIsItalic(false);
        setIsUnderline(false);
        setFontFamily('Arial');
        setFontSize(14);
        setTextColor('#000000');
        setTextAlign('left');
        alert('Formatting cleared!');
        closeAllMenus();
    };

    const handleTheme = () => {
        alert('Theme options');
        closeAllMenus();
    };

    const handleLayoutSetup = () => {
        alert('Layout setup');
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

            // Check if user is typing in an input/textarea
            const activeElement = document.activeElement;
            const isTyping = activeElement && (
                activeElement.tagName === 'INPUT' ||
                activeElement.tagName === 'TEXTAREA' ||
                activeElement.isContentEditable
            );

            // Ctrl/Cmd + Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isTyping) {
                e.preventDefault();
                handleUndo();
            }
            // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z = Redo
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isTyping) {
                e.preventDefault();
                handleRedo();
            }
            // Ctrl/Cmd + X = Cut (only for elements, not text in inputs)
            if ((e.ctrlKey || e.metaKey) && e.key === 'x' && !isTyping) {
                e.preventDefault();
                handleCut();
            }
            // Ctrl/Cmd + C = Copy (only for elements, not text in inputs)
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !isTyping) {
                e.preventDefault();
                handleCopy();
            }
            // Ctrl/Cmd + V = Paste (only for elements, not text in inputs)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !isTyping) {
                e.preventDefault();
                handlePaste();
            }
            // Ctrl/Cmd + S = Save (always works)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveDocument();
            }
            // Ctrl/Cmd + F = Find (only when not typing)
            if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !isTyping) {
                e.preventDefault();
                handleFindReplace();
            }
            // Ctrl/Cmd + A = Select All (only for elements, not text in inputs)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !isTyping) {
                e.preventDefault();
                handleSelectAll();
            }
        };

        window.addEventListener('keydown', handleKeyboardShortcuts);
        return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
    }, [elements, selectedElement, clipboard, showSignatureModal, history, historyIndex]);

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
        // Special handling for images - always show if they have a value
        if (element.type === 'image' && element.value) {
            return (
                <img
                    src={element.value}
                    alt="Inserted image"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        pointerEvents: 'none'
                    }}
                />
            );
        }

        // Render input for editable fields
        if (element.type === 'text') {
            return (
                <input
                    type="text"
                    value={element.value || ''}
                    onChange={(e) => handleElementValueChange(element.id, e.target.value)}
                    className="field-input"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    placeholder="Type here..."
                />
            );
        }

        if (element.type === 'date') {
            return (
                <input
                    type="date"
                    value={element.value || ''}
                    onChange={(e) => handleElementValueChange(element.id, e.target.value)}
                    className="field-input"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                />
            );
        }

        if (element.type === 'textbox') {
            return (
                <textarea
                    value={element.value || ''}
                    onChange={(e) => handleElementValueChange(element.id, e.target.value)}
                    className="field-input textbox-input"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        border: 'none',
                        padding: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        outline: 'none'
                    }}
                    placeholder="Type multi-line text here..."
                />
            );
        }

        if (element.type === 'checkbox') {
            return (
                <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={element.value || false}
                        onChange={(e) => handleElementValueChange(element.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                </div>
            );
        }

        if (element.type === 'radio') {
            return (
                <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    <input
                        type="radio"
                        checked={element.value || false}
                        onChange={(e) => handleElementValueChange(element.id, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                </div>
            );
        }

        if (element.type === 'dropdown') {
            const isOpen = openDropdownId === element.id;
            return (
                <div
                    className="field-input dropdown-field-wrapper"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        padding: '0 8px',
                        position: 'relative',
                        height: '100%',
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(isOpen ? null : element.id);
                    }}
                >
                    <span style={{ fontSize: '13px', opacity: element.value ? 1 : 0.5, userSelect: 'none' }}>
                        {element.value || 'Select...'}
                    </span>
                    <ChevronDown 
                        size={14} 
                        style={{ 
                            transition: 'transform 0.2s ease', 
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' 
                        }} 
                    />

                    {isOpen && (
                        <div 
                            className="custom-dropdown-menu"
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '100%',
                                marginTop: '4px',
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                zIndex: 1000,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}
                        >
                            {(element.options || ['Option 1', 'Option 2', 'Option 3']).map((option, idx) => (
                                <div
                                    key={idx}
                                    className="dropdown-option-item"
                                    style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        color: '#1e293b',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        borderBottom: idx < (element.options?.length || 3) - 1 ? '1px solid #f1f5f9' : 'none'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleElementValueChange(element.id, option);
                                        setOpenDropdownId(null);
                                    }}
                                >
                                    {option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (element.type === 'file-upload') {
            return (
                <div
                    className="field-input"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '0 8px',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden'
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.onchange = (ev) => {
                            const file = ev.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    handleElementValueChange(element.id, event.target.result);
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                        fileInput.click();
                    }}
                >
                    {element.value && typeof element.value === 'string' && element.value.startsWith('data:image') ? (
                        <img
                            src={element.value}
                            alt="Upload preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <>
                            <Upload size={14} />
                            <span style={{ fontSize: '12px' }}>{element.value ? 'File Uploaded' : 'Upload File'}</span>
                        </>
                    )}
                </div>
            );
        }

        if (element.type === 'card-details') {
            return (
                <div
                    className="field-input"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Close dropdowns if open
                        setOpenDropdownId(null);
                        setOpenStampId(null);
                        
                        const val = prompt('Enter card details (last 4 digits):', element.value || '');
                        if (val !== null) handleElementValueChange(element.id, val);
                    }}
                >
                    <CreditCard size={14} />
                    <span style={{ fontSize: '12px' }}>
                        {element.value ? `Card: **** ${element.value}` : 'Card Details'}
                    </span>
                </div>
            );
        }

        if (element.type === 'stamp') {
            const isStampOpen = openStampId === element.id;
            const stampOptions = [
                { label: 'APPROVED', color: '#16a34a', borderColor: '#bbf7d0', bgColor: '#f0fdf4' },
                { label: 'PAID', color: '#2563eb', borderColor: '#bfdbfe', bgColor: '#eff6ff' },
                { label: 'DRAFT', color: '#64748b', borderColor: '#e2e8f0', bgColor: '#f8fafc' },
                { label: 'SIGN HERE', color: '#ea580c', borderColor: '#fed7aa', bgColor: '#fff7ed' },
                { label: 'URGENT', color: '#dc2626', borderColor: '#fecaca', bgColor: '#fef2f2' }
            ];

            const currentStamp = element.value 
                ? stampOptions.find(opt => opt.label === element.value) || stampOptions[0]
                : null;

            return (
                <div
                    className="field-input dropdown-field-wrapper"
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: currentStamp ? '4px' : '0 8px',
                        cursor: 'pointer',
                        position: 'relative',
                        border: currentStamp ? 'none' : undefined,
                        background: currentStamp ? 'transparent' : undefined
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Close other open menus
                        setOpenDropdownId(null);
                        setOpenStampId(isStampOpen ? null : element.id);
                    }}
                >
                    {currentStamp ? (
                        <div style={{
                            border: `3px solid ${currentStamp.borderColor}`,
                            color: currentStamp.color,
                            backgroundColor: currentStamp.bgColor,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            transform: 'rotate(-5deg)',
                            fontFamily: 'Impact, Arial Black, sans-serif',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            {currentStamp.label}
                        </div>
                    ) : (
                        <>
                            <Stamp size={14} />
                            <span style={{ fontSize: '12px' }}>Stamp</span>
                        </>
                    )}

                    {isStampOpen && (
                        <div className="custom-dropdown-menu" style={{ 
                            left: '50%', 
                            transform: 'translateX(-50%)',
                            width: '160px',
                            padding: '8px'
                        }}>
                            {stampOptions.map((option, idx) => (
                                <div 
                                    key={idx}
                                    className="custom-dropdown-item"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px',
                                        borderBottom: idx < stampOptions.length - 1 ? '1px solid #f1f5f9' : 'none'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleElementValueChange(element.id, option.label);
                                        setOpenStampId(null);
                                    }}
                                >
                                    <div style={{
                                        border: `2px solid ${option.borderColor}`,
                                        color: option.color,
                                        backgroundColor: option.bgColor,
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        letterSpacing: '0.5px',
                                        fontFamily: 'Impact, Arial Black, sans-serif'
                                    }}>
                                        {option.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        if (element.completed && element.value) {
            switch (element.type) {
                case 'signature':
                case 'initials':
                case 'date':
                    return <input type="date" value={element.value} onChange={(e) => handleElementValueChange(element.id, e.target.value)} className="field-input" onClick={(e) => e.stopPropagation()} />;
                case 'checkbox':
                    return <input type="checkbox" checked={element.value} onChange={(e) => handleElementValueChange(element.id, e.target.checked)} onClick={(e) => e.stopPropagation()} />;
                case 'textbox':
                    return (
                        <textarea
                            value={element.value}
                            onChange={(e) => handleElementValueChange(element.id, e.target.value)}
                            className="field-input textbox-input"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                height: '100%',
                                resize: 'none',
                                border: 'none',
                                padding: '8px',
                                fontFamily: 'inherit',
                                fontSize: '14px',
                                outline: 'none'
                            }}
                        />
                    );
                case 'image':
                    return (
                        <img
                            src={element.value}
                            alt="Inserted image"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                pointerEvents: 'none'
                            }}
                        />
                    );
                case 'table':
                    if (element.value && element.value.data) {
                        return (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                overflow: 'auto',
                                pointerEvents: 'auto'
                            }}>
                                <table style={{
                                    width: '100%',
                                    borderCollapse: 'collapse',
                                    fontSize: '12px'
                                }}>
                                    <tbody>
                                        {element.value.data.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                {row.map((cell, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        style={{
                                                            border: '1px solid #cbd5e1',
                                                            padding: '6px',
                                                            minWidth: '60px'
                                                        }}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={cell}
                                                            data-row={rowIndex}
                                                            data-col={colIndex}
                                                            data-element-id={element.id}
                                                            onChange={(e) => {
                                                                const newData = element.value.data.map((r, ri) =>
                                                                    ri === rowIndex
                                                                        ? r.map((c, ci) => ci === colIndex ? e.target.value : c)
                                                                        : r
                                                                );
                                                                handleElementValueChange(element.id, {
                                                                    ...element.value,
                                                                    data: newData
                                                                });
                                                            }}
                                                            onKeyDown={(e) => {
                                                                const maxRow = element.value.data.length - 1;
                                                                const maxCol = element.value.data[0].length - 1;
                                                                let targetRow = rowIndex;
                                                                let targetCol = colIndex;

                                                                if (e.key === 'ArrowRight' && colIndex < maxCol) {
                                                                    targetCol = colIndex + 1;
                                                                    e.preventDefault();
                                                                } else if (e.key === 'ArrowLeft' && colIndex > 0) {
                                                                    targetCol = colIndex - 1;
                                                                    e.preventDefault();
                                                                } else if (e.key === 'ArrowDown' && rowIndex < maxRow) {
                                                                    targetRow = rowIndex + 1;
                                                                    e.preventDefault();
                                                                } else if (e.key === 'ArrowUp' && rowIndex > 0) {
                                                                    targetRow = rowIndex - 1;
                                                                    e.preventDefault();
                                                                } else if (e.key === 'Tab') {
                                                                    e.preventDefault();
                                                                    if (e.shiftKey) {
                                                                        // Tab backwards
                                                                        if (colIndex > 0) {
                                                                            targetCol = colIndex - 1;
                                                                        } else if (rowIndex > 0) {
                                                                            targetRow = rowIndex - 1;
                                                                            targetCol = maxCol;
                                                                        }
                                                                    } else {
                                                                        // Tab forwards
                                                                        if (colIndex < maxCol) {
                                                                            targetCol = colIndex + 1;
                                                                        } else if (rowIndex < maxRow) {
                                                                            targetRow = rowIndex + 1;
                                                                            targetCol = 0;
                                                                        }
                                                                    }
                                                                }

                                                                if (targetRow !== rowIndex || targetCol !== colIndex) {
                                                                    const targetInput = document.querySelector(
                                                                        `input[data-element-id="${element.id}"][data-row="${targetRow}"][data-col="${targetCol}"]`
                                                                    );
                                                                    if (targetInput) {
                                                                        targetInput.focus();
                                                                        targetInput.select();
                                                                    }
                                                                }
                                                            }}
                                                            onClick={(e) => e.stopPropagation()}
                                                            style={{
                                                                width: '100%',
                                                                border: 'none',
                                                                background: 'transparent',
                                                                outline: 'none',
                                                                fontSize: '12px',
                                                                padding: '2px'
                                                            }}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }
                    return <div className="element-content">{element.name}</div>;
                case 'video':
                    if (element.value) {
                        // Convert YouTube/Vimeo URLs to embed format
                        let embedUrl = element.value;
                        if (element.value.includes('youtube.com/watch?v=')) {
                            const videoId = element.value.split('v=')[1]?.split('&')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (element.value.includes('youtu.be/')) {
                            const videoId = element.value.split('youtu.be/')[1]?.split('?')[0];
                            embedUrl = `https://www.youtube.com/embed/${videoId}`;
                        } else if (element.value.includes('vimeo.com/')) {
                            const videoId = element.value.split('vimeo.com/')[1]?.split('?')[0];
                            embedUrl = `https://player.vimeo.com/video/${videoId}`;
                        }
                        return (
                            <iframe
                                src={embedUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: '4px'
                                }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        );
                    }
                    return <div className="element-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={32} /></div>;
                case 'pricing-table':
                    if (element.value && element.value.plans) {
                        return (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                gap: '10px',
                                padding: '10px',
                                overflow: 'auto'
                            }}>
                                {element.value.plans.map((plan, index) => (
                                    <div key={index} style={{
                                        flex: 1,
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        background: 'white',
                                        textAlign: 'center'
                                    }}>
                                        <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#1e293b' }}>{plan.name}</h3>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px', color: '#F97316' }}>{plan.price}</div>
                                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '12px' }}>
                                            {plan.features.map((feature, fi) => (
                                                <li key={fi} style={{ padding: '5px 0', color: '#64748b' }}>✓ {feature}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return <div className="element-content">Pricing Table</div>;
                case 'quote-builder':
                    if (element.value && element.value.items) {
                        return (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                padding: '15px',
                                overflow: 'auto',
                                background: 'white'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                            <th style={{ padding: '8px', textAlign: 'left' }}>Description</th>
                                            <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Rate</th>
                                            <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {element.value.items.map((item, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '8px' }}>{item.description}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                                                <td style={{ padding: '8px', textAlign: 'right' }}>${item.rate}</td>
                                                <td style={{ padding: '8px', textAlign: 'right' }}>${item.amount}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr style={{ borderTop: '2px solid #e2e8f0' }}>
                                            <td colSpan="3" style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Subtotal:</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>${element.value.subtotal}</td>
                                        </tr>
                                        <tr>
                                            <td colSpan="3" style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>Tax:</td>
                                            <td style={{ padding: '8px', textAlign: 'right' }}>${element.value.tax}</td>
                                        </tr>
                                        <tr style={{ background: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
                                            <td colSpan="3" style={{ padding: '8px', textAlign: 'right' }}>Total:</td>
                                            <td style={{ padding: '8px', textAlign: 'right', color: '#F97316' }}>${element.value.total}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        );
                    }
                    return <div className="element-content">Quote Builder</div>;
                case 'toc':
                    if (element.value && element.value.sections) {
                        return (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                padding: '15px',
                                overflow: 'auto',
                                background: 'white'
                            }}>
                                <h2 style={{ fontSize: '18px', marginBottom: '15px', color: '#1e293b' }}>Table of Contents</h2>
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {element.value.sections.map((section, index) => (
                                        <li key={index} style={{
                                            padding: '8px 0',
                                            borderBottom: '1px dotted #e2e8f0',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '13px'
                                        }}>
                                            <span>{section.title}</span>
                                            <span style={{ color: '#64748b' }}>{section.page}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    }
                    return <div className="element-content">Table of Contents</div>;
                case 'cover-page':
                    if (element.value) {
                        return (
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '40px',
                                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                                border: '2px solid #cbd5e1',
                                borderRadius: '8px'
                            }}>
                                <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#1e293b', textAlign: 'center' }}>
                                    {element.value.title}
                                </h1>
                                <p style={{ fontSize: '18px', marginBottom: '15px', color: '#64748b' }}>
                                    {element.value.subtitle}
                                </p>
                                <div style={{ marginTop: '30px', fontSize: '14px', color: '#94a3b8' }}>
                                    <div>By: {element.value.author}</div>
                                    <div>{element.value.date}</div>
                                </div>
                            </div>
                        );
                    }
                    return <div className="element-content">Cover Page</div>;
                case 'page-break':
                    return (
                        <div style={{
                            width: '100%',
                            height: '2px',
                            background: '#cbd5e1',
                            position: 'relative'
                        }}>
                            <span style={{
                                position: 'absolute',
                                left: '50%',
                                top: '-10px',
                                transform: 'translateX(-50%)',
                                background: 'white',
                                padding: '0 10px',
                                fontSize: '10px',
                                color: '#64748b'
                            }}>
                                Page Break
                            </span>
                        </div>
                    );
                default:
                    return <div className="element-content">{element.name}</div>;
            }
        }

        // Handle textbox - always editable
        if (element.type === 'textbox') {
            return (
                <textarea
                    value={element.value || ''}
                    onChange={(e) => handleElementValueChange(element.id, e.target.value)}
                    className="field-input textbox-input"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        border: 'none',
                        padding: '8px',
                        fontFamily: 'inherit',
                        fontSize: '14px',
                        outline: 'none',
                        background: 'transparent'
                    }}
                />
            );
        }

        // Handle table - always editable
        if (element.type === 'table' && element.value && element.value.data) {
            return (
                <div style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'auto',
                    pointerEvents: 'auto'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '12px'
                    }}>
                        <tbody>
                            {element.value.data.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={{
                                                border: '1px solid #cbd5e1',
                                                padding: '6px',
                                                minWidth: '60px'
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={cell}
                                                data-row={rowIndex}
                                                data-col={colIndex}
                                                data-element-id={element.id}
                                                onChange={(e) => {
                                                    const newData = element.value.data.map((r, ri) =>
                                                        ri === rowIndex
                                                            ? r.map((c, ci) => ci === colIndex ? e.target.value : c)
                                                            : r
                                                    );
                                                    handleElementValueChange(element.id, {
                                                        ...element.value,
                                                        data: newData
                                                    });
                                                }}
                                                onKeyDown={(e) => {
                                                    const maxRow = element.value.data.length - 1;
                                                    const maxCol = element.value.data[0].length - 1;
                                                    let targetRow = rowIndex;
                                                    let targetCol = colIndex;

                                                    if (e.key === 'ArrowRight' && colIndex < maxCol) {
                                                        targetCol = colIndex + 1;
                                                        e.preventDefault();
                                                    } else if (e.key === 'ArrowLeft' && colIndex > 0) {
                                                        targetCol = colIndex - 1;
                                                        e.preventDefault();
                                                    } else if (e.key === 'ArrowDown' && rowIndex < maxRow) {
                                                        targetRow = rowIndex + 1;
                                                        e.preventDefault();
                                                    } else if (e.key === 'ArrowUp' && rowIndex > 0) {
                                                        targetRow = rowIndex - 1;
                                                        e.preventDefault();
                                                    } else if (e.key === 'Tab') {
                                                        e.preventDefault();
                                                        if (e.shiftKey) {
                                                            // Tab backwards
                                                            if (colIndex > 0) {
                                                                targetCol = colIndex - 1;
                                                            } else if (rowIndex > 0) {
                                                                targetRow = rowIndex - 1;
                                                                targetCol = maxCol;
                                                            }
                                                        } else {
                                                            // Tab forwards
                                                            if (colIndex < maxCol) {
                                                                targetCol = colIndex + 1;
                                                            } else if (rowIndex < maxRow) {
                                                                targetRow = rowIndex + 1;
                                                                targetCol = 0;
                                                            }
                                                        }
                                                    }

                                                    if (targetRow !== rowIndex || targetCol !== colIndex) {
                                                        const targetInput = document.querySelector(
                                                            `input[data-element-id="${element.id}"][data-row="${targetRow}"][data-col="${targetCol}"]`
                                                        );
                                                        if (targetInput) {
                                                            targetInput.focus();
                                                            targetInput.select();
                                                        }
                                                    }
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                style={{
                                                    width: '100%',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    outline: 'none',
                                                    fontSize: '12px',
                                                    padding: '2px'
                                                }}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
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
                                <button className="menu-dropdown-item" onClick={handleRename}>
                                    <Pencil size={16} />
                                    <span>Rename</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleNewDocument}>
                                    <FilePlus size={16} />
                                    <span>Create new</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleConvertToTemplate}>
                                    <FileText size={16} />
                                    <span>Convert to Template</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleMakeCopy}>
                                    <Copy size={16} />
                                    <span>Make a copy</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleWorkflowSetup}>
                                    <Settings size={16} />
                                    <span>Workflow setup</span>
                                    <span className="try-badge">Try it out</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleESignature}>
                                    <PenTool size={16} />
                                    <span>E-signature and verification</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleRecipients}>
                                    <Users size={16} />
                                    <span>Recipients</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleDocumentSettings}>
                                    <FileText size={16} />
                                    <span>Document</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleRename}>
                                    <Pencil size={16} />
                                    <span>Rename</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleMove}>
                                    <FolderOpen size={16} />
                                    <span>Move</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleArchive}>
                                    <Trash2 size={16} />
                                    <span>Archive</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={() => handleDownload('pdf')}>
                                    <Download size={16} />
                                    <span>Download</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handlePrint}>
                                    <Printer size={16} />
                                    <span>Print</span>
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
                                <button className="menu-dropdown-item" onClick={handleUndo} disabled={historyIndex <= 0}>
                                    <Undo size={16} />
                                    <span>Undo</span>
                                    <kbd>Ctrl+Z</kbd>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
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
                                <button className="menu-dropdown-item" onClick={handleInsertDocument}>
                                    <FileText size={16} />
                                    <span>Insert document</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleInsertCoverPage}>
                                    <FileText size={16} />
                                    <span>Cover page</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertBlankPage}>
                                    <FileText size={16} />
                                    <span>Blank page</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertAttachment}>
                                    <Link2 size={16} />
                                    <span>Attachment</span>
                                    <span className="try-badge">Try it out</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleAddFrom}>
                                    <Plus size={16} />
                                    <span>Add from</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleFillableFields}>
                                    <PenTool size={16} />
                                    <span>Fillable fields</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <div className="menu-divider"></div>
                                <div className="menu-section-label">CONTENT</div>
                                <button className="menu-dropdown-item" onClick={handleInsertTextBox}>
                                    <Type size={16} />
                                    <span>Text</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertImage}>
                                    <ImageIcon size={16} />
                                    <span>Image</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertVideo}>
                                    <Play size={16} />
                                    <span>Video</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertTable}>
                                    <Table size={16} />
                                    <span>Table</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertPricingTable}>
                                    <CreditCard size={16} />
                                    <span>Pricing table</span>
                                    <span className="try-badge">Try it out</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertQuoteBuilder}>
                                    <Building size={16} />
                                    <span>Quote builder</span>
                                    <span className="try-badge">Try it out</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleInsertTOC}>
                                    <List size={16} />
                                    <span>Table of contents</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleInsertPageBreak}>
                                    <Scissors size={16} />
                                    <span>Page break</span>
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
                                <button className="menu-dropdown-item" onClick={handleAllVariables}>
                                    <Database size={16} />
                                    <span>All variables</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleContentLibrary}>
                                    <FileText size={16} />
                                    <span>Content library</span>
                                    <span className="try-badge">Try it out</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handlePagesPreview}>
                                    <FileText size={16} />
                                    <span>Pages preview</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleResolvedComments}>
                                    <MessageSquare size={16} />
                                    <span>Resolved comments/suggestions</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleReviewData}>
                                    <Database size={16} />
                                    <span>Review data</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleFullScreenPreview}>
                                    <Maximize2 size={16} />
                                    <span>Full screen preview</span>
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
                                <button className="menu-dropdown-item" onClick={handleStyleMenu}>
                                    <Type size={16} />
                                    <span>Style</span>
                                    <span className="menu-value">Normal text</span>
                                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleFontMenu}>
                                    <Type size={16} />
                                    <span>Font</span>
                                    <span className="menu-value">Arial</span>
                                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleTextSizeMenu}>
                                    <Type size={16} />
                                    <span>Text size</span>
                                    <span className="menu-value">16</span>
                                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleFormattingMenu}>
                                    <Bold size={16} />
                                    <span>Formatting</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleAlignTextMenu}>
                                    <AlignLeft size={16} />
                                    <span>Align text</span>
                                    <span className="menu-value">Align left</span>
                                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleBulletsMenu}>
                                    <List size={16} />
                                    <span>Bullets and numbering</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleIndentMenu}>
                                    <AlignLeft size={16} />
                                    <span>Indent</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleLineSpacingMenu}>
                                    <AlignJustify size={16} />
                                    <span>Line spacing</span>
                                    <span className="menu-value">1.25</span>
                                    <ChevronDown size={14} style={{ opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleBorderStyles}>
                                    <Square size={16} />
                                    <span>Border styles</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleInsertLinkFormat}>
                                    <Link size={16} />
                                    <span>Insert link</span>
                                </button>
                                <button className="menu-dropdown-item" onClick={handleClearFormatting}>
                                    <X size={16} />
                                    <span>Clear formatting</span>
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-dropdown-item" onClick={handleTheme}>
                                    <Palette size={16} />
                                    <span>Theme</span>
                                    <ChevronDown size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                                </button>
                                <button className="menu-dropdown-item" onClick={handleLayoutSetup}>
                                    <Settings size={16} />
                                    <span>Layout setup</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="navbar-actions">
                    <button className="action-btn trial" onClick={handleUpgrade}>
                        <span>Start free trial</span>
                    </button>

                    <button
                        className="action-btn secondary"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <Users size={16} />
                        <span>Invite</span>
                    </button>

                    <button
                        className="action-btn primary"
                        onClick={() => setShowReviewModal(true)}
                    >
                        <Send size={16} />
                        <span>Review and send</span>
                    </button>

                    <button className="action-btn icon-only" onClick={() => alert('Help center')}>
                        <HelpCircle size={20} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="editor-main">
                {/* Left Toolbar */}
                <aside className="left-toolbar">
                    <button
                        className="toolbar-btn"
                        title="Undo"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        style={{ opacity: historyIndex <= 0 ? 0.5 : 1, cursor: historyIndex <= 0 ? 'not-allowed' : 'pointer' }}
                    >
                        <Undo size={20} />
                    </button>
                    <button
                        className="toolbar-btn"
                        title="Redo"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                        style={{ opacity: historyIndex >= history.length - 1 ? 0.5 : 1, cursor: historyIndex >= history.length - 1 ? 'not-allowed' : 'pointer' }}
                    >
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
                    <button className="toolbar-btn" title="Text" onClick={handleInsertTextBox}>
                        <Type size={20} />
                    </button>
                    <button className="toolbar-btn" title="Image" onClick={handleInsertImage}>
                        <ImageIcon size={20} />
                    </button>
                    <button className="toolbar-btn" title="Shape" onClick={() => {
                        const newElement = {
                            id: Date.now(),
                            type: 'shape',
                            name: 'Shape',
                            x: 100,
                            y: 100,
                            width: 100,
                            height: 100,
                            page: currentPage,
                            value: 'rectangle',
                            completed: false
                        };
                        setElements([...elements, newElement]);
                    }}>
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
                                                            {element.type === 'dropdown' && (
                                                                <button
                                                                    className="edit-element-btn"
                                                                    onClick={() => handleEditOptions(element)}
                                                                    title="Edit Options"
                                                                    style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        width: '28px',
                                                                        height: '28px',
                                                                        borderRadius: '4px',
                                                                        border: 'none',
                                                                        background: '#f8fafc',
                                                                        color: '#64748b',
                                                                        cursor: 'pointer',
                                                                        marginRight: '8px',
                                                                        transition: 'all 0.2s'
                                                                    }}
                                                                >
                                                                    <Settings size={14} />
                                                                </button>
                                                            )}
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
                            <h2>{currentSignatureElement?.type === 'initials' ? 'Initials' : 'Signature'}</h2>
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
                                            placeholder={currentSignatureElement?.type === 'initials' ? "Enter your initials" : "Enter your full name"}
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
                                                className={`tab-btn ${selectedFont === font.name ? 'active' : ''}`}
                                                style={{
                                                    borderBottom: selectedFont === font.name ? '3px solid #16a34a' : 'none',
                                                    padding: '10px 20px',
                                                    fontFamily: font.name,
                                                    fontSize: '20px',
                                                    color: selectedFont === font.name ? '#111827' : '#64748b'
                                                }}
                                                onClick={() => setSelectedFont(font.name)}
                                            >
                                                {typedName || (currentSignatureElement?.type === 'initials' ? 'JD' : 'John Doe')}
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

                        <div className="signature-tab-content" style={{ paddingTop: 0 }}>
                            <p className="disclaimer-text">
                                By electronically signing this document, I agree that my signature and initials are the equivalent of my handwritten signature and are considered originals on all documents, including legally binding contracts. I also agree to the <a href="#">Master Services Agreement</a> and <a href="#">Privacy Policy</a>.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={handleSignatureCancel}>
                                Cancel
                            </button>
                            <button
                                className="btn-accept"
                                onClick={handleSignatureSave}
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
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                </div>

                                <label className="invite-label">Access level</label>
                                <div className="role-options">
                                    <div className="role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            id="viewer"
                                            checked={inviteAccessLevel === 'viewer'}
                                            onChange={() => setInviteAccessLevel('viewer')}
                                        />
                                        <label htmlFor="viewer">
                                            <Eye size={16} />
                                            <div>
                                                <strong>Viewer</strong>
                                                <span>Can view only</span>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            id="commenter"
                                            checked={inviteAccessLevel === 'commenter'}
                                            onChange={() => setInviteAccessLevel('commenter')}
                                        />
                                        <label htmlFor="commenter">
                                            <MessageSquare size={16} />
                                            <div>
                                                <strong>Commenter</strong>
                                                <span>Can view and comment</span>
                                            </div>
                                        </label>
                                    </div>
                                    <div className="role-option">
                                        <input
                                            type="radio"
                                            name="role"
                                            id="editor"
                                            checked={inviteAccessLevel === 'editor'}
                                            onChange={() => setInviteAccessLevel('editor')}
                                        />
                                        <label htmlFor="editor">
                                            <Edit3 size={16} />
                                            <div>
                                                <strong>Editor</strong>
                                                <span>Can view and edit</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <button
                                    className="invite-send-btn"
                                    onClick={async () => {
                                        if (!inviteEmail.trim()) {
                                            alert('Please enter at least one email address');
                                            return;
                                        }

                                        setIsSendingInvite(true);
                                        try {
                                            const response = await api.post(`/documents/${templateId}/send-invitation`, {
                                                recipientEmail: inviteEmail,
                                                accessLevel: inviteAccessLevel
                                            });

                                            alert(response.message || 'Invitation sent successfully!');
                                            setInviteEmail('');
                                            setInviteAccessLevel('viewer');
                                            setShowInviteModal(false);
                                        } catch (error) {
                                            console.error('Invitation failed:', error);
                                            alert(error.message || 'Failed to send invitation. Please try again.');
                                        } finally {
                                            setIsSendingInvite(false);
                                        }
                                    }}
                                    disabled={isSendingInvite}
                                >
                                    <Send size={18} />
                                    {isSendingInvite ? 'Sending...' : 'Send Invitation'}
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
                            <h2>Review and Send Document</h2>
                            <p>Preview your document and send to recipients</p>
                        </div>

                        <div className="review-modal-body">
                            {/* Send To Section */}
                            <div className="send-section">
                                <label className="send-label">
                                    <Mail size={16} />
                                    Send to
                                </label>
                                <div className="send-input-wrapper">
                                    <input
                                        type="email"
                                        placeholder="Enter recipient email addresses..."
                                        className="send-email-input"
                                    />
                                </div>

                                <label className="send-label" style={{ marginTop: '16px' }}>
                                    <MessageSquare size={16} />
                                    Message (optional)
                                </label>
                                <textarea
                                    placeholder="Add a personal message..."
                                    className="send-message-textarea"
                                    rows="3"
                                ></textarea>

                                <div className="send-actions">
                                    <button className="send-action-btn download" onClick={() => {
                                        handleExport('pdf');
                                        setShowReviewModal(false);
                                    }}>
                                        <Download size={18} />
                                        Download PDF
                                    </button>

                                    <button className="send-action-btn preview" onClick={() => {
                                        window.open(`/api/documents/${templateId}/preview`, '_blank');
                                    }}>
                                        <Eye size={18} />
                                        Preview
                                    </button>

                                    <button className="send-action-btn send-now" onClick={() => {
                                        alert('✅ Document sent successfully!');
                                        setShowReviewModal(false);
                                    }}>
                                        <Send size={18} />
                                        Send Now
                                    </button>
                                </div>
                            </div>

                            <div className="review-divider"></div>

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

                                <button className="review-action-card" onClick={() => alert('View version history')}>
                                    <div className="action-card-icon history">
                                        <History size={24} />
                                    </div>
                                    <h3>Version History</h3>
                                    <p>View previous versions</p>
                                </button>

                                <button className="review-action-card" onClick={() => alert('✅ Document approved!')}>
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

            {/* Insert Table Modal */}
            {showInsertTableModal && (
                <div className="modal-overlay" onClick={() => setShowInsertTableModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Insert Table</h2>
                            <button className="modal-close" onClick={() => setShowInsertTableModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Number of Rows
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={tableRows}
                                        onChange={(e) => setTableRows(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Number of Columns
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={tableColumns}
                                        onChange={(e) => setTableColumns(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const newElement = {
                                            id: Date.now(),
                                            type: 'table',
                                            name: 'Table',
                                            x: 100,
                                            y: 100,
                                            width: 400,
                                            height: tableRows * 40 + 40, // Header + rows
                                            page: currentPage,
                                            value: {
                                                rows: tableRows,
                                                columns: tableColumns,
                                                data: Array(tableRows).fill(null).map(() =>
                                                    Array(tableColumns).fill('')
                                                )
                                            },
                                            completed: false
                                        };
                                        setElements([...elements, newElement]);
                                        setShowInsertTableModal(false);
                                        setTableRows(3);
                                        setTableColumns(3);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Table size={16} />
                                    Insert Table
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Insert Video Modal */}
            {showInsertVideoModal && (
                <div className="modal-overlay" onClick={() => setShowInsertVideoModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Insert Video</h2>
                            <button className="modal-close" onClick={() => setShowInsertVideoModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                                        Video URL (YouTube, Vimeo, etc.)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        id="video-url-input"
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const videoUrl = document.getElementById('video-url-input').value;
                                        if (videoUrl) {
                                            const newElement = {
                                                id: Date.now(),
                                                type: 'video',
                                                name: 'Video',
                                                x: 100,
                                                y: 100,
                                                width: 400,
                                                height: 225,
                                                page: currentPage,
                                                value: videoUrl,
                                                completed: false
                                            };
                                            setElements([...elements, newElement]);
                                            setShowInsertVideoModal(false);
                                        } else {
                                            alert('Please enter a video URL');
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Play size={16} />
                                    Insert Video
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pricing Table Modal */}
            {showPricingTableModal && (
                <div className="modal-overlay" onClick={() => setShowPricingTableModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Insert Pricing Table</h2>
                            <button className="modal-close" onClick={() => setShowPricingTableModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '15px', color: '#64748b' }}>
                                    Create a professional pricing table with multiple tiers
                                </p>
                                <button
                                    onClick={() => {
                                        const newElement = {
                                            id: Date.now(),
                                            type: 'pricing-table',
                                            name: 'Pricing Table',
                                            x: 50,
                                            y: 100,
                                            width: 600,
                                            height: 400,
                                            page: currentPage,
                                            value: {
                                                plans: [
                                                    { name: 'Basic', price: '$9/mo', features: ['Feature 1', 'Feature 2', 'Feature 3'] },
                                                    { name: 'Pro', price: '$29/mo', features: ['All Basic', 'Feature 4', 'Feature 5'] },
                                                    { name: 'Enterprise', price: '$99/mo', features: ['All Pro', 'Feature 6', 'Priority Support'] }
                                                ]
                                            },
                                            completed: false
                                        };
                                        setElements([...elements, newElement]);
                                        setShowPricingTableModal(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <CreditCard size={16} />
                                    Insert Pricing Table
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quote Builder Modal */}
            {showQuoteBuilderModal && (
                <div className="modal-overlay" onClick={() => setShowQuoteBuilderModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Quote Builder</h2>
                            <button className="modal-close" onClick={() => setShowQuoteBuilderModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '15px', color: '#64748b' }}>
                                    Build a professional quote with line items and totals
                                </p>
                                <button
                                    onClick={() => {
                                        const newElement = {
                                            id: Date.now(),
                                            type: 'quote-builder',
                                            name: 'Quote',
                                            x: 50,
                                            y: 100,
                                            width: 600,
                                            height: 300,
                                            page: currentPage,
                                            value: {
                                                items: [
                                                    { description: 'Item 1', quantity: 1, rate: 100, amount: 100 },
                                                    { description: 'Item 2', quantity: 2, rate: 50, amount: 100 }
                                                ],
                                                subtotal: 200,
                                                tax: 20,
                                                total: 220
                                            },
                                            completed: false
                                        };
                                        setElements([...elements, newElement]);
                                        setShowQuoteBuilderModal(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <FileText size={16} />
                                    Insert Quote
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table of Contents Modal */}
            {showTOCModal && (
                <div className="modal-overlay" onClick={() => setShowTOCModal(false)}>
                    <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Table of Contents</h2>
                            <button className="modal-close" onClick={() => setShowTOCModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-content">
                            <div style={{ padding: '20px' }}>
                                <p style={{ marginBottom: '15px', color: '#64748b' }}>
                                    Automatically generate a table of contents from document headings
                                </p>
                                <button
                                    onClick={() => {
                                        const newElement = {
                                            id: Date.now(),
                                            type: 'toc',
                                            name: 'Table of Contents',
                                            x: 50,
                                            y: 100,
                                            width: 500,
                                            height: 200,
                                            page: currentPage,
                                            value: {
                                                sections: [
                                                    { title: 'Introduction', page: 1 },
                                                    { title: 'Main Content', page: 2 },
                                                    { title: 'Conclusion', page: 3 }
                                                ]
                                            },
                                            completed: false
                                        };
                                        setElements([...elements, newElement]);
                                        setShowTOCModal(false);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: '#F97316',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <List size={16} />
                                    Insert Table of Contents
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentTemplateEditor;
