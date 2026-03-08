import React from 'react';
import { Link } from 'react-router-dom';

export function MidArticleCTA() {
  return (
    <div className="not-prose my-10 border-l-4 border-primary bg-primary-50/60 rounded-r-xl p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-1">
            Try it yourself
          </p>
          <p className="text-base text-foreground font-medium leading-snug">
            ProteinLens uses AI to analyze food photos and give you instant macro breakdowns — no manual logging needed.
          </p>
        </div>
        <Link
          to="/"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          📸 Try Free
        </Link>
      </div>
    </div>
  );
}
