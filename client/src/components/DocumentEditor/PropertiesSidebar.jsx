import React from 'react';
import { 
    Type, 
    Maximize2, 
    Move, 
    Palette, 
    AlignLeft, 
    AlignCenter, 
    AlignRight, 
    Trash2,
    Bold,
    Italic
} from 'lucide-react';

const PropertiesSidebar = ({ block, onUpdate }) => {
    if (!block) return null;

    const handleStyleChange = (key, value) => {
        onUpdate(block.id, {
            style: {
                ...block.style,
                [key]: value
            }
        });
    };

    const handleDimensionChange = (key, value) => {
        onUpdate(block.id, {
            [key]: parseInt(value) || 0
        });
    };

    return (
        <div className="properties-sidebar">
            <div className="sidebar-header">
                <h3>Block Properties</h3>
                <span className="block-type-badge">{block.type}</span>
            </div>

            <div className="sidebar-content">
                {/* Content/Label Section */}
                {['text', 'heading', 'textfield', 'date', 'checkbox', 'radio', 'dropdown'].includes(block.type) && (
                    <div className="property-group">
                        <label className="property-label">
                            <Type size={14} />
                            {['checkbox', 'radio'].includes(block.type) ? 'Label' : 'Placeholder / Content'}
                        </label>
                        <textarea
                            className="property-textarea"
                            value={block.content || ''}
                            onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                            placeholder={['checkbox', 'radio'].includes(block.type) ? 'Enter label...' : 'Enter text content...'}
                        />
                    </div>
                )}

                {/* Typography Section */}
                {(block.type === 'text' || block.type === 'heading') && (
                    <div className="property-group">
                        <label className="property-label">
                            <Palette size={14} />
                            Typography
                        </label>
                        <div className="property-row">
                            <div className="property-field">
                                <span>Size</span>
                                <input
                                    type="number"
                                    className="property-inputSmall"
                                    value={parseInt(block.style?.fontSize) || 16}
                                    onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                                />
                            </div>
                            <div className="property-field">
                                <span>Color</span>
                                <input
                                    type="color"
                                    className="property-color"
                                    value={block.style?.color || '#000000'}
                                    onChange={(e) => handleStyleChange('color', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="alignment-tools">
                            <button 
                                className={`tool-icon-btn ${block.style?.textAlign === 'left' ? 'active' : ''}`}
                                onClick={() => handleStyleChange('textAlign', 'left')}
                            >
                                <AlignLeft size={16} />
                            </button>
                            <button 
                                className={`tool-icon-btn ${block.style?.textAlign === 'center' ? 'active' : ''}`}
                                onClick={() => handleStyleChange('textAlign', 'center')}
                            >
                                <AlignCenter size={16} />
                            </button>
                            <button 
                                className={`tool-icon-btn ${block.style?.textAlign === 'right' ? 'active' : ''}`}
                                onClick={() => handleStyleChange('textAlign', 'right')}
                            >
                                <AlignRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Dimensions Section */}
                <div className="property-group">
                    <label className="property-label">
                        <Maximize2 size={14} />
                        Dimensions
                    </label>
                    <div className="property-row">
                        <div className="property-field">
                            <span>Width</span>
                            <input
                                type="number"
                                className="property-input"
                                value={Math.round(block.width)}
                                onChange={(e) => handleDimensionChange('width', e.target.value)}
                            />
                        </div>
                        <div className="property-field">
                            <span>Height</span>
                            <input
                                type="number"
                                className="property-input"
                                value={Math.round(block.height)}
                                onChange={(e) => handleDimensionChange('height', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Position Section */}
                <div className="property-group">
                    <label className="property-label">
                        <Move size={14} />
                        Position
                    </label>
                    <div className="property-row">
                        <div className="property-field">
                            <span>X</span>
                            <input
                                type="number"
                                className="property-input"
                                value={Math.round(block.x)}
                                onChange={(e) => handleDimensionChange('x', e.target.value)}
                            />
                        </div>
                        <div className="property-field">
                            <span>Y</span>
                            <input
                                type="number"
                                className="property-input"
                                value={Math.round(block.y)}
                                onChange={(e) => handleDimensionChange('y', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="sidebar-footer">
                <p className="sidebar-hint">Properties are auto-saved</p>
            </div>
        </div>
    );
};

export default PropertiesSidebar;
