# Document Editor Implementation Guide

## Overview
Implement a PandaDoc-style document editor workflow that allows users to:
1. Select templates from the template library
2. Add document recipients (CLIENT & SENDER)
3. Edit documents with fillable fields
4. Use Paint-like editing tools for customization

## User Flow

### Step 1: Template Selection (Existing Dashboard)
- User browses template library in dashboard
- Clicks on a template (e.g., Letter of Recommendation, Agency Agreement, etc.)
- System captures template selection and redirects to recipient page

### Step 2: Add Document Recipients Page
**Route:** `/document/recipients/:templateId`

**Features:**
- Document name input field (pre-filled with template name)
- Recipient roles:
  - CLIENT role input (name, email, or group)
  - SENDER role input (name, email, or group)
- "Add recipient" button for additional recipients
- Action buttons:
  - "Skip" - proceeds without adding recipients
  - "Continue" - saves recipients and proceeds to editor

**UI Components Needed:**
- RecipientInput component (with role badges: orange for CLIENT, purple for SENDER)
- Form validation for email addresses
- Dynamic recipient list management

### Step 3: Document Editor Page
**Route:** `/document/editor/:documentId`

**Layout:**
```
┌────────────────────────────────────────────────────────────┐
│  Header: [Document Name] | [Review and Send] [Invite]     │
├─────────────────────────────────┬──────────────────────────┤
│                                 │  ADD FILLABLE FIELDS     │
│   Document Preview Area         │  ┌────────────────────┐  │
│   (PDF/Canvas Renderer)         │  │ 👤 Signature       │  │
│                                 │  │ ✍️ Initials        │  │
│   - Zoom controls               │  │ A| Text field      │  │
│   - Page navigation             │  │ 📅 Date            │  │
│   - Drag & drop fields          │  │ 📎 File upload     │  │
│                                 │  │ ⚪ Radio buttons   │  │
│                                 │  │ ☑️ Checkbox        │  │
│                                 │  │ ▼ Dropdown         │  │
│                                 │  │ 💳 Card details    │  │
│                                 │  │ 🔖 Stamp           │  │
│                                 │  └────────────────────┘  │
│                                 │                          │
│                                 │  MORE ACTIONS            │
│                                 │  - Manage recipients     │
│                                 │  - Review steps          │
└─────────────────────────────────┴──────────────────────────┘
```

**Core Features:**

#### A. Document Preview Panel (Left Side)
- PDF/Document rendering using:
  - `react-pdf` for PDF rendering
  - `fabric.js` or `konva` for canvas-based editing
- Page navigation (Page X of Y)
- Zoom controls (fit width, fit page, 50%, 75%, 100%, 125%, 150%)
- Field positioning system with drag & drop

#### B. Fillable Fields Panel (Right Side)
**Field Types:**
1. **Signature** - Digital signature capture
2. **Initials** - Initial capture
3. **Text Field** - Single/multi-line text input
4. **Date** - Date picker field
5. **File Upload** - Attachment field
6. **Radio Buttons** - Single choice options
7. **Checkbox** - Multiple choice options
8. **Dropdown** - Select menu
9. **Card Details** - Payment information
10. **Stamp** - Approval/rejection stamps

**Field Properties:**
- Assignable to recipients (CLIENT/SENDER)
- Required/Optional toggle
- Field labels and descriptions
- Default values
- Validation rules

#### C. Paint-Like Editing Tools
**Drawing Tools:**
- ✏️ Pencil/Pen tool
- 🖊️ Highlighter
- 📝 Text box (add custom text anywhere)
- ⬜ Shapes (rectangle, circle, line, arrow)
- 🎨 Color picker
- 📏 Size/thickness controls
- 🗑️ Eraser tool
- ↩️ Undo/Redo
- 🗑️ Delete selected element

**Interaction:**
- Click field from panel → Drag to document
- Click on placed field → Show properties panel
- Right-click → Context menu (delete, duplicate, properties)
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y, Delete)

### Step 4: Review and Send
- Preview all fields and assignments
- Send to recipients via email
- Track document status

## Technical Implementation

### Frontend Structure

```
client/src/
├── components/
│   ├── DocumentEditor/
│   │   ├── DocumentEditor.jsx (Main container)
│   │   ├── DocumentPreview.jsx (Left panel)
│   │   ├── FieldsPanel.jsx (Right panel)
│   │   ├── DrawingTools.jsx (Paint tools)
│   │   ├── FieldComponents/
│   │   │   ├── SignatureField.jsx
│   │   │   ├── TextField.jsx
│   │   │   ├── DateField.jsx
│   │   │   └── ... (other fields)
│   │   └── RecipientDialog.jsx
│   └── RecipientForm/
│       ├── RecipientForm.jsx
│       └── RecipientInput.jsx
├── pages/
│   ├── DocumentRecipients.jsx
│   └── DocumentEditor.jsx
└── utils/
    ├── documentRenderer.js
    ├── fieldManager.js
    └── canvasUtils.js
```

### Backend API Endpoints

