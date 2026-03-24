import React from 'react';
import BlockWrapper from './BlockWrapper';

const Canvas = ({ 
    document, 
    selectedBlockId, 
    onSelectBlock, 
    onUpdateBlock, 
    onDeleteBlock, 
    zoom = 1 
}) => {
    if (!document || !document.pages) return null;

    return (
        <div className="canvas-viewport" style={{ width: '100%', height: '100%', overflow: 'auto', padding: '40px' }}>
            <div 
                className="document-pages-container" 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '40px' 
                }}
                onClick={() => onSelectBlock(null)}
            >
                {document.pages.map(page => (
                    <div 
                        key={page.id}
                        className="canvas-page"
                        style={{
                            width: page.width * zoom,
                            height: page.height * zoom,
                            background: 'white',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Render individual blocks */}
                        {page.blocks.map(block => (
                            <BlockWrapper
                                key={block.id}
                                block={block}
                                isSelected={selectedBlockId === block.id}
                                onSelect={onSelectBlock}
                                onUpdate={onUpdateBlock}
                                onDelete={onDeleteBlock}
                                zoom={zoom}
                            >
                                {renderBlockContent(block, onUpdateBlock)}
                            </BlockWrapper>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Map block types to specialized components
const renderBlockContent = (block, onUpdate) => {
    switch (block.type) {
        case 'text':
        case 'heading':
            return (
                <div 
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                        width: '100%',
                        height: '100%',
                        outline: 'none',
                        wordBreak: 'break-word',
                        ...block.style
                    }}
                    onBlur={(e) => {
                        onUpdate(block.id, { content: e.target.innerText });
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            // Logic for splitting blocks or adding new lines
                        }
                    }}
                >
                    {block.content || ''}
                </div>
            );
        case 'image':
            return (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {block.content ? (
                        <img 
                            src={block.content} 
                            alt="Block" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                    ) : (
                        <div className="image-placeholder">
                            <span>Image Placeholder</span>
                        </div>
                    )}
                </div>
            );
        case 'signature':
            return (
                <div className="signature-placeholder" style={{ 
                    border: '2px dashed #cbd5e1', 
                    width: '100%', 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b'
                }}>
                    {block.content ? (
                        <img src={block.content} alt="Signature" style={{ maxHeight: '100%' }} />
                    ) : (
                        <span>Sign Here</span>
                    )}
                </div>
            );
        default:
            return <div>Unknown block type</div>;
    }
};

export default Canvas;
