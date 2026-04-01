import React, { useRef } from 'react';
import { 
    PenTool, 
    Upload, 
    Calendar, 
    CheckSquare, 
    Circle, 
    ChevronDown, 
    Stamp, 
    CreditCard 
} from 'lucide-react';
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
                        padding: block.id === 'gen-block-main' ? '0' : '4px 6px',
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

        case 'date':
            return (
                <div 
                    className="interactive-element"
                    style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', 
                        padding: '0 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                        background: '#f8fafc', color: '#1e293b', fontSize: '13px', gap: '10px',
                        cursor: 'pointer', pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        // Trigger a native date picker
                        const input = e.currentTarget.querySelector('input');
                        if (input) input.showPicker ? input.showPicker() : input.focus();
                    }}
                >
                    <Calendar size={14} color="#6366f1" />
                    <span>{block.value || block.content || 'Select Date'}</span>
                    <input 
                        type="date" 
                        style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                        onChange={(e) => onUpdateBlock(block.id, { value: e.target.value })}
                    />
                </div>
            );

        case 'checkbox':
        case 'radio':
            const isChecked = !!block.value;
            return (
                <div 
                    className="interactive-element"
                    style={{
                        width: '100%', height: '100%', display: 'flex', alignItems: 'center', 
                        gap: '10px', padding: '0 8px', cursor: 'pointer', pointerEvents: 'auto'
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onUpdateBlock(block.id, { value: !isChecked });
                    }}
                >
                    <div style={{
                        width: '20px', height: '20px', 
                        border: '2px solid #6366f1', 
                        borderRadius: block.type === 'radio' ? '50%' : '4px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isChecked ? '#6366f1' : 'white',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        {isChecked && (
                            block.type === 'checkbox' 
                                ? <CheckSquare size={14} color="white" /> 
                                : <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }} />
                        )}
                    </div>
                    <span style={{ fontSize: '13.5px', color: '#1e293b', fontWeight: 500 }}>{block.content || 'Option'}</span>
                </div>
            );

        case 'dropdown':
            return (
                <div 
                    className="interactive-element"
                    style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'auto' }}>
                    <select
                        className="interactive-element"
                        style={{
                            width: '100%', height: '100%', padding: '0 12px', border: '1px solid #cbd5e1',
                            borderRadius: '6px', background: 'white', color: '#1e293b', fontSize: '13px',
                            appearance: 'none', cursor: 'pointer', outline: 'none'
                        }}
                        value={block.value || ''}
                        onChange={(e) => onUpdateBlock(block.id, { value: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="" disabled>Select option...</option>
                        <option value="option1">Option 1</option>
                        <option value="option2">Option 2</option>
                        <option value="option3">Option 3</option>
                    </select>
                    <ChevronDown 
                        size={14} 
                        color="#64748b" 
                        style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} 
                    />
                </div>
            );

        case 'stamp':
            return (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', border: '2px dashed #94a3b8',
                    borderRadius: '50%', background: '#f1f5f9', color: '#64748b', opacity: 0.8
                }}>
                    <Stamp size={32} strokeWidth={1.5} />
                    <span style={{ fontSize: '10px', fontWeight: 700, marginTop: '4px' }}>STAMP HERE</span>
                </div>
            );

        case 'payment':
            return (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', alignItems: 'center', 
                    gap: '12px', padding: '0 16px', border: '1px solid #e2e8f0', 
                    borderRadius: '8px', background: '#f8fafc', color: '#1e293b'
                }}>
                    <CreditCard size={20} color="#6366f1" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Payment Field</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>Configure in properties</span>
                    </div>
                </div>
            );

        default:
            return <div style={{ padding: 8, color: '#64748b', fontSize: 12 }}>{block.type} block</div>;
    }
};

export default Canvas;
