import React, { useEffect, useState, useCallback } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
}

export function TableOfContents({ contentRef }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Extract headings from content
  useEffect(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll('h2, h3');
    const tocItems: TocItem[] = [];
    headings.forEach((h, i) => {
      const id = h.id || `section-${i}`;
      if (!h.id) h.id = id;
      tocItems.push({
        id,
        text: h.textContent || '',
        level: h.tagName === 'H3' ? 3 : 2,
      });
    });
    setItems(tocItems);
  }, [contentRef]);

  // Track active heading on scroll
  const handleScroll = useCallback(() => {
    if (!items.length) return;
    let current = items[0]?.id || '';
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el && el.getBoundingClientRect().top <= 120) {
        current = item.id;
      }
    }
    setActiveId(current);
  }, [items]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (items.length < 2) return null;

  const tocList = (
    <ul className="space-y-1.5 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setMobileOpen(false);
            }}
            className={`block py-1 transition-colors ${
              item.level === 3 ? 'pl-4' : ''
            } ${
              activeId === item.id
                ? 'text-primary font-medium border-l-2 border-primary pl-3'
                : 'text-muted-foreground hover:text-foreground border-l-2 border-transparent pl-3'
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Desktop: sticky sidebar */}
      <nav className="hidden xl:block" aria-label="Table of contents">
        <div className="sticky top-20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            In this article
          </p>
          {tocList}
        </div>
      </nav>

      {/* Mobile: collapsible */}
      <nav className="xl:hidden mb-8 border border-border rounded-xl overflow-hidden" aria-label="Table of contents">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 text-sm font-medium text-foreground"
        >
          <span>📑 In this article ({items.length} sections)</span>
          <span className={`transition-transform ${mobileOpen ? 'rotate-180' : ''}`}>▾</span>
        </button>
        {mobileOpen && (
          <div className="px-4 py-3 bg-background">
            {tocList}
          </div>
        )}
      </nav>
    </>
  );
}
