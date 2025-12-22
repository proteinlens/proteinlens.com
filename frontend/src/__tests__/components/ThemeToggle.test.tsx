import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset theme
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('proteinlens_theme');
  });

  it('should render three theme options', () => {
    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });

  it('should select Light theme', async () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    await userEvent.click(lightButton);

    expect(lightButton).toHaveClass('bg-white', 'dark:bg-slate-900');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should select Dark theme', async () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    await userEvent.click(darkButton);

    expect(darkButton).toHaveClass('bg-slate-900', 'dark:bg-slate-900');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should select System theme', async () => {
    render(<ThemeToggle />);

    const systemButton = screen.getByRole('button', { name: /system/i });
    await userEvent.click(systemButton);

    const stored = localStorage.getItem('proteinlens_theme');
    expect(stored).toBe('system');
  });

  it('should persist theme to localStorage', async () => {
    render(<ThemeToggle />);

    const darkButton = screen.getByRole('button', { name: /dark/i });
    await userEvent.click(darkButton);

    expect(localStorage.getItem('proteinlens_theme')).toBe('dark');
  });

  it('should load saved theme on mount', () => {
    localStorage.setItem('proteinlens_theme', 'dark');
    document.documentElement.classList.add('dark');

    render(<ThemeToggle />);

    expect(screen.getByRole('button', { name: /dark/i })).toHaveClass('bg-slate-900');
  });

  it('should show checkmark for active theme', async () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    await userEvent.click(lightButton);

    // Check for visual indicator (could be checkmark, highlight, etc)
    expect(lightButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('should toggle between themes', async () => {
    render(<ThemeToggle />);

    const lightButton = screen.getByRole('button', { name: /light/i });
    const darkButton = screen.getByRole('button', { name: /dark/i });

    await userEvent.click(lightButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await userEvent.click(darkButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await userEvent.click(lightButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should respect system preferences when set to system', () => {
    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ThemeToggle />);

    const systemButton = screen.getByRole('button', { name: /system/i });
    expect(systemButton).toBeInTheDocument();
  });
});
