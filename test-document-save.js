const mongoose = require("mongoose");
const Document = require("./src/models/Document");

async function testDocumentSave() {
  try {
    console.log("🧪 Testing document save operation...");
    
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/aidocumentation");
    console.log("✅ Connected to MongoDB");
    
    // Test document creation
    const testDoc = await Document.create({
      userId: "699f02cb64d08fd30af0c9d6", // Demo user ID
      title: "Test Document",
      type: "quotation",
      content: { test: "data" }
    });
    
    console.log("✅ Document created successfully!");
    console.log("Document ID:", testDoc._id);
    
    // Clean up
    await Document.deleteOne({ _id: testDoc._id });
    console.log("✅ Test document cleaned up");
    
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
    
  } catch (error) {
    console.error("❌ Document save test failed:");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testDocumentSave();