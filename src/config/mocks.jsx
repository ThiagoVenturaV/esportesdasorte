/**
 * mocks.js — Centralized Mock Data
 */

import TeamShield from '@/components/TeamShield';

// ─── Matches ─────────────────────────────────────────────────────────────────

/** @type {Match[]} */
export const MOCK_LIVE_MATCHES = [
  {
    id: 'match-001',
    status: 'live',
    sport: 'soccer',
    league: 'Brasileirão Série A',
    home: { name: 'Botafogo', shortName: 'BOT', logo: <TeamShield externalId="677fc743454d0" name="Botafogo" /> },
    away: { name: 'Santos', shortName: 'SAN', logo: <TeamShield externalId="677fc82a860d4" name="Santos" /> },
    homeScore: 1, awayScore: 0, minute: "32'", period: '1º Tempo',
    odds: { home: 1.72, draw: 3.1, away: 4.5 },
    markets: [
      {
        id: 'm1',
        name: 'Resultado Final (1X2)',
        category: 'PRINCIPAIS',
        selections: [
          { label: 'Botafogo', odd: 1.72 },
          { label: 'Empate', odd: 3.10 },
          { label: 'Santos', odd: 4.50 }
        ]
      },
      {
        id: 'm2',
        name: 'Total de Gols (Over/Under)',
        category: 'GOLS',
        selections: [
          { label: 'Mais de 1.5', odd: 1.35 },
          { label: 'Menos de 1.5', odd: 2.80 },
          { label: 'Mais de 2.5', odd: 2.10 }
        ]
      },
      {
        id: 'm3',
        name: 'Ambas Marcam',
        category: 'PRINCIPAIS',
        selections: [{ label: 'Sim', odd: 1.95 }, { label: 'Não', odd: 1.80 }]
      },
      {
        id: 'm4',
        name: 'Handicap Europeu (0:1)',
        category: 'HANDICAP',
        selections: [
          { label: 'Botafogo (-1)', odd: 3.10 },
          { label: 'Empate (Santos +1)', odd: 3.40 },
          { label: 'Santos (+1)', odd: 2.10 }
        ]
      },
      {
        id: 'm5',
        name: 'Total de Escanteios (Mais/Menos)',
        category: 'ESCANTEIOS',
        selections: [
          { label: 'Mais de 9.5', odd: 1.85 },
          { label: 'Menos de 9.5', odd: 1.95 }
        ]
      },
      {
        id: 'm6',
        name: 'Resultado Final & Total de Gols',
        category: 'COMBOS',
        selections: [
          { label: 'Botafogo & +2.5', odd: 2.80 },
          { label: 'Empate & -2.5', odd: 3.50 }
        ]
      }
    ]
  },
  {
    id: 'match-002',
    status: 'live',
    sport: 'soccer',
    league: 'Brasileirão Série A',
    home: { name: 'Flamengo', shortName: 'FLA', logo: <TeamShield externalId="677fc73fcec1e" name="Flamengo" /> },
    away: { name: 'Palmeiras', shortName: 'PAL', logo: <TeamShield externalId="677fc746b0687" name="Palmeiras" /> },
    homeScore: 1, awayScore: 0, minute: "32'", period: '1º Tempo',
    odds: { home: 2.1, draw: 3.1, away: 3.5 },
    markets: [
      { id: 'm1', name: 'Resultado Final', category: 'PRINCIPAIS', selections: [{ label: '1', odd: 2.1 }, { label: 'X', odd: 3.1 }, { label: '2', odd: 3.5 }] },
      { id: 'm2', name: 'Gols +/- 2.5', category: 'GOLS', selections: [{ label: '+2.5', odd: 2.1 }, { label: '-2.5', odd: 1.65 }] }
    ]
  },
  {
    id: 'match-003',
    status: 'live',
    sport: 'soccer',
    league: 'Premier League',
    home: { name: 'Arsenal', shortName: 'ARS', logo: <TeamShield externalId="677fc9dc47c3e" name="Arsenal" /> },
    away: { name: 'Liverpool', shortName: 'LIV', logo: <TeamShield externalId="677fc9baa0935" name="Liverpool" /> },
    homeScore: 0, awayScore: 0, minute: "12'", period: '1º Tempo',
    odds: { home: 2.45, draw: 3.4, away: 2.8 },
    markets: [
      { id: 'm1', name: 'Resultado Final', category: 'PRINCIPAIS', selections: [{ label: '1', odd: 2.45 }, { label: 'X', odd: 3.4 }, { label: '2', odd: 2.8 }] }
    ]
  },
  {
    id: 'match-005',
    status: 'live',
    sport: 'soccer',
    league: 'UEFA Champions League',
    home: { name: 'Real Madrid', shortName: 'RMA', logo: <TeamShield externalId="677fc9bfbc808" name="Real Madrid" /> },
    away: { name: 'Bayern', shortName: 'BAY', logo: <TeamShield externalId="bayern" name="Bayern" /> },
    homeScore: 2, awayScore: 1, minute: "72'", period: '2º Tempo',
    odds: { home: 1.05, draw: 12.0, away: 45.0 },
    markets: [
      { id: 'm1', name: 'Resultado Final', category: 'PRINCIPAIS', selections: [{ label: '1', odd: 1.05 }, { label: 'X', odd: 12.0 }, { label: '2', odd: 45.0 }] }
    ]
  },
  {
    id: 'match-006',
    status: 'live',
    sport: 'basketball',
    league: 'NBA',
    home: { name: 'Lakers', shortName: 'LAL', logo: <TeamShield externalId="lakers" name="Lakers" /> },
    away: { name: 'Celtics', shortName: 'BOS', logo: <TeamShield externalId="celtics" name="Celtics" /> },
    homeScore: 87, awayScore: 91, minute: 'Q3 4:22', period: '3º Quarto',
    odds: { home: 2.1, draw: null, away: 1.78 },
    markets: [
      { id: 'm1', name: 'Vencedor', category: 'PRINCIPAIS', selections: [{ label: 'LAL', odd: 2.1 }, { label: 'BOS', odd: 1.78 }] },
      { id: 'm2', name: 'Total de Pontos (Over/Under)', category: 'PRINCIPAIS', selections: [{ label: 'Mais de 220.5', odd: 1.9 }, { label: 'Menos de 220.5', odd: 1.9 }] }
    ]
  }
];

/** @type {Match[]} */
export const MOCK_UPCOMING_MATCHES = [
  {
    id: 'match-101', status: 'upcoming', sport: 'soccer', league: 'Brasileirão Série A',
    home: { name: 'Grêmio', shortName: 'GRE', logo: <TeamShield externalId="gremio" name="Grêmio" /> },
    away: { name: 'Inter', shortName: 'INT', logo: <TeamShield externalId="internacional" name="Inter" /> },
    homeScore: null, awayScore: null, minute: 'HOJE 21:00', period: null,
    odds: { home: 1.85, draw: 3.1, away: 4.5 },
    markets: []
  }
];

export const MOCK_OPEN_BETS = [];
export const MOCK_FINISHED_BETS = [];
