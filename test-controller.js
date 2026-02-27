const mongoose = require("mongoose");
const { generateContent } = require("./src/services/ai/aiService");
const BrandKit = require("./src/models/BrandKit");
const Document = require("./src/models/Document");

async function testController() {
  try {
    console.log("🧪 Testing controller logic...");
    
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/aidocumentation");
    console.log("✅ Connected to MongoDB");
    
    const userId = "699f02cb64d08fd30af0c9d6"; // Demo user ID
    const type = "quotation";
    const topic = "Test quotation";
    
    console.log(`🎯 Generate and save request: type=${type}, topic=${topic}, userId=${userId}`);

    // Fetch user's brand kit
    console.log("🔍 Fetching brand kit...");
    const brandKit = await BrandKit.findOne({ userId });
    console.log(`🎨 Brand kit found: ${brandKit ? 'Yes' : 'No'}`);
    
    const brandContext = brandKit
        ? { name: brandKit.name, tone: "Professional", description: brandKit.description, logo: brandKit.logo }
        : { name: "Generic", tone: "Neutral" };

    // Generate AI content
    console.log(`🤖 Generating ${type} for: ${topic}`);
    const content = await generateContent(type, topic, brandContext);
    console.log(`✅ AI content generated successfully`);

    // Auto-generate title
    const documentTitle = content.title || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${topic}`;
    console.log(`📝 Document title: ${documentTitle}`);

    // Save as document
    console.log(`💾 Saving document to database...`);
    const document = await Document.create({
        userId,
        title: documentTitle,
        type,
        content,
        brandKitId: brandKit ? brandKit._id : null,
    });

    console.log(`✅ Document saved with ID: ${document._id}`);
    console.log("✅ Controller test completed successfully!");
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error("❌ Controller test failed:");
    console.error("Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testController();