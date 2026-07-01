import {
  Briefcase,
  Car,
  Film,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Plane,
  ShoppingCart,
  Utensils,
  Wallet,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_ICONS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ['grocery', 'groceries', 'food'], icon: ShoppingCart },
  { keywords: ['rent', 'housing', 'mortgage'], icon: Home },
  { keywords: ['restaurant', 'dining', 'eating'], icon: Utensils },
  { keywords: ['transport', 'fuel', 'car', 'uber', 'taxi'], icon: Car },
  { keywords: ['utilities', 'electricity', 'bill'], icon: Zap },
  { keywords: ['health', 'medical', 'doctor'], icon: HeartPulse },
  { keywords: ['entertainment', 'movie', 'streaming'], icon: Film },
  { keywords: ['education', 'tuition', 'school'], icon: GraduationCap },
  { keywords: ['salary', 'income', 'work'], icon: Briefcase },
  { keywords: ['gift', 'donation'], icon: Gift },
  { keywords: ['travel', 'vacation', 'flight'], icon: Plane },
];

export function getCategoryIcon(category: string): LucideIcon {
  const lower = category.toLowerCase();
  const match = CATEGORY_ICONS.find(({ keywords }) => keywords.some((k) => lower.includes(k)));
  return match?.icon ?? Wallet;
}
