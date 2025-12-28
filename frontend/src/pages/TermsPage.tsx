// Terms of Service Page
import React from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import './TermsPage.css';

export const TermsPage: React.FC = () => {
  return (
    <PageContainer>
      <div className="terms-page max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using ProteinLens, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">2. Use License</h2>
            <p className="text-muted-foreground mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on ProteinLens for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on ProteinLens</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">3. Disclaimer</h2>
            <p className="text-muted-foreground mb-3">
              The materials on ProteinLens are provided on an "as is" basis. ProteinLens makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-muted-foreground">
              Further, ProteinLens does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its Internet web site or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">4. Limitations</h2>
            <p className="text-muted-foreground">
              In no event shall ProteinLens or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ProteinLens, even if ProteinLens or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">5. Accuracy of Materials</h2>
            <p className="text-muted-foreground">
              The materials appearing on ProteinLens could include technical, typographical, or photographic errors. ProteinLens does not warrant that any of the materials on our website are accurate, complete, or current. ProteinLens may make changes to the materials contained on our website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">6. Links</h2>
            <p className="text-muted-foreground">
              ProteinLens has not reviewed all of the sites linked to its Internet web site and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ProteinLens of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">7. Modifications</h2>
            <p className="text-muted-foreground">
              ProteinLens may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">8. Governing Law</h2>
            <p className="text-muted-foreground">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where ProteinLens is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">9. User Accounts</h2>
            <p className="text-muted-foreground mb-3">
              If you create an account on ProteinLens, you are responsible for maintaining the confidentiality of your account information and password, and you are responsible for all activities that occur under your account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Update your information as necessary</li>
              <li>Immediately notify us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">10. Payment Terms</h2>
            <p className="text-muted-foreground mb-3">
              If you subscribe to a paid plan on ProteinLens:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You authorize us to charge your payment method on a recurring basis</li>
              <li>Billing occurs at the beginning of each billing cycle</li>
              <li>You can cancel your subscription at any time</li>
              <li>Refunds for partial months are not provided</li>
            </ul>
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

export default TermsPage;
