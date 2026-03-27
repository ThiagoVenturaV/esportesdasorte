/**
 * routes.js — Centralized Route Definitions
 *
 * All route paths live here. Never hardcode paths in <Link to="..."> —
 * import ROUTES and reference these constants instead.
 *
 * Usage:
 *   import { ROUTES } from '@/config/routes';
 *   <Link to={ROUTES.HOME} />
 *   <Navigate to={ROUTES.ANALYSIS(match.id)} />
 */

export const ROUTES = {
  HOME: '/',
  LIVE: '/ao-vivo',
  APOSTAS: '/apostas',
  LOGIN: '/login',
  REGISTER: '/registro',
  REGISTER_SUCCESS: '/registro-sucesso',
  FORGOT_PASSWORD: '/recuperar-senha',
  LIVE_ANALYSIS: '/analises-ia',
  ACCOUNT: '/minha-conta',
  ACCOUNT_SECURITY: '/minha-conta/seguranca',

  // Dynamic routes — call as a function to get the path with param
  ANALYSIS: (matchId = ':matchId') => `/analise/${matchId}`,
  BETTING: (matchId = ':matchId') => `/apostar/${matchId}`,
};

export default ROUTES;
