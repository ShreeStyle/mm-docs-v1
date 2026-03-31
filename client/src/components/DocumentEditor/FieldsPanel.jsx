import React from 'react';
import {
    PenTool,
    Type,
    Calendar,
    Upload,
    Circle,
    CheckSquare,
    ChevronDown,
    CreditCard,
    Stamp
} from 'lucide-react';

const FieldsPanel = ({ onAddBlock }) => {
    const fieldTypes = [
        {
            type: 'signature',
            icon: PenTool,
            label: 'Signature',
            description: 'Digital signature'
        },
        {
            type: 'initials',
            icon: Type,
            label: 'Initials',
            description: 'Initial capture'
        },
        {
            type: 'text',
            icon: Type,
            label: 'Text block',
            description: 'Add a new text block'
        },
        {
            type: 'image',
            icon: Upload,
            label: 'Image',
            description: 'Upload an image'
        },
        {
            type: 'textfield',
            icon: Type,
            label: 'Text Field',
            description: 'Fillable text area'
        }
    ];

    const handleDragStart = (e, field) => {
        e.dataTransfer.setData('text/plain', field.type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="fields-panel">
            <div className="panel-header">
                <h3>Add Elements</h3>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>Click or drag to add to document</p>
            </div>

            <div className="fields-list" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fieldTypes.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div
                            key={field.type}
                            className="field-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, field)}
                            onClick={() => onAddBlock(field.type)}
                            style={{ 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.backgroundColor = '#f5f7ff';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.backgroundColor = 'white';
                            }}
                        >
                            <div className="field-icon" style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6366f1'
                            }}>
                                <Icon size={18} />
                            </div>
                            <div className="field-info">
                                <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{field.label}</h4>
                                <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{field.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FieldsPanel;
