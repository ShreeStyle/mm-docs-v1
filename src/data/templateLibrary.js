// Pre-built document templates that users can clone — 20 ready-to-use templates

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
        },
        {
            id: "proposal_mobile_app",
            title: "Mobile App Development Proposal",
            category: "proposal",
            description: "End-to-end mobile app development proposal",
            tags: ["mobile", "app", "development", "iOS", "Android"],
            content: {
                title: "Mobile App Development Proposal",
                executiveSummary: "We propose building a cross-platform mobile application using React Native to deliver a seamless experience on both iOS and Android. The app will feature real-time notifications, offline support, and integration with your existing backend systems.",
                methodology: [
                    "Phase 1: Requirements Gathering & UX Research - Define user stories, create journey maps, and establish KPIs",
                    "Phase 2: UI/UX Design - Design intuitive interfaces with accessibility in mind, build interactive prototypes",
                    "Phase 3: Development Sprints - Agile development in 2-week sprints with regular demos and feedback loops",
                    "Phase 4: QA & Testing - Automated testing, device compatibility testing, performance optimization",
                    "Phase 5: App Store Submission & Launch - Prepare store listings, handle review process, and launch marketing"
                ],
                pricing: [
                    { item: "UX Research & Design", price: "$6,000" },
                    { item: "React Native Development (iOS + Android)", price: "$25,000" },
                    { item: "Backend API Integration", price: "$8,000" },
                    { item: "QA Testing & App Store Submission", price: "$4,000" },
                    { item: "3-Month Post-Launch Support", price: "$3,000" }
                ],
                conclusion: "Our experienced mobile team has delivered 50+ successful apps. We're confident in delivering a product that your users will love and that drives measurable business outcomes."
            }
        },
        {
            id: "proposal_consulting_services",
            title: "Business Consulting Proposal",
            category: "proposal",
            description: "Strategic business consulting engagement proposal",
            tags: ["consulting", "strategy", "business"],
            content: {
                title: "Strategic Business Consulting Proposal",
                executiveSummary: "This engagement will assess your current operations, identify growth opportunities, and develop a 12-month strategic roadmap. We specialize in helping mid-size companies achieve 30-50% revenue growth through operational excellence and market expansion.",
                methodology: [
                    "Phase 1: Diagnostic Assessment - Comprehensive review of operations, financials, and market position",
                    "Phase 2: Strategy Development - Build data-driven growth strategy with clear milestones",
                    "Phase 3: Implementation Planning - Create detailed action plans with assigned ownership",
                    "Phase 4: Ongoing Advisory - Monthly check-ins and quarterly strategy reviews for 12 months"
                ],
                pricing: [
                    { item: "Diagnostic Assessment (2 weeks)", price: "$8,000" },
                    { item: "Strategy Development Workshop", price: "$5,000" },
                    { item: "Implementation Roadmap", price: "$4,000" },
                    { item: "Monthly Advisory (12 months)", price: "$18,000" }
                ],
                conclusion: "With 15+ years of experience guiding businesses through transformation, we're ready to help you unlock your full potential and achieve sustainable growth."
            }
        },
        {
            id: "proposal_saas_product",
            title: "SaaS Product Development Proposal",
            category: "proposal",
            description: "Full-stack SaaS product build proposal",
            tags: ["SaaS", "product", "startup", "development"],
            content: {
                title: "SaaS Product Development Proposal",
                executiveSummary: "We will build a scalable, multi-tenant SaaS platform from concept to launch. The solution includes user management, subscription billing, analytics dashboard, and API integrations — designed to support 10,000+ concurrent users from day one.",
                methodology: [
                    "Phase 1: Product Discovery - Define MVP features, create user personas, map competitive landscape",
                    "Phase 2: Architecture & Design - Design scalable cloud architecture, create component library and design system",
                    "Phase 3: Core Development - Build authentication, billing, core features in 6 agile sprints",
                    "Phase 4: Beta Testing - Recruit beta users, gather feedback, iterate on product",
                    "Phase 5: Launch & Scale - Production deployment, monitoring setup, growth optimization"
                ],
                pricing: [
                    { item: "Product Discovery & Planning", price: "$5,000" },
                    { item: "Architecture & Design System", price: "$10,000" },
                    { item: "Full-Stack Development (12 weeks)", price: "$45,000" },
                    { item: "Payment & Subscription Integration", price: "$6,000" },
                    { item: "Beta Testing & Launch Support", price: "$4,000" }
                ],
                conclusion: "We've launched 20+ SaaS products and understand the unique challenges of building for scale. Let's turn your vision into a product that delights users and generates recurring revenue."
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
        },
        {
            id: "invoice_web_development",
            title: "Web Development Invoice",
            category: "invoice",
            description: "Invoice for web development and design services",
            tags: ["web", "development", "design"],
            content: {
                invoiceNumber: "INV-2024-002",
                billedTo: "StartupXYZ Inc.",
                items: [
                    { description: "Website Design (5 pages)", amount: 4000 },
                    { description: "Frontend Development (React)", amount: 8000 },
                    { description: "Backend API Development", amount: 6000 },
                    { description: "Database Setup & Migration", amount: 2000 },
                    { description: "Deployment & SSL Setup", amount: 500 }
                ],
                total: 20500,
                notes: "50% paid upfront. Remaining balance due upon project completion. Hosting costs billed separately."
            }
        },
        {
            id: "invoice_freelance_design",
            title: "Freelance Design Invoice",
            category: "invoice",
            description: "Invoice template for freelance graphic designers",
            tags: ["freelance", "design", "creative"],
            content: {
                invoiceNumber: "INV-2024-003",
                billedTo: "Brand Solutions Agency",
                items: [
                    { description: "Logo Design (3 concepts + revisions)", amount: 1500 },
                    { description: "Brand Identity Package", amount: 3000 },
                    { description: "Social Media Templates (10 designs)", amount: 1200 },
                    { description: "Business Card & Letterhead Design", amount: 800 }
                ],
                total: 6500,
                notes: "All deliverables include source files. Payment due within 15 days of invoice date."
            }
        },
        {
            id: "invoice_monthly_retainer",
            title: "Monthly Retainer Invoice",
            category: "invoice",
            description: "Recurring monthly retainer billing invoice",
            tags: ["retainer", "monthly", "ongoing"],
            content: {
                invoiceNumber: "INV-2024-004",
                billedTo: "Global Tech Partners",
                items: [
                    { description: "Monthly Development Retainer (January 2024)", amount: 5000 },
                    { description: "Additional Feature Requests (8 hours @ $125/hr)", amount: 1000 },
                    { description: "Server Monitoring & Maintenance", amount: 500 },
                    { description: "Priority Support (24/7)", amount: 750 }
                ],
                total: 7250,
                notes: "Retainer hours roll over for one month. Unused hours expire after 60 days."
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
        },
        {
            id: "resume_product_manager",
            title: "Product Manager Resume",
            category: "resume",
            description: "Resume template for product managers",
            tags: ["product", "management", "strategy"],
            content: {
                name: "Sarah Chen",
                email: "sarah.chen@email.com",
                phone: "+1 (555) 987-6543",
                location: "New York, NY",
                summary: "Results-driven Product Manager with 6+ years leading cross-functional teams to deliver innovative B2B SaaS products. Track record of growing ARR from $2M to $15M through data-driven feature prioritization and customer-centric design.",
                experience: [
                    {
                        title: "Senior Product Manager",
                        company: "CloudScale Technologies",
                        period: "2021 - Present",
                        responsibilities: [
                            "Own roadmap for enterprise analytics platform generating $8M ARR",
                            "Increased user retention by 35% through onboarding redesign",
                            "Led cross-functional team of 12 engineers, 3 designers, and 2 data scientists",
                            "Launched 3 major features resulting in 40% increase in enterprise deals"
                        ]
                    },
                    {
                        title: "Product Manager",
                        company: "DataFlow Inc.",
                        period: "2018 - 2021",
                        responsibilities: [
                            "Managed end-to-end product lifecycle for data visualization tool",
                            "Conducted 100+ customer interviews to inform product strategy",
                            "Reduced churn by 25% through proactive feature development"
                        ]
                    }
                ],
                education: [
                    { degree: "MBA", institution: "Wharton School of Business", year: "2018" },
                    { degree: "BS in Industrial Engineering", institution: "Georgia Tech", year: "2015" }
                ],
                skills: ["Product Strategy", "Agile/Scrum", "SQL", "Figma", "Jira", "A/B Testing", "User Research", "Roadmapping", "Stakeholder Management", "OKRs"]
            }
        },
        {
            id: "resume_ux_designer",
            title: "UX Designer Resume",
            category: "resume",
            description: "Creative resume for UX/UI designers",
            tags: ["design", "UX", "UI", "creative"],
            content: {
                name: "Maya Rodriguez",
                email: "maya.design@email.com",
                phone: "+1 (555) 456-7890",
                location: "Austin, TX",
                summary: "UX Designer with 5+ years crafting intuitive digital experiences for consumer and enterprise products. Expertise in design systems, user research, and accessibility. Portfolio includes work for Fortune 500 companies and high-growth startups.",
                experience: [
                    {
                        title: "Senior UX Designer",
                        company: "DesignCraft Studio",
                        period: "2021 - Present",
                        responsibilities: [
                            "Designed end-to-end experience for fintech app with 2M+ downloads",
                            "Built and maintained design system with 200+ reusable components",
                            "Improved task completion rate by 45% through usability testing iterations",
                            "Mentored 3 junior designers and established design critique process"
                        ]
                    },
                    {
                        title: "UX Designer",
                        company: "Digital Agency Co.",
                        period: "2019 - 2021",
                        responsibilities: [
                            "Delivered UX for 15+ client projects across healthcare, retail, and education",
                            "Conducted user research including interviews, surveys, and card sorting",
                            "Created wireframes, prototypes, and high-fidelity mockups in Figma"
                        ]
                    }
                ],
                education: [
                    { degree: "BFA in Interaction Design", institution: "School of Visual Arts", year: "2019" }
                ],
                skills: ["Figma", "Sketch", "Adobe XD", "Prototyping", "User Research", "Design Systems", "Accessibility (WCAG)", "HTML/CSS", "Miro", "Usability Testing"]
            }
        },
        {
            id: "resume_data_analyst",
            title: "Data Analyst Resume",
            category: "resume",
            description: "Resume template for data analysts and scientists",
            tags: ["data", "analytics", "SQL", "Python"],
            content: {
                name: "Priya Sharma",
                email: "priya.sharma@email.com",
                phone: "+1 (555) 321-9876",
                location: "Chicago, IL",
                summary: "Data Analyst with 4+ years turning raw data into actionable business insights. Proficient in SQL, Python, and Tableau. Experienced in building dashboards, predictive models, and A/B testing frameworks that drive revenue growth.",
                experience: [
                    {
                        title: "Senior Data Analyst",
                        company: "FinServe Analytics",
                        period: "2022 - Present",
                        responsibilities: [
                            "Built executive dashboard tracking $50M+ in quarterly revenue across 3 product lines",
                            "Designed A/B testing framework that improved conversion rates by 22%",
                            "Automated weekly reporting pipeline, saving 15 hours/week of manual work",
                            "Partnered with product team to define KPIs and measure feature impact"
                        ]
                    },
                    {
                        title: "Data Analyst",
                        company: "RetailMax Corp.",
                        period: "2020 - 2022",
                        responsibilities: [
                            "Analyzed customer purchase patterns to inform $2M marketing budget allocation",
                            "Created churn prediction model with 85% accuracy using logistic regression",
                            "Delivered monthly business reviews to C-suite with data-driven recommendations"
                        ]
                    }
                ],
                education: [
                    { degree: "MS in Applied Statistics", institution: "University of Michigan", year: "2020" },
                    { degree: "BS in Mathematics", institution: "Purdue University", year: "2018" }
                ],
                skills: ["SQL", "Python", "Tableau", "Power BI", "Excel", "R", "Google Analytics", "A/B Testing", "Statistical Modeling", "ETL Pipelines"]
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
        },
        {
            id: "brief_brand_awareness",
            title: "Brand Awareness Campaign Brief",
            category: "marketing_brief",
            description: "Campaign brief to boost brand recognition",
            tags: ["branding", "awareness", "campaign"],
            content: {
                title: "Brand Awareness Campaign: Expanding Market Presence",
                subtitle: "From Unknown to Unforgettable",
                objective: "Increase unaided brand recall from 12% to 30% in our target market within 6 months, while growing social media following by 200% and establishing thought leadership.",
                audience: {
                    demographics: "Small business owners, ages 25-45, annual revenue $500K-$5M, tech-savvy, 60% male / 40% female",
                    psychographics: "Growth-minded entrepreneurs who invest in tools that save time, value peer recommendations, consume content on LinkedIn and industry podcasts",
                    painPoints: "Low market visibility, struggling to differentiate from competitors, limited marketing budget and expertise"
                },
                strategies: [
                    { channel: "Influencer Partnerships", description: "Partner with 10 micro-influencers in our niche for authentic brand advocacy and case studies" },
                    { channel: "Content & SEO", description: "Publish weekly thought leadership articles, optimize for 50 high-value keywords, launch company podcast" },
                    { channel: "PR & Media", description: "Secure 5 media placements per month, submit for industry awards, host virtual summit" },
                    { channel: "Community Building", description: "Launch branded Slack community, host monthly AMAs, create referral program with incentives" }
                ],
                timeline: "6 months (Q1-Q2 2024)",
                budget: "$40,000"
            }
        },
        {
            id: "brief_social_media",
            title: "Social Media Strategy Brief",
            category: "marketing_brief",
            description: "Comprehensive social media marketing strategy",
            tags: ["social media", "content", "engagement"],
            content: {
                title: "Social Media Strategy: Building an Engaged Community",
                subtitle: "Content-First Social Growth",
                objective: "Grow total social media following to 50K across platforms, achieve 5% average engagement rate, and drive 1,000 monthly website visits from social channels within 4 months.",
                audience: {
                    demographics: "Millennials and Gen Z professionals, ages 22-38, urban, college-educated, digitally native",
                    psychographics: "Career-driven, seek professional development content, value authenticity over polish, consume short-form video content daily",
                    painPoints: "Information overload, desire for actionable tips over theory, want to learn from real practitioners not just thought leaders"
                },
                strategies: [
                    { channel: "Instagram & Reels", description: "Daily stories, 4 feed posts/week, 3 Reels/week featuring behind-the-scenes and quick tips" },
                    { channel: "LinkedIn", description: "Daily posts alternating between personal stories, industry insights, and carousel education posts" },
                    { channel: "TikTok", description: "5 videos/week focusing on trending sounds, educational content, and day-in-the-life format" },
                    { channel: "Twitter/X", description: "10+ tweets/day including threads, engagement with industry conversations, and live commentary on events" }
                ],
                timeline: "4 months (ongoing)",
                budget: "$15,000"
            }
        },
        {
            id: "brief_event_marketing",
            title: "Event Marketing Campaign Brief",
            category: "marketing_brief",
            description: "Marketing brief for conferences, webinars, and events",
            tags: ["events", "conference", "webinar", "networking"],
            content: {
                title: "Annual Tech Summit: Event Marketing Campaign",
                subtitle: "Driving Registration & Engagement",
                objective: "Achieve 2,000 registrations and 70% attendance rate for our annual tech summit, generate 300 qualified sales leads, and establish our brand as a thought leader in the AI/ML space.",
                audience: {
                    demographics: "CTOs, VP Engineering, Senior Developers at companies with 50-500 employees, primarily in North America and Europe",
                    psychographics: "Lifelong learners, conference regulars, value networking and hands-on workshops over keynote speeches, active in developer communities",
                    painPoints: "Conference fatigue from low-quality events, difficulty justifying event costs to management, limited time away from daily responsibilities"
                },
                strategies: [
                    { channel: "Early Bird Campaign", description: "3-tier pricing with 40% discount for first 200 registrants, exclusive VIP networking dinner for early signups" },
                    { channel: "Speaker Promotion", description: "Leverage speaker networks for cross-promotion, create speaker spotlight series on blog and social media" },
                    { channel: "Partner & Sponsor Outreach", description: "Recruit 10 sponsors with tiered packages, co-marketing campaigns with 5 community partners" },
                    { channel: "Content Teasers", description: "Release weekly preview content from sessions, behind-the-scenes planning vlogs, attendee testimonials from previous years" }
                ],
                timeline: "4 months pre-event",
                budget: "$35,000"
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
        },
        {
            id: "quote_branding_package",
            title: "Branding Package Quotation",
            category: "quotation",
            description: "Complete brand identity package quotation",
            tags: ["branding", "design", "identity"],
            content: {
                quoteNumber: "Q-2024-002",
                clientName: "FreshStart Ventures",
                clientEmail: "hello@freshstart.com",
                validUntil: "21 days from issue date",
                projectDescription: "Complete brand identity package including logo, color palette, typography, brand guidelines, and marketing collateral for a new health & wellness startup.",
                items: [
                    { name: "Brand Discovery Workshop", description: "Half-day workshop to define brand values, personality, and positioning", quantity: 1, rate: 1500, amount: 1500 },
                    { name: "Logo Design", description: "3 initial concepts, 3 revision rounds, final files in all formats", quantity: 1, rate: 3000, amount: 3000 },
                    { name: "Brand Identity System", description: "Color palette, typography, imagery style, icon set", quantity: 1, rate: 2500, amount: 2500 },
                    { name: "Brand Guidelines Document", description: "40-page comprehensive usage guide", quantity: 1, rate: 2000, amount: 2000 },
                    { name: "Stationery Design", description: "Business cards, letterhead, envelope, email signature", quantity: 1, rate: 1500, amount: 1500 },
                    { name: "Social Media Kit", description: "Templates for 4 platforms, profile images, cover photos", quantity: 1, rate: 1800, amount: 1800 }
                ],
                subtotal: 12300,
                taxRate: 8,
                tax: 984,
                total: 13284,
                terms: [
                    "40% deposit to begin, 30% at midpoint, 30% on delivery",
                    "Up to 3 rounds of revisions included per deliverable",
                    "All source files delivered upon final payment",
                    "Timeline: 4-6 weeks from project kickoff"
                ]
            }
        },
        {
            id: "quote_ecommerce",
            title: "E-Commerce Platform Quotation",
            category: "quotation",
            description: "Full e-commerce website build quotation",
            tags: ["ecommerce", "shopify", "online store"],
            content: {
                quoteNumber: "Q-2024-003",
                clientName: "Artisan Goods Co.",
                clientEmail: "orders@artisangoods.com",
                validUntil: "30 days from issue date",
                projectDescription: "Custom e-commerce platform with product catalog, shopping cart, payment processing, inventory management, and shipping integration for a handcrafted goods retailer.",
                items: [
                    { name: "E-Commerce Design", description: "Custom storefront design, product pages, checkout flow", quantity: 1, rate: 5000, amount: 5000 },
                    { name: "Platform Development", description: "Custom Shopify/WooCommerce build with theme customization", quantity: 1, rate: 10000, amount: 10000 },
                    { name: "Payment Gateway Setup", description: "Stripe/Razorpay integration, multi-currency support", quantity: 1, rate: 2000, amount: 2000 },
                    { name: "Inventory & Shipping", description: "Stock management, shipping calculator, order tracking", quantity: 1, rate: 3000, amount: 3000 },
                    { name: "SEO & Analytics Setup", description: "On-page SEO, Google Analytics, conversion tracking", quantity: 1, rate: 1500, amount: 1500 },
                    { name: "Training & Documentation", description: "Admin training, video tutorials, user manual", quantity: 1, rate: 1000, amount: 1000 }
                ],
                subtotal: 22500,
                taxRate: 10,
                tax: 2250,
                total: 24750,
                terms: [
                    "50% deposit required to begin development",
                    "Remaining 50% due before go-live",
                    "Includes 60 days of post-launch bug fixes",
                    "Monthly maintenance available at $500/month",
                    "Estimated timeline: 6-8 weeks"
                ]
            }
        }
    ]
};

const getAllTemplates = () => {
    const allTemplates = [];
    Object.keys(TEMPLATE_LIBRARY).forEach(category => {
        TEMPLATE_LIBRARY[category].forEach(template => {
            allTemplates.push({ ...template, previewAvailable: true });
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
