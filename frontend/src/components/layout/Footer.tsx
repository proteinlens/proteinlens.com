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

      {/* Network */}
      <div style={{ padding: '10px 16px 8px', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px 6px', maxWidth: 720, margin: '0 auto' }}>
          {[
            { href: 'https://lucaberton.com/', label: 'Luca Berton' },
            { href: 'https://www.ansiblepilot.com/', label: 'Ansible Pilot' },
            { href: 'https://www.ansiblebyexample.com/', label: 'Ansible by Example' },
            { href: 'https://www.openempower.com/', label: 'Open Empower' },
            { href: 'https://kubernetes.recipes/', label: 'K8s Recipes' },
            { href: 'https://www.terraformpilot.com/', label: 'Terraform Pilot' },
            { href: 'https://www.copypastelearn.com/', label: 'CopyPasteLearn' },
            { href: 'https://www.proteinlens.com/', label: 'ProteinLens', active: true },
            { href: 'https://www.techmeout.it/', label: 'TechMeOut' },
          ].map((site, i) => (
            <span key={site.href} style={{ display: 'inline-flex', alignItems: 'center' }}>
              {i > 0 && <span style={{ fontSize: 10, opacity: 0.25, marginRight: 6 }}>·</span>}
              <a
                href={site.href}
                title={site.label}
                style={{ fontSize: 10, color: 'inherit', opacity: site.active ? 0.5 : 0.4, textDecoration: 'none', transition: 'opacity .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = site.active ? '0.5' : '0.4'; }}
              >
                {site.label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
