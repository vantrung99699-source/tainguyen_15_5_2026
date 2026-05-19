import { CATEGORIES } from '../constants';
import type { Category } from '../types';

/** ID danh mục dùng làm icon mạng xã hội / nền tảng phổ biến trên shop MMO */
const SOCIAL_PRESET_IDS = [
  'facebook',
  'tiktok',
  'instagram',
  'youtube',
  'twitter',
  'telegram',
  'zalo',
  'gmail',
  'fanpage',
] as const;

const EXTRA_SOCIAL_PRESETS: Category[] = [
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: '#0a66c2' },
  { id: 'discord', name: 'Discord', icon: 'MessageSquare', color: '#5865f2' },
  { id: 'threads', name: 'Threads', icon: 'AtSign', color: '#000000' },
  { id: 'whatsapp', name: 'WhatsApp', icon: 'Phone', color: '#25d366' },
];

export const PRESET_ICON_PREFIX = 'preset:';

export const SOCIAL_ICON_PRESETS: Category[] = [
  ...CATEGORIES.filter((c) => (SOCIAL_PRESET_IDS as readonly string[]).includes(c.id)),
  ...EXTRA_SOCIAL_PRESETS,
];

export function presetIconUrl(presetId: string) {
  return `${PRESET_ICON_PREFIX}${presetId}`;
}

export function isPresetIconUrl(url: string) {
  return url.startsWith(PRESET_ICON_PREFIX);
}

export function getPresetIdFromUrl(url: string) {
  return isPresetIconUrl(url) ? url.slice(PRESET_ICON_PREFIX.length) : '';
}

export function resolveSocialIconPreset(url: string): Category | undefined {
  const id = getPresetIdFromUrl(url);
  return SOCIAL_ICON_PRESETS.find((p) => p.id === id);
}
