# MM Docs - Streamlined Onboarding Flow

## 🎯 User Flow (Under 3 Minutes)

```
Sign Up (30s) → Brand Kit Wizard (60s) → Choose Document (15s) → 
AI Generates (30s) → Preview (30s) → Export/Share (15s)
```

**Total Time: ~3 minutes** ⏱️

---

## 📋 API Endpoints

### **1. Complete Onboarding**
```
POST /api/onboarding/complete
```

**Request:**
```json
{
  "brandKit": {
    "name": "Acme Corp",
    "colors": {
      "primary": "#667eea"
    }
  },
  "firstDocument": {
    "type": "proposal",
    "topic": "AI Strategy for Enterprise"
  }
}
```

**Response:**
```json
{
  "message": "Onboarding completed successfully",
  "brandKit": {
    "name": "Acme Corp",
    "colors": ["#667eea", "#ea6788"],
    "fonts": { "primary": "Inter", "secondary": "Roboto" }
  },
  "document": {
    "title": "Proposal - AI Strategy for Enterprise",
    "_id": "..."
  },
  "previewUrl": "/api/documents/:id/preview",
  "nextSteps": {
    "preview": "/api/documents/:id/preview",
    "download": "/api/documents/:id/download",
    "share": "/api/documents/:id/share"
  }
}
```

---

### **2. Check Onboarding Status**
```
GET /api/onboarding/status
```

**Response:**
```json
{
  "onboarded": false,
  "hasBrandKit": false,
  "documentCount": 0,
  "needsOnboarding": true
}
```

---

### **3. Get Color Presets**
```
GET /api/onboarding/color-presets
```

**Response:**
```json
{
  "presets": [
    { "name": "Professional Purple", "primary": "#667eea", "secondary": "#764ba2" },
    { "name": "Trust Blue", "primary": "#4299e1", "secondary": "#2c5282" },
    { "name": "Growth Green", "primary": "#48bb78", "secondary": "#2f855a" },
    { "name": "Energy Orange", "primary": "#ed8936", "secondary": "#c05621" },
    { "name": "Bold Red", "primary": "#f56565", "secondary": "#c53030" },
    { "name": "Elegant Black", "primary": "#2d3748", "secondary": "#1a202c" }
  ]
}
```

---

### **4. Skip Onboarding**
```
POST /api/onboarding/skip
```

**Response:**
```json
{
  "message": "Onboarding skipped, defaults applied",
  "brandKit": {
    "name": "My Brand",
    "colors": ["#667eea", "#ea6788"],
    "fonts": { "primary": "Inter", "secondary": "Roboto" }
  }
}
```

---

## 🎨 Smart Defaults

### **What Gets Auto-Generated:**

1. **Brand Name:** "My Brand" (if not provided)
2. **Colors:** Professional Purple (#667eea + complementary)
3. **Fonts:** Inter (primary) + Roboto (secondary)
4. **Logo:** Empty (can be added later)
5. **Watermark:** Enabled (Free tier)

### **Complementary Color Logic:**
- Purple → Pink
- Blue → Orange
- Green → Magenta
- Orange → Blue
- Red → Teal

---

## ✨ Key Features

### **1. One-Call Onboarding**
- Create brand kit + first document in single API call
- No multiple requests needed
- Instant time-to-value

### **2. Smart Defaults**
- Auto-generate complementary colors
- Professional font pairings
- Skip-friendly (works without any input)

### **3. Auto-Apply Brand Kit**
- Brand kit automatically linked to all documents
- No manual selection required
- Consistent branding across all outputs

### **4. Flexible Options**
- **Full Setup:** Customize everything
- **Partial Setup:** Provide some fields, rest use defaults
- **Skip Setup:** Use all defaults, customize later

---

## 🚀 Usage Examples

### **Example 1: Full Onboarding**
```javascript
POST /api/onboarding/complete
{
  "brandKit": {
    "name": "TechCorp",
    "colors": { "primary": "#4299e1" },
    "fonts": { "primary": "Poppins" }
  },
  "firstDocument": {
    "type": "proposal",
    "topic": "Cloud Migration Strategy"
  }
}
```

### **Example 2: Minimal Input**
```javascript
POST /api/onboarding/complete
{
  "brandKit": {
    "name": "StartupXYZ"
  },
  "firstDocument": {
    "type": "resume",
    "topic": "Senior Product Manager"
  }
}
// Colors and fonts will use smart defaults
```

### **Example 3: Skip Everything**
```javascript
POST /api/onboarding/skip
// Creates brand kit with all defaults
// User can customize later
```

---

## 📊 Onboarding Status Tracking

The system tracks:
- ✅ **onboarded**: User completed onboarding
- ✅ **hasBrandKit**: Brand kit exists
- ✅ **documentCount**: Number of documents created
- ✅ **needsOnboarding**: Needs to complete flow

---

## 🎯 Design Philosophy

1. **Progressive Disclosure:** Show only what's needed
2. **Smart Defaults:** Work without input
3. **Flexibility:** Customize as much or as little as desired
4. **Speed:** Get to value in under 3 minutes
5. **No Friction:** Skip options everywhere

---

## ✅ Testing

Run the verification script:
```bash
node scripts/verifyOnboarding.js
```

**Tests:**
- ✅ Sign up & login
- ✅ Status check
- ✅ Color presets
- ✅ Complete onboarding (brand + document)
- ✅ Skip onboarding (defaults)

---

## 🎉 Result

**Users can now:**
1. Sign up in 30 seconds
2. Set up brand in 60 seconds (or skip)
3. Generate first document in 30 seconds
4. Download/share immediately

**Total: Under 3 minutes from signup to first professional document!**
