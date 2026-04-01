import React, { useRef } from 'react';
import { Trash2, PenTool, Upload, GripVertical } from 'lucide-react';

const BlockWrapper = ({ 
    block, 
    isSelected, 
    onSelect, 
    onAction,
    onUpdate, 
    onDelete, 
    children,
    zoom = 1,
    pageRef
}) => {
    const isDragging = useRef(false);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, blockX: 0, blockY: 0 });

    const handleMouseDown = (e) => {
        // Don't start drag on resize handles, buttons or delete btn
        const isInteractive = e.target.closest('.interactive-element') || 
                            e.target.closest('input') || 
                            e.target.closest('select') || 
                            e.target.closest('textarea');

        if (e.target.closest('.block-action-btn') || 
            e.target.closest('.block-delete-btn') ||
            e.target.closest('.resize-handle')) {
            return;
        }

        // If it's an interactive element AND the block is already selected, 
        // allow the event to pass through to the children
        if (isInteractive && isSelected) {
            return;
        }

        // Only prevent default if we're actually going to start a drag
        if (!isInteractive) {
            e.preventDefault();
        }
        
        e.stopPropagation();

        // Select the block on mouse down
        onSelect(block);

        isDragging.current = true;
        dragStart.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            blockX: block.x,
            blockY: block.y
        };

        const handleMouseMove = (moveEvent) => {
            if (!isDragging.current) return;

            // Divide by zoom because the page container is scaled
            const dx = (moveEvent.clientX - dragStart.current.mouseX) / zoom;
            const dy = (moveEvent.clientY - dragStart.current.mouseY) / zoom;

            let newX = dragStart.current.blockX + dx;
            let newY = dragStart.current.blockY + dy;

            // Clamp inside page boundaries if pageRef is available
            if (pageRef && pageRef.current) {
                const pageWidth = pageRef.current.offsetWidth;
                const pageHeight = pageRef.current.offsetHeight;
                newX = Math.max(0, Math.min(newX, pageWidth - block.width));
                newY = Math.max(0, Math.min(newY, pageHeight - block.height));
            }

            onUpdate(block.id, { x: newX, y: newY });
        };

        const handleMouseUp = (upEvent) => {
            if (!isDragging.current) return;
            isDragging.current = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleResizeMouseDown = (e, handle) => {
        e.stopPropagation();
        e.preventDefault();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = block.width;
        const startHeight = block.height;
        const startXPos = block.x;
        const startYPos = block.y;

        const handleMouseMove = (moveEvent) => {
            const deltaX = (moveEvent.clientX - startX) / zoom;
            const deltaY = (moveEvent.clientY - startY) / zoom;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startXPos;
            let newY = startYPos;

            if (handle.includes('e')) newWidth = Math.max(50, startWidth + deltaX);
            if (handle.includes('s')) newHeight = Math.max(30, startHeight + deltaY);
            if (handle.includes('w')) {
                const widthChange = Math.min(startWidth - 50, deltaX);
                newWidth = startWidth - widthChange;
                newX = startXPos + widthChange;
            }
            if (handle.includes('n')) {
                const heightChange = Math.min(startHeight - 30, deltaY);
                newHeight = startHeight - heightChange;
                newY = startYPos + heightChange;
            }

            onUpdate(block.id, { width: newWidth, height: newHeight, x: newX, y: newY });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        onAction(block);
    };

    const handleClick = (e) => {
        e.stopPropagation();
        onSelect(block);
    };

    return (
        <div
            className={`block-wrapper ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height,
                zIndex: isSelected ? 100 : (block.type === 'text' ? 0 : 1),
                border: isSelected 
                    ? '2px dashed #6366f1' 
                    : (['html', 'text'].includes(block.type) || (['signature', 'initials', 'date'].includes(block.type) && block.content) ? 'none' : '1px dashed #cbd5e1'),
                borderRadius: '4px',
                boxSizing: 'border-box',
                cursor: 'grab',
                userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onClick={handleClick}
        >
            {/* Selection UI — only shown when selected */}
            {isSelected && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 101 }}>
                    {/* Top action pill */}
                    <div style={{
                        position: 'absolute', top: -36, right: 0,
                        background: 'white', color: '#6366f1',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '4px 8px', borderRadius: '6px',
                        fontSize: '11px', fontWeight: 700, pointerEvents: 'auto',
                        border: '1px solid #e2e8f0'
                    }}>
                        <span 
                            className="drag-handle"
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 4, 
                                color: '#94a3b8', 
                                cursor: 'grab', 
                                padding: '0 4px',
                                pointerEvents: 'auto' // Crucial: Allow handle to receive clicks
                            }}
                        >
                            <GripVertical size={11} /> {block.type.toUpperCase()}
                        </span>

                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            {/* Sign / Upload action button */}
                            {(block.type === 'signature' || block.type === 'initials') && (
                                <button
                                    className="block-action-btn"
                                    style={{
                                        background: '#f8fafc', color: '#6366f1', border: '1px solid #e2e8f0',
                                        borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: '10px', fontWeight: 600, pointerEvents: 'auto'
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); onAction(block); }}
                                >
                                    <PenTool size={11} /> {block.content ? 'RE-SIGN' : 'SIGN'}
                                </button>
                            )}
                            {block.type === 'image' && (
                                <button
                                    className="block-action-btn"
                                    style={{
                                        background: '#f8fafc', color: '#6366f1', border: '1px solid #e2e8f0',
                                        borderRadius: '4px', padding: '4px 8px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 4,
                                        fontSize: '10px', fontWeight: 600, pointerEvents: 'auto'
                                    }}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); onAction(block); }}
                                >
                                    <Upload size={11} /> {block.content ? 'CHANGE' : 'UPLOAD'}
                                </button>
                            )}
                            <button
                                className="block-delete-btn"
                                style={{
                                    background: '#fef2f2', color: '#dc2626', border: 'none',
                                    borderRadius: '4px', padding: '4px 6px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    pointerEvents: 'auto'
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); onDelete(block.id); }}
                            >
                                <Trash2 size={13} />
                            </button>
                        </div>
                    </div>

                    {/* Corner + Edge Resize Handles */}
                    {[
                        { id: 'nw', style: { top: -5, left: -5, cursor: 'nw-resize' } },
                        { id: 'ne', style: { top: -5, right: -5, cursor: 'ne-resize' } },
                        { id: 'sw', style: { bottom: -5, left: -5, cursor: 'sw-resize' } },
                        { id: 'se', style: { bottom: -5, right: -5, cursor: 'se-resize' } },
                        { id: 'n',  style: { top: -5, left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
                        { id: 's',  style: { bottom: -5, left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
                        { id: 'e',  style: { top: '50%', right: -5, transform: 'translateY(-50%)', cursor: 'e-resize' } },
                        { id: 'w',  style: { top: '50%', left: -5, transform: 'translateY(-50%)', cursor: 'w-resize' } },
                    ].map(h => (
                        <div
                            key={h.id}
                            className={`resize-handle handle-${h.id}`}
                            onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, h.id); }}
                            style={{
                                position: 'absolute',
                                width: 10, height: 10,
                                background: 'white',
                                border: '2px solid #6366f1',
                                borderRadius: h.id.length > 1 ? '50%' : '2px',
                                zIndex: 102,
                                boxSizing: 'border-box',
                                pointerEvents: 'auto',
                                ...h.style
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Block Content — allow auto so text can be edited, 
                individual block types will override this if they need to be grabbable */}
            <div style={{ width: '100%', height: '100%', pointerEvents: 'auto', overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    );
};

export default BlockWrapper;
