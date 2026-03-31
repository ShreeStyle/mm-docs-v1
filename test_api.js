// Use native fetch
const mongoose = require('mongoose');

async function testPdfRoute() {
  require('dotenv').config();
  
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://developer:test@cluster0.abcde.mongodb.net/aidocumentation?retryWrites=true&w=majority');
  
  const User = require('./src/models/User');
  const user = await User.findOne();
  if(!user) return console.log('No user');
  
  const Document = require('./src/models/Document');
  const doc = await Document.findOne({ userId: user._id });
  if(!doc) return console.log('No document found for user');
  
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'sync_logic_jwt_secret_key_2024_secure', { expiresIn: '1d' });

  console.log('Testing document:', doc._id, doc.title);
  
  try {
    const res = await fetch(`http://localhost:5000/api/document-editor/${doc._id}/pdf`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ html: '<h1>Test from frontend</h1>' })
    });

    const text = await res.text();
    console.log('Status HTTP:', res.status);
    console.log('Response preview:', text.substring(0, 150));
  } catch(e) {
    console.log('Fetch error:', e);
  }
  
  process.exit(0);
}
testPdfRoute();
