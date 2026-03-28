/**
 * bets.js — Bets API (Conectado ao Backend Real)
 *
 * Consome dados reais do backend em vez de mocks.
 */

import { BACKEND_URL } from '@/config/backend';
import { getAuthHeaders } from '@/services/authService';

/**
 * Busca apostas abertas do backend.
 * @returns {Promise<Array>}
 */
export async function getOpenBets() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/apostas/abertas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      console.warn('Falha ao buscar apostas abertas, retornando vazio.');
      return [];
    }

    const data = await response.json();
    return data?.apostas || data || [];
  } catch (error) {
    console.warn('Erro ao buscar apostas abertas:', error);
    return [];
  }
}

/**
 * Busca apostas finalizadas do backend.
 * @returns {Promise<Array>}
 */
export async function getFinishedBets() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/apostas/finalizadas`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      console.warn('Falha ao buscar apostas finalizadas, retornando vazio.');
      return [];
    }

    const data = await response.json();
    return data?.apostas || data || [];
  } catch (error) {
    console.warn('Erro ao buscar apostas finalizadas:', error);
    return [];
  }
}

/**
 * Busca odds de uma partida específica.
 * @param {string} matchId
 * @returns {Promise<Object|null>}
 */
export async function getOddsPartida(matchId) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/odds/${matchId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.warn('Erro ao buscar odds da partida:', error);
    return null;
  }
}
