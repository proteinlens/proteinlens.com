/**
 * NotFoundPage Component
 * 
 * Fun, engaging 404 page with protein/nutrition theme.
 */

import { FC, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const funMessages = [
  {
    emoji: '🥩',
    title: "This page has gone missing like protein from a vegan buffet",
    subtitle: "Don't worry, we've got plenty of gains elsewhere!",
  },
  {
    emoji: '🍗',
    title: "404: Page Not Found in Our Macro Database",
    subtitle: "This URL has fewer results than a salad's protein content",
  },
  {
    emoji: '🥚',
    title: "Oops! This page is scrambled",
    subtitle: "Unlike your protein goals, this URL is cracked",
  },
  {
    emoji: '🏋️',
    title: "Even we can't lift this page",
    subtitle: "It's too heavy... wait, no, it just doesn't exist",
  },
  {
    emoji: '🧬',
    title: "DNA Error: Page Sequence Not Found",
    subtitle: "This amino acid chain leads nowhere",
  },
  {
    emoji: '🍖',
    title: "This page got eaten before we could serve it",
    subtitle: "Must have been high in protein!",
  },
  {
    emoji: '💪',
    title: "Gains not found at this location",
    subtitle: "But don't skip leg day—or checking your URL!",
  },
  {
    emoji: '🥛',
    title: "404: No whey!",
    subtitle: "This page has been filtered out of existence",
  },
];

export const NotFoundPage: FC = () => {
  const location = useLocation();
  const [message] = useState(() => 
    funMessages[Math.floor(Math.random() * funMessages.length)]
  );
  const [bounce, setBounce] = useState(false);

  // Bounce animation on load
  useEffect(() => {
    setBounce(true);
    const timer = setTimeout(() => setBounce(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg mx-auto">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <div className={`text-[150px] sm:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-accent to-primary leading-none select-none ${bounce ? 'animate-bounce' : ''}`}>
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className={`text-6xl sm:text-8xl ${bounce ? 'animate-spin' : 'hover:animate-spin'} transition-transform cursor-pointer`}
              role="img"
              aria-label="emoji"
            >
              {message.emoji}
            </span>
          </div>
        </div>

        {/* Fun message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {message.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          {message.subtitle}
        </p>

        {/* Current path (for debugging) */}
        <div className="mb-8 px-4 py-2 bg-secondary/50 rounded-lg inline-block">
          <code className="text-sm text-muted-foreground">
            {location.pathname}
          </code>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            <span>🏠</span>
            <span>Back to Home</span>
          </Link>
          
          <Link
            to="/history"
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-foreground font-semibold rounded-xl border border-primary/20 hover:bg-secondary/80 hover:scale-105 transition-all duration-300"
          >
            <span>📊</span>
            <span>View History</span>
          </Link>
        </div>

        {/* Fun facts */}
        <div className="mt-12 p-6 bg-gradient-to-br from-secondary/30 to-primary/5 rounded-2xl border border-primary/10">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            🧠 While you're here, did you know?
          </p>
          <p className="text-foreground">
            The average adult needs about <strong className="text-primary">0.8g of protein per kg</strong> of body weight daily. 
            Athletes may need up to <strong className="text-primary">2g per kg</strong>!
          </p>
        </div>

        {/* Help link */}
        <p className="mt-8 text-sm text-muted-foreground">
          Think this is a mistake?{' '}
          <a 
            href="mailto:support@proteinlens.com" 
            className="text-primary hover:underline"
          >
            Let us know
          </a>
        </p>
      </div>
    </main>
  );
};

export default NotFoundPage;
