import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Send, Loader2, Save } from 'lucide-react';
import { api } from '../utils/api';
import DocumentPreview from '../components/DocumentEditor/DocumentPreview';
import FieldsPanel from '../components/DocumentEditor/FieldsPanel';
import DrawingTools from '../components/DocumentEditor/DrawingTools';
import '../styles/DocumentEditor.css';

const DocumentEditor = () => {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState(null);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [selectedField, setSelectedField] = useState(null);
    const [activeTool, setActiveTool] = useState('pencil');
    const [activeColor, setActiveColor] = useState('#000000');

    useEffect(() => {
        fetchDocument();
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/documents/${documentId}`);
            if (response.success) {
                setDocument(response.data);
                setFields(response.data.fields || []);
            }
        } catch (err) {
            console.error('Error fetching document:', err);
            setError('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleFieldDrop = (fieldData, position, page) => {
        const newField = {
            fieldType: fieldData.type,
            label: fieldData.label,
            page,
            position,
            size: {
                width: 200,
                height: fieldData.type === 'signature' ? 60 : 40
            },
            properties: {
                required: false,
                assignedTo: 'CLIENT', // Default assignment
                defaultValue: '',
                validation: {}
            }
        };

        setFields(prev => [...prev, newField]);
        autoSave([...fields, newField]);
    };

    const handleFieldSelect = (field) => {
        setSelectedField(field);
    };

    const autoSave = async (updatedFields) => {
        try {
            await api.put(`/documents/${documentId}/fields`, { fields: updatedFields });
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put(`/documents/${documentId}`, {
                fields,
                status: 'draft'
            });
            alert('Document saved successfully!');
        } catch (err) {
            console.error('Error saving document:', err);
            setError('Failed to save document');
        } finally {
            setSaving(false);
        }
    };

    const handleSend = async () => {
        try {
            setSaving(true);
            await api.post(`/documents/${documentId}/send`, {
                fields
            });
            alert('Document sent successfully!');
            navigate('/dashboard/documents');
        } catch (err) {
            console.error('Error sending document:', err);
            setError('Failed to send document');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="editor-loading">
                <Loader2 className="spinner" size={48} />
                <p>Loading document editor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="editor-error">
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="document-editor">
            {/* Header */}
            <div className="editor-header">
                <h1 className="editor-title">{document?.title || 'Untitled Document'}</h1>
                <div className="editor-actions">
                    <button className="btn-secondary" onClick={handleSave} disabled={saving}>
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button className="btn-secondary">
                        <Eye size={16} />
                        Preview
                    </button>
                    <button className="btn-primary" onClick={handleSend}>
                        <Send size={16} />
                        Review and Send
                    </button>
                </div>
            </div>

            {/* Main Editor Layout */}
            <div className="editor-main">
                {/* Document Preview (Left) */}
                <DocumentPreview
                    document={document}
                    fields={fields}
                    onFieldDrop={handleFieldDrop}
                    onFieldSelect={handleFieldSelect}
                />

                {/* Fields Panel (Right) */}
                <div className="right-sidebar">
                    <FieldsPanel
                        onFieldDragStart={(field) => console.log('Dragging field:', field)}
                    />
                    <DrawingTools
                        onToolSelect={setActiveTool}
                        activeTool={activeTool}
                        onColorChange={setActiveColor}
                        activeColor={activeColor}
                    />
                </div>
            </div>
        </div>
    );
};

export default DocumentEditor;