```javascript
// Document Management
POST   /api/documents/create-from-template/:templateId
GET    /api/documents/:id
PUT    /api/documents/:id
DELETE /api/documents/:id

// Recipients
POST   /api/documents/:id/recipients
PUT    /api/documents/:id/recipients/:recipientId
DELETE /api/documents/:id/recipients/:recipientId

// Fields
POST   /api/documents/:id/fields
PUT    /api/documents/:id/fields/:fieldId
DELETE /api/documents/:id/fields/:fieldId

// Document rendering
GET    /api/documents/:id/preview
GET    /api/documents/:id/pdf

// Sending
POST   /api/documents/:id/send
```

### Database Schema

```javascript
// Document Model
{
  _id: ObjectId,
  name: String,
  templateId: ObjectId,
  userId: ObjectId,
  content: {
    originalPdf: String, // URL or base64
    pages: Number,
    annotations: [] // Drawing/paint data
  },
  recipients: [{
    role: String, // 'CLIENT', 'SENDER', 'CUSTOM'
    name: String,
    email: String,
    order: Number
  }],
  fields: [{
    type: String, // 'signature', 'text', 'date', etc.
    label: String,
    page: Number,
    position: { x: Number, y: Number },
    size: { width: Number, height: Number },
    properties: {
      required: Boolean,
      assignedTo: String, // recipient role
      defaultValue: String,
      validation: Object
    }
  }],
  status: String, // 'draft', 'sent', 'completed'
  createdAt: Date,
  updatedAt: Date
}
```

## Key Libraries & Technologies

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **react-pdf** - PDF rendering (`@react-pdf/renderer` or `react-pdf`)
- **fabric.js** or **Konva + react-konva** - Canvas editing/drawing
- **react-signature-canvas** - Signature capture
- **react-datepicker** - Date inputs
- **react-dropzone** - File uploads
- **react-beautiful-dnd** - Drag and drop
- **Tailwind CSS** - Styling

### Backend
- **pdf-lib** - PDF manipulation
- **pdfkit** - PDF generation
- **multer** - File uploads
- **nodemailer** - Email sending

## Implementation Phases

### Phase 1: Recipient Page (Week 1)
- [ ] Create RecipientForm component
- [ ] Create recipient page route
- [ ] Implement recipient management (add/edit/delete)
- [ ] Form validation
- [ ] Navigation to editor

### Phase 2: Document Editor Structure (Week 2)
- [ ] Create DocumentEditor layout
- [ ] Implement PDF rendering
- [ ] Create fields panel UI
- [ ] Setup canvas for field placement

### Phase 3: Field System (Week 2-3)
- [ ] Implement drag & drop from fields panel
- [ ] Create field components (signature, text, date, etc.)
- [ ] Field positioning and resizing
- [ ] Field assignment to recipients
- [ ] Field properties panel

### Phase 4: Paint Tools (Week 3-4)
- [ ] Drawing tools implementation
- [ ] Color picker
- [ ] Eraser tool
- [ ] Undo/redo functionality
- [ ] Save annotations

### Phase 5: Backend Integration (Week 4)
- [ ] Document CRUD APIs
- [ ] Field management APIs
- [ ] PDF processing
- [ ] Document preview generation

### Phase 6: Review & Send (Week 5)
- [ ] Review page
- [ ] Email integration
- [ ] Document delivery
- [ ] Status tracking

## User Experience Considerations

1. **Intuitive Drag & Drop:** Fields should snap to grid for alignment
2. **Visual Feedback:** Show field boundaries, hover states, selection
3. **Responsive:** Work on desktop (primary) and tablet
4. **Auto-save:** Save document state periodically
5. **Keyboard Shortcuts:** Power user features
6. **Templates:** Save commonly used field configurations
7. **Real-time Collaboration:** (Future) Multiple users editing

## Security Considerations

1. **Access Control:** Only document owner and assigned recipients can view
2. **Encryption:** Sensitive data encrypted at rest
3. **Audit Trail:** Track all document changes
4. **Email Verification:** Verify recipient emails before sending
5. **Session Management:** Secure token-based authentication

## Performance Optimization

1. **Lazy Loading:** Load pages on-demand for large documents
2. **Canvas Optimization:** Use virtual scrolling for large documents
3. **Debouncing:** Debounce auto-save operations
4. **Caching:** Cache rendered pages
5. **Compression:** Compress uploaded PDFs

## Testing Strategy

1. **Unit Tests:** Individual components and utilities
2. **Integration Tests:** API endpoints
3. **E2E Tests:** Complete user flows (Cypress/Playwright)
4. **Browser Testing:** Chrome, Firefox, Safari, Edge
5. **Performance Testing:** Large documents (100+ pages)

## Success Metrics

1. Time to create a document < 5 minutes
2. Field placement accuracy > 95%
3. Document load time < 3 seconds
4. User satisfaction score > 4.5/5
5. Completion rate > 80%

---

## Next Steps

1. Review and approve this guide
2. Setup development branches
3. Begin Phase 1 implementation
4. Regular progress reviews
5. User testing at each phase completion
