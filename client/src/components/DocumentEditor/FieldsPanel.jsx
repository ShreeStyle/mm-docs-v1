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
    const [isExpanded, setIsExpanded] = React.useState(false);

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
            type: 'date',
            icon: Calendar,
            label: 'Date',
            description: 'Calendar date'
        },
        {
            type: 'text',
            icon: Type,
            label: 'Text block',
            description: 'Add a new text block'
        },
        {
            type: 'textfield',
            icon: Type,
            label: 'Text Field',
            description: 'Fillable text area'
        },
        {
            type: 'checkbox',
            icon: CheckSquare,
            label: 'Checkbox',
            description: 'Multi-select'
        },
        {
            type: 'radio',
            icon: Circle,
            label: 'Radio',
            description: 'Single-select'
        },
        {
            type: 'dropdown',
            icon: ChevronDown,
            label: 'Dropdown',
            description: 'Selection list'
        },
        {
            type: 'stamp',
            icon: Stamp,
            label: 'Stamp',
            description: 'Official stamp'
        },
        {
            type: 'image',
            icon: Upload,
            label: 'Image',
            description: 'Upload an image'
        },
        {
            type: 'payment',
            icon: CreditCard,
            label: 'Payment',
            description: 'Payment link'
        }
    ];

    const handleDragStart = (e, field) => {
        e.dataTransfer.setData('text/plain', field.type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const visibleFields = isExpanded ? fieldTypes : fieldTypes.slice(0, 4);

    return (
        <div className="fields-panel">
            <div className="panel-header">
                <h3>Add Elements</h3>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Click or drag to add to document</p>
            </div>

            <div className="fields-list" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {visibleFields.map((field) => {
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
                                gap: '10px',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                background: 'white',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = '#6366f1';
                                e.currentTarget.style.backgroundColor = '#f5f7ff';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#e2e8f0';
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div className="field-icon" style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#6366f1'
                            }}>
                                <Icon size={16} />
                            </div>
                            <div className="field-info">
                                <h4 style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', margin: 0 }}>{field.label}</h4>
                                <p style={{ fontSize: '10px', color: '#64748b', margin: '1px 0 0' }}>{field.description}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Toggle Button */}
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{
                        marginTop: '4px',
                        padding: '10px',
                        width: '100%',
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        color: '#6366f1',
                        fontSize: '12px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                >
                    {isExpanded ? (
                        <>Show Less <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} /></>
                    ) : (
                        <>More Elements <ChevronDown size={14} /></>
                    )}
                </button>
            </div>
        </div>
    );
};

export default FieldsPanel;
