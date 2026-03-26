import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    ArrowLeft, Loader2, Plus, Trash2, Save, Printer, CheckCircle, AlertCircle
} from 'lucide-react';
import Handlebars from 'handlebars';
import { api, API_BASE_URL } from '../utils/api';

// --- Constants & Helpers ---

const initialRow = {
    gstin: '',
    customerName: '',
    placeOfSupply: { code: '', name: '' },
    invoiceDetails: { no: '', date: '', value: 0 },
    totalTaxPct: 0,
    taxableValue: 0,
    taxAmount: { central: 0, state: 0, integrated: 0, cess: 0 },
    totalTax: 0
};

// Professional Fallback Template
const DEFAULT_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Outfit', sans-serif;
            color: #2D3748;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            background: #fff;
            font-size: 9px;
        }

        .page-container {
            padding: 40px;
        }

        .main-header {
            background: linear-gradient(135deg, #1A202C 0%, #2D3748 100%);
            color: white;
            padding: 30px 40px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header-content h1 {
            font-size: 28px;
            margin: 0;
            letter-spacing: 2px;
            font-weight: 700;
            color: #F6AD55;
        }

        .header-content p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }

        .company-info {
            text-align: right;
        }

        .company-info h2 {
            font-size: 18px;
            margin: 0;
            color: #fff;
        }

        .company-info p {
            margin: 2px 0;
            font-size: 11px;
            color: #CBD5E0;
        }

        .summary-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin: -15px 40px 30px 40px;
            position: relative;
            z-index: 10;
        }

        .summary-card {
            background: white;
            border: 1px solid #E2E8F0;
            padding: 12px;
            border-radius: 12px;
            border-top: 4px solid #ED8936;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .summary-card .label {
            font-size: 7px;
            color: #718096;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .summary-card .value {
            font-size: 13px;
            font-weight: 700;
            color: #1A202C;
        }

        .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #2D3748;
            margin: 10px 0 15px 0;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #E2E8F0;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            margin-bottom: 30px;
            table-layout: fixed;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            overflow: hidden;
        }

        th {
            background-color: #F8FAFC;
            color: #4A5568;
            font-weight: 700;
            font-size: 8px;
            text-transform: uppercase;
            padding: 12px 10px;
            border-bottom: 2px solid #E2E8F0;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #EDF2F7;
            color: #4A5568;
            font-size: 9px;
            vertical-align: middle;
        }

        tr:last-child td { border-bottom: none; }
        tr:nth-child(even) { background-color: #FBFDFF; }

        .text-right { text-align: right; }
        .font-bold { font-weight: 700; }
        .text-orange { color: #DD6B20; }

        .footer {
            margin-top: 50px;
            padding: 40px;
            border-top: 1px solid #E2E8F0;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .footer-logo {
            font-weight: 800;
            font-size: 14px;
            color: #CBD5E0;
            letter-spacing: 1px;
        }
    </style>
</head>
<body>
    <div class="main-header">
        <div class="header-content">
            <h1>GSTR-1</h1>
            <p>Filing Period: <strong>{{dateRange}}</strong></p>
        </div>
        <div class="company-info">
            <h2>{{companyName}}</h2>
            <p>GSTIN: {{gstNo}} | Mob: {{mobile}}</p>
        </div>
    </div>

    <div class="summary-ribbon">
        <div class="summary-card">
            <div class="label">Taxable Turnover</div>
            <div class="value">₹{{numberFormat summary.totalTaxableValue}}</div>
        </div>
        <div class="summary-card" style="border-top-color: #4299E1;">
            <div class="label">Tax Credit (Returns)</div>
            <div class="value">₹{{numberFormat summary.returnTax}}</div>
        </div>
        <div class="summary-card" style="border-top-color: #48BB78;">
            <div class="label">Central/State Tax</div>
            <div class="value">₹{{numberFormat (add summary.totalCGST summary.totalSGST)}}</div>
        </div>
        <div class="summary-card" style="border-top-color: #F6AD55;">
            <div class="label">Net GST Payable / Refund</div>
            <div class="value" style="color: #DD6B20;">₹{{numberFormat summary.netPayable}}</div>
        </div>
    </div>

    <div class="page-container">
        <div class="section-title">Details of Outward Supplies</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 20%; text-align: left;">GSTIN</th>
                    <th style="width: 25%; text-align: left;">Customer</th>
                    <th style="width: 15%; text-align: left;">Inv #</th>
                    <th style="width: 12%; text-align: left;">Date</th>
                    <th style="width: 13%; text-align: right;">Taxable</th>
                    <th style="width: 15%; text-align: right;">GST Amount</th>
                </tr>
            </thead>
            <tbody>
                {{#each sales}}
                <tr>
                    <td class="font-bold">{{gstin}}</td>
                    <td>{{customerName}}</td>
                    <td>{{invoiceDetails.no}}</td>
                    <td>{{invoiceDetails.date}}</td>
                    <td class="text-right">₹{{numberFormat taxableValue}}</td>
                    <td class="text-right font-bold text-orange">₹{{numberFormat totalTax}}</td>
                </tr>
                {{/each}}
                {{#unless sales}}
                <tr><td colspan="6" style="text-align: center; padding: 40px; color: #A0AEC0;">No sales data found</td></tr>
                {{/unless}}
            </tbody>
        </table>

        {{#if salesReturn.length}}
        <div class="section-title">Sales Returns (Credit Notes)</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 20%; text-align: left;">GSTIN</th>
                    <th style="width: 25%; text-align: left;">Customer</th>
                    <th style="width: 15%; text-align: left;">Note #</th>
                    <th style="width: 12%; text-align: left;">Date</th>
                    <th style="width: 13%; text-align: right;">Value</th>
                    <th style="width: 15%; text-align: right;">Tax Credit</th>
                </tr>
            </thead>
            <tbody>
                {{#each salesReturn}}
                <tr>
                    <td class="font-bold">{{gstin}}</td>
                    <td>{{customerName}}</td>
                    <td>{{invoiceDetails.no}}</td>
                    <td>{{invoiceDetails.date}}</td>
                    <td class="text-right">₹{{numberFormat taxableValue}}</td>
                    <td class="text-right font-bold" style="color: #4299E1;">₹{{numberFormat totalTax}}</td>
                </tr>
                {{/each}}
            </tbody>
        </table>
        {{/if}}
    </div>

    <div class="footer">
        <div class="footer-left">
            <p class="font-bold">{{authorizedSignatory.name}}</p>
            <p>{{authorizedSignatory.designation}}</p>
            <p style="font-size: 8px; margin-top: 4px;">System Generated Statement | {{generatedDate}}</p>
        </div>
        <div class="footer-logo">MM-DOCS</div>
    </div>
</body>
</html>
`;

// Register Helpers once
if (!Handlebars.helpers.numberFormat) {
    Handlebars.registerHelper("numberFormat", function(value) {
        const num = parseFloat(value);
        if (isNaN(num) || !isFinite(num)) return "0.00";
        return num.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    });
}

if (!Handlebars.helpers.add) {
    Handlebars.registerHelper("add", function(a, b) {
        const valA = parseFloat(a) || 0;
        const valB = parseFloat(b) || 0;
        return valA + valB;
    });
}

// --- Sub-components ---

const TableSection = ({ title, tableKey, rows, onRowChange, onAdd, onRemove }) => (
    <div style={{ marginBottom: '32px', backgroundColor: '#F9FAFB', padding: '24px', borderRadius: '12px', border: '1px solid #F3F4F6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{title}</h3>
            <button 
                onClick={() => onAdd(tableKey)}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', 
                    padding: '8px 16px', backgroundColor: '#F97316', 
                    color: 'white', border: 'none', borderRadius: '8px',
                    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(249, 115, 22, 0.2)'
                }}
            >
                <Plus size={16} /> Add Entry
            </button>
        </div>
        <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '120px' }}>GSTIN</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '150px' }}>Customer</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '80px' }}>Inv No</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '80px' }}>Date</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '70px' }}>Taxable</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '60px' }}>CGST</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '60px' }}>SGST</th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', color: '#4B5563', width: '60px' }}>IGST</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', color: '#4B5563', width: '40px' }}>✕</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '8px' }}>
                                <input value={row.gstin} onChange={(e) => onRowChange(tableKey, index, 'gstin', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} placeholder="27XXXX..." />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input value={row.customerName} onChange={(e) => onRowChange(tableKey, index, 'customerName', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} placeholder="Company Ltd" />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input value={row.invoiceDetails?.no} onChange={(e) => onRowChange(tableKey, index, 'invoiceDetails', e.target.value, 'no')} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} placeholder="INV-01" />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input value={row.invoiceDetails?.date} onChange={(e) => onRowChange(tableKey, index, 'invoiceDetails', e.target.value, 'date')} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} placeholder="DD-MMM" />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input type="number" value={row.taxableValue} onChange={(e) => onRowChange(tableKey, index, 'taxableValue', e.target.value)} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input type="number" value={row.taxAmount?.central} onChange={(e) => onRowChange(tableKey, index, 'taxAmount', e.target.value, 'central')} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input type="number" value={row.taxAmount?.state} onChange={(e) => onRowChange(tableKey, index, 'taxAmount', e.target.value, 'state')} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                                <input type="number" value={row.taxAmount?.integrated} onChange={(e) => onRowChange(tableKey, index, 'taxAmount', e.target.value, 'integrated')} style={{ width: '100%', padding: '6px', border: '1px solid #D1D5DB', borderRadius: '4px' }} />
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                                <button onClick={() => onRemove(tableKey, index)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr><td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF', fontStyle: 'italic' }}>No rows added yet</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

// --- Main Page Component ---

const GSTFilingSummaryPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const iframeRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fetchingDoc, setFetchingDoc] = useState(!!id);
    const [message, setMessage] = useState(null);
    const [templateSource, setTemplateSource] = useState(DEFAULT_TEMPLATE);

    const [formData, setFormData] = useState({
        companyName: '',
        mobile: '',
        gstNo: '',
        dateRange: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
        sales: [
             { ...initialRow }
        ],
        salesReturn: [],
        purchaseReturn: [],
        summary: { totalTaxableValue: 0, totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0, totalTaxableValue: 0, returnTax: 0, netPayable: 0 },
        authorizedSignatory: { name: '', designation: '' }
    });

    // 1. Fetch real organization & brand kit data + template
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch Template
                const tRes = await api.get('/templates/gst-filing-summary-001');
                if (tRes?.success && tRes?.data?.content) {
                    setTemplateSource(tRes.data.content);
                }

                // Fetch Organization & Brand Kit for Autofill
                const [org, brand] = await Promise.all([
                    api.get('/organization'),
                    api.get('/brand-kit')
                ]);

                if (org) {
                    setFormData(prev => ({
                        ...prev,
                        companyName: org.name || brand?.brandName || '',
                        gstNo: org.tax?.gstin || '',
                        mobile: org.contact?.phone || '',
                        authorizedSignatory: {
                            name: org.signatory?.name || '',
                            designation: org.signatory?.designation || ''
                        }
                    }));
                }

                // Fetch Document if ID exists (overwrites autofill)
                if (id) {
                    const dRes = await api.get(`/documents/${id}`);
                    if (dRes && dRes.content) {
                        setFormData(prev => ({
                            ...prev,
                            ...dRes.content,
                            sales: dRes.content.sales || [],
                            salesReturn: dRes.content.salesReturn || [],
                            purchaseReturn: dRes.content.purchaseReturn || []
                        }));
                    }
                }
            } catch (err) {
                console.error("Initialization failed:", err);
            } finally {
                setLoading(false);
                setFetchingDoc(false);
            }
        };
        init();
    }, [id]);

    // 2. Real-time Totals Calculation
    useEffect(() => {
        const calculate = () => {
            const allSales = formData.sales || [];
            const allReturns = formData.salesReturn || [];
            
            const sum = { 
                totalTaxableValue: 0, totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0,
                returnTax: 0, netPayable: 0 
            };
            
            allSales.forEach(row => {
                const taxable = parseFloat(row.taxableValue) || 0;
                const central = parseFloat(row.taxAmount?.central) || 0;
                const state = parseFloat(row.taxAmount?.state) || 0;
                const integrated = parseFloat(row.taxAmount?.integrated) || 0;
                const cess = parseFloat(row.taxAmount?.cess) || 0;
                
                // Use components if totalTax is missing or inconsistent
                const rowTotalTax = parseFloat(row.totalTax) || (central + state + integrated + cess);
                
                sum.totalTaxableValue += taxable;
                sum.totalCGST += central;
                sum.totalSGST += state;
                sum.totalIGST += integrated;
                sum.totalTax += rowTotalTax;
            });

            allReturns.forEach(row => {
                const central = parseFloat(row.taxAmount?.central) || 0;
                const state = parseFloat(row.taxAmount?.state) || 0;
                const integrated = parseFloat(row.taxAmount?.integrated) || 0;
                const cess = parseFloat(row.taxAmount?.cess) || 0;
                
                const rowTotalTax = parseFloat(row.totalTax) || (central + state + integrated + cess);
                sum.returnTax += rowTotalTax;
            });

            // Net Payable = Sales Tax - Returns
            sum.netPayable = sum.totalTax - sum.returnTax;

            // Use string comparison for stable update check
            const currentSummaryStr = JSON.stringify(formData.summary);
            const newSummaryStr = JSON.stringify(sum);
            
            if (currentSummaryStr !== newSummaryStr) {
                console.log("📊 Updating Summary Totals:", sum);
                setFormData(prev => ({ ...prev, summary: sum }));
            }
        };
        calculate();
    }, [formData.sales, formData.salesReturn]); // Removed formData.summary from dependencies to avoid infinite loop

    // 3. Live Preview Engine (using direct doc.write)
    useEffect(() => {
        const updatePreview = () => {
            if (!iframeRef.current) return;
            try {
                const template = Handlebars.compile(templateSource);
                const html = template(formData);
                const doc = iframeRef.current.contentDocument;
                if (doc) {
                    doc.open();
                    doc.write(html);
                    doc.close();
                }
            } catch (err) {
                console.error("Preview render failed:", err);
            }
        };
        
        // Use a small timeout to ensure state has settled
        const timer = setTimeout(updatePreview, 100);
        return () => clearTimeout(timer);
    }, [formData, templateSource]);

    // --- Event Handlers ---

    const handleBasicChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRowChange = (table, index, field, value, subfield = null) => {
        setFormData(prev => {
            const newTable = [...prev[table]];
            const newRow = JSON.parse(JSON.stringify(newTable[index]));
            
            if (subfield) {
                newRow[field] = { ...(newRow[field] || {}), [subfield]: value };
            } else {
                newRow[field] = value;
            }

            // Recalculate row total including CESS
            const c = Number(newRow.taxAmount?.central || 0);
            const s = Number(newRow.taxAmount?.state || 0);
            const i = Number(newRow.taxAmount?.integrated || 0);
            const cess = Number(newRow.taxAmount?.cess || 0);
            newRow.totalTax = c + s + i + cess;
            
            newTable[index] = newRow;
            return { ...prev, [table]: newTable };
        });
    };

    const addRow = (table) => {
        setFormData(prev => ({
            ...prev,
            [table]: [...prev[table], JSON.parse(JSON.stringify(initialRow))]
        }));
    };

    const removeRow = (table, index) => {
        setFormData(prev => {
            const newTable = [...prev[table]];
            newTable.splice(index, 1);
            return { ...prev, [table]: newTable };
        });
    };

    const handleAction = async (action) => {
        setSaving(true);
        setMessage({ type: 'info', text: action === 'save' ? 'Saving...' : 'Generating PDF...' });
        try {
            const payload = {
                title: `GST Summary - ${formData.companyName}`,
                type: 'gst_filing_summary',
                content: formData
            };
            
            let res;
            if (id) {
                res = await api.put(`/documents/${id}`, payload);
                if (!res && id) res = { _id: id }; // Fallback if put returns void
            } else {
                res = await api.post('/documents', payload);
            }
            
            if (action === 'download') {
                const downloadUrl = `${API_BASE_URL}/documents/${res._id}/download`;
                const response = await fetch(downloadUrl, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GST_Summary_${Date.now()}.pdf`;
                a.click();
            }
            
            setMessage({ type: 'success', text: 'Success!' });
            if (action === 'save') setTimeout(() => navigate('/documents'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
            <header style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate(-1)} style={{ padding: '10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: 0 }}>GST FILING SUMMARY</h1>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Smart tax calculation & professional report generation</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => handleAction('save')} disabled={saving} style={{ padding: '10px 20px', backgroundColor: 'white', border: '1px solid #D1D5DB', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> Save
                    </button>
                    <button onClick={() => handleAction('download')} disabled={saving} style={{ padding: '10px 24px', backgroundColor: '#F97316', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)' }}>
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />} Generate PDF
                    </button>
                </div>
            </header>

            <main style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(600px, 1fr) 500px', gap: '24px', flex: 1, overflow: 'hidden' }}>
                {/* Scrollable Form Area */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '32px', overflowY: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '12px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
                        <div style={{ backgroundColor: '#3B82F6', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold' }}>i</div>
                        <div>
                            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1E40AF' }}>How to build your summary:</h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#1E40AF', lineHeight: '1.5' }}>
                                1. Update your <strong>Company Information</strong> below.<br/>
                                2. Click <strong>+ Add Entry</strong> in the tables to list your Invoices or Returns.<br/>
                                3. The <strong>Live Preview</strong> will update automatically as you type!
                            </p>
                        </div>
                    </div>

                    <section style={{ marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                            <div style={{ width: '4px', height: '24px', backgroundColor: '#F97316', borderRadius: '2px' }}></div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>Step 1: Company Information</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}>Business Name</label>
                                <input name="companyName" value={formData.companyName} onChange={handleBasicChange} style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}>GSTIN Number</label>
                                <input name="gstNo" value={formData.gstNo} onChange={handleBasicChange} style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}>Filing Period</label>
                                <input name="dateRange" value={formData.dateRange} onChange={handleBasicChange} style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#4B5563', marginBottom: '6px' }}>Contact Mobile</label>
                                <input name="mobile" value={formData.mobile} onChange={handleBasicChange} style={{ width: '100%', padding: '12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '14px' }} />
                            </div>
                        </div>
                    </section>

                    <TableSection title="Step 2: Outward Supplies (Sales)" tableKey="sales" rows={formData.sales} onRowChange={handleRowChange} onAdd={addRow} onRemove={removeRow} />
                    <TableSection title="Step 3: Sales Returns (Credit Notes)" tableKey="salesReturn" rows={formData.salesReturn} onRowChange={handleRowChange} onAdd={addRow} onRemove={removeRow} />
                    <TableSection title="Step 4: Purchase Returns (Debit Notes)" tableKey="purchaseReturn" rows={formData.purchaseReturn} onRowChange={handleRowChange} onAdd={addRow} onRemove={removeRow} />

                    <section style={{ marginTop: '40px', padding: '32px', backgroundColor: '#111827', borderRadius: '16px', color: 'white' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>SUMMARY AUDIT</span>
                            <span style={{ color: '#F97316' }}>GSTR-1</span>
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>SALES TAX DUE</p>
                                <p style={{ fontSize: '20px', fontWeight: '800' }}>₹{Handlebars.helpers.numberFormat(formData.summary.totalTax)}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '8px' }}>TAX CREDIT (RETURNS)</p>
                                <p style={{ fontSize: '20px', fontWeight: '800', color: '#4299E1' }}>₹{Handlebars.helpers.numberFormat(formData.summary.returnTax)}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '12px', color: '#F97316', fontWeight: 'bold', marginBottom: '8px' }}>NET PAYABLE / REFUND</p>
                                <p style={{ fontSize: '28px', fontWeight: '800', color: '#F97316' }}>₹{Handlebars.helpers.numberFormat(formData.summary.netPayable)}</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Fixed Preview Area */}
                <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', position: 'sticky', top: '88px' }}>
                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }}></div>
                            LIVE PREVIEW
                        </h3>
                        <span style={{ fontSize: '10px', color: '#9CA3AF', backgroundColor: 'white', padding: '2px 8px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>A4 PAPER SIZE</span>
                    </div>
                    <div style={{ 
                        flex: 1, backgroundColor: '#374151', borderRadius: '16px', 
                        padding: '24px', display: 'flex', justifyContent: 'center', 
                        overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' 
                    }}>
                        <div style={{ 
                            width: '420px', height: '100%', backgroundColor: 'white', 
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            transform: 'scale(1)', transformOrigin: 'top center'
                        }}>
                            <iframe 
                                ref={iframeRef} 
                                title="Live Preview"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GSTFilingSummaryPage;
