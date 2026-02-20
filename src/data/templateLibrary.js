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
        },
        {
            id: "invoice_marketing_services",
            title: "Marketing Services Invoice",
            category: "invoice",
            description: "Invoice for digital marketing and advertising services",
            tags: ["marketing", "advertising", "social media"],
            content: {
                invoiceNumber: "INV-2024-005",
                billedTo: "GrowthHub Marketing",
                items: [
                    { description: "Social Media Management (3 platforms, 1 month)", amount: 2500 },
                    { description: "Content Creation (12 posts + graphics)", amount: 1800 },
                    { description: "Paid Ad Campaign Management (Google + Facebook)", amount: 3000 },
                    { description: "Monthly Analytics Report & Strategy Session", amount: 800 },
                    { description: "Email Marketing Campaign (2 campaigns)", amount: 1200 }
                ],
                total: 9300,
                notes: "Ad spend billed separately. Next month's retainer due by the 1st. Includes performance dashboard access."
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
        },
        {
            id: "resume_marketing_manager",
            title: "Marketing Manager Resume",
            category: "resume",
            description: "Resume template for marketing managers and directors",
            tags: ["marketing", "management", "digital marketing"],
            content: {
                name: "Jordan Martinez",
                email: "jordan.marketing@email.com",
                phone: "+1 (555) 234-5678",
                location: "Los Angeles, CA",
                summary: "Creative Marketing Manager with 7+ years driving brand growth through integrated digital campaigns. Expert in content strategy, demand generation, and marketing automation. Proven track record of increasing MQLs by 150% and reducing CAC by 40%.",
                experience: [
                    {
                        title: "Marketing Manager",
                        company: "TechFlow Solutions",
                        period: "2021 - Present",
                        responsibilities: [
                            "Manage $500K annual marketing budget across 6 channels",
                            "Increased qualified leads by 150% through content marketing and SEO strategy",
                            "Reduced customer acquisition cost from $250 to $150 through optimization",
                            "Built and led team of 4 marketing specialists and 2 contractors",
                            "Launched product marketing campaigns generating $3M in pipeline"
                        ]
                    },
                    {
                        title: "Digital Marketing Specialist",
                        company: "GrowthLabs Inc.",
                        period: "2018 - 2021",
                        responsibilities: [
                            "Managed paid advertising campaigns with $200K annual spend",
                            "Improved email open rates from 18% to 32% through segmentation",
                            "Created content calendar and managed blog generating 50K monthly visitors",
                            "Implemented marketing automation workflows increasing conversion by 25%"
                        ]
                    }
                ],
                education: [
                    { degree: "BA in Marketing", institution: "UCLA", year: "2017" }
                ],
                skills: ["Content Marketing", "SEO/SEM", "Marketing Automation", "HubSpot", "Google Ads", "Social Media Marketing", "Email Marketing", "Analytics", "Copywriting", "Project Management"]
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
        },
        {
            id: "brief_email_campaign",
            title: "Email Marketing Campaign Brief",
            category: "marketing_brief",
            description: "Strategic brief for email nurture campaigns",
            tags: ["email", "nurture", "automation", "conversion"],
            content: {
                title: "Email Nurture Campaign: Lead to Customer Journey",
                subtitle: "Automated Email Sequence Strategy",
                objective: "Design and implement a 12-email nurture sequence that converts 15% of leads into paying customers within 60 days, while maintaining a 25%+ open rate and 4%+ click-through rate.",
                audience: {
                    demographics: "B2B leads who downloaded our lead magnet, company size 10-200 employees, decision-makers in operations or IT",
                    psychographics: "Problem-aware but not yet solution-aware, researching options, need education before purchase, value ROI data and case studies",
                    painPoints: "Overwhelmed by options, need proof of concept, concerned about implementation complexity, require executive buy-in"
                },
                strategies: [
                    { channel: "Welcome Series (Days 1-7)", description: "3 emails: Welcome + value prop, educational content, social proof with case study" },
                    { channel: "Education Phase (Days 8-21)", description: "4 emails: Problem deep-dive, solution overview, feature spotlights, comparison guide" },
                    { channel: "Consideration Phase (Days 22-42)", description: "3 emails: ROI calculator, customer success stories, demo invitation" },
                    { channel: "Decision Phase (Days 43-60)", description: "2 emails: Limited-time offer, final call with urgency and scarcity" }
                ],
                timeline: "60-day automated sequence",
                budget: "$8,000 (copywriting, design, automation setup)"
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
        },
        {
            id: "quote_seo_services",
            title: "SEO Services Quotation",
            category: "quotation",
            description: "Comprehensive SEO optimization package quotation",
            tags: ["SEO", "digital marketing", "optimization"],
            content: {
                quoteNumber: "Q-2024-004",
                clientName: "Digital Growth Agency",
                clientEmail: "hello@digitalgrowth.com",
                validUntil: "30 days from issue date",
                projectDescription: "Complete SEO optimization package including technical audit, on-page optimization, content strategy, and link building for improved search rankings and organic traffic.",
                items: [
                    { name: "Technical SEO Audit", description: "Comprehensive site audit, Core Web Vitals optimization, schema markup", quantity: 1, rate: 2500, amount: 2500 },
                    { name: "On-Page Optimization", description: "Meta tags, headers, internal linking for 20 pages", quantity: 1, rate: 3000, amount: 3000 },
                    { name: "Content Strategy & Creation", description: "Keyword research, content calendar, 10 SEO-optimized articles", quantity: 1, rate: 5000, amount: 5000 },
                    { name: "Link Building Campaign", description: "Outreach, guest posting, 15 high-quality backlinks", quantity: 1, rate: 4000, amount: 4000 },
                    { name: "Monthly Reporting & Optimization", description: "Rank tracking, traffic analysis, ongoing improvements (3 months)", quantity: 1, rate: 3000, amount: 3000 }
                ],
                subtotal: 17500,
                taxRate: 10,
                tax: 1750,
                total: 19250,
                terms: [
                    "40% deposit to begin work",
                    "30% after month 1 deliverables",
                    "30% upon completion of 3-month engagement",
                    "Results typically visible within 60-90 days",
                    "Monthly retainer available after initial engagement"
                ]
            }
        },
        {
            id: "quote_mobile_app",
            title: "Mobile App Development Quotation",
            category: "quotation",
            description: "Native mobile application development quotation",
            tags: ["mobile", "app", "iOS", "Android"],
            content: {
                quoteNumber: "Q-2024-005",
                clientName: "FitLife Wellness",
                clientEmail: "dev@fitlifewellness.com",
                validUntil: "45 days from issue date",
                projectDescription: "Development of a cross-platform mobile fitness app with workout tracking, nutrition logging, social features, and integration with wearable devices.",
                items: [
                    { name: "UX Research & Design", description: "User research, wireframes, UI design for all screens", quantity: 1, rate: 8000, amount: 8000 },
                    { name: "iOS Development", description: "Native Swift development with all core features", quantity: 1, rate: 18000, amount: 18000 },
                    { name: "Android Development", description: "Native Kotlin development with feature parity", quantity: 1, rate: 18000, amount: 18000 },
                    { name: "Backend API & Database", description: "Node.js API, PostgreSQL database, cloud hosting setup", quantity: 1, rate: 12000, amount: 12000 },
                    { name: "Wearable Integration", description: "Apple Watch, Fitbit, and Google Fit integration", quantity: 1, rate: 6000, amount: 6000 },
                    { name: "Testing & QA", description: "Automated testing, device testing, bug fixes", quantity: 1, rate: 5000, amount: 5000 },
                    { name: "App Store Submission", description: "Store listing optimization, submission, launch support", quantity: 1, rate: 2000, amount: 2000 }
                ],
                subtotal: 69000,
                taxRate: 10,
                tax: 6900,
                total: 75900,
                terms: [
                    "30% deposit upon contract signing",
                    "30% upon completion of design phase",
                    "30% upon beta app delivery",
                    "10% upon successful app store approval",
                    "Includes 90 days post-launch support",
                    "Estimated timeline: 16-20 weeks"
                ]
            }
        }
    ],

    company_profile: [
        {
            id: "profile_tech_startup",
            title: "Tech Startup Company Profile",
            category: "company_profile",
            description: "Modern company profile for technology startups",
            tags: ["startup", "technology", "SaaS"],
            content: {
                companyName: "InnovateTech Solutions",
                tagline: "Building the Future of Enterprise Automation",
                founded: "2022",
                headquarters: "San Francisco, CA",
                about: "InnovateTech Solutions is a fast-growing SaaS company revolutionizing how enterprises manage their workflows. Our AI-powered platform helps companies automate repetitive tasks, reduce operational costs by 40%, and scale efficiently. With over 500 enterprise clients and $10M in ARR, we're on a mission to make automation accessible to every business.",
                vision: "To become the global standard for intelligent business automation, empowering 1 million companies to operate at peak efficiency by 2030.",
                mission: "We build intuitive, powerful automation tools that eliminate busywork and let teams focus on what matters most—innovation and growth.",
                coreValues: ["Innovation First", "Customer Obsession", "Transparency", "Continuous Learning", "Sustainable Growth"],
                services: [
                    "Workflow Automation Platform",
                    "AI-Powered Process Optimization",
                    "Enterprise Integration Services",
                    "Custom Automation Consulting",
                    "24/7 Premium Support"
                ],
                achievements: [
                    "500+ Enterprise Clients Worldwide",
                    "$10M ARR in First 2 Years",
                    "98% Customer Satisfaction Rate",
                    "Featured in TechCrunch and Forbes",
                    "SOC 2 Type II Certified"
                ],
                team: "Led by experienced founders from Google, Salesforce, and McKinsey, our team of 50+ engineers, designers, and customer success experts is dedicated to delivering exceptional value."
            }
        },
        {
            id: "profile_consulting_firm",
            title: "Consulting Firm Company Profile",
            category: "company_profile",
            description: "Professional profile for consulting and advisory firms",
            tags: ["consulting", "business", "strategy"],
            content: {
                companyName: "Strategic Advisors Group",
                tagline: "Transforming Businesses Through Strategic Excellence",
                founded: "2015",
                headquarters: "New York, NY",
                about: "Strategic Advisors Group is a premier management consulting firm specializing in digital transformation, operational excellence, and growth strategy. With 9 years of experience and 200+ successful engagements, we partner with mid-market and enterprise companies to unlock their full potential. Our data-driven approach and hands-on implementation support deliver measurable results—averaging 35% revenue growth for our clients.",
                vision: "To be the most trusted strategic partner for companies navigating complex business transformations in the digital age.",
                mission: "We empower organizations to achieve sustainable growth through strategic clarity, operational excellence, and digital innovation.",
                coreValues: ["Client Success First", "Intellectual Rigor", "Collaborative Partnership", "Measurable Impact", "Ethical Practice"],
                services: [
                    "Digital Transformation Strategy",
                    "Operational Excellence & Process Optimization",
                    "Growth Strategy & Market Expansion",
                    "Change Management & Implementation",
                    "Executive Coaching & Leadership Development"
                ],
                achievements: [
                    "200+ Successful Client Engagements",
                    "$500M+ in Client Value Created",
                    "15 Industry Awards for Excellence",
                    "95% Client Retention Rate",
                    "Published 3 Industry-Leading Whitepapers"
                ],
                team: "Our 30-person team includes former executives from Fortune 500 companies, MBAs from top business schools, and industry specialists with deep domain expertise across technology, healthcare, finance, and retail."
            }
        },
        {
            id: "profile_creative_agency",
            title: "Creative Agency Company Profile",
            category: "company_profile",
            description: "Vibrant profile for creative and design agencies",
            tags: ["creative", "design", "branding", "agency"],
            content: {
                companyName: "Pixel Perfect Creative Studio",
                tagline: "Where Creativity Meets Strategy",
                founded: "2018",
                headquarters: "Austin, TX",
                about: "Pixel Perfect is an award-winning creative agency that brings brands to life through stunning design, compelling storytelling, and strategic thinking. We've partnered with over 150 brands—from scrappy startups to Fortune 500 companies—to create memorable experiences that drive results. Our multidisciplinary team blends art and science to deliver campaigns that don't just look good, but perform exceptionally.",
                vision: "To redefine what's possible in brand storytelling and become the go-to creative partner for ambitious brands worldwide.",
                mission: "We craft authentic brand experiences that resonate emotionally, drive engagement, and deliver measurable business impact.",
                coreValues: ["Creative Fearlessness", "Strategic Thinking", "Collaborative Spirit", "Attention to Detail", "Results-Driven"],
                services: [
                    "Brand Strategy & Identity Design",
                    "Digital Marketing Campaigns",
                    "Website & App Design",
                    "Video Production & Motion Graphics",
                    "Social Media Content Creation",
                    "Packaging & Print Design"
                ],
                achievements: [
                    "150+ Brands Transformed",
                    "25+ Industry Awards (Webby, Awwwards, Cannes Lions)",
                    "Featured in Communication Arts & Design Week",
                    "3M+ Social Media Impressions Generated for Clients",
                    "100% On-Time Project Delivery Rate"
                ],
                team: "Our diverse team of 20 creatives includes award-winning designers, copywriters, strategists, and developers who are passionate about pushing creative boundaries while delivering business results."
            }
        },
        {
            id: "profile_manufacturing",
            title: "Manufacturing Company Profile",
            category: "company_profile",
            description: "Industrial company profile for manufacturing businesses",
            tags: ["manufacturing", "industrial", "production"],
            content: {
                companyName: "Precision Manufacturing Corp",
                tagline: "Engineering Excellence Since 1995",
                founded: "1995",
                headquarters: "Detroit, MI",
                about: "Precision Manufacturing Corp is a leading provider of custom metal fabrication and precision machining services for the automotive, aerospace, and industrial equipment sectors. With nearly 30 years of experience, state-of-the-art facilities, and ISO 9001:2015 certification, we deliver high-quality components with unmatched precision and reliability. Our 200,000 sq ft facility houses advanced CNC machines, robotic welding systems, and quality control labs that ensure every part meets exact specifications.",
                vision: "To be North America's most trusted partner for precision manufacturing, known for quality, innovation, and on-time delivery.",
                mission: "We manufacture precision components that power critical industries, combining advanced technology with skilled craftsmanship to exceed customer expectations.",
                coreValues: ["Quality Without Compromise", "Continuous Improvement", "Safety First", "Customer Partnership", "Innovation"],
                services: [
                    "CNC Machining (3, 4, and 5-axis)",
                    "Metal Fabrication & Welding",
                    "Sheet Metal Forming",
                    "Assembly & Sub-Assembly",
                    "Quality Inspection & Testing",
                    "Just-In-Time Delivery Programs"
                ],
                achievements: [
                    "ISO 9001:2015 & AS9100D Certified",
                    "99.8% On-Time Delivery Rate",
                    "Trusted Supplier to 50+ OEMs",
                    "Zero Defects Award from Major Automotive Client",
                    "$50M Annual Production Capacity"
                ],
                team: "Our 150-person team includes experienced machinists, welders, quality engineers, and production managers committed to delivering excellence in every component we produce."
            }
        },
        {
            id: "profile_healthcare",
            title: "Healthcare Company Profile",
            category: "company_profile",
            description: "Professional profile for healthcare and medical services",
            tags: ["healthcare", "medical", "wellness"],
            content: {
                companyName: "HealthFirst Medical Group",
                tagline: "Compassionate Care, Advanced Medicine",
                founded: "2010",
                headquarters: "Boston, MA",
                about: "HealthFirst Medical Group is a patient-centered healthcare organization providing comprehensive primary care, specialty services, and preventive medicine to over 50,000 patients across 12 locations. Our team of board-certified physicians, nurse practitioners, and healthcare professionals is dedicated to delivering personalized, evidence-based care that improves health outcomes and enhances quality of life. We combine cutting-edge medical technology with a warm, compassionate approach to make healthcare accessible and effective.",
                vision: "To transform healthcare delivery by making high-quality, patient-centered care accessible to every community we serve.",
                mission: "We provide comprehensive, compassionate healthcare that empowers patients to live healthier, fuller lives through prevention, early intervention, and advanced treatment.",
                coreValues: ["Patient First", "Clinical Excellence", "Compassion & Respect", "Collaborative Care", "Continuous Innovation"],
                services: [
                    "Primary Care & Family Medicine",
                    "Cardiology & Heart Health",
                    "Orthopedics & Sports Medicine",
                    "Women's Health & OB/GYN",
                    "Pediatrics & Adolescent Medicine",
                    "Preventive Care & Wellness Programs",
                    "Telemedicine & Virtual Visits"
                ],
                achievements: [
                    "50,000+ Active Patients",
                    "4.8/5 Average Patient Satisfaction Score",
                    "NCQA Patient-Centered Medical Home Recognition",
                    "Top 10% Nationally for Quality Metrics",
                    "12 Convenient Locations Across Metro Area"
                ],
                team: "Our multidisciplinary team of 200+ healthcare professionals includes physicians, specialists, nurses, and support staff who are committed to providing exceptional care with empathy and expertise."
            }
        }
    ],

    sales_email: [
        {
            id: "email_cold_outreach",
            title: "B2B Cold Outreach Email",
            category: "sales_email",
            description: "Professional cold email for B2B prospecting",
            tags: ["cold email", "B2B", "prospecting"],
            content: {
                subject: "Quick question about [Company]'s [specific pain point]",
                greeting: "Hi [First Name],",
                opening: "I noticed [Company] recently [specific trigger event - funding, expansion, job posting, etc.]. Congrats on the growth! I'm reaching out because companies at your stage often struggle with [specific pain point related to your solution].",
                valueProposition: "We help [similar companies/industry] [achieve specific outcome] through [your unique approach]. For example, [Similar Company] used our platform to [specific result with numbers - e.g., reduce costs by 35%, increase efficiency by 50%].",
                socialProof: "We're currently working with [recognizable client names or '50+ companies in your industry'] to solve similar challenges.",
                callToAction: "Would you be open to a quick 15-minute call next week to explore if there's a fit? I promise to keep it focused and valuable—no hard sell.",
                signOff: "Best regards,\n[Your Name]\n[Your Title]\n[Company]\n[Phone] | [Email]"
            }
        },
        {
            id: "email_follow_up",
            title: "Follow-Up Email After No Response",
            category: "sales_email",
            description: "Polite follow-up email to re-engage prospects",
            tags: ["follow-up", "re-engagement", "persistence"],
            content: {
                subject: "Re: [Original Subject] - One more try",
                greeting: "Hi [First Name],",
                opening: "I know you're busy, so I'll keep this brief. I reached out last week about [brief reminder of value prop], but I imagine my email got buried in your inbox (happens to the best of us!).",
                valueProposition: "The reason I'm following up is that I genuinely believe we could help [Company] [achieve specific outcome]. We've helped similar companies like [Client Name] achieve [specific measurable result].",
                alternativeApproach: "If now isn't the right time, I completely understand. Would it make sense to reconnect in [timeframe - e.g., Q2, after your busy season]? Or if there's someone else on your team who handles [relevant area], I'd be happy to connect with them instead.",
                callToAction: "Just reply with 'Not interested' if this isn't a fit, and I'll stop bothering you. Otherwise, I'd love to grab 10 minutes on your calendar.",
                signOff: "Thanks for considering,\n[Your Name]\n[Your Title]\n[Company]"
            }
        },
        {
            id: "email_demo_invitation",
            title: "Product Demo Invitation Email",
            category: "sales_email",
            description: "Compelling invitation to schedule a product demo",
            tags: ["demo", "product", "invitation"],
            content: {
                subject: "See how [Company Name] can [achieve specific outcome] in 20 minutes",
                greeting: "Hi [First Name],",
                opening: "Thanks for your interest in [Product Name]! I'd love to show you exactly how we can help [Company] [solve specific problem or achieve goal].",
                valueProposition: "In a quick 20-minute demo, I'll show you:\n• How to [specific feature/benefit #1]\n• The exact process [Client Name] used to [achieve result]\n• A personalized roadmap for implementing this at [Company]\n• Live Q&A to address your specific use case",
                socialProof: "Companies like [Client 1], [Client 2], and [Client 3] have seen [specific results - e.g., 40% time savings, 3x ROI] within the first 90 days.",
                callToAction: "I have a few slots available this week:\n• [Day] at [Time]\n• [Day] at [Time]\n• [Day] at [Time]\n\nJust reply with what works best, or grab time directly on my calendar: [Calendar Link]",
                signOff: "Looking forward to it!\n[Your Name]\n[Your Title]\n[Company]\nP.S. - If you have specific questions or use cases you'd like me to address, just let me know and I'll tailor the demo accordingly."
            }
        },
        {
            id: "email_proposal_followup",
            title: "Proposal Follow-Up Email",
            category: "sales_email",
            description: "Strategic follow-up after sending a proposal",
            tags: ["proposal", "closing", "follow-up"],
            content: {
                subject: "Thoughts on the proposal for [Company]?",
                greeting: "Hi [First Name],",
                opening: "I wanted to follow up on the proposal I sent over last [day]. I hope you had a chance to review it with your team.",
                valueRecap: "Just to recap, the proposal outlines how we'll help [Company] [achieve specific goals] through [brief solution summary]. Based on our conversations, I tailored it specifically to address [their key pain points].",
                addressConcerns: "I know these decisions involve multiple stakeholders and careful consideration. If you have any questions, concerns about pricing, or need clarification on any aspect of the proposal, I'm here to help.",
                nextSteps: "What would be helpful at this stage?\n• A call to walk through the proposal together?\n• Adjustments to scope or timeline?\n• Additional case studies or references?\n• A conversation with our technical team?",
                callToAction: "Let me know what would be most valuable, and I'll make it happen. Are you available for a quick call this week to discuss?",
                signOff: "Best,\n[Your Name]\n[Your Title]\n[Company]\n[Phone]"
            }
        },
        {
            id: "email_referral_request",
            title: "Customer Referral Request Email",
            category: "sales_email",
            description: "Asking satisfied customers for referrals",
            tags: ["referral", "customer success", "networking"],
            content: {
                subject: "Quick favor? (It'll take 2 minutes)",
                greeting: "Hi [First Name],",
                opening: "I hope you're doing well! It's been [timeframe] since we started working together, and I'm thrilled to see [Company] achieving [specific results they've achieved with your product/service].",
                request: "I have a small favor to ask. As you know, we grow primarily through referrals from happy customers like you. If you know anyone who might benefit from [your solution] the way you have, I'd be incredibly grateful for an introduction.",
                makeItEasy: "To make this easy, I'm thinking of companies or people who:\n• Are in [industry/role]\n• Struggle with [specific pain point]\n• Are looking to [achieve specific outcome]\n\nEven just a warm intro via email would be amazing—I'll take it from there and make sure they're well taken care of.",
                incentive: "As a thank you, I'd love to [offer incentive - e.g., extend your subscription by a month, send a gift card, feature your success story, etc.].",
                callToAction: "If anyone comes to mind, just reply with their name and email (or make a quick intro), and I'll handle the rest. No pressure at all—I know you're busy!",
                signOff: "Thanks so much for being an awesome customer,\n[Your Name]\n[Your Title]\n[Company]"
            }
        }
    ],

    pitch_outline: [
        {
            id: "pitch_investor_deck",
            title: "Investor Pitch Deck Outline",
            category: "pitch_outline",
            description: "Comprehensive outline for investor pitch presentations",
            tags: ["investor", "funding", "startup", "pitch deck"],
            content: {
                title: "Investor Pitch Deck: [Company Name]",
                subtitle: "Raising [Amount] to [Achieve Specific Goal]",
                slides: [
                    { slide: "1. Cover", content: "Company name, tagline, your name/title, date, confidential notice" },
                    { slide: "2. The Problem", content: "Paint a vivid picture of the pain point. Use statistics, customer quotes, and real-world examples. Make it personal and urgent." },
                    { slide: "3. The Solution", content: "Introduce your product/service as the hero. Show how it elegantly solves the problem. Include a demo screenshot or product visual." },
                    { slide: "4. Market Opportunity", content: "TAM, SAM, SOM breakdown. Show market size, growth rate, and your wedge strategy. Use credible sources." },
                    { slide: "5. Product Demo", content: "Show, don't tell. Walk through key features and user experience. Highlight your unique value proposition." },
                    { slide: "6. Business Model", content: "How you make money. Pricing strategy, unit economics, LTV:CAC ratio, path to profitability." },
                    { slide: "7. Traction", content: "Prove momentum: revenue growth, user metrics, partnerships, press coverage. Show hockey stick growth if possible." },
                    { slide: "8. Go-to-Market Strategy", content: "Customer acquisition channels, sales process, marketing strategy, partnerships. Show what's working." },
                    { slide: "9. Competitive Landscape", content: "Positioning map showing you in the top-right corner. Explain your defensible moat and competitive advantages." },
                    { slide: "10. Team", content: "Highlight relevant experience, domain expertise, previous exits. Show why you're the right team to execute." },
                    { slide: "11. Financial Projections", content: "3-5 year projections: revenue, expenses, profitability. Be ambitious but realistic. Show key assumptions." },
                    { slide: "12. The Ask", content: "How much you're raising, what you'll use it for (specific milestones), expected runway, and next funding round." }
                ],
                tips: "Keep it to 12-15 slides max. Tell a story. Use visuals over text. Practice until you can deliver in 10-12 minutes. Anticipate tough questions."
            }
        },
        {
            id: "pitch_sales_presentation",
            title: "Enterprise Sales Pitch Outline",
            category: "pitch_outline",
            description: "Structured outline for B2B sales presentations",
            tags: ["sales", "B2B", "enterprise", "presentation"],
            content: {
                title: "Enterprise Sales Presentation: [Product Name]",
                subtitle: "Solving [Client's Problem] for [Client Company]",
                slides: [
                    { slide: "1. Agenda", content: "Set expectations: 'Today we'll cover your challenges, our solution, implementation, and next steps. Should take about 30 minutes with time for questions.'" },
                    { slide: "2. Understanding Your Challenges", content: "Recap discovery call insights. Show you understand their specific pain points, current state, and desired outcomes. Get confirmation." },
                    { slide: "3. Our Approach", content: "High-level overview of your methodology. Explain your philosophy and why it works. Build credibility." },
                    { slide: "4. The Solution", content: "Tailored demo showing exactly how your product solves their specific problems. Use their terminology and use cases." },
                    { slide: "5. Why Us", content: "Differentiation: What makes you different from competitors they're considering. Focus on outcomes, not features." },
                    { slide: "6. Proof Points", content: "Case studies from similar companies. Specific results with numbers. Customer testimonials. Industry recognition." },
                    { slide: "7. Implementation Roadmap", content: "Clear timeline from contract to go-live. Show you've done this before. Address their concerns about disruption." },
                    { slide: "8. Investment & ROI", content: "Transparent pricing. ROI calculator showing payback period. Total cost of ownership vs. current state." },
                    { slide: "9. Next Steps", content: "Clear path forward: pilot program, contract terms, timeline, stakeholder alignment. Make it easy to say yes." }
                ],
                tips: "Customize heavily for each prospect. Ask questions throughout. Handle objections proactively. Always tie features back to their specific business outcomes."
            }
        },
        {
            id: "pitch_partnership",
            title: "Strategic Partnership Pitch Outline",
            category: "pitch_outline",
            description: "Outline for proposing strategic business partnerships",
            tags: ["partnership", "collaboration", "B2B"],
            content: {
                title: "Strategic Partnership Proposal: [Your Company] + [Partner Company]",
                subtitle: "Creating Mutual Value Through Collaboration",
                slides: [
                    { slide: "1. Introduction", content: "Brief intro to your company, your mission, and why you're excited about a potential partnership with them." },
                    { slide: "2. The Opportunity", content: "Market opportunity that neither company can fully capture alone. Show the white space and potential." },
                    { slide: "3. Why Partner?", content: "Explain strategic fit: complementary strengths, shared target customers, aligned values. Show 1+1=3." },
                    { slide: "4. Partnership Vision", content: "Paint a picture of what success looks like. Joint value proposition. How customers benefit." },
                    { slide: "5. Proposed Partnership Model", content: "Specific collaboration structure: co-marketing, integration, reseller, referral, or joint product. Be clear and specific." },
                    { slide: "6. Value to [Partner Company]", content: "What's in it for them: new revenue stream, customer value-add, market expansion, competitive advantage." },
                    { slide: "7. Value to [Your Company]", content: "Be transparent about your benefits: distribution, credibility, product enhancement, market access." },
                    { slide: "8. Success Stories", content: "Examples of similar partnerships you've done. Results achieved. Testimonials from other partners." },
                    { slide: "9. Implementation Plan", content: "Phased approach: pilot, scale, optimize. Timeline, resources needed, key milestones." },
                    { slide: "10. Next Steps", content: "Proposed timeline for decision, pilot program details, key stakeholders to involve, follow-up meeting." }
                ],
                tips: "Focus on mutual value, not just what you need. Come with a specific proposal, not just an idea. Show you've done your homework on their business."
            }
        },
        {
            id: "pitch_conference_talk",
            title: "Conference Talk Pitch Outline",
            category: "pitch_outline",
            description: "Outline for pitching a conference or event speaking proposal",
            tags: ["conference", "speaking", "thought leadership"],
            content: {
                title: "Conference Talk Proposal: [Talk Title]",
                subtitle: "For [Conference Name] [Year]",
                sections: [
                    { section: "Talk Title", content: "Compelling, specific, benefit-driven. Example: 'How We Scaled to 10M Users Without Burning Out: A Framework for Sustainable Growth'" },
                    { section: "Abstract (150 words)", content: "Hook them in the first sentence. Clearly state the problem, your unique perspective, and what attendees will learn. Make it actionable." },
                    { section: "Key Takeaways", content: "3-5 specific, actionable insights attendees will walk away with. Use bullet points. Be concrete, not vague." },
                    { section: "Target Audience", content: "Who is this for? What level (beginner/intermediate/advanced)? What roles? What problems do they face?" },
                    { section: "Why This Matters Now", content: "Timeliness: Why is this topic relevant right now? Tie to industry trends, recent events, or emerging challenges." },
                    { section: "Your Unique Perspective", content: "What makes you qualified to speak on this? Specific experience, results achieved, research conducted, or unique approach." },
                    { section: "Talk Format", content: "Presentation style: keynote, workshop, panel, fireside chat. Interactive elements. Estimated duration." },
                    { section: "Supporting Materials", content: "What you'll provide: slides, handouts, code samples, templates, resource lists." },
                    { section: "Previous Speaking Experience", content: "Past talks with links to videos or slides. Audience size. Feedback scores. Media mentions." },
                    { section: "Why This Conference", content: "Show you've done research. Explain why your talk fits their audience and theme. Reference past talks you admired." }
                ],
                tips: "Conference organizers get hundreds of proposals. Be specific, not generic. Show proven speaking ability. Make it easy for them to say yes by providing everything they need."
            }
        },
        {
            id: "pitch_media_story",
            title: "Media Story Pitch Outline",
            category: "pitch_outline",
            description: "Outline for pitching stories to journalists and media outlets",
            tags: ["PR", "media", "journalism", "press"],
            content: {
                title: "Media Pitch: [Story Angle]",
                subtitle: "For [Publication Name] / [Journalist Name]",
                sections: [
                    { section: "Subject Line", content: "Make it irresistible and specific. Example: 'EXCLUSIVE: How [Company] Reduced Carbon Emissions by 80% Using AI' or 'Data: Remote Work Productivity Myths Debunked'" },
                    { section: "Personalized Opening", content: "Reference their recent article or beat. Show you're a real reader, not mass-emailing. One sentence max." },
                    { section: "The Hook", content: "Lead with the most newsworthy angle. What's surprising, contrarian, timely, or exclusive? Make them want to keep reading." },
                    { section: "Why Now", content: "Tie to current events, trends, or news cycle. Explain why this story matters to their readers right now." },
                    { section: "The Story", content: "2-3 paragraphs with the full narrative. Include data, quotes, human interest angle. Make it easy for them to visualize the article." },
                    { section: "What Makes It Unique", content: "Why hasn't this been covered before? What's your exclusive angle, data, or access?" },
                    { section: "Sources & Data", content: "Who they can interview. What data/research you can provide. Exclusive access you're offering." },
                    { section: "Visuals Available", content: "Photos, videos, infographics, charts. Journalists love stories with strong visual elements." },
                    { section: "Timing", content: "Any time sensitivity? Embargo date? When sources are available for interviews?" },
                    { section: "Your Credentials", content: "Brief bio establishing your credibility. Previous media mentions. Why you're the right source." }
                ],
                tips: "Keep it under 200 words. Journalists get 100+ pitches daily. Be newsworthy, not promotional. Offer exclusive angles. Follow up once, then move on. Build relationships, not one-off pitches."
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
