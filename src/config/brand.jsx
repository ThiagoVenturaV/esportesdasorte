/**
 * brand.js — Esportes da Sorte Brand Configuration
 *
 * SINGLE SOURCE OF TRUTH for all brand-related constants.
 * To change colors, fonts, logo, app name or typography: edit only this file.
 *
 * Usage:
 *   import { BRAND } from '@/config/brand';
 *   const primary = BRAND.colors.primary;
 */

import { SoccerIcon, BasketballIcon, TennisIcon, EsportsIcon } from '@/components/Icons';

export const BRAND = {
  // ─── App Identity ───────────────────────────────────────────────────────────
  appName: 'Esportes da Sorte',
  appNameShort: 'EdS',
  tagline: 'Análise inteligente para apostas esportivas',

  // ─── Color Palette ──────────────────────────────────────────────────────────
  // Source: Tela 11 — Core Palette (sRGB)
  colors: {
    primary: '#023397',       // Azul principal — Pantone 7487 U
    accent: '#38E67D',        // Verde principal — Pantone 286 U
    accentLight: '#A8F0C0',   // Verde claro (degradê)
    gradient: 'linear-gradient(90deg, #023397 0%, #38E67D 100%)',

    // Dark UI backgrounds
    bg: '#0D0D0D',            // Background raiz
    bgCard: '#1A1A2E',        // Card/surface background
    bgCardHover: '#1E2240',   // Card hover state
    bgInput: '#1A1A2E',       // Input background
    bgOverlay: 'rgba(0,0,0,0.7)', // Modal overlay

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A8C0',
    textMuted: '#5A6080',

    // Semantic
    success: '#38E67D',
    warning: '#F5A623',
    danger: '#E63850',
    info: '#4A90D9',

    // Status badges
    live: '#E63850',
    liveGlow: 'rgba(230, 56, 80, 0.3)',
  },

  // ─── Typography ─────────────────────────────────────────────────────────────
  // Font loaded in index.html via Google Fonts
  fonts: {
    base: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    weights: {
      light: 300,
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
  },

  // ─── Logo & Assets ──────────────────────────────────────────────────────────
  // To swap logos: change the path or SVG string below. All components import from here.
  logo: {
    // Full wordmark — used in TopBar
    wordmark: 'EdS',
    // Whether to use SVG component (true) or <img src="..."> (false)
    useSvgComponent: true,
  },

  // ─── Spacing & Radius ───────────────────────────────────────────────────────
  // Mirrors the CSS variables in tokens.css — kept here for JS usage
  radius: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // ─── Sports Categories ──────────────────────────────────────────────────────
  // Add or remove sports here — BottomNav and SideMenu consume this list
  sports: [
    { id: 'soccer',     label: 'Futebol',    emoji: <SoccerIcon /> },
    { id: 'basketball', label: 'Basquete',   emoji: <BasketballIcon /> },
    { id: 'tennis',     label: 'Tênis',      emoji: <TennisIcon /> },
    { id: 'esports',    label: 'E-Sports',   emoji: <EsportsIcon /> },
  ],
};

export default BRAND;
