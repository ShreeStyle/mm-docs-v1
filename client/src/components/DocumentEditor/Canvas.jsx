import React, { useRef } from 'react';
import { PenTool, Upload } from 'lucide-react';
import BlockWrapper from './BlockWrapper';
import { getApiUrl } from '../../config/api';

const PageCanvas = ({
    page,
    selectedBlockId,
    onSelectBlock,
    onBlockAction,
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock,
    zoom
}) => {
    const pageRef = useRef(null);

    return (
        <div
            ref={pageRef}
            className="canvas-page"
            style={{
                width: page.width,
                height: page.height,
                background: 'white',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0
            }}
            onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            }}
            onClick={(e) => e.stopPropagation()}
            onDrop={(e) => {
                e.preventDefault();
                const type = e.dataTransfer.getData('text/plain');
                if (type && pageRef.current) {
                    const rect = pageRef.current.getBoundingClientRect();
                    // Divide by zoom because the container is CSS-scaled
                    const x = (e.clientX - rect.left) / zoom;
                    const y = (e.clientY - rect.top) / zoom;
                    onAddBlock(type, x, y, page.id);
                }
            }}
        >
            {(page.blocks || []).map(block => (
                <BlockWrapper
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={onSelectBlock}
                    onAction={onBlockAction}
                    onUpdate={onUpdateBlock}
                    onDelete={onDeleteBlock}
                    zoom={zoom}
                    pageRef={pageRef}
                >
                    {renderBlockContent(block, onUpdateBlock)}
                </BlockWrapper>
            ))}
        </div>
    );
};

const Canvas = ({
    document,
    selectedBlockId,
    onSelectBlock,
    onBlockAction,
    onUpdateBlock,
    onDeleteBlock,
    onAddBlock,
    zoom = 1
}) => {
    if (!document || !document.pages) return null;

    return (
        <div
            className="canvas-viewport"
            style={{ width: '100%', height: '100%', overflow: 'auto', background: '#e8eaed' }}
            onClick={() => onSelectBlock(null)}
        >
            <div
                className="document-pages-container"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '40px',
                    padding: '40px',
                    // True zoom using transform — all coordinates inside remain unscaled
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top center',
                    // Make sure the container is large enough for the scaled content
                    minHeight: '100%'
                }}
            >
                {document.pages.map(page => (
                    <PageCanvas
                        key={page.id}
                        page={page}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={onSelectBlock}
                        onBlockAction={onBlockAction}
                        onUpdateBlock={onUpdateBlock}
                        onDeleteBlock={onDeleteBlock}
                        onAddBlock={onAddBlock}
                        zoom={zoom}
                    />
                ))}
            </div>
        </div>
    );
};

// Renders the visual content of each block type
const renderBlockContent = (block, onUpdate) => {
    switch (block.type) {
        case 'html':
            // Check if it's a raw HTML string (like an SVG) or a URL
            const isRawHtml = block.content?.trim().startsWith('<');
            return isRawHtml ? (
                <div 
                    style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            ) : (
                <iframe
                    title="Document Preview"
                    src={getApiUrl(block.content)}
                    style={{ width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                    scrolling="no"
                />
            );

        case 'text':
        case 'textfield':
        case 'html':
            return (
                <div
                    className={block.className || ''} 
                    contentEditable
                    suppressContentEditableWarning
                    style={{
                        width: '100%',
                        height: '100%',
                        outline: 'none',
                        wordBreak: 'break-word',
                        padding: '4px 6px',
                        userSelect: 'text',
                        pointerEvents: 'auto',
                        ...block.style
                    }}
                    onMouseDown={(e) => e.stopPropagation()} // let text select, not drag
                    onBlur={(e) => {
                        const newContent = e.target.innerHTML;
                        if (newContent !== block.content) {
                            onUpdate(block.id, { content: newContent });
                        }
                    }}
                    dangerouslySetInnerHTML={{ __html: block.content || '' }}
                />
            );

        case 'image':
            return (
                <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
                    {block.content ? (
                        <img
                            src={block.content}
                            alt="Block"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <div style={{
                            width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', background: '#f8fafc',
                            border: '2px dashed #cbd5e1', borderRadius: '4px', color: '#64748b'
                        }}>
                            <Upload size={24} style={{ marginBottom: 8 }} />
                            <span style={{ fontSize: 12 }}>Click UPLOAD above</span>
                        </div>
                    )}
                </div>
            );

        case 'signature':
        case 'initials':
            return (
                <div style={{
                    border: block.content ? 'none' : '2px dashed #a5b4fc',
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#6366f1', background: block.content ? 'transparent' : '#f5f3ff',
                    borderRadius: '4px',
                    pointerEvents: 'none'
                }}>
                    {block.content ? (
                        typeof block.content === 'string' ? (
                            <img src={block.content} alt="Signature" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{
                                fontFamily: block.content.font || 'cursive',
                                color: block.content.color || '#000',
                                fontSize: '28px', textAlign: 'center'
                            }}>
                                {block.content.text}
                            </div>
                        )
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                            <PenTool size={20} />
                            <span style={{ fontSize: 11, fontWeight: 600 }}>Click SIGN above</span>
                        </div>
                    )}
                </div>
            );

        default:
            return <div style={{ padding: 8, color: '#64748b', fontSize: 12 }}>{block.type} block</div>;
    }
};

export default Canvas;
