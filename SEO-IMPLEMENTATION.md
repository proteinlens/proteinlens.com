# ProteinLens SEO Implementation Guide

## 🚨 Current State (February 2026)

**Ahrefs Report:**
- Crawled pages: 0
- Keywords: 0  
- Traffic: 0
- DR: 0.4
- Referring domains: 4

**Root Causes:**
1. ❌ Site is 100% client-side rendered (React SPA)
2. ❌ Most content is behind authentication
3. ❌ Bots see empty HTML shell
4. ❌ Brand confusion with academic "ProteinLens" (proteinlens.io)

---

## 📊 Current Pages Audit

### ✅ Keep & Index (Public, SEO-valuable)
| Route | Status | Priority | Notes |
|-------|--------|----------|-------|
| `/` | ✅ Has content | 1.0 | Landing page - needs SSR or prerender |
| `/pricing` | ✅ Has content | 0.8 | Pricing page - needs SEO meta |
| `/protein-calculator` | ✅ Has content | 0.9 | **High SEO value** - calculator page |
| `/privacy` | ✅ Has content | 0.3 | Trust signal |
| `/terms` | ✅ Has content | 0.3 | Trust signal |
| `/meal/:shareId` | ✅ Dynamic | 0.7 | Shareable meals (social traffic) |

### 🚫 Noindex (Auth/Transactional)
| Route | Reason |
|-------|--------|
| `/login` | Auth page - no SEO value |
| `/signup` | Auth page - no SEO value |
| `/signup-legacy` | Deprecated |
| `/reset-password` | Auth page |
| `/verify-email` | Auth page |
| `/resend-verification` | Auth page |
| `/invite/:token` | Auth page |

### 🔒 Protected Routes (Behind Auth - robots.txt blocked)
| Route | Reason |
|-------|--------|
| `/history` | User data |
| `/settings` | User data |
| `/settings/sessions` | User data |
| `/billing/success` | Transactional |

---

## 🚀 New Pages to Create (Priority Order)

### Phase 1: Core Landing Pages (Days 1-3)

| Page | Route | Target Keywords | Priority |
|------|-------|-----------------|----------|
| **How It Works** | `/how-it-works` | how to track macros from photo, AI food scanner | HIGH |
| **Features** | `/features` | macro tracker app, protein tracking app features | HIGH |
| **About** | `/about` | ProteinLens AI nutrition tracker (brand disambiguation) | MEDIUM |

### Phase 2: Calculator Pages (Days 4-7)

| Page | Route | Target Keywords | Priority |
|------|-------|-----------------|----------|
| **Macro Calculator** | `/macro-calculator` | macro calculator, macro split calculator, carb fat protein calculator | HIGH |
| **TDEE Calculator** | `/tdee-calculator` | tdee calculator, how many calories do i need | HIGH |
| **Calorie Calculator** | `/calorie-calculator` | daily calorie calculator, calorie needs | MEDIUM |

### Phase 3: Content/Blog Pages (Days 8-14)

| Page | Route | Target Keywords | Priority |
|------|-------|-----------------|----------|
| **Blog Index** | `/guides` | nutrition guides, macro tracking tips | HIGH |
| **How to Track Macros** | `/guides/how-to-track-macros` | how to track macros, beginner macro tracking | HIGH |
| **Protein per Day** | `/guides/protein-per-day` | how much protein per day, protein requirements | HIGH |
| **Photo vs Manual Tracking** | `/guides/photo-vs-manual-tracking` | macro tracking apps compared | MEDIUM |
| **High Protein Meal Prep** | `/guides/high-protein-meal-prep` | high protein lunches, meal prep macros | MEDIUM |
| **Accuracy Methodology** | `/methodology` | how accurate is AI food tracking | MEDIUM |

---

## 🔧 Technical SEO Fixes

### 1. robots.txt (Updated)

```txt
# ProteinLens robots.txt
User-agent: *
Allow: /
Allow: /pricing
Allow: /protein-calculator
Allow: /macro-calculator
Allow: /tdee-calculator
Allow: /calorie-calculator
Allow: /how-it-works
Allow: /features
Allow: /about
Allow: /guides
Allow: /guides/*
Allow: /methodology
Allow: /privacy
Allow: /terms
Allow: /meal/*

# Disallow auth and user-specific pages
Disallow: /login
Disallow: /signup
Disallow: /signup-legacy
Disallow: /reset-password
Disallow: /verify-email
Disallow: /resend-verification
Disallow: /invite/
Disallow: /history
Disallow: /settings
Disallow: /billing/
Disallow: /api/

# Sitemap
Sitemap: https://www.proteinlens.com/sitemap.xml

# Social media crawlers - allow shareable content
User-agent: facebookexternalhit
Allow: /
Allow: /meal/*

User-agent: Twitterbot
Allow: /
Allow: /meal/*

User-agent: LinkedInBot
Allow: /
Allow: /meal/*

# Block AI training crawlers (privacy)
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /
```

### 2. sitemap.xml (Updated)

See updated file: `/frontend/public/sitemap.xml`

### 3. Meta Tags Strategy

Every public page should have:
- Unique `<title>` with primary keyword + brand
- Unique `<meta name="description">` (150-160 chars)
- Canonical URL
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)

### 4. Structured Data Types

| Page Type | Schema |
|-----------|--------|
| Homepage | `WebApplication`, `Organization` |
| Calculator pages | `WebApplication`, `FAQPage` |
| Guide/Blog pages | `Article`, `FAQPage` |
| About page | `Organization`, `AboutPage` |
| Pricing page | `Product`, `Offer` |

