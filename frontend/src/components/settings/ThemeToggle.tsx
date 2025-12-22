import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { getCardVariants, getPageTransition } from '@/utils/animations';

type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: 'light', label: 'Light', icon: '☀️' },
  { mode: 'dark', label: 'Dark', icon: '🌙' },
  { mode: 'system', label: 'System', icon: '⚙️' },
];

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const cardVariants = getCardVariants();
  const transition = getPageTransition();

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      transition={transition}
      className="bg-card border border-border rounded-lg p-6 space-y-4"
    >
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Appearance
        </label>
        <p className="text-sm text-muted-foreground">
          Choose how ProteinLens looks on your device
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {THEME_OPTIONS.map(({ mode, label, icon }) => (
          <motion.button
            key={mode}
            onClick={() => setTheme(mode)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-lg',
              'border-2 transition-all cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              theme === mode
                ? 'border-primary bg-primary/10'
                : 'border-border bg-background hover:border-primary/50'
            )}
          >
            <span className="text-2xl">{icon}</span>
            <span className="text-xs font-medium">{label}</span>
            {theme === mode && (
              <span className="text-xs text-primary font-bold">✓</span>
            )}
          </motion.button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        {theme === 'system' && '⚠️ Using system preference'}
        {theme === 'light' && '💡 Light mode enabled'}
        {theme === 'dark' && '🌑 Dark mode enabled'}
      </p>
    </motion.div>
  );
};
