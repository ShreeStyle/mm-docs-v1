import { Sparkles, Wand2, FileText } from 'lucide-react';

const AIGeneratorPage = () => {
    return (
        <div style={{ padding: '40px', minHeight: '100vh', background: '#F8F9FB' }}>
            <div style={{ 
                maxWidth: '900px', 
                margin: '0 auto',
                background: 'white',
                borderRadius: '16px',
                padding: '48px',
                textAlign: 'center',
                border: '1px solid #E5E7EB'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    <Sparkles size={40} color="white" />
                </div>
                <h1 style={{ 
                    fontSize: '32px', 
                    fontWeight: '700', 
                    color: '#111827',
                    margin: '0 0 16px 0'
                }}>
                    AI Document Generator
                </h1>
                <p style={{ 
                    fontSize: '16px', 
                    color: '#6B7280',
                    margin: '0 0 32px 0',
                    lineHeight: '1.6'
                }}>
                    Generate professional documents instantly using AI. Simply describe what you need, 
                    and our intelligent system will create a customized document for you.
                </p>
                
                <div style={{
                    background: '#F9FAFB',
                    borderRadius: '12px',
                    padding: '32px',
                    marginBottom: '32px',
                    textAlign: 'left'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginTop: 0 }}>
                        How it works:
                    </h3>
                    <ul style={{ color: '#6B7280', lineHeight: '2' }}>
                        <li>Enter a prompt describing your document needs</li>
                        <li>AI generates a professional document based on your requirements</li>
                        <li>Customize and edit the generated content</li>
                        <li>Save as a document or create a reusable template</li>
                    </ul>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button style={{
                        padding: '14px 28px',
                        background: '#F97316',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Wand2 size={20} />
                        Start Generating
                    </button>
                    <button style={{
                        padding: '14px 28px',
                        background: 'white',
                        color: '#374151',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <FileText size={20} />
                        View Examples
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIGeneratorPage;
