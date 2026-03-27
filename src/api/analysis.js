/**
 * analysis.js — Match Analysis API
 *
 * Returns win probabilities, goal/card/penalty risk, momentum and AI commentary.
 * To use a real API: replace the body with a fetch() call.
 * Shape must remain identical so AnalysisPage never needs updating.
 */

import { MOCK_ANALYSIS } from '@/config/mocks';

const delay = (ms = 500) => new Promise((res) => setTimeout(res, ms));

/**
 * Returns deep analysis for a match.
 * @param {string} matchId
 * @returns {Promise<import('@/config/mocks').MatchAnalysis | null>}
 */
export async function getMatchAnalysis(matchId) {
  await delay(600);
  
  // If we have a specific mock for this ID (e.g. 'match-1')
  if (MOCK_ANALYSIS[matchId]) {
    return MOCK_ANALYSIS[matchId];
  }

  // If it's a numeric ID (Sportingtech real match) but no mock exists, 
  // we generate a plausible "AI Analysis" structure to keep the UI functional.
  if (!isNaN(Number(matchId))) {
    return {
      id: matchId,
      predictedWinner: 'Equilíbrio Técnico',
      confidenceScore: 72,
      winProbability: { home: 38, draw: 28, away: 34 },
      goalProbabilityNextMinute: 12,
      cardRiskHome: 45,
      cardRiskAway: 30,
      penaltyRisk: 5,
      momentumHome: [10, 20, 15, 40, 60, 55, 45, 50, 65, 70],
      momentumAway: [5, 10, 25, 30, 20, 15, 40, 35, 30, 25],
      commentary: [
        "A IA detectou uma leve tendência ofensiva por parte da equipe mandante nos últimos 5 minutos.",
        "O volume de jogo no meio campo sugere uma partida de transição rápida.",
        "Atenção às bolas paradas: o índice de precisão em escanteios está acima da média."
      ]
    };
  }

  return null;
}
