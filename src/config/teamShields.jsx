/**
 * teamShields.js — Centralized Team Shield Mapping for API-Futebol
 * 
 * Mapping of team names/slugs to their official API-Futebol CDN hashes.
 * Format: https://cdn.api-futebol.com.br/times/escudos/{HASH}.svg
 */

export const TEAM_SHIELDS = {
  // ─── Série A ───────────────────────────────────────────────────────────────
  'botafogo': { hash: '677fc743454d0', ext: 'svg' },
  'bot': { hash: '677fc743454d0', ext: 'svg' },
  'flamengo': { hash: '677fc73fcec1e', ext: 'svg' },
  'fla': { hash: '677fc73fcec1e', ext: 'svg' },
  'palmeiras': { hash: '677fc746b0687', ext: 'svg' },
  'pal': { hash: '677fc746b0687', ext: 'svg' },
  'santos': { hash: '677fc82a860d4', ext: 'svg' },
  'san': { hash: '677fc82a860d4', ext: 'svg' },
  'sao paulo': { hash: '677fc754a5a78', ext: 'svg' },
  'spfc': { hash: '677fc754a5a78', ext: 'svg' },
  'corinthians': { hash: '677fc7386c4ef', ext: 'svg' },
  'sccp': { hash: '677fc7386c4ef', ext: 'svg' },
  'fluminense': { hash: '677fc750c6c81', ext: 'svg' },
  'flu': { hash: '677fc750c6c81', ext: 'svg' },
  'vasco': { hash: '677fc702ef04f', ext: 'svg' },
  'vas': { hash: '677fc702ef04f', ext: 'svg' },
  'gremio': { hash: '677fc735c7d91', ext: 'svg' },
  'gre': { hash: '677fc735c7d91', ext: 'svg' },
  'internacional': { hash: '677fc74bc3190', ext: 'svg' },
  'int': { hash: '677fc74bc3190', ext: 'svg' },
  'atletico-mg': { hash: '677fc73a35795', ext: 'svg' },
  'atletico mg': { hash: '677fc73a35795', ext: 'svg' },
  'cruzeiro': { hash: '677fc7451529e', ext: 'svg' },
  'bahia': { hash: '677fc749f1800', ext: 'svg' },
  'fortaleza': { hash: '677fc7563ed30', ext: 'svg' },

  // ─── Internacionais ────────────────────────────────────────────────────────
  'real madrid': { hash: '677fc9bfbc808', ext: 'svg' },
  'man city': { hash: '677fc9ccdd4d5', ext: 'svg' },
  'arsenal': { hash: '677fc9dc47c3e', ext: 'svg' },
  'liverpool': { hash: '677fc9baa0935', ext: 'svg' },
  'chelsea': { hash: '677fca04a3cfa', ext: 'svg' },
  'man united': { hash: '677fc9fb31944', ext: 'svg' },
  'tottenham': { hash: '677fca020aee5', ext: 'svg' },
  'barcelona': { hash: '677fc9e5a0d87', ext: 'svg' },
  'atletico': { hash: '677fc9ddec164', ext: 'svg' },
  'villarreal': { hash: '677fca3084a63', ext: 'svg' },
  'psg': { hash: '677fc9d08c5b7', ext: 'svg' },
  'monaco': { hash: '677fc9e3e71b9', ext: 'svg' },
  'bayern': { hash: '677fc9b7438d8', ext: 'svg' },
  'bayer leverkusen': { hash: '677fc9d8b4c6c', ext: 'svg' },
  'borussia dortmund': { hash: '677fc9caf24e4', ext: 'svg' },
  'rb leipzig': { hash: '677fc9dfa27ef', ext: 'svg' },
  'juventus': { hash: '677fc9b1c2356', ext: 'svg' },
  'inter milan': { hash: '677fc9ced3689', ext: 'svg' },
  'ac milan': { hash: '677fc9b8eb738', ext: 'svg' },
  'atalanta': { hash: '677fc9da91a7c', ext: 'svg' },
  'lazio': { hash: '677fba15e6d1a', ext: 'svg' },
  'roma': { url: 'https://img-cdn001.akamaized.net/ls/crest/medium/3851.png' },
  'porto': { hash: '677fc9f89d206', ext: 'svg' },
  'benfica': { hash: '677fc9d49f7e8', ext: 'svg' },
  'sporting': { hash: '677fc9bd35705', ext: 'svg' },
  'ajax': { hash: '677fba7c43490', ext: 'svg' },
  'psv': { hash: '677fc9b3af3c2', ext: 'svg' },
  'feyenoord': { hash: '677fc9d6cdd16', ext: 'svg' },

  // ─── NBA ───────────────────────────────────────────────────────────────
  'lakers': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
  'celtics': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png' },
  'warriors': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/gsw.png' },
  'suns': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/phx.png' },
  'bucks': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/mil.png' },
  'nets': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/bkn.png' },
  'clippers': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/lac.png' },
  'mavericks': { url: 'https://a.espncdn.com/i/teamlogos/nba/500/dal.png' },

  // ─── Seleções Nacionais ───────────────────────────────────────────────────
  'pais de gales': { url: 'https://flagcdn.com/w160/gb-wls.png' },
  'bosnia e herzegovina': { url: 'https://flagcdn.com/w160/ba.png' },
  'brasil': { url: 'https://flagcdn.com/w160/br.png' },
  'argentina': { url: 'https://flagcdn.com/w160/ar.png' },
  'franca': { url: 'https://flagcdn.com/w160/fr.png' },
  'alemanha': { url: 'https://flagcdn.com/w160/de.png' },
  'inglaterra': { url: 'https://flagcdn.com/w160/gb-eng.png' },
  'portugal': { url: 'https://flagcdn.com/w160/pt.png' },
  'espanha': { url: 'https://flagcdn.com/w160/es.png' },
  'italia': { url: 'https://flagcdn.com/w160/it.png' },
  'paises baixos': { url: 'https://flagcdn.com/w160/nl.png' },
  'dinamarca': { url: 'https://flagcdn.com/w160/dk.png' },
  'ucrania': { url: 'https://flagcdn.com/w160/ua.png' },
  'rep checa': { url: 'https://flagcdn.com/w160/cz.png' },
  'irlanda': { url: 'https://flagcdn.com/w160/ie.png' },
  'turquia': { url: 'https://flagcdn.com/w160/tr.png' },
  'romenia': { url: 'https://flagcdn.com/w160/ro.png' },
  'gibraltar': { url: 'https://flagcdn.com/w160/gi.png' },
  'letonia': { url: 'https://flagcdn.com/w160/lv.png' },
};

/**
 * Resolves the shield URL for a given team name or external ID.
 * @param {string} teamName 
 * @param {string} [id] 
 * @returns {string | null}
 */
export function resolveShieldUrl(teamName, id) {
  const name = teamName?.toLowerCase()?.normalize("NFD")?.replace(/[\u0300-\u036f]/g, "");
  const entry = TEAM_SHIELDS[name] || TEAM_SHIELDS[id];

  if (entry) {
    if (entry.url) return entry.url;
    const path = entry.path || 'times/escudos';
    return `https://cdn.api-futebol.com.br/${path}/${entry.hash}.${entry.ext}`;
  }

  // Fallback para o CDN do Sportingtech se tivermos um ID numérico válido
  // O hcId/acId do Sportingtech mapeia diretamente para este CDN
  if (id && !isNaN(id) && id.length > 2) {
    return `https://img-cdn001.akamaized.net/ls/crest/medium/${id}.png`;
  }

  return null;
}
