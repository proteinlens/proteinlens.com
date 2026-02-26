import { Link } from 'react-router-dom'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block border-t border-border bg-card/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-base">🍽️</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                ProteinLens
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm">
              AI-powered nutrition tracking. Snap a photo of your meal and get instant protein and calorie analysis.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                  History
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="text-muted-foreground hover:text-foreground transition-colors">
                  Methodology
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-muted-foreground hover:text-foreground transition-colors">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} ProteinLens. All rights reserved.
          </p>
        </div>
      </div>

      {/* Luca Berton Network */}
      <div style={{ borderTop: '1px solid #334155', padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
          {[
            { href: 'https://lucaberton.com/', title: 'AI & Cloud Advisor', label: 'Luca Berton', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> },
            { href: 'https://www.ansiblepilot.com/', title: '772+ Ansible Tutorials', label: 'Ansible Pilot', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg> },
            { href: 'https://www.ansiblebyexample.com/', title: 'Ansible Books & Resources', label: 'Ansible by Example', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
            { href: 'https://www.openempower.com/', title: 'AI Platform Engineering Consultancy', label: 'Open Empower', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> },
            { href: 'https://kubernetes.recipes/', title: 'Kubernetes Recipe Book', label: 'K8s Recipes', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
            { href: 'https://www.terraformpilot.com/', title: 'Terraform Automation Mastery', label: 'Terraform Pilot', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg> },
            { href: 'https://www.copypastelearn.com/', title: 'Learn IT by Doing', label: 'CopyPasteLearn', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
            { href: 'https://www.proteinlens.com/', title: 'AI Macro Nutrition Tracker', label: 'ProteinLens', active: true, icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg> },
          ].map((site) => (
            <a
              key={site.href}
              href={site.href}
              title={site.title}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                site.active
                  ? 'text-blue-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {site.icon}
              {site.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
