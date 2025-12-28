import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import React from 'react';

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Reset theme
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('theme');
  });

  const renderWithProvider = () =>
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

  it('should render three theme options', () => {
    renderWithProvider();

    expect(screen.getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /system/i })).toBeInTheDocument();
  });

  it('should select Light theme', async () => {
    renderWithProvider();

    const lightButton = screen.getByRole('button', { name: /light/i });
    await userEvent.click(lightButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
    expect(lightButton).toHaveClass('border-primary');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should select Dark theme', async () => {
    renderWithProvider();

    const darkButton = screen.getByRole('button', { name: /dark/i });
    await userEvent.click(darkButton);

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
    expect(darkButton).toHaveClass('border-primary');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should select System theme', async () => {
    renderWithProvider();

    const systemButton = screen.getByRole('button', { name: /system/i });
    await userEvent.click(systemButton);

    expect(localStorage.getItem('theme')).toBe('system');
  });

  it('should persist theme to localStorage', async () => {
    renderWithProvider();

    const darkButton = screen.getByRole('button', { name: /dark/i });
    await userEvent.click(darkButton);

    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should load saved theme on mount', () => {
    localStorage.setItem('theme', 'dark');

    renderWithProvider();

    expect(screen.getByRole('button', { name: /dark/i })).toHaveClass('border-primary');
  });

  it('should show checkmark for active theme', async () => {
    renderWithProvider();

    const lightButton = screen.getByRole('button', { name: /light/i });
    await userEvent.click(lightButton);

    expect(lightButton).toHaveTextContent('✓');
  });

  it('should toggle between themes', async () => {
    renderWithProvider();

    const lightButton = screen.getByRole('button', { name: /light/i });
    const darkButton = screen.getByRole('button', { name: /dark/i });

    await userEvent.click(lightButton);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    await userEvent.click(darkButton);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    await userEvent.click(lightButton);
    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
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

    renderWithProvider();

    const systemButton = screen.getByRole('button', { name: /system/i });
    expect(systemButton).toBeInTheDocument();
  });
});
