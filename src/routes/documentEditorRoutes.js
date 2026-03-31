const express = require('express');
const router = express.Router();
const documentEditorController = require('../controllers/documentEditorController');
const auth = require('../middleware/authMiddleware');

// Create document from template with recipients
router.post('/create-from-template', auth, documentEditorController.createFromTemplate);

// Get document by ID (with all editor data)
router.get('/:documentId', auth, documentEditorController.getDocument);

// Update document
router.put('/:documentId', auth, documentEditorController.updateDocument);

// Update document fields
router.put('/:documentId/fields', auth, documentEditorController.updateFields);

// Add/Update recipients
router.post('/:documentId/recipients', auth, documentEditorController.updateRecipients);

// Send document to recipients
router.post('/:documentId/send', auth, documentEditorController.sendDocument);

// Generate WYSIWYG PDF from Canvas HTML
router.post('/:documentId/pdf', auth, documentEditorController.generateEditorPDF);

// Delete document
router.delete('/:documentId', auth, documentEditorController.deleteDocument);

module.exports = router;
