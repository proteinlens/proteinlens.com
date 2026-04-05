/**
 * EmojiIcon — drop-in replacement for emoji-as-icon patterns.
 * Maps emoji strings to Lucide React SVG icons for better rendering,
 * accessibility, and consistent sizing across platforms.
 * 
 * Usage: <EmojiIcon emoji="🎯" className="w-5 h-5" />
 * Or use the Icon export directly: <Icon name="target" className="w-5 h-5" />
 */
import React from 'react';
import {
  Target, Camera, Cpu, Lock, Zap, Sparkles, Brain, BarChart3,
  Settings, Lightbulb, Search, Dumbbell, Flame, UtensilsCrossed,
  BookOpen, Microscope, AlertTriangle, Mail, Key, KeyRound, Dna,
  Apple, Calculator, Coins, Beef, Frown, Share2, HardDrive, User,
  Palette, Salad, Cloud, RefreshCw, Info, Leaf, Shield, ChevronRight,
  type LucideIcon,
} from 'lucide-react';

const emojiMap: Record<string, LucideIcon> = {
  '🎯': Target,
  '📸': Camera,
  '📷': Camera,
  '🤖': Cpu,
  '🔒': Lock,
  '⚡': Zap,
  '✨': Sparkles,
  '🧠': Brain,
  '📊': BarChart3,
  '⚙️': Settings,
  '💡': Lightbulb,
  '🔍': Search,
  '💪': Dumbbell,
  '🔥': Flame,
  '🍽️': UtensilsCrossed,
  '📚': BookOpen,
  '🔬': Microscope,
  '⚠️': AlertTriangle,
  '📧': Mail,
  '✉️': Mail,
  '🔑': Key,
  '🔐': KeyRound,
  '🧬': Dna,
  '🍎': Apple,
  '🧮': Calculator,
  '💰': Coins,
  '🥩': Beef,
  '😵': Frown,
  '📤': Share2,
  '💾': HardDrive,
  '👤': User,
  '🎨': Palette,
  '🥗': Salad,
  '☁️': Cloud,
  '🔄': RefreshCw,
  'ℹ️': Info,
  '🌱': Leaf,
  '🛡️': Shield,
  '→': ChevronRight,
};

interface EmojiIconProps {
  emoji: string;
  className?: string;
  /** Fallback to emoji string if no SVG mapping exists */
  fallback?: boolean;
}

export function EmojiIcon({ emoji, className = 'w-5 h-5', fallback = true }: EmojiIconProps) {
  const IconComponent = emojiMap[emoji];
  
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  
  if (fallback) {
    return <span aria-hidden="true">{emoji}</span>;
  }
  
  return null;
}

export { emojiMap };
export type { LucideIcon };
