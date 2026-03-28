/**
 * analysis.js — Match Analysis API (Backend Connected)
 *
 * Calls the Python backend (/api/analisar) using Groq,
 * Neon Database (historical + cache), and BetsAPI.
 */

import { fetchWithBackendFallback } from '@/config/backend';
import { getAuthHeaders } from '@/services/authService';

function toInt(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

function normalizeAnalysisPayload(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const win = raw.winProbability || raw.win_probability || {};
  const commentary = Array.isArray(raw.commentary)
    ? raw.commentary
    : typeof raw.commentary === 'string'
      ? [raw.commentary]
      : [];

  return {
    winProbability: {
      home: toInt(win.home, 34),
      draw: toInt(win.draw, 32),
      away: toInt(win.away, 34),
    },
    confidenceScore: toInt(raw.confidenceScore ?? raw.confidence, 52),
    predictedWinner: String(raw.predictedWinner || raw.prediction || 'Empate'),
    commentary:
      commentary.length > 0
        ? commentary.map((x) => String(x))
        : ['Análise temporariamente simplificada por indisponibilidade parcial de dados.'],
    goalProbabilityNextMinute: toInt(raw.goalProbabilityNextMinute, 42),
    cardRiskHome: toInt(raw.cardRiskHome, 38),
    cardRiskAway: toInt(raw.cardRiskAway ?? raw.cardRisskAway, 36),
    penaltyRisk: toInt(raw.penaltyRisk, 18),
    momentumHome: toInt(raw.momentumHome, 51),
    momentumAway: toInt(raw.momentumAway, 49),
  };
}

/**
 * Returns deep analysis for a match from the AI Backend.
 * @param {string} matchId
 * @param {{ home?: { name?: string }, away?: { name?: string } } | null} matchContext
 * @returns {Promise<import('@/config/mocks').MatchAnalysis | null>}
 */
export async function getMatchAnalysis(matchId, matchContext = null) {
  try {
    const params = new URLSearchParams();
    if (matchContext?.home?.name)
      params.set('home_team', matchContext.home.name);
    if (matchContext?.away?.name)
      params.set('away_team', matchContext.away.name);
    const query = params.toString();

    const response = await fetchWithBackendFallback(
      `/api/analisar/${matchId}${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      },
    );

    if (!response.ok) {
      const savedFallback = await getSavedMatchAnalysis(matchId, matchContext);
      if (savedFallback) {
        return savedFallback;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const analysisData = await response.json();
    return normalizeAnalysisPayload(analysisData);
  } catch (error) {
    console.error('Error fetching AI analysis from backend:', error);
    const savedFallback = await getSavedMatchAnalysis(matchId, matchContext);
    if (savedFallback) {
      return normalizeAnalysisPayload(savedFallback);
    }
    return null;
  }
}

/**
 * Returns a saved analysis already persisted in DB for faster first paint.
 * @param {string} matchId
 * @param {{ home?: { name?: string }, away?: { name?: string } } | null} matchContext
 * @returns {Promise<import('@/config/mocks').MatchAnalysis | null>}
 */
export async function getSavedMatchAnalysis(matchId, matchContext = null) {
  try {
    const params = new URLSearchParams();
    if (matchContext?.home?.name)
      params.set('home_team', matchContext.home.name);
    if (matchContext?.away?.name)
      params.set('away_team', matchContext.away.name);
    const query = params.toString();

    const response = await fetchWithBackendFallback(
      `/api/analises-salvas/${matchId}${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (payload?.sucesso && payload?.analise) {
      return normalizeAnalysisPayload(payload.analise);
    }
    return null;
  } catch (error) {
    console.error('Error fetching saved analysis from backend:', error);
    return null;
  }
}
