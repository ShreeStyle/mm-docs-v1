// SaaS Plan Configuration
const PLANS = {
  free: {
    name: "Free Plan",
    price: 0,
    currency: "INR",
    billingCycle: "monthly",
    features: {
      documentsPerMonth: 10,
      watermark: false,
      brandKit: false,
      aiQuality: "basic",
      exports: {
        pdf: true,
        docx: false,
        html: false,
      },
      exportLimit: 10, // Max exports per month
      templates: {
        basic: true,
        premium: false,
      },
      support: "community",
      processingPriority: "standard",
    },
    limits: {
      documents: 10,
      exports: 10,
      aiTokens: 2000, // Lower quality AI
    },
    description: "Perfect for trying out MM Docs",
    cta: "Get Started Free",
  },
  pro: {
    name: "Pro Plan",
    price: 999,
    currency: "INR",
    billingCycle: "monthly",
    features: {
      documentsPerMonth: -1, // Unlimited (-1 indicates no limit)
      watermark: false,
      brandKit: true,
      aiQuality: "premium",
      exports: {
        pdf: true,
        docx: true,
        html: true,
      },
      exportLimit: -1, // Unlimited
      templates: {
        basic: true,
        premium: true,
      },
      support: "priority",
      processingPriority: "high",
    },
    limits: {
      documents: -1, // Unlimited
      exports: -1, // Unlimited
      aiTokens: 8000, // Higher quality AI
    },
    description: "Unlimited professional documents without watermarks",
    cta: "Upgrade to Pro",
    benefits: [
      "Unlimited document generation",
      "No watermarks on exports",
      "Full Brand Kit customization",
      "Premium AI quality",
      "PDF, DOCX, HTML exports",
      "Priority processing",
      "Priority email support",
    ],
  },
};

// Helper functions
const getPlanFeatures = (planName) => {
  return PLANS[planName]?.features || PLANS.free.features;
};

const getPlanLimits = (planName) => {
  return PLANS[planName]?.limits || PLANS.free.limits;
};

const canGenerateDocument = (user) => {
  const plan = PLANS[user.plan] || PLANS.free;
  const limit = plan.limits.documents;
  
  // Unlimited for pro
  if (limit === -1) return { allowed: true, remaining: -1 };
  
  // Check monthly limit for free
  const used = user.documentsGeneratedThisMonth || 0;
  const remaining = limit - used;
  
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: limit,
    used: used,
  };
};

const canExportDocument = (user, exportCount = 0) => {
  const plan = PLANS[user.plan] || PLANS.free;
  const limit = plan.limits.exports;
  
  // Unlimited for pro
  if (limit === -1) return { allowed: true, remaining: -1 };
  
  // Check export limit
  const remaining = limit - exportCount;
  
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    limit: limit,
  };
};

const shouldAddWatermark = (user) => {
  // Watermark disabled for all users
  return false;
};

const canUseBrandKit = (user) => {
  const plan = PLANS[user.plan] || PLANS.free;
  return plan.features.brandKit === true;
};

const getAIQuality = (user) => {
  const plan = PLANS[user.plan] || PLANS.free;
  return plan.features.aiQuality || "basic";
};

const canExportFormat = (user, format) => {
  const plan = PLANS[user.plan] || PLANS.free;
  return plan.features.exports[format] === true;
};

module.exports = {
  PLANS,
  getPlanFeatures,
  getPlanLimits,
  canGenerateDocument,
  canExportDocument,
  shouldAddWatermark,
  canUseBrandKit,
  getAIQuality,
  canExportFormat,
};
