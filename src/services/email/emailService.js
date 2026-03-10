const nodemailer = require("nodemailer");

// Create email transporter
// Supports Gmail, custom SMTP, SendGrid, AWS SES, etc.
const createTransporter = () => {
    // Check if custom SMTP is configured
    if (process.env.SMTP_HOST) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER || process.env.EMAIL_USER,
                pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD,
            },
        });
    }
    
    // Fallback to Gmail service
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

// Send document via email
exports.sendDocumentEmail = async (recipientEmail, documentTitle, documentUrl, senderName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `${senderName} via Mediaa Masala Doc <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `${senderName} shared a document: ${documentTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📄 Document Shared</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p><strong>${senderName}</strong> has shared a document with you:</p>
                            <h2 style="color: #667eea;">${documentTitle}</h2>
                            <p>Click the button below to view the document:</p>
                            <a href="${documentUrl}" class="button">View Document</a>
                            <p style="color: #666; font-size: 14px;">Or copy this link: <br>${documentUrl}</p>
                        </div>
                        <div class="footer">
                            <p>Powered by MM Docs - Professional Document Generation</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ Email sending failed:", error);
        throw new Error("Failed to send email");
    }
};

// Send OTP email for two-step verification
exports.sendOTPEmail = async (recipientEmail, recipientName, otp) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `Mediaa Masala Doc <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: "Login Verification",
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6; 
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 40px auto; 
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #D97706 0%, #EA580C 100%);
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .header h1 {
                            color: white;
                            margin: 0;
                            font-size: 24px;
                            font-weight: 600;
                        }
                        .header .icon {
                            font-size: 48px;
                            margin-bottom: 10px;
                        }
                        .content { 
                            padding: 40px 30px;
                            background: white;
                        }
                        .greeting {
                            font-size: 16px;
                            color: #333;
                            margin-bottom: 20px;
                        }
                        .otp-box {
                            background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%);
                            border: 2px solid #D97706;
                            border-radius: 8px;
                            padding: 30px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-label {
                            font-size: 14px;
                            color: #666;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 10px;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: bold;
                            color: #FFFFFF;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                            margin: 10px 0;
                            background: #D97706;
                            padding: 15px 30px;
                            border-radius: 8px;
                            display: inline-block;
                        }
                        .warning {
                            background: #fff3cd;
                            border-left: 4px solid #ffc107;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .warning-text {
                            color: #856404;
                            font-size: 14px;
                            margin: 0;
                        }
                        .info-text {
                            color: #666;
                            font-size: 14px;
                            line-height: 1.8;
                        }
                        .footer {
                            background: #f9f9f9;
                            padding: 20px 30px;
                            text-align: center;
                            border-top: 1px solid #e0e0e0;
                        }
                        .footer-text {
                            color: #888;
                            font-size: 12px;
                            margin: 5px 0;
                        }
                        .security-tips {
                            background: #f0f4ff;
                            padding: 20px;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .security-tips h3 {
                            color: #667eea;
                            font-size: 14px;
                            margin-top: 0;
                        }
                        .security-tips ul {
                            margin: 10px 0;
                            padding-left: 20px;
                            color: #666;
                            font-size: 13px;
                        }
                        .security-tips li {
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="icon">🔐</div>
                            <h1>Login Verification Code</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Hello,</p>
                            <p class="info-text">
                                Your verification code for login is:
                            </p>
                            
                            <div class="otp-box">
                                <div class="otp-label">Your Verification Code</div>
                                <div class="otp-code">${otp}</div>
                            </div>

                            <div class="warning">
                                <p class="warning-text">
                                    <strong>This code will expire in 10 minutes.</strong>
                                </p>
                            </div>

                            <p class="info-text">
                                If you didn't request this code, please ignore this email.
                            </p>
                        </div>
                        <div class="footer">
                            <p class="footer-text">Mediaa Masala - Restaurant Management Platform</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ OTP email sent:", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ OTP email sending failed:", error);
        throw new Error("Failed to send OTP email");
    }
};

// Send test email
exports.sendTestEmail = async (recipientEmail) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: "MM Docs - Email Configuration Test",
            html: `
                <h1>✅ Email Configuration Successful!</h1>
                <p>Your MM Docs email service is working correctly.</p>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("Test email failed:", error);
        throw error;
    }
};