---

## 🎯 Brand Disambiguation Strategy

**Problem:** Academic "ProteinLens" (proteinlens.io) = protein allosteric signalling research

**Solution:**

1. **Title tags always include:** "AI Macro Nutrition Tracker" or "Food Photo Analyzer"
2. **About page:** Clear company/product story differentiating from academic project
3. **Schema markup:** `SoftwareApplication` with `applicationCategory: "HealthApplication"`
4. **Consistent messaging:** "ProteinLens - AI Macro Nutrition Tracker"

---

## 📝 Content Guidelines

### Sourcing & Citations

For nutrition data, cite these authoritative sources:
- **USDA FoodData Central**: https://fdc.nal.usda.gov/
- **EFSA (European Food Safety Authority)**: Protein reference intakes
- **NCBI DRI Tables**: Dietary Reference Intakes

### Content Templates

#### Calculator Page Template
```
H1: [Calculator Name] Calculator
Introduction: 1-2 sentences explaining the calculator
Calculator Component: Interactive tool
How It Works: 2-3 paragraphs explaining methodology
FAQ Section: 5-8 common questions (FAQPage schema)
Related Calculators: Internal links
CTA: Try ProteinLens for photo-based tracking
```

#### Guide Page Template
```
H1: [How-to / Guide Title]
Introduction: Problem + solution overview
Main Content: Step-by-step or detailed explanation
Key Takeaways: Bullet points
Related Guides: Internal links
CTA: Start tracking with ProteinLens
```

---

## 🔗 Link Building Strategy (Days 11-14)

### Quick Wins (Week 2)
1. **Product Hunt / BetaList**: Launch announcement
2. **Fitness subreddits**: r/fitness, r/nutrition (helpful answers, not spam)
3. **Alternative.to / G2 / Capterra**: Product listings
4. **GitHub**: Open-source components or methodology doc

### Medium-term (Month 2-3)
1. **Guest posts**: Fitness blogs looking for "best macro tracker" content
2. **Trainer partnerships**: Case studies with fitness coaches
3. **Tool roundup outreach**: "Best macro tracking apps" articles

---

## 📅 14-Day Execution Plan

### Days 1-3: Indexability Foundation
- [ ] Update robots.txt
- [ ] Update sitemap.xml
- [ ] Create `/how-it-works` page
- [ ] Create `/features` page  
- [ ] Create `/about` page
- [ ] Add SEO component with structured data
- [ ] Submit to Google Search Console
- [ ] Submit sitemap

### Days 4-7: Calculator Pages
- [ ] Create `/macro-calculator` page
- [ ] Create `/tdee-calculator` page
- [ ] Enhance `/protein-calculator` with FAQs and schema
- [ ] Add internal linking between calculators

### Days 8-10: Content Foundation
- [ ] Create `/guides` index page
- [ ] Create 3-4 guide articles
- [ ] Add internal linking (each guide → 2-3 others + calculator)

### Days 11-14: Authority Building
- [ ] Submit to Product Hunt
- [ ] Create `/methodology` page (citation-worthy)
- [ ] Outreach to 10 link targets
- [ ] Monitor GSC for indexing status

---

## 🛠 Implementation Files to Create/Update

### New Pages
- `frontend/src/pages/HowItWorksPage.tsx`
- `frontend/src/pages/FeaturesPage.tsx`
- `frontend/src/pages/AboutPage.tsx`
- `frontend/src/pages/MacroCalculatorPage.tsx`
- `frontend/src/pages/TDEECalculatorPage.tsx`
- `frontend/src/pages/GuidesIndexPage.tsx`
- `frontend/src/pages/guides/*.tsx` (individual articles)
- `frontend/src/pages/MethodologyPage.tsx`

### Components
- `frontend/src/components/seo/SEOHead.tsx` - Reusable SEO component
- `frontend/src/components/seo/StructuredData.tsx` - JSON-LD generator
- `frontend/src/components/calculators/MacroCalculator.tsx`
- `frontend/src/components/calculators/TDEECalculator.tsx`

### Updated Files
- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`
- `frontend/src/App.tsx` - Add new routes
- `frontend/index.html` - Update default meta tags

---

## ⚠️ Pre-rendering Consideration

**Current issue:** React SPA renders client-side only. Bots see empty HTML.

**Solutions (choose one):**

1. **Prerender.io / Rendertron** (Quickest)
   - Service that serves pre-rendered HTML to bots
   - No code changes needed
   - ~$9-15/month

2. **vite-plugin-ssr** (Medium effort)
   - Add SSR/SSG to existing Vite app
   - Requires some refactoring

3. **Migrate to Next.js/Astro** (Highest effort, best long-term)
   - Full SSR/SSG support
   - Significant migration effort

**Recommendation:** Start with Prerender.io for immediate results, plan migration to Next.js for Phase 2.

---

## 📊 Success Metrics

| Metric | Current | Week 2 Target | Month 1 Target |
|--------|---------|---------------|----------------|
| Crawled pages (Ahrefs) | 0 | 10-15 | 50+ |
| Indexed pages (GSC) | 0 | 10-15 | 50+ |
| Keywords ranking | 0 | 5-10 | 50+ |
| Organic traffic | 0 | 50/month | 500/month |
| Referring domains | 4 | 10 | 25 |

---

## Next Steps

1. Run `npm run build` and check if pages have any HTML content for bots
2. Consider implementing prerender service
3. Start with Phase 1 pages
4. Submit to GSC immediately after deployment
