import React, { useState } from 'react';
import { 
    Edit3, 
    Minus, 
    Square, 
    Circle, 
    ArrowRight, 
    Type, 
    Palette, 
    Eraser, 
    Undo, 
    Redo, 
    Trash2 
} from 'lucide-react';

const DrawingTools = ({ onToolSelect, activeTool, onColorChange, activeColor }) => {
    const [showColorPicker, setShowColorPicker] = useState(false);

    const tools = [
        { id: 'pencil', icon: Edit3, label: 'Pencil', type: 'draw' },
        { id: 'highlighter', icon: Minus, label: 'Highlighter', type: 'draw' },
        { id: 'text', icon: Type, label: 'Text Box', type: 'draw' },
        { id: 'line', icon: Minus, label: 'Line', type: 'shape' },
        { id: 'rectangle', icon: Square, label: 'Rectangle', type: 'shape' },
        { id: 'circle', icon: Circle, label: 'Circle', type: 'shape' },
        { id: 'arrow', icon: ArrowRight, label: 'Arrow', type: 'shape' },
        { id: 'eraser', icon: Eraser, label: 'Eraser', type: 'edit' }
    ];

    const colors = [
        '#000000', // Black
        '#FF0000', // Red
        '#0000FF', // Blue
        '#00FF00', // Green
        '#FFFF00', // Yellow
        '#FF6B00', // Orange
        '#800080', // Purple
        '#00FFFF', // Cyan
        '#FF1493', // Pink
        '#8B4513'  // Brown
    ];

    const handleToolClick = (toolId) => {
        onToolSelect(toolId);
    };

    const handleColorClick = (color) => {
        onColorChange(color);
        setShowColorPicker(false);
    };

    return (
        <div className="drawing-tools-container">
            <div className="tools-section">
                <h4 className="tools-title">Drawing Tools</h4>
                
                <div className="tools-grid">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <button
                                key={tool.id}
                                className={`tool-btn ${activeTool === tool.id ? 'active' : ''}`}
                                onClick={() => handleToolClick(tool.id)}
                                title={tool.label}
                            >
                                <Icon size={18} />
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="tools-section">
                <h4 className="tools-title">Colors</h4>
                <div className="color-picker-container">
                    <button
                        className="current-color-btn"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        style={{ backgroundColor: activeColor }}
                        title="Choose color"
                    >
                        <Palette size={18} style={{ color: activeColor === '#000000' ? '#fff' : '#000' }} />
                    </button>
                    
                    {showColorPicker && (
                        <div className="color-palette">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    className={`color-option ${activeColor === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => handleColorClick(color)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="tools-section">
                <h4 className="tools-title">Actions</h4>
                <div className="action-buttons">
                    <button className="action-btn" title="Undo">
                        <Undo size={18} />
                    </button>
                    <button className="action-btn" title="Redo">
                        <Redo size={18} />
                    </button>
                    <button className="action-btn danger" title="Delete">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DrawingTools;
