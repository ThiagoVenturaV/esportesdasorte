/**
 * bets.js — Bets API
 *
 * Returns open and finished bets.
 * To use a real API: replace the body with a fetch() call.
 */

import { MOCK_OPEN_BETS, MOCK_FINISHED_BETS } from '@/config/mocks';

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));

/**
 * @returns {Promise<typeof MOCK_OPEN_BETS>}
 */
export async function getOpenBets() {
  await delay();
  return MOCK_OPEN_BETS;
}

/**
 * @returns {Promise<typeof MOCK_FINISHED_BETS>}
 */
export async function getFinishedBets() {
  await delay();
  return MOCK_FINISHED_BETS;
}