// Send invitation email for document collaboration
exports.sendInvitationEmail = async (recipientEmail, documentTitle, documentUrl, senderName, accessLevel) => {
    try {
        const transporter = createTransporter();

        const accessLevelText = {
            'viewer': 'view this document',
            'commenter': 'view and comment on this document',
            'editor': 'view and edit this document'
        };

        const accessIcon = {
            'viewer': '👁️',
            'commenter': '💬',
            'editor': '✏️'
        };

        const mailOptions = {
            from: `${senderName} via MM Docs <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: `${senderName} invited you to collaborate on: ${documentTitle}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                            line-height: 1.6; 
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background-color: #f8fafc;
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 40px auto; 
                            background: white;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                            padding: 40px 30px;
                            text-align: center;
                        }
                        .header h1 {
                            color: white;
                            margin: 0;
                            font-size: 24px;
                            font-weight: 600;
                        }
                        .header .icon {
                            font-size: 48px;
                            margin-bottom: 15px;
                        }
                        .content { 
                            padding: 40px 30px;
                            background: white;
                        }
                        .invitation-box {
                            background: #f8fafc;
                            border: 2px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 25px;
                            margin: 25px 0;
                        }
                        .document-title {
                            font-size: 20px;
                            font-weight: 600;
                            color: #16a34a;
                            margin: 10px 0;
                        }
                        .access-badge {
                            display: inline-block;
                            background: #16a34a;
                            color: white;
                            padding: 6px 14px;
                            border-radius: 20px;
                            font-size: 13px;
                            font-weight: 600;
                            margin: 10px 0;
                        }
                        .button { 
                            display: inline-block; 
                            background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                            color: white; 
                            padding: 14px 32px; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            margin: 20px 0;
                            font-weight: 600;
                            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
                        }
                        .button:hover {
                            background: linear-gradient(135deg, #15803d 0%, #166534 100%);
                        }
                        .info-text {
                            color: #64748b;
                            font-size: 14px;
                            margin: 15px 0;
                        }
                        .sender-info {
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            margin: 20px 0;
                        }
                        .sender-avatar {
                            width: 48px;
                            height: 48px;
                            background: linear-gradient(135deg, #16a34a, #15803d);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: bold;
                            font-size: 20px;
                        }
                        .sender-name {
                            font-weight: 600;
                            color: #1e293b;
                        }
                        .footer {
                            background: #f8fafc;
                            padding: 25px 30px;
                            text-align: center;
                            border-top: 1px solid #e2e8f0;
                        }
                        .footer-text {
                            color: #64748b;
                            font-size: 13px;
                            margin: 5px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <div class="icon">📄</div>
                            <h1>You've Been Invited!</h1>
                        </div>
                        <div class="content">
                            <div class="sender-info">
                                <div class="sender-avatar">${senderName.charAt(0).toUpperCase()}</div>
                                <div>
                                    <div class="sender-name">${senderName}</div>
                                    <div style="font-size: 13px; color: #64748b;">invited you to collaborate</div>
                                </div>
                            </div>

                            <div class="invitation-box">
                                <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px;">Document</p>
                                <div class="document-title">📄 ${documentTitle}</div>
                                <div class="access-badge">${accessIcon[accessLevel] || '👁️'} ${accessLevel.toUpperCase()} Access</div>
                                <p class="info-text">You have been granted permission to ${accessLevelText[accessLevel] || 'view this document'}.</p>
                            </div>

                            <center>
                                <a href="${documentUrl}" class="button">Open Document</a>
                            </center>

                            <p class="info-text" style="text-align: center; margin-top: 20px;">
                                Or copy and paste this link in your browser:<br>
                                <a href="${documentUrl}" style="color: #16a34a; word-break: break-all;">${documentUrl}</a>
                            </p>
                        </div>
                        <div class="footer">
                            <p class="footer-text">Powered by MM Docs - Professional Document Collaboration</p>
                            <p class="footer-text">© ${new Date().getFullYear()} MM Docs. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Invitation email sent:", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error("❌ Invitation email sending failed:", error);
        throw new Error("Failed to send invitation email");
    }
};
