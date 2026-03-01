const nodemailer = require("nodemailer");

// Create email transporter
// For production, use a service like SendGrid, AWS SES, or Gmail
const createTransporter = () => {
    // Using Gmail for demo (requires app password)
    // For production, use environment variables
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER || "your-email@gmail.com",
            pass: process.env.EMAIL_PASSWORD || "your-app-password",
        },
    });
};

// Send document via email
exports.sendDocumentEmail = async (recipientEmail, documentTitle, documentUrl, senderName) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `${senderName} via MM Docs <${process.env.EMAIL_USER}>`,
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
            from: `MM Docs Security <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: "Your MM Docs Login Verification Code",
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
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
                            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
                            border: 2px dashed #667eea;
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
                            color: #667eea;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                            margin: 10px 0;
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
                            <p class="greeting">Hi ${recipientName},</p>
                            <p class="info-text">
                                You requested to sign in to your MM Docs account. To complete the login process, 
                                please use the verification code below:
                            </p>
                            
                            <div class="otp-box">
                                <div class="otp-label">Your Verification Code</div>
                                <div class="otp-code">${otp}</div>
                            </div>

                            <div class="warning">
                                <p class="warning-text">
                                    ⏱️ <strong>This code will expire in 10 minutes.</strong> Enter it on the login page to continue.
                                </p>
                            </div>

                            <p class="info-text">
                                If you didn't request this code, please ignore this email or contact our support team 
                                if you have concerns about your account security.
                            </p>

                            <div class="security-tips">
                                <h3>🛡️ Security Tips:</h3>
                                <ul>
                                    <li>Never share this code with anyone</li>
                                    <li>MM Docs staff will never ask for your verification code</li>
                                    <li>Always verify the sender's email address</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p class="footer-text">This is an automated security message from MM Docs</p>
                            <p class="footer-text">© ${new Date().getFullYear()} MM Docs. All rights reserved.</p>
                            <p class="footer-text" style="margin-top: 10px;">
                                Professional Document Generation Platform
                            </p>
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
