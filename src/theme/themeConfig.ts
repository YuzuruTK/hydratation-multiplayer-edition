import {
  Crown,
  CupSoda,
  Droplets,
  Flame,
  FlaskConical,
  GlassWater,
  Leaf,
  Moon,
  MoonStar,
  Sprout,
  Trophy,
  Waves,
  Wine,
  type LucideIcon,
} from 'lucide-react';

export const THEME_NAMES = ['ocean', 'midnight', 'ocean-green', 'dracula', 'dragonade'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export type VesselStyle = 'droplet' | 'rocks-glass' | 'potion' | 'chalice' | 'fireball-bottle';

export interface ThemeArtwork {
  vesselAsset?: string;
  mascotAsset?: string;
  mascotPlacement?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ThemeConfig {
  name: string;
  selectorLabel: string;
  colorScheme: 'light' | 'dark';
  vessel: VesselStyle;
  iconStrokeWidth: number;
  fillBrandIcon: boolean;
  icons: {
    brand: LucideIcon;
    home: LucideIcon;
    ranking: LucideIcon;
    activity: LucideIcon;
    goal: LucideIcon;
    containerGlass: LucideIcon;
    containerBottle: LucideIcon;
    containerCup: LucideIcon;
  };
  visual: {
    iconTreatment: 'fluid' | 'minimal' | 'botanical' | 'gothic' | 'bold';
    surfaceTreatment: 'clear-glass' | 'smoked-glass' | 'potion-glass' | 'gothic-glass' | 'monochrome-line-art';
    vesselMotion: 'float' | 'still' | 'bubbles';
    motifs: readonly string[];
  };
  artwork?: ThemeArtwork;
}

/**
 * Visual identity registry.
 *
 * Keep palette values in themes.css; this registry controls the visual language
 * used by React components: iconography, vessel artwork, ornaments and motion.
 */
export const THEME_CONFIG: Record<ThemeName, ThemeConfig> = {
  ocean: {
    name: 'Ocean',
    selectorLabel: 'Ocean',
    colorScheme: 'light',
    vessel: 'droplet',
    iconStrokeWidth: 1.8,
    fillBrandIcon: true,
    icons: {
      brand: Droplets,
      home: GlassWater,
      ranking: Trophy,
      activity: Droplets,
      goal: Waves,
      containerGlass: GlassWater,
      containerBottle: CupSoda,
      containerCup: Waves,
    },
    visual: {
      iconTreatment: 'fluid',
      surfaceTreatment: 'clear-glass',
      vesselMotion: 'float',
      motifs: ['water droplets', 'waves', 'soft reflections'],
    },
  },
  midnight: {
    name: 'Midnight',
    selectorLabel: 'Midnight',
    colorScheme: 'dark',
    vessel: 'rocks-glass',
    iconStrokeWidth: 1.85,
    fillBrandIcon: false,
    icons: {
      brand: Moon,
      home: GlassWater,
      ranking: Trophy,
      activity: Wine,
      goal: Moon,
      containerGlass: GlassWater,
      containerBottle: CupSoda,
      containerCup: Wine,
    },
    visual: {
      iconTreatment: 'minimal',
      surfaceTreatment: 'smoked-glass',
      vesselMotion: 'still',
      motifs: ['lowball glass', 'ice', 'night ambience'],
    },
  },
  'ocean-green': {
    name: 'Ocean Green',
    selectorLabel: 'Ocean Green · Osaka Jade',
    colorScheme: 'dark',
    vessel: 'potion',
    iconStrokeWidth: 1.8,
    fillBrandIcon: false,
    icons: {
      brand: FlaskConical,
      home: FlaskConical,
      ranking: Sprout,
      activity: Leaf,
      goal: Sprout,
      containerGlass: FlaskConical,
      containerBottle: FlaskConical,
      containerCup: CupSoda,
    },
    visual: {
      iconTreatment: 'botanical',
      surfaceTreatment: 'potion-glass',
      vesselMotion: 'bubbles',
      motifs: ['forest leaves', 'jade', 'alchemy', 'potion bubbles'],
    },
  },
  dracula: {
    name: 'Dracula',
    selectorLabel: 'Dracula',
    colorScheme: 'dark',
    vessel: 'chalice',
    iconStrokeWidth: 1.9,
    fillBrandIcon: false,
    icons: {
      brand: MoonStar,
      home: Wine,
      ranking: Crown,
      activity: Moon,
      goal: Crown,
      containerGlass: Wine,
      containerBottle: Wine,
      containerCup: Wine,
    },
    visual: {
      iconTreatment: 'gothic',
      surfaceTreatment: 'gothic-glass',
      vesselMotion: 'still',
      motifs: ['gothic arches', 'chalice', 'moonlight', 'crimson accents'],
    },
  },
  dragonade: {
    name: 'Dragonade',
    selectorLabel: 'Dragonade',
    colorScheme: 'dark',
    vessel: 'fireball-bottle',
    iconStrokeWidth: 2,
    fillBrandIcon: false,
    icons: {
      brand: Flame,
      home: Flame,
      ranking: Trophy,
      activity: Flame,
      goal: Flame,
      containerGlass: CupSoda,
      containerBottle: CupSoda,
      containerCup: GlassWater,
    },
    visual: {
      iconTreatment: 'bold',
      surfaceTreatment: 'monochrome-line-art',
      vesselMotion: 'still',
      motifs: ['Fireball bottle', 'flame', 'cinnamon whisky', 'original devil mascot'],
    },
    artwork: {
      vesselAsset: '/assets/dragonade-bottle.svg',
      mascotAsset: '/assets/fireball-devil.svg',
      mascotPlacement: { x: 134, y: 1010, width: 500, height: 500 },
    },
  },
};

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(THEME_CONFIG, value);
}
