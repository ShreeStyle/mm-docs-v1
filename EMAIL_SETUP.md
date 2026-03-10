# Email Setup Guide for MM Docs

This guide will help you configure email functionality for sending document invitations and notifications in MM Docs.

## 📧 Features That Use Email

- **Document Invitations**: Invite team members to collaborate on documents with viewer, commenter, or editor access
- **Share Notifications**: Send document links via email
- **Future**: Password reset, notifications, etc.

## 🚀 Quick Setup (Gmail - Recommended for Testing)

### Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/security
2. Click on "2-Step Verification" under "Signing in to Google"
3. Follow the steps to enable 2FA if not already enabled

### Step 2: Generate App Password

1. Go to Google App Passwords: https://myaccount.google.com/apppasswords
2. Select "Mail" for the app, and "Other (Custom name)" for the device
3. Enter "MM Docs" as the custom name
4. Click "Generate"
5. Copy the 16-character password (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your email credentials:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxxxxxxxxxx  # Your 16-character app password (no spaces)
   EMAIL_FROM=MM Docs <your-email@gmail.com>
   ```

### Step 4: Restart Your Server

```bash
npm run dev
```

### Step 5: Test Email Functionality

1. Open any document in the editor
2. Click the "Invite" button in the top toolbar
3. Enter an email address
4. Select access level (Viewer, Commenter, or Editor)
5. Click "Send Invitation"
6. Check that the email was received

## 🔧 Alternative: Custom SMTP Setup

If you prefer to use a custom SMTP server (like SendGrid, AWS SES, or your own mail server):

```env
# Uncomment and configure these in .env
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
EMAIL_FROM=MM Docs <noreply@yourdomain.com>
```

### Common SMTP Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
EMAIL_USER=your_aws_smtp_username
EMAIL_PASSWORD=your_aws_smtp_password
```

#### Outlook/Office365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your_password
```

## 🐛 Troubleshooting

### "Invalid login" or "Authentication failed"
- ✅ Make sure you're using an App Password, not your regular Gmail password
- ✅ Remove any spaces from the app password
- ✅ Verify 2FA is enabled on your Google account

### Emails not being received
- ✅ Check spam/junk folder
- ✅ Verify EMAIL_USER is correct
- ✅ Check server console logs for error messages
- ✅ Try the test email endpoint: `POST /api/email/test` with `{"email": "test@example.com"}`

### "Connection timeout"
- ✅ Check your internet connection
- ✅ Verify firewall isn't blocking port 587
- ✅ Try using SMTP_PORT=465 with SMTP_SECURE=true

### "Rate limit exceeded"
- ✅ Gmail has a sending limit of ~500 emails/day for regular accounts
- ✅ Consider using SendGrid or AWS SES for production

## 🔒 Security Best Practices

1. **Never commit your .env file** - It's already in `.gitignore`
2. **Use App Passwords** - Never use your main Gmail password
3. **Rotate credentials regularly** - Generate new app passwords periodically
4. **Use environment-specific configs** - Different credentials for dev/staging/production
5. **Monitor usage** - Check Google Account activity for unusual sending patterns

## 📝 Email Templates

The invitation emails use a professional HTML template with:
- ✉️ Branded header with gradient
- 👤 Sender information with avatar
- 📄 Document title and access level badge
- 🔗 Direct "Open Document" button
- 🎨 Responsive design for mobile and desktop

## 🚀 Production Recommendations

For production environments, consider:

1. **Use a dedicated email service** like SendGrid, AWS SES, or Mailgun
2. **Set up SPF, DKIM, and DMARC records** for your domain
3. **Use a custom domain** (e.g., noreply@yourdomain.com)
4. **Implement rate limiting** to prevent abuse
5. **Add email queue system** (e.g., Bull, Agenda) for better reliability
6. **Monitor bounce rates** and failed deliveries
7. **Implement unsubscribe functionality** for compliance

## 💡 Tips

- Test with multiple email providers (Gmail, Outlook, Yahoo) to ensure compatibility
- Use meaningful subject lines and sender names
- Include both text and HTML versions of emails
- Add tracking pixels for open rates (optional)
- Implement retry logic for failed sends

## 📚 API Endpoints

### Send Invitation
```http
POST /api/documents/:documentId/send-invitation
Authorization: Bearer <token>

{
  "recipientEmail": "user@example.com",
  "accessLevel": "viewer|commenter|editor"
}
```

### Test Email Configuration
```http
POST /api/email/test
Authorization: Bearer <token>

{
  "email": "test@example.com"
}
```

## 🎯 Next Steps

After setting up email:
1. ✅ Test with your own email address first
2. ✅ Test with different email providers
3. ✅ Test multiple recipients (comma-separated)
4. ✅ Check all access levels work correctly
5. ✅ Verify the share links work when clicked

## 📞 Support

If you encounter issues not covered here:
- Check server console logs for detailed error messages
- Review the email service code in `/src/services/email/emailService.js`
- Test your SMTP credentials using a tool like [SMTP Test Tool](https://www.smtper.net/)

---

**Last Updated**: December 2024
