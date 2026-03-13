require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./src/models/Document");
const renderService = require("./src/services/render/renderService");

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/aidocumentation");
    console.log("Connected to DB");

    // Fetch the most recent experience certificate
    const doc = await Document.findOne({ type: 'experience_certificate' }).sort({ createdAt: -1 });
    if (!doc) {
      console.log("No experience certificate found in DB");
    } else {
      console.log("Found document:", doc.title, doc._id);
      
      try {
        const html = await renderService.renderDocument(doc, null);
        console.log("Rendered HTML length:", html.length);
        
        const pdfService = require("./src/services/render/pdfService");
        const pdf = await pdfService.generatePDF(html, { plan: 'pro' });
        console.log("Successfully generated PDF of size:", pdf.length);
      } catch (err) {
        console.error("Error during rendering/PDF generation:", err);
      }
    }
    
    mongoose.disconnect();
  } catch (err) {
    console.error("DB Error:", err);
    mongoose.disconnect();
  }
})();
