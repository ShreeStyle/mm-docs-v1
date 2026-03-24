import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, GripVertical } from 'lucide-react';

const BlockWrapper = ({ 
    block, 
    isSelected, 
    onSelect, 
    onUpdate, 
    onDelete, 
    children,
    zoom = 1 
}) => {
    const wrapperRef = useRef(null);

    const handleDragEnd = (event, info) => {
        const { x, y } = info.point;
        // Logic to calculate delta and update block position
        // For simplicity, we'll use motion's layout but we need to sync with state
        onUpdate(block.id, {
            x: block.x + info.offset.x / zoom,
            y: block.y + info.offset.y / zoom
        });
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

            if (handle.includes('e')) newWidth = Math.max(20, startWidth + deltaX);
            if (handle.includes('s')) newHeight = Math.max(20, startHeight + deltaY);
            if (handle.includes('w')) {
                const widthChange = Math.min(startWidth - 20, deltaX);
                newWidth = startWidth - widthChange;
                newX = startXPos + widthChange;
            }
            if (handle.includes('n')) {
                const heightChange = Math.min(startHeight - 20, deltaY);
                newHeight = startHeight - heightChange;
                newY = startYPos + heightChange;
            }

            onUpdate(block.id, {
                width: newWidth,
                height: newHeight,
                x: newX,
                y: newY
            });
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <motion.div
            className={`block-wrapper ${isSelected ? 'selected' : ''}`}
            style={{
                position: 'absolute',
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height,
                zIndex: isSelected ? 100 : 1,
            }}
            initial={false}
            drag={isSelected}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            onClick={(e) => {
                e.stopPropagation();
                onSelect(block.id);
            }}
        >
            {/* Selection UI */}
            {isSelected && (
                <>
                    <div className="drag-handle">
                        <GripVertical size={14} />
                    </div>
                    <button className="block-delete-btn" onClick={(e) => {
                        e.stopPropagation();
                        onDelete(block.id);
                    }}>
                        <X size={12} />
                    </button>
                    
                    {/* Resize Handles */}
                    {['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map(handle => (
                        <div 
                            key={handle}
                            className={`resize-handle handle-${handle}`}
                            onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                        />
                    ))}
                </>
            )}

            <div className="block-content-container" style={{ width: '100%', height: '100%' }}>
                {children}
            </div>
        </motion.div>
    );
};

export default BlockWrapper;
