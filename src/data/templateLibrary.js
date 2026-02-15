// Pre-built document templates that users can clone

const TEMPLATE_LIBRARY = {
    proposals: [
        {
            id: "proposal_website_redesign",
            title: "Website Redesign Proposal",
            category: "proposal",
            description: "Professional proposal for website redesign projects",
            tags: ["web", "design", "digital"],
            content: {
                title: "Website Redesign Proposal",
                executiveSummary: "This proposal outlines a comprehensive website redesign strategy to modernize your digital presence, improve user experience, and drive conversions. Our approach combines cutting-edge design with proven UX principles.",
                methodology: [
                    "Phase 1: Discovery & Research - Analyze current site, user behavior, and competitor landscape",
                    "Phase 2: Design & Prototyping - Create wireframes, mockups, and interactive prototypes",
                    "Phase 3: Development & Testing - Build responsive site with modern tech stack",
                    "Phase 4: Launch & Optimization - Deploy, monitor, and continuously improve"
                ],
                pricing: [
                    { item: "UX Research & Strategy", price: "$3,500" },
                    { item: "UI Design (10 pages)", price: "$8,000" },
                    { item: "Frontend Development", price: "$12,000" },
                    { item: "CMS Integration", price: "$4,500" }
                ],
                conclusion: "We're excited to partner with you on this transformative project. Our team brings 10+ years of experience in creating high-converting websites that users love."
            }
        },
        {
            id: "proposal_marketing_campaign",
            title: "Digital Marketing Campaign Proposal",
            category: "proposal",
            description: "Comprehensive digital marketing strategy proposal",
            tags: ["marketing", "digital", "social media"],
            content: {
                title: "Q1 Digital Marketing Campaign Proposal",
                executiveSummary: "A data-driven digital marketing campaign designed to increase brand awareness by 40% and generate 500+ qualified leads through multi-channel strategies.",
                methodology: [
                    "Phase 1: Audience Research - Deep dive into target demographics and psychographics",
                    "Phase 2: Content Creation - Develop engaging content across all channels",
                    "Phase 3: Campaign Launch - Execute coordinated multi-channel campaign",
                    "Phase 4: Optimization - A/B testing and continuous improvement"
                ],
                pricing: [
                    { item: "Strategy & Planning", price: "$2,500" },
                    { item: "Content Creation (3 months)", price: "$6,000" },
                    { item: "Paid Advertising Management", price: "$8,000" },
                    { item: "Analytics & Reporting", price: "$2,000" }
                ],
                conclusion: "Let's work together to elevate your brand and achieve measurable results this quarter."
            }
        }
    ],

    invoices: [
        {
            id: "invoice_consulting",
            title: "Consulting Services Invoice",
            category: "invoice",
            description: "Professional invoice for consulting services",
            tags: ["consulting", "services"],
            content: {
                invoiceNumber: "INV-2024-001",
                billedTo: "Acme Corporation",
                items: [
                    { description: "Strategic Consulting (40 hours @ $150/hr)", amount: 6000 },
                    { description: "Market Research & Analysis", amount: 2500 },
                    { description: "Implementation Support", amount: 1500 }
                ],
                total: 10000,
                notes: "Payment due within 30 days. Thank you for your business!"
            }
        }
    ],

    resumes: [
        {
            id: "resume_software_engineer",
            title: "Senior Software Engineer Resume",
            category: "resume",
            description: "Professional resume for senior software engineers",
            tags: ["tech", "engineering", "software"],
            content: {
                name: "Alex Johnson",
                email: "alex.johnson@email.com",
                phone: "+1 (555) 123-4567",
                location: "San Francisco, CA",
                summary: "Senior Software Engineer with 8+ years of experience building scalable web applications. Expert in React, Node.js, and cloud architecture. Passionate about clean code and mentoring junior developers.",
                experience: [
                    {
                        title: "Senior Software Engineer",
                        company: "Tech Innovations Inc.",
                        period: "2020 - Present",
                        responsibilities: [
                            "Led development of microservices architecture serving 5M+ users",
                            "Reduced API response time by 60% through optimization",
                            "Mentored team of 5 junior engineers",
                            "Implemented CI/CD pipeline reducing deployment time by 80%"
                        ]
                    },
                    {
                        title: "Software Engineer",
                        company: "StartupXYZ",
                        period: "2017 - 2020",
                        responsibilities: [
                            "Built real-time chat application using WebSockets",
                            "Developed RESTful APIs handling 100K+ requests/day",
                            "Implemented automated testing increasing code coverage to 90%"
                        ]
                    }
                ],
                education: [
                    { degree: "Bachelor of Science in Computer Science", institution: "Stanford University", year: "2016" }
                ],
                skills: ["JavaScript", "React", "Node.js", "Python", "AWS", "Docker", "PostgreSQL", "MongoDB", "Git", "Agile"]
            }
        }
    ],

    marketing_briefs: [
        {
            id: "brief_product_launch",
            title: "Product Launch Marketing Brief",
            category: "marketing_brief",
            description: "Marketing brief for new product launches",
            tags: ["product", "launch", "marketing"],
            content: {
                title: "Marketing Campaign: New SaaS Product Launch",
                subtitle: "Go-to-Market Strategy",
                objective: "Successfully launch our new SaaS product and acquire 1,000 beta users within the first 3 months through targeted digital marketing campaigns.",
                audience: {
                    demographics: "B2B decision-makers, ages 30-50, mid to senior level positions in tech companies",
                    psychographics: "Early adopters, value efficiency and innovation, active on LinkedIn and tech communities",
                    painPoints: "Struggling with manual processes, looking for automation solutions, need better team collaboration tools"
                },
                strategies: [
                    { channel: "Content Marketing", description: "Publish 2 blog posts/week, create comprehensive guides, host webinars" },
                    { channel: "Social Media", description: "Daily LinkedIn posts, engage in relevant communities, share customer success stories" },
                    { channel: "Email Marketing", description: "Nurture campaign for leads, product updates for beta users, exclusive early-bird offers" },
                    { channel: "Paid Advertising", description: "Google Ads targeting high-intent keywords, LinkedIn sponsored content for B2B audience" }
                ],
                timeline: "3 months (Q1 2024)",
                budget: "$25,000"
            }
        }
    ],

    quotations: [
        {
            id: "quote_web_development",
            title: "Web Development Project Quotation",
            category: "quotation",
            description: "Detailed quotation for web development projects",
            tags: ["web", "development", "project"],
            content: {
                quoteNumber: "Q-2024-001",
                clientName: "TechStart Inc.",
                clientEmail: "contact@techstart.com",
                validUntil: "30 days from issue date",
                projectDescription: "Development of a modern, responsive web application with user authentication, dashboard, and API integration.",
                items: [
                    { name: "UI/UX Design", description: "Wireframes, mockups, and design system", quantity: 1, rate: 4000, amount: 4000 },
                    { name: "Frontend Development", description: "React application with responsive design", quantity: 1, rate: 8000, amount: 8000 },
                    { name: "Backend Development", description: "Node.js API with database integration", quantity: 1, rate: 7000, amount: 7000 },
                    { name: "Testing & QA", description: "Comprehensive testing and bug fixes", quantity: 1, rate: 2000, amount: 2000 },
                    { name: "Deployment & Training", description: "Cloud deployment and client training", quantity: 1, rate: 1500, amount: 1500 }
                ],
                subtotal: 22500,
                taxRate: 10,
                tax: 2250,
                total: 24750,
                terms: [
                    "50% deposit required to commence work",
                    "Payment due within 30 days of invoice",
                    "Includes 30 days of post-launch support",
                    "Additional features quoted separately"
                ]
            }
        }
    ]
};

const getAllTemplates = () => {
    const allTemplates = [];

    Object.keys(TEMPLATE_LIBRARY).forEach(category => {
        TEMPLATE_LIBRARY[category].forEach(template => {
            allTemplates.push({
                ...template,
                previewAvailable: true,
            });
        });
    });

    return allTemplates;
};

const getTemplatesByCategory = (category) => {
    return TEMPLATE_LIBRARY[category] || [];
};

const getTemplateById = (templateId) => {
    const allTemplates = getAllTemplates();
    return allTemplates.find(t => t.id === templateId);
};

module.exports = {
    TEMPLATE_LIBRARY,
    getAllTemplates,
    getTemplatesByCategory,
    getTemplateById,
};
