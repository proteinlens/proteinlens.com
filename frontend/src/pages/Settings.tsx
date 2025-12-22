import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { GoalInput } from '@/components/settings/GoalInput';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { getPageVariants, getPageTransition } from '@/utils/animations';

export function Settings() {
  const pageVariants = getPageVariants();
  const pageTransition = getPageTransition();

  return (
    <PageContainer>
      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
        className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20"
      >
        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your ProteinLens experience
          </p>
        </div>

        {/* Goal Setting Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Nutrition</h2>
          <GoalInput />
        </section>

        {/* Appearance Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          <ThemeToggle />
        </section>

        {/* Account Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Account</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">user@example.com</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Subscription</p>
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">Free Plan</p>
                <Button variant="outline" size="sm">
                  Upgrade
                </Button>
              </div>
            </div>

            <hr className="border-border" />

            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Version:</strong> 1.0.0-beta
              </p>
              <p className="text-xs text-muted-foreground">
                Built with React, TypeScript, and Tailwind CSS
              </p>
            </div>
          </div>
        </section>

        {/* Export Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Data</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Export your meal history as CSV for backup or analysis
            </p>
            <Button variant="outline" className="w-full">
              📥 Export Meals (CSV)
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
          <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground">
              Permanently delete all your data and meal history
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm('Are you sure? This cannot be undone.')) {
                  // TODO: Implement delete all data
                  console.log('Delete all data');
                }
              }}
            >
              🗑️ Delete All Data
            </Button>
          </div>
        </section>
      </motion.div>
    </PageContainer>
  );
}
