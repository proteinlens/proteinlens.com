// Privacy Policy Page
import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import './PrivacyPage.css';

export const PrivacyPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="privacy-page max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              ProteinLens ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">We collect information in the following ways:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Email, password, profile information</li>
              <li><strong>Usage Data:</strong> Meal images, scan history, nutrition data</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
              <li><strong>Payment Information:</strong> Processed securely through Stripe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and improve our services</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send administrative and service-related emails</li>
              <li>Monitor and analyze service usage and trends</li>
              <li>Detect and prevent fraud and security issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Third-Party Services</h2>
            <p className="text-muted-foreground mb-3">We use third-party services including:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Azure Communication Services:</strong> For email delivery</li>
              <li><strong>Stripe:</strong> For payment processing</li>
              <li><strong>OpenAI:</strong> For nutrition analysis</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              These providers have their own privacy policies governing the use of your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="text-muted-foreground mt-3">
              <strong>Email:</strong> privacy@proteinlens.com
            </p>
          </section>

          <section className="border-t border-primary/10 pt-8">
            <p className="text-sm text-muted-foreground">
              Last updated: December 28, 2025
            </p>
          </section>
        </div>
      </div>
    </PageContainer>
  );
};

export default PrivacyPage;
