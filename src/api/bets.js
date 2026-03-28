/**
 * bets.js — Bets API (Conectado ao Backend Real)
 *
 * Consome dados reais do backend em vez de mocks.
 */

import { fetchWithBackendFallback } from '@/config/backend';
import { getAuthHeaders } from '@/services/authService';

/**
 * Busca apostas do endpoint principal.
 * @returns {Promise<Array>}
 */
export async function getApostas() {
  try {
    const response = await fetchWithBackendFallback('/api/apostas', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
    });

    if (!response.ok) {
      console.warn('Falha ao buscar apostas, retornando vazio.');
      return [];
    }

    const data = await response.json();
    return data?.apostas || data || [];
  } catch (error) {
    console.warn('Erro ao buscar apostas:', error);
    return [];
  }
}

/**
 * Busca apostas abertas do backend.
 * @returns {Promise<Array>}
 */
export async function getOpenBets() {
  return getApostas();
}

/**
 * Busca apostas finalizadas do backend.
 * @returns {Promise<Array>}
 */
export async function getFinishedBets() {
  try {
    const response = await fetchWithBackendFallback(
      '/api/apostas/finalizadas',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      },
    );

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
    const response = await fetchWithBackendFallback(`/api/odds/${matchId}`, {
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
