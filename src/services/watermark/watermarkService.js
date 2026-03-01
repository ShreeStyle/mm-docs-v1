const { shouldAddWatermark } = require("../../config/plans");

/**
 * Generate watermark HTML/CSS for free plan users
 * @param {Object} user - User object
 * @returns {String} - Watermark HTML
 */
const generateWatermarkHTML = (user) => {
    if (!shouldAddWatermark(user)) {
        return "";
    }

    return `
    <style>
        @media print {
            .watermark-footer {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                width: 100%;
                text-align: center;
                padding: 8px 0;
                background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 100%);
                font-size: 10px;
                color: #9CA3AF;
                z-index: 9999;
                page-break-inside: avoid;
            }
            
            .watermark-footer a {
                color: #6366F1;
                text-decoration: none;
                font-weight: 600;
            }
            
            .watermark-badge {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 9px;
                font-weight: 600;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                margin-left: 8px;
            }
        }
        
        .watermark-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            width: 100%;
            text-align: center;
            padding: 12px 0;
            background: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 100%);
            font-size: 11px;
            color: #9CA3AF;
            z-index: 9999;
            border-top: 1px solid #E5E7EB;
        }
        
        .watermark-footer a {
            color: #6366F1;
            text-decoration: none;
            font-weight: 600;
        }
        
        .watermark-footer a:hover {
            color: #4F46E5;
            text-decoration: underline;
        }
        
        .watermark-badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-left: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .watermark-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }
    </style>
    <div class="watermark-footer">
        <div class="watermark-content">
            <span>Generated with</span>
            <a href="https://mmdocs.co" target="_blank">MM Docs</a>
            <span class="watermark-badge">Free Plan</span>
        </div>
        <div style="font-size: 9px; margin-top: 4px; color: #D1D5DB;">
            Upgrade to Pro to remove watermark
        </div>
    </div>
    `;
};

/**
 * Inject watermark into HTML before PDF generation
 * @param {String} html - Original HTML content
 * @param {Object} user - User object
 * @returns {String} - HTML with watermark if needed
 */
const injectWatermark = (html, user) => {
    if (!shouldAddWatermark(user)) {
        return html;
    }

    const watermarkHTML = generateWatermarkHTML(user);
    
    // Inject watermark before closing body tag
    if (html.includes('</body>')) {
        return html.replace('</body>', `${watermarkHTML}</body>`);
    }
    
    // If no body tag, append at the end
    return html + watermarkHTML;
};

/**
 * Generate watermark CSS for dynamic injection
 * @returns {String} - Watermark CSS
 */
const getWatermarkCSS = () => {
    return `
        body {
            padding-bottom: 60px !important;
        }
        
        @page {
            margin-bottom: 60px;
        }
    `;
};

module.exports = {
    generateWatermarkHTML,
    injectWatermark,
    getWatermarkCSS,
    shouldAddWatermark,
};
