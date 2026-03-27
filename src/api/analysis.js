/**
 * analysis.js — Match Analysis API (Backend Connected)
 *
 * Calls the Python backend (/api/analisar) which uses Gemini 2.5 Lite,
 * Neon Database (Parquet historical data), and BetsAPI.
 */

import { BACKEND_URL } from '@/config/backend';

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

    const response = await fetch(
      `${BACKEND_URL}/api/analisar/${matchId}${query ? `?${query}` : ''}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const analysisData = await response.json();
    return analysisData;
  } catch (error) {
    console.error('Error fetching AI analysis from backend:', error);
    return null;
  }
}
