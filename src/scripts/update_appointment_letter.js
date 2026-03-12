require("dotenv").config();
const mongoose = require("mongoose");
const fs = require('fs');
const path = require('path');
const Template = require("../models/Template");

async function updateAppointmentLetterTemplate() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MongoDB URI not found in environment variables");
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    const templateId = 'appointment-letter-001';
    
    // Find the appointment letter template
    let template = await Template.findOne({ templateId });
    
    if (!template) {
      console.log(`🔍 Template with ID ${templateId} not found. Creating it...`);
      
      const contentPath = path.join(__dirname, '../templates/appointment_letter.hbs');
      const content = fs.readFileSync(contentPath, 'utf8');

      template = new Template({
        templateId: 'appointment-letter-001',
        name: 'Appointment Letter',
        category: 'hr',
        description: 'Official appointment confirmation letter with terms and conditions',
        icon: '📋',
        requiredFields: [
            { fieldName: 'employeeName', fieldType: 'text', label: 'Employee Name', placeholder: 'e.g. Jane Smith', required: true },
            { fieldName: 'position', fieldType: 'text', label: 'Position', placeholder: 'e.g. Marketing Manager', required: true },
            { fieldName: 'department', fieldType: 'text', label: 'Department', placeholder: 'e.g. Marketing', required: true },
            { fieldName: 'appointmentDate', fieldType: 'date', label: 'Appointment Date', required: true },
            { fieldName: 'salary', fieldType: 'number', label: 'Annual Salary (₹)', placeholder: 'e.g. 1800000', required: true },
            { fieldName: 'reportingTo', fieldType: 'text', label: 'Reporting Manager', placeholder: 'e.g. Head of Marketing', required: true },
            { fieldName: 'workLocation', fieldType: 'text', label: 'Work Location', placeholder: 'e.g. Mumbai Office', required: true },
            { fieldName: 'companyName', fieldType: 'text', label: 'Company Name', placeholder: 'e.g. Business Corp Ltd', required: true },
            { fieldName: 'companyAddress', fieldType: 'textarea', label: 'Company Address', placeholder: 'Complete company address', required: true }
        ],
        content: content,
        placeholders: [
            { placeholder: '{{employeeName}}', description: 'Name of the employee', fieldMapping: 'employeeName' },
            { placeholder: '{{position}}', description: 'Job position', fieldMapping: 'position' },
            { placeholder: '{{appointmentDate}}', description: 'Date of appointment', fieldMapping: 'appointmentDate' }
        ],
        metadata: { tags: ['appointment', 'hr', 'employment'], version: '1.0.0' }
      });
      
      await template.save();
      console.log("✅ Successfully created appointment letter template with salary field");
    } else {
      console.log(`🔍 Found template: ${template.name}`);

      // Check if salary field already exists
      const hasSalaryField = template.requiredFields.some(f => f.fieldName === 'salary');
      
      if (hasSalaryField) {
        console.log("⚠️  Salary field already exists in the template. No updates needed.");
      } else {
        // Find the index of appointmentDate to insert salary after it
        const dateIndex = template.requiredFields.findIndex(f => f.fieldName === 'appointmentDate');
        
        const salaryField = {
          fieldName: 'salary',
          fieldType: 'number',
          label: 'Annual Salary (₹)',
          placeholder: 'e.g. 1800000',
          required: true
        };

        if (dateIndex !== -1) {
          template.requiredFields.splice(dateIndex + 1, 0, salaryField);
        } else {
          template.requiredFields.push(salaryField);
        }

        await template.save();
        console.log("✅ Successfully added salary field to the template metadata");
      }
    }

    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating template:", error);
    process.exit(1);
  }
}

updateAppointmentLetterTemplate();
