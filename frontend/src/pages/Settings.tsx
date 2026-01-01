import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageContainer } from '@/components/layout/PageContainer';
import { GoalInput } from '@/components/settings/GoalInput';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { getPageVariants, getPageTransition } from '@/utils/animations';
import { useAuth } from '@/contexts/AuthProvider';
import { useMeals } from '@/hooks/useMeal';
import { getUserId } from '@/utils/userId';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  
  // Use authenticated user ID if available, otherwise fall back to localStorage ID
  const userId = useMemo(() => {
    if (user?.id) return user.id;
    try {
      return getUserId();
    } catch {
      return undefined;
    }
  }, [user?.id]);
  
  const { data: meals = [], isLoading: mealsLoading } = useMeals(userId);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pageVariants = getPageVariants();
  const pageTransition = getPageTransition();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleExportCSV = async () => {
    if (meals.length === 0) {
      alert('No meals to export yet! 📸 Take some photos first.');
      return;
    }

    setIsExporting(true);
    try {
      // Build CSV content
      const headers = ['Date', 'Time', 'Food Items', 'Total Protein (g)', 'Confidence'];
      const rows = meals.map((meal: any) => {
        const date = new Date(meal.uploadedAt);
        const dateStr = date.toLocaleDateString();
        const timeStr = date.toLocaleTimeString();
        const foodItems = meal.analysis?.foods?.map((f: any) => `${f.name} (${f.portion})`).join('; ') || '';
        const protein = meal.analysis?.totalProtein || 0;
        const confidence = meal.analysis?.confidence || 'unknown';
        return [dateStr, timeStr, `"${foodItems}"`, protein, confidence];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `proteinlens-meals-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

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
            ⚙️ Settings
          </h1>
          <p className="text-muted-foreground">
            Make ProteinLens work just the way you like it!
          </p>
        </div>

        {/* Goal Setting Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">🎯 Nutrition Goals</h2>
          <GoalInput />
          <Link 
            to="/protein-calculator"
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mt-2"
          >
            <span>🧮</span>
            <span>Not sure? Use our Protein Calculator to find your personalized target</span>
            <span>→</span>
          </Link>
        </section>

        {/* Appearance Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">🎨 Appearance</h2>
          <ThemeToggle />
        </section>

        {/* Account Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">👤 Account</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">{user?.email || 'Not logged in'}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Plan</p>
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground">{user?.plan === 'PRO' ? 'Pro Plan' : 'Free Plan'}</p>
                {user?.plan !== 'PRO' && (
                  <Button variant="outline" size="sm" onClick={() => navigate('/pricing')}>
                    ⭐ Upgrade
                  </Button>
                )}
              </div>
            </div>

            <hr className="border-border" />

            {/* Logout Button */}
            {isAuthenticated && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? '⏳ Logging out...' : '🚪 Log Out'}
              </Button>
            )}

            <hr className="border-border" />

            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Version:</strong> 1.0.0-beta
              </p>
              <p className="text-xs text-muted-foreground">
                🤖 Powered by AI • Built with ❤️
              </p>
            </div>
          </div>
        </section>

        {/* Export Section */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">💾 Your Data</h2>
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Download your meal history - it's your data, take it anywhere! 
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleExportCSV}
              disabled={isExporting || mealsLoading}
            >
              {isExporting ? '⏳ Exporting...' : mealsLoading ? '⏳ Loading...' : '📥 Export Meals (CSV)'}
            </Button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-destructive">⚠️ Danger Zone</h2>
          <div className="bg-destructive/5 border border-destructive/30 rounded-lg p-6 space-y-4">
            <p className="text-sm text-foreground">
              This will permanently delete all your data. No take-backs! 😬
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => {
                if (confirm('Are you absolutely sure? All your meals and history will be gone forever! 💨')) {
                  // TODO: Implement delete all data
                  console.log('Delete all data');
                }
              }}
            >
              🗑️ Delete Everything
            </Button>
          </div>
        </section>
      </motion.div>
    </PageContainer>
  );
}
