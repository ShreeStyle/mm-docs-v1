/**
 * Auto-Generate All Document Templates
 * This script automatically generates professional documents for all available templates
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Document = require('./src/models/Document');
const BrandKit = require('./src/models/BrandKit');
const { generateContent } = require('./src/services/ai/aiService');
const { MONGO_URI } = require('./src/config/config');

// Template configurations with sample data
const TEMPLATE_CONFIGS = {
    offer_letter: {
        name: '💼 Offer Letter',
        topic: 'Generate a professional employment offer letter',
        data: {
            companyName: 'TechCorp Solutions Pvt Ltd',
            companyAddress: '123 Business Tower, Lower Parel, Mumbai - 400013, Maharashtra, India',
            candidateName: 'Priya Sharma',
            position: 'Senior Software Engineer',
            department: 'Engineering',
            salary: '1800000',
            startDate: '2026-04-01',
            reportingTo: 'Director of Engineering',
            workLocation: 'Mumbai Office (Hybrid)',
            probationPeriod: '90 days',
            noticePeriod: '30 days'
        }
    },
    appointment_letter: {
        name: '📋 Appointment Letter',
        topic: 'Generate a professional appointment letter',
        data: {
            companyName: 'InnovateX Technologies',
            companyAddress: 'Tower B, Cyber City, Gurgaon - 122002, Haryana, India',
            employeeName: 'Rahul Verma',
            position: 'Product Manager',
            department: 'Product Development',
            appointmentDate: '2026-03-15',
            salary: '2200000',
            reportingTo: 'VP of Product',
            workLocation: 'Gurgaon Office',
            employeeId: 'EMP2026001',
            probationPeriod: '90 days',
            noticePeriod: '30 days'
        }
    },
    experience_certificate: {
        name: '🏆 Experience Certificate',
        topic: 'Generate a professional experience certificate',
        data: {
            companyName: 'DataFlow Systems',
            companyAddress: 'Plot 45, Electronics City, Bangalore - 560100, Karnataka, India',
            employeeName: 'Amit Kumar',
            position: 'Data Analyst',
            department: 'Analytics',
            joiningDate: '2023-06-01',
            relievingDate: '2026-02-28',
            workDescription: 'Successfully managed data analytics projects, created comprehensive reports, and contributed to strategic decision-making processes.'
        }
    },
    nda: {
        name: '🔒 Non-Disclosure Agreement',
        topic: 'Generate a professional NDA',
        data: {
            companyName: 'SecureVault Technologies',
            partyName: 'CloudStream Solutions',
            effectiveDate: '2026-03-01',
            jurisdiction: 'Mumbai, Maharashtra',
            term: '2 years'
        }
    },
    service_agreement: {
        name: '📜 Service Agreement',
        topic: 'Generate a professional service agreement',
        data: {
            companyName: 'WebCraft Studios',
            clientName: 'RetailHub India',
            projectTitle: 'E-commerce Platform Development',
            startDate: '2026-03-15',
            endDate: '2026-09-15',
            projectValue: '5500000',
            paymentTerms: '40% advance, 30% on milestone completion, 30% on final delivery'
        }
    },
    proposal: {
        name: '📊 Business Proposal',
        topic: 'Generate a comprehensive business proposal for digital transformation services',
        data: {
            companyName: 'DigiTransform Consulting',
            clientName: 'Legacy Manufacturing Ltd',
            projectTitle: 'Enterprise Digital Transformation Initiative',
            projectValue: '12500000',
            duration: '12 months',
            objectives: 'Modernize legacy systems, implement cloud infrastructure, and establish data analytics capabilities'
        }
    },
    invoice: {
        name: '🧾 Invoice',
        topic: 'Generate a professional invoice',
        data: {
            companyName: 'Creative Solutions',
            companyAddress: 'Office 301, Business Center, Pune - 411001, Maharashtra',
            clientName: 'StartupHub Ventures',
            clientAddress: 'Tower 2, Tech Park, Hyderabad',
            invoiceNumber: 'INV-2026-0123',
            invoiceDate: '2026-03-02',
            dueDate: '2026-03-17',
            items: [
                { description: 'Website Development', quantity: 1, rate: 150000, amount: 150000 },
                { description: 'SEO Optimization', quantity: 1, rate: 25000, amount: 25000 },
                { description: 'Content Creation', quantity: 1, rate: 15000, amount: 15000 }
            ],
            subtotal: 190000,
            tax: 34200,
            total: 224200
        }
    },
    gst_invoice: {
        name: '📑 GST Invoice',
        topic: 'Generate a GST-compliant invoice',
        data: {
            companyName: 'TechServe Solutions Pvt Ltd',
            companyGSTIN: '27AABCT1234F1Z5',
            companyAddress: 'Unit 12, IT Park, Navi Mumbai - 400706, Maharashtra',
            clientName: 'Global Enterprises',
            clientGSTIN: '29AABCU9876P1ZX',
            clientAddress: 'Commerce Tower, Bangalore - 560001, Karnataka',
            invoiceNumber: 'GST/2026/0045',
            invoiceDate: '2026-03-02',
            placeOfSupply: 'Karnataka',
            items: [
                { description: 'Software Licensing', hsn: '998314', quantity: 1, rate: 500000, cgst: 9, sgst: 9, amount: 590000 }
            ],
            totalAmount: 590000
        }
    },
    quotation: {
        name: '💰 Quotation',
        topic: 'Generate a professional quotation',
        data: {
            companyName: 'BuildRight Construction',
            clientName: 'Urban Developers Pvt Ltd',
            projectTitle: 'Commercial Complex Interior Design',
            quotationNumber: 'QT-2026-189',
            validUntil: '2026-03-31',
            items: [
                { description: 'Interior Design Consultation', quantity: 1, rate: 75000 },
                { description: '3D Visualization', quantity: 5, rate: 15000 },
                { description: 'Project Management', quantity: 1, rate: 125000 }
            ],
            totalAmount: 275000
        }
    },
    audit_report: {
        name: '📈 Audit Report',
        topic: 'Generate a comprehensive audit report',
        data: {
            companyName: 'FinAudit Associates',
            clientName: 'GreenEnergy Solutions',
            auditPeriod: 'FY 2025-2026',
            auditType: 'Financial Audit',
            reportDate: '2026-03-02',
            findings: 'Overall financial health is strong with minor improvements needed in inventory management'
        }
    }
};

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    header: (msg) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}\n`)
};

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/aidocumentation');
        log.success('Connected to MongoDB');
    } catch (error) {
        log.error(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

async function getOrCreateUser() {
    try {
        let user = await User.findOne({ email: 'demo@test.com' });
        if (!user) {
            log.warning('Demo user not found, creating one...');
            user = await User.create({
                name: 'Demo User',
                email: 'demo@test.com',
                password: 'hashed_password',
                plan: 'pro' // Use pro plan for unlimited generation
            });
            log.success('Demo user created');
        }
        return user;
    } catch (error) {
        log.error(`Error getting user: ${error.message}`);
        throw error;
    }
}

async function getOrCreateBrandKit(userId) {
    try {
        let brandKit = await BrandKit.findOne({ userId });
        if (!brandKit) {
            log.warning('Brand kit not found, creating default one...');
            brandKit = {
                userId,
                brandName: 'MM Docs',
                description: 'Professional Business Document Platform',
                primaryColor: '#F97316',
                secondaryColor: '#64748b',
                accentColor: '#3b82f6',
                fontFamily: 'Inter',
                footer: {
                    website: 'www.mmdocs.com',
                    email: 'contact@mmdocs.com',
                    phone: '+91-9876543210',
                    address: 'Business Tower, Mumbai, India'
                },
                _id: new mongoose.Types.ObjectId()
            };
            log.success('Using default brand kit');
        }
        return brandKit;
    } catch (error) {
        log.error(`Error getting brand kit: ${error.message}`);
        // Return default brand kit even on error
        return {
            userId,
            brandName: 'MM Docs',
            description: 'Professional Business Document Platform',
            primaryColor: '#F97316',
            secondaryColor: '#64748b',
            accentColor: '#3b82f6',
            fontFamily: 'Inter',
            footer: {
                website: 'www.mmdocs.com',
                email: 'contact@mmdocs.com',
                phone: '+91-9876543210',
                address: 'Business Tower, Mumbai, India'
            },
            _id: new mongoose.Types.ObjectId()
        };
    }
}

async function generateDocument(type, config, user, brandKit) {
    try {
        log.info(`Generating ${config.name}...`);

        const brandContext = {
            name: brandKit.brandName || 'MM Docs',
            tone: 'Strictly Professional and Formal',
            description: brandKit.description || '',
            logo: brandKit.logo || '',
            primaryColor: brandKit.primaryColor || '#F97316',
            secondaryColor: brandKit.secondaryColor || '#64748b',
            accentColor: brandKit.accentColor || '#3b82f6',
            fontFamily: brandKit.fontFamily || 'Inter',
            website: brandKit.footer?.website || '',
            email: brandKit.footer?.email || '',
            phone: brandKit.footer?.phone || '',
            address: brandKit.footer?.address || ''
        };

        // Generate content using AI service
        const content = await generateContent(
            type,
            config.topic,
            brandContext,
            config.data,
            'premium' // Use premium quality
        );

        // Create document title
        const title = `${config.name.replace(/[^\w\s]/gi, '').trim()} - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        // Save document to database
        const document = await Document.create({
            userId: user._id,
            title,
            type,
            content,
            brandKitId: brandKit._id
        });

        log.success(`✨ Generated ${config.name} (ID: ${document._id})`);
        return document;

    } catch (error) {
        log.error(`Failed to generate ${config.name}: ${error.message}`);
        return null;
    }
}

async function generateAllTemplates() {
    log.header('🚀 AUTO-GENERATING ALL DOCUMENT TEMPLATES');
    log.info('This will create professional documents for all available templates...');

    try {
        // Connect to database
        await connectDB();

        // Get user and brand kit
        const user = await getOrCreateUser();
        const brandKit = await getOrCreateBrandKit(user._id);

        log.info(`Using account: ${user.email} (${user.plan} plan)`);
        log.info(`Brand: ${brandKit.brandName}`);
        log.info(`Templates to generate: ${Object.keys(TEMPLATE_CONFIGS).length}`);

        console.log('\n' + '='.repeat(60) + '\n');

        // Generate documents
        const results = {
            success: [],
            failed: []
        };

        let counter = 1;
        for (const [type, config] of Object.entries(TEMPLATE_CONFIGS)) {
            log.header(`[${counter}/${Object.keys(TEMPLATE_CONFIGS).length}] ${config.name}`);
            
            const document = await generateDocument(type, config, user, brandKit);
            
            if (document) {
                results.success.push({ type, name: config.name, id: document._id });
            } else {
                results.failed.push({ type, name: config.name });
            }
            
            // Add delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            counter++;
        }

        // Summary
        console.log('\n' + '='.repeat(60) + '\n');
        log.header('📊 GENERATION SUMMARY');
        log.success(`Successfully generated: ${results.success.length} documents`);
        if (results.failed.length > 0) {
            log.warning(`Failed: ${results.failed.length} documents`);
            results.failed.forEach(item => log.error(`  - ${item.name}`));
        }

        console.log('\n✨ All documents generated successfully!\n');
        console.log('You can now view them in your dashboard at http://localhost:5173\n');

    } catch (error) {
        log.error(`Fatal error: ${error.message}`);
    } finally {
        await mongoose.connection.close();
        log.info('Database connection closed');
    }
}

// Run the script
generateAllTemplates().catch(error => {
    log.error(`Unhandled error: ${error.message}`);
    process.exit(1);
});
