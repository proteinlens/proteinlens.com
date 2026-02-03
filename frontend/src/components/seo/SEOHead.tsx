/**
 * SEO Head Component
 * 
 * Provides consistent meta tags, Open Graph, Twitter Cards, and structured data
 * for all public pages to improve search engine visibility.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noindex?: boolean;
  structuredData?: object;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
  };
}

const BASE_URL = 'https://www.proteinlens.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.svg`;
const SITE_NAME = 'ProteinLens';
const BRAND_SUFFIX = ' | ProteinLens - AI Macro Nutrition Tracker';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  canonical,
  keywords,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  noindex = false,
  structuredData,
  article,
}) => {
  const fullTitle = title.includes('ProteinLens') ? title : `${title}${BRAND_SUFFIX}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : BASE_URL);
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Article-specific meta (for blog posts) */}
      {article?.publishedTime && (
        <meta property="article:published_time" content={article.publishedTime} />
      )}
      {article?.modifiedTime && (
        <meta property="article:modified_time" content={article.modifiedTime} />
      )}
      {article?.author && (
        <meta property="article:author" content={article.author} />
      )}
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

/**
 * Common structured data generators
 */

export const generateWebApplicationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ProteinLens',
  description: 'AI-powered macronutrient analyzer. Upload food photos to instantly analyze protein, carbohydrates, and fat content.',
  url: BASE_URL,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'AI-powered food image analysis with GPT Vision',
    'Complete macronutrient breakdown (protein, carbs, fat)',
    'Calorie calculation with macro percentages',
    'Daily nutrition tracking',
    'Shareable meal results',
    'Diet profile support (Keto, Paleo, Vegan)',
    'Protein calculator',
    'Macro calculator',
  ],
  author: {
    '@type': 'Organization',
    name: 'ProteinLens',
    url: BASE_URL,
  },
});

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ProteinLens',
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.svg`,
  description: 'AI-powered macro nutrition tracking app. Snap photos to instantly analyze protein, carbs, and fat.',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@proteinlens.com',
    contactType: 'customer service',
  },
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  url: article.url,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    '@type': 'Organization',
    name: article.author || 'ProteinLens',
    url: BASE_URL,
  },
  publisher: {
    '@type': 'Organization',
    name: 'ProteinLens',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/favicon.svg`,
    },
  },
  image: article.image || DEFAULT_OG_IMAGE,
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export default SEOHead;
