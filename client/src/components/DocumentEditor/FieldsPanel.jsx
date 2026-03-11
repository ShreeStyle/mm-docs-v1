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

const FieldsPanel = ({ onFieldDragStart, onFieldClick }) => {
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
            label: 'Text Field',
            description: 'Single or multi-line text'
        },
        {
            type: 'date',
            icon: Calendar,
            label: 'Date',
            description: 'Date picker field'
        },
        {
            type: 'file-upload',
            icon: Upload,
            label: 'File Upload',
            description: 'Attachment field'
        },
        {
            type: 'radio',
            icon: Circle,
            label: 'Radio Buttons',
            description: 'Single choice'
        },
        {
            type: 'checkbox',
            icon: CheckSquare,
            label: 'Checkbox',
            description: 'Multiple choice'
        },
        {
            type: 'dropdown',
            icon: ChevronDown,
            label: 'Dropdown',
            description: 'Select menu'
        },
        {
            type: 'card-details',
            icon: CreditCard,
            label: 'Card Details',
            description: 'Payment information'
        },
        {
            type: 'stamp',
            icon: Stamp,
            label: 'Stamp',
            description: 'Approval/rejection'
        }
    ];

    const handleDragStart = (e, field) => {
        e.dataTransfer.setData('field', JSON.stringify(field));
        onFieldDragStart?.(field);
    };

    const handleFieldClick = (field) => {
        onFieldClick?.(field);
    };

    return (
        <div className="fields-panel">
            <div className="panel-header">
                <h3>Add Fillable Fields</h3>
            </div>

            <div className="fields-list">
                {fieldTypes.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div
                            key={field.type}
                            className="field-item"
                            draggable
                            onDragStart={(e) => handleDragStart(e, field)}
                            onClick={() => handleFieldClick(field)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="field-icon">
                                <Icon size={20} />
                            </div>
                            <div className="field-info">
                                <h4>{field.label}</h4>
                                <p>{field.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="panel-header" style={{ marginTop: '1rem' }}>
                <h3>More Actions</h3>
            </div>

            <div className="fields-list">
                <button className="action-item">
                    <span>Manage Recipients</span>
                </button>
                <button className="action-item">
                    <span>Review Steps</span>
                </button>
            </div>
        </div>
    );
};

export default FieldsPanel;
