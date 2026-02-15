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
