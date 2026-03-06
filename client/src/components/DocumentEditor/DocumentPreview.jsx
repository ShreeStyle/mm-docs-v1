import React, { useRef, useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';

const DocumentPreview = ({ document, fields, onFieldDrop, onFieldSelect }) => {
    const canvasRef = useRef(null);
    const [zoom, setZoom] = useState(100);
    const [currentPage, setCurrentPage] = useState(1);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 1100 });

    useEffect(() => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw white background (simulating paper)
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw sample content (we'll load actual PDF later)
            ctx.fillStyle= '#000000';
            ctx.font = '16px Arial';
            ctx.fillText('Document Preview - PDF will be rendered here', 50, 50);
            
            // Draw fields
            fields.forEach((field, index) => {
                if (field.page === currentPage) {
                    drawField(ctx, field, index);
                }
            });
        }
    }, [fields, currentPage, zoom, document]);

    const drawField = (ctx, field, index) => {
        const { position, size, fieldType, properties, value, completed } = field;
        
        // Field border
        ctx.strokeStyle = completed ? '#10b981' : (properties.assignedTo === 'CLIENT' ? '#F97316' : '#8B5CF6');
        ctx.lineWidth = 2;
        ctx.strokeRect(position.x, position.y, size.width, size.height);
        
        // Field background
        ctx.fillStyle = completed 
            ? 'rgba(16, 185, 129, 0.1)'
            : (properties.assignedTo === 'CLIENT' 
                ? 'rgba(249, 115, 22, 0.1)' 
                : 'rgba(139, 92, 246, 0.1)');
        ctx.fillRect(position.x, position.y, size.width, size.height);
        
        // If signature is completed, draw the signature
        if (completed && fieldType === 'signature' && value) {
            if (typeof value === 'string') {
                // Draw image signature
                const img = new Image();
                img.src = value;
                img.onload = () => {
                    ctx.drawImage(img, position.x + 5, position.y + 5, size.width - 10, size.height - 10);
                };
            } else if (typeof value === 'object' && value.type === 'text') {
                // Draw text signature
                ctx.save();
                ctx.fillStyle = value.color;
                ctx.font = `italic ${Math.min(size.height - 10, 24)}px ${value.font}`;
                ctx.fillText(value.text, position.x + 10, position.y + size.height - 15);
                ctx.restore();
            }
        } else {
            // Field label
            ctx.fillStyle = '#1e293b';
            ctx.font = '12px Arial';
            ctx.fillText(field.label, position.x + 5, position.y + 15);
        }
    };

    const handleCanvasDrop = (e) => {
        e.preventDefault();
        const fieldData = JSON.parse(e.dataTransfer.getData('field'));
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        onFieldDrop(fieldData, { x, y }, currentPage);
    };

    const handleCanvasDragOver = (e) => {
        e.preventDefault();
    };
    
    const handleCanvasClick = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Find which field was clicked
        const clickedField = fields.find(field => {
            if (field.page !== currentPage) return false;
            
            const { position, size } = field;
            return x >= position.x && 
                   x <= position.x + size.width && 
                   y >= position.y && 
                   y <= position.y + size.height;
        });
        
        if (clickedField) {
            onFieldSelect(clickedField);
        }
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
                <div 
                    className="canvas-container"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                >
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        onDrop={handleCanvasDrop}
                        onDragOver={handleCanvasDragOver}
                        onClick={handleCanvasClick}
                        style={{ display: 'block', cursor: 'crosshair' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentPreview;
