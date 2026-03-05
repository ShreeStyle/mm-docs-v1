import React from 'react';
import { X } from 'lucide-react';
import '../../styles/DocumentEditor.css';

const RecipientInput = ({ recipient, role, onChange, onRemove, canRemove }) => {
    const roleColors = {
        CLIENT: 'orange',
        SENDER: 'purple',
        CUSTOM: 'blue'
    };

    return (
        <div className="recipient-input-container">
            <div className={`role-badge ${roleColors[role]}`}>
                {role}
            </div>
            <div className="recipient-fields">
                <input
                    type="text"
                    placeholder="Name"
                    value={recipient.name || ''}
                    onChange={(e) => onChange({ ...recipient, name: e.target.value })}
                    className="recipient-name-input"
                />
                <input
                    type="email"
                    placeholder="Email address"
                    value={recipient.email || ''}
                    onChange={(e) => onChange({ ...recipient, email: e.target.value })}
                    className="recipient-email-input"
                />
            </div>
            {canRemove && (
                <button 
                    onClick={onRemove} 
                    className="remove-recipient-btn"
                    aria-label="Remove recipient"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

export default RecipientInput;
