# 📧 Document Invitation Feature - Testing Guide

## ✅ What Was Implemented

The document invitation feature now **actually sends real emails** instead of just showing an alert. Here's what was added:

### Backend Changes

1. **Email Service Enhancement** (`/src/services/email/emailService.js`)
   - Added `sendInvitationEmail()` function
   - Professional HTML email template with:
     - Gradient header
     - Sender avatar and name
     - Document title
     - Access level badge (Viewer/Commenter/Editor)
     - Direct "Open Document" button
     - Shareable link

2. **Email Controller** (`/src/controllers/emailController.js`)
   - Added `sendInvitation()` controller
   - Supports multiple recipients (comma or semicolon separated)
   - Creates secure share links
   - Returns success/failure for each recipient

3. **Document Routes** (`/src/routes/documentRoutes.js`)
   - Added `POST /api/documents/:id/send-invitation` endpoint
   - Protected by authentication middleware

### Frontend Changes

4. **Document Editor** (`/client/src/pages/DocumentTemplateEditor.jsx`)
   - Added state management for invitation:
     - `inviteEmail` - stores email addresses
     - `inviteAccessLevel` - tracks selected role
     - `isSendingInvite` - loading state
   - Updated invite modal with:
     - Controlled inputs
     - Radio button state management
     - Actual API call to backend
     - Loading indicator during send
     - Success/error alerts

5. **Styling** (`/client/src/styles/DocumentTemplateEditor.css`)
   - Added disabled state for send button
   - Gray out button when sending
   - Cursor changes to not-allowed

### Configuration

6. **Environment Variables** (`.env.example`)
   - Added email configuration section
   - Gmail setup instructions
   - Custom SMTP options

7. **Documentation** (`EMAIL_SETUP.md`)
   - Complete setup guide for Gmail
   - Alternative SMTP providers
   - Troubleshooting section
   - Security best practices

## 🧪 How to Test

### Prerequisites
1. Configure email in `.env`:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```
2. Restart the server: `npm run dev`

### Test Steps

#### Test 1: Single Recipient
1. Open any document in the editor
2. Click **"Invite"** button in top toolbar
3. Enter your email address
4. Select **"Viewer"** access
5. Click **"Send Invitation"**
6. ✅ EXPECTED: "Sending..." appears, then success message
7. ✅ CHECK: Email received in inbox within 1 minute

#### Test 2: Multiple Recipients
1. Click **"Invite"** again
2. Enter: `email1@test.com, email2@test.com`
3. Select **"Commenter"** access
4. Click **"Send Invitation"**
5. ✅ EXPECTED: Success message showing "2 of 2 recipients"
6. ✅ CHECK: Both emails received

#### Test 3: Editor Access
1. Click **"Invite"** again
2. Enter recipient email
3. Select **"Editor"** access
4. Click **"Send Invitation"**
5. ✅ CHECK: Email shows "EDITOR Access" badge with pencil icon

#### Test 4: Invalid Email
1. Click **"Invite"**
2. Leave email field empty
3. Click **"Send Invitation"**
4. ✅ EXPECTED: Alert "Please enter at least one email address"

#### Test 5: Email Content Verification

Open the received email and verify:
- ✅ Subject: `[Sender Name] invited you to collaborate on: [Document Title]`
- ✅ From: `[Sender Name] via MM Docs`
- ✅ Header: Green gradient with 📄 icon
- ✅ Sender avatar: First letter of sender's name
- ✅ Document title: Correct document name
- ✅ Access badge: Shows correct level (VIEWER, COMMENTER, or EDITOR)
- ✅ Button: "Open Document" button is visible
- ✅ Link: Share URL is included below button
- ✅ Footer: MM Docs branding and copyright

#### Test 6: Link Functionality
1. Click **"Open Document"** button in email
2. ✅ EXPECTED: Document opens in browser
3. ✅ CHECK: Share link is valid and accessible

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No email received | Check spam folder, verify EMAIL_USER/PASSWORD in .env |
| "Invalid login" error | Use Gmail App Password, not regular password |
| Button stays "Sending..." | Check browser console for errors, verify server is running |
| Email has no styling | Email client may not support HTML, check in Gmail/Outlook |
| Multiple emails fail | Check Gmail sending limits (500/day max) |

## 📊 Expected Results

### Success Path
1. User enters email(s)
2. User selects access level
3. User clicks "Send Invitation"
4. Button shows "Sending..."
5. API call completes (1-3 seconds)
6. Success alert appears
7. Modal closes
8. Form resets
9. Email arrives in 10-60 seconds

### Error Path
1. API returns error
2. Error alert shows with message
3. Modal stays open
4. User can retry

## 🔍 Debugging

### Check Server Logs
Look for these messages:
- ✅ `✓ Invitation email sent: <messageId>`
- ❌ `✗ Invitation email sending failed: <error>`

### Check Browser Console
Look for:
- ✅ `POST /api/documents/:id/send-invitation 200`
- ❌ `POST /api/documents/:id/send-invitation 500`

### Test Email Endpoint Directly
```bash
curl -X POST http://localhost:5000/api/email/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## 🎯 Feature Comparison

| Before | After |
|--------|-------|
| Click "Send Invitation" → Alert only | Click "Send Invitation" → Real email sent |
| No validation | Email validation, empty check |
| No loading state | "Sending..." indicator |
| No API call | Full backend integration |
| Hardcoded access levels | Dynamic radio selection |
| No error handling | Try-catch with user feedback |

## 📝 Notes

- **Email Delivery Time**: Usually 10-60 seconds depending on email provider
- **Multiple Recipients**: Separate with commas or semicolons
- **Rate Limits**: Gmail allows ~500 emails/day per account
- **Access Levels**: 
  - **Viewer** 👁️ - Can only view
  - **Commenter** 💬 - Can view and comment
  - **Editor** ✏️ - Can view and edit

## 🚀 Next Steps (Optional Enhancements)

Future improvements could include:
- [ ] Toast notifications instead of alerts
- [ ] Invitation history/tracking
- [ ] Resend invitation option
- [ ] Email preview before sending
- [ ] Custom message field
- [ ] Bulk import from CSV
- [ ] Email templates customization
- [ ] Delivery status tracking

---

**Status**: ✅ Feature Complete and Ready for Testing
**Date**: December 2024
