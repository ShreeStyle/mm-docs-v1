import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, SkipForward, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import RecipientInput from '../components/DocumentEditor/RecipientInput';
import '../styles/DocumentEditor.css';

const DocumentRecipients = () => {
    const { templateId } = useParams();
    const navigate = useNavigate();
    const [documentName, setDocumentName] = useState('');
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    
    const [recipients, setRecipients] = useState({
        CLIENT: [{ name: '', email: '', role: 'CLIENT', order: 0 }],
        SENDER: [{ name: '', email: '', role: 'SENDER', order: 1 }]
    });

    useEffect(() => {
        fetchTemplate();
    }, [templateId]);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/templates/${templateId}`);
            if (response.success) {
                setTemplate(response.data);
                setDocumentName(response.data.name || 'Untitled Document');
            }
        } catch (err) {
            console.error('Error fetching template:', err);
            setError('Failed to load template');
        } finally {
            setLoading(false);
        }
    };

    const handleRecipientChange = (role, index, updatedRecipient) => {
        const newRecipients = { ...recipients };
        newRecipients[role][index] = updatedRecipient;
        setRecipients(newRecipients);
    };

    const handleAddRecipient = (role) => {
        const newRecipients = { ...recipients };
        const newOrder = newRecipients[role].length;
        newRecipients[role].push({ 
            name: '', 
            email: '', 
            role, 
            order: newOrder 
        });
        setRecipients(newRecipients);
    };

    const handleRemoveRecipient = (role, index) => {
        const newRecipients = { ...recipients };
        newRecipients[role].splice(index, 1);
        setRecipients(newRecipients);
    };

    const validateRecipients = () => {
        // Check if at least one recipient has both name and email
        const allRecipients = [...recipients.CLIENT, ...recipients.SENDER];
        const validRecipients = allRecipients.filter(r => r.name && r.email);
        
        if (validRecipients.length === 0) {
            return { valid: false, message: 'Please add at least one recipient with name and email' };
        }

        // Validate email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = validRecipients.filter(r => !emailRegex.test(r.email));
        
        if (invalidEmails.length > 0) {
            return { valid: false, message: 'Please enter valid email addresses' };
        }

        return { valid: true, recipients: validRecipients };
    };

    const handleContinue = async () => {
        const validation = validateRecipients();
        
        if (!validation.valid) {
            setError(validation.message);
            return;
        }

        try {
            setSaving(true);
            setError(null);

            // Create document with recipients
            const response = await api.post('/document-editor/create-from-template', {
                templateId,
                name: documentName,
                recipients: validation.recipients
            });

            if (response.success) {
                // Navigate to document editor
                navigate(`/document/editor/${response.data._id}`);
            }
        } catch (err) {
            console.error('Error creating document:', err);
            setError('Failed to create document. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        try {
            setSaving(true);
            const response = await api.post('/document-editor/create-from-template', {
                templateId,
                name: documentName,
                recipients: []
            });

            if (response.success) {
                navigate(`/document/editor/${response.data._id}`);
            }
        } catch (err) {
            console.error('Error creating document:', err);
            setError('Failed to create document. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="recipient-page-loading">
                <Loader2 className="spinner" size={48} />
                <p>Loading template...</p>
            </div>
        );
    }

    return (
        <div className="recipient-page">
            <div className="recipient-container">
                <div className="recipient-header">
                    <h1>Add Document Recipients</h1>
                    <p>This template includes roles, which help assign fields to recipients automatically.</p>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="document-name-section">
                    <label htmlFor="documentName">Document Name *</label>
                    <input
                        id="documentName"
                        type="text"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        placeholder="Enter document name"
                        className="document-name-input"
                    />
                </div>

                {/* CLIENT Recipients */}
                <div className="recipient-section">
                    <div className="recipient-section-header">
                        <h3>Add Recipient <span className="role-badge orange">CLIENT</span></h3>
                    </div>
                    {recipients.CLIENT.map((recipient, index) => (
                        <RecipientInput
                            key={`client-${index}`}
                            recipient={recipient}
                            role="CLIENT"
                            onChange={(updated) => handleRecipientChange('CLIENT', index, updated)}
                            onRemove={() => handleRemoveRecipient('CLIENT', index)}
                            canRemove={recipients.CLIENT.length > 1}
                        />
                    ))}
                    <button 
                        onClick={() => handleAddRecipient('CLIENT')}
                        className="add-recipient-btn"
                    >
                        <UserPlus size={16} />
                        Add another CLIENT
                    </button>
                </div>

                {/* SENDER Recipients */}
                <div className="recipient-section">
                    <div className="recipient-section-header">
                        <h3>Add Recipient <span className="role-badge purple">SENDER</span></h3>
                    </div>
                    {recipients.SENDER.map((recipient, index) => (
                        <RecipientInput
                            key={`sender-${index}`}
                            recipient={recipient}
                            role="SENDER"
                            onChange={(updated) => handleRecipientChange('SENDER', index, updated)}
                            onRemove={() => handleRemoveRecipient('SENDER', index)}
                            canRemove={recipients.SENDER.length > 1}
                        />
                    ))}
                    <button 
                        onClick={() => handleAddRecipient('SENDER')}
                        className="add-recipient-btn"
                    >
                        <UserPlus size={16} />
                        Add another SENDER
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="recipient-actions">
                    <button 
                        onClick={handleSkip}
                        className="btn-skip"
                        disabled={saving}
                    >
                        <SkipForward size={16} />
                        Skip
                    </button>
                    <button 
                        onClick={handleContinue}
                        className="btn-continue"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="spinner" size={16} />
                                Creating...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentRecipients;
