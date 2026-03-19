import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight, X, Loader2 } from 'lucide-react';

// Set up pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const DocumentPreview = ({ document, fields, onFieldDrop, onFieldSelect, onFieldUpdate, selectedFieldId, onFieldDelete }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 });
    const [pdf, setPdf] = useState(null);
    const [rendering, setRendering] = useState(false);

    // Load PDF
    useEffect(() => {
        const loadPdf = async () => {
            if (document?.documentContent?.originalPdf) {
                try {
                    const loadingTask = pdfjsLib.getDocument(document.documentContent.originalPdf);
                    const pdfDoc = await loadingTask.promise;
                    setPdf(pdfDoc);
                } catch (err) {
                    console.error('Error loading PDF:', err);
                }
            }
        };
        loadPdf();
    }, [document?.documentContent?.originalPdf]);

    // Render Page
    useEffect(() => {
        const renderPage = async () => {
            if (!pdf || !canvasRef.current || rendering) return;

            setRendering(true);
            try {
                const page = await pdf.getPage(currentPage);
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                
                // Set scale for high DPI displays
                const viewport = page.getViewport({ scale: 1.5 }); // Base scale
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                setCanvasSize({ width: viewport.width, height: viewport.height });

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                await page.render(renderContext).promise;
            } catch (err) {
                console.error('Error rendering page:', err);
            } finally {
                setRendering(false);
            }
        };

        renderPage();
    }, [pdf, currentPage, document]);

    const handleCanvasDrop = (e) => {
        e.preventDefault();
        const fieldData = JSON.parse(e.dataTransfer.getData('field'));
        const rect = containerRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        onFieldDrop(fieldData, { x, y }, currentPage);
    };

    const handleCanvasDragOver = (e) => {
        e.preventDefault();
    };

    const handleFieldMouseDown = (e, field) => {
        if (e.button !== 0) return; // Only left click
        e.stopPropagation();
        onFieldSelect(field);

        const rect = containerRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        setDragOffset({
            x: mouseX - field.position.x,
            y: mouseY - field.position.y
        });
        setIsDragging(true);
    };

    const handleResizeMouseDown = (e, field, handle) => {
        e.stopPropagation();
        e.preventDefault();
        onFieldSelect(field);

        const rect = containerRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        setIsResizing(true);
        setResizeHandle(handle);
        setResizeStart({
            x: mouseX,
            y: mouseY,
            width: field.size.width,
            height: field.size.height,
            elementX: field.position.x,
            elementY: field.position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging && !isResizing) return;

        const rect = containerRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const mouseX = (e.clientX - rect.left) / scale;
        const mouseY = (e.clientY - rect.top) / scale;

        const field = fields.find(f => (f.id === selectedFieldId || f._id === selectedFieldId));
        if (!field) return;

        if (isDragging) {
            const newX = Math.max(0, Math.min(canvasSize.width - field.size.width, mouseX - dragOffset.x));
            const newY = Math.max(0, Math.min(canvasSize.height - field.size.height, mouseY - dragOffset.y));

            onFieldUpdate(selectedFieldId, {
                position: { x: newX, y: newY }
            });
        } else if (isResizing) {
            const deltaX = mouseX - resizeStart.x;
            const deltaY = mouseY - resizeStart.y;

            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;
            let newX = resizeStart.elementX;
            let newY = resizeStart.elementY;

            const minSize = 30;

            switch (resizeHandle) {
                case 'se':
                    newWidth = Math.max(minSize, resizeStart.width + deltaX);
                    newHeight = Math.max(minSize, resizeStart.height + deltaY);
                    break;
                case 'sw':
                    newWidth = Math.max(minSize, resizeStart.width - deltaX);
                    newHeight = Math.max(minSize, resizeStart.height + deltaY);
                    newX = resizeStart.elementX + (resizeStart.width - newWidth);
                    break;
                case 'ne':
                    newWidth = Math.max(minSize, resizeStart.width + deltaX);
                    newHeight = Math.max(minSize, resizeStart.height - deltaY);
                    newY = resizeStart.elementY + (resizeStart.height - newHeight);
                    break;
                case 'nw':
                    newWidth = Math.max(minSize, resizeStart.width - deltaX);
                    newHeight = Math.max(minSize, resizeStart.height - deltaY);
                    newX = resizeStart.elementX + (resizeStart.width - newWidth);
                    newY = resizeStart.elementY + (resizeStart.height - newHeight);
                    break;
            }

            onFieldUpdate(selectedFieldId, {
                position: { x: newX, y: newY },
                size: { width: newWidth, height: newHeight }
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    useEffect(() => {
        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, selectedFieldId]);

    const renderFieldOverlay = (field) => {
        const isSelected = selectedFieldId === (field.id || field._id);
        const { position, size, completed, value, fieldType } = field;

        return (
            <div
                key={field.id || field._id}
                className={`canvas-element ${isSelected ? 'selected' : ''} ${completed ? 'completed' : ''} ${isDragging && isSelected ? 'dragging' : ''}`}
                style={{
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                    borderColor: completed ? '#10b981' : (field.properties?.assignedTo === 'CLIENT' ? '#F97316' : '#8B5CF6')
                }}
                onMouseDown={(e) => handleFieldMouseDown(e, field)}
                onClick={(e) => {
                    e.stopPropagation();
                    onFieldSelect(field);
                }}
            >
                <div className="element-label">{field.label}</div>

                {completed && (
                    <div className="field-content" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {(fieldType === 'signature' || fieldType === 'initials') && value && (
                            typeof value === 'string' ? (
                                <img src={value} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontFamily: value.font || 'Arial', color: value.color || '#000', fontStyle: 'italic', fontSize: '18px' }}>
                                    {value.text}
                                </span>
                            )
                        )}
                        {fieldType === 'text' && <span style={{ fontSize: '14px', color: '#000' }}>{value}</span>}
                        {fieldType === 'file-upload' && value && (
                            typeof value === 'string' && value.startsWith('data:image') ? (
                                <img src={value} alt="Upload" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: '12px', color: '#000' }}>📎 Attached</span>
                            )
                        )}
                        {fieldType === 'checkbox' && value && <span style={{ fontSize: '18px', fontWeight: 'bold' }}>✓</span>}
                        {fieldType === 'radio' && value && <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#000' }} />}
                        {fieldType === 'dropdown' && <span style={{ fontSize: '14px' }}>{value}</span>}
                        {fieldType === 'card-details' && value && (
                            <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                                **** {typeof value === 'string' ? value.slice(-4) : ''}
                            </span>
                        )}
                        {fieldType === 'stamp' && (
                            <div style={{
                                border: '2px solid #dc2626',
                                color: '#dc2626',
                                fontWeight: 'bold',
                                padding: '2px 8px',
                                textTransform: 'uppercase',
                                transform: 'rotate(-5deg)',
                                fontSize: '14px'
                            }}>
                                {value || 'APPROVED'}
                            </div>
                        )}
                    </div>
                )}

                {isSelected && !isDragging && (
                    <>
                        <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeMouseDown(e, field, 'nw')} />
                        <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeMouseDown(e, field, 'ne')} />
                        <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeMouseDown(e, field, 'sw')} />
                        <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeMouseDown(e, field, 'se')} />
                        <button 
                            className="field-delete-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFieldDelete(field.id || field._id);
                            }}
                        >
                            <X size={12} />
                        </button>
                    </>
                )}
            </div>
        );
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleFitWidth = () => setZoom(100);

    return (
        <div className="document-preview-panel">
            <div className="preview-toolbar">
                <div className="zoom-controls">
                    <button onClick={handleZoomOut} className="toolbar-btn" title="Zoom Out">
                        <ZoomOut size={18} />
                    </button>
                    <span className="zoom-level">{zoom}%</span>
                    <button onClick={handleZoomIn} className="toolbar-btn" title="Zoom In">
                        <ZoomIn size={18} />
                    </button>
                    <button onClick={handleFitWidth} className="toolbar-btn" title="Fit Width">
                        <Maximize2 size={18} />
                    </button>
                </div>

                <div className="page-controls">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="toolbar-btn"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="page-info">
                        Page {currentPage} of {document?.documentContent?.pages || 1}
                    </span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(document?.documentContent?.pages || 1, prev + 1))}
                        disabled={currentPage === (document?.documentContent?.pages || 1)}
                        className="toolbar-btn"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            <div className="preview-canvas">
                {rendering && (
                    <div className="rendering-overlay">
                        <Loader2 className="spinner" size={48} />
                        <p>Rendering page...</p>
                    </div>
                )}
                <div
                    ref={containerRef}
                    className="canvas-container"
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        width: canvasSize.width,
                        height: canvasSize.height
                    }}
                    onDrop={handleCanvasDrop}
                    onDragOver={handleCanvasDragOver}
                >
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        style={{ display: 'block', pointerEvents: 'none' }}
                    />
                    {fields.filter(f => f.page === currentPage).map(renderFieldOverlay)}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
