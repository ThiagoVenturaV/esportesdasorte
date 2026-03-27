import { sportingFetch, sportingGenericFetch } from '@/services/sportingtech';
import TeamShield from '@/components/TeamShield';
import React from 'react';

function extractTeamId(fixture, side) {
  const isHome = side === 'home';
  const candidateKeys = isHome
    ? ['hcId', 'hId', 'homeId', 'homeCompetitorId', 'hcid', 'homeTeamId']
    : ['acId', 'aId', 'awayId', 'awayCompetitorId', 'acid', 'awayTeamId'];

  for (const key of candidateKeys) {
    const value = fixture?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }

  return String(fixture?.fId || '');
}

/**
 * Maps a Sportingtech fixture object to the internal Match format.
 */
function mapFixtureToMatch(
  f,
  categoryName = '',
  seasonName = '',
  sportName = 'soccer',
) {
  // Handle both flat (popularOdds) and nested (fixture-search) formats
  const homeName = f.hcN || f.fixtureInfo?.split(' vs. ')[0] || 'Home';
  const awayName = f.acN || f.fixtureInfo?.split(' vs. ')[1] || 'Away';

  const mDat = f.mDat || {};
  const homeScore = mDat.hcS ?? 0;
  const awayScore = mDat.acS ?? 0;

  const minute = mDat.sud ? `${Math.floor(mDat.sud / 60)}'` : '';
  const period = mDat.st || (f.fStId > 1 ? 'Ao Vivo' : 'Em breve');

  let odds = { home: 0, draw: 0, away: 0 };

  if (f.btgs) {
    const mainBtg = f.btgs.find(
      (g) => g.btgN?.toLowerCase().includes('resultado') || g.btgId === 1,
    );
    if (mainBtg?.fos) {
      mainBtg.fos.forEach((o) => {
        const label = (o.hSh || '').toLowerCase();
        if (label === homeName.toLowerCase() || o.oN?.includes('1'))
          odds.home = o.hO;
        else if (label === awayName.toLowerCase() || o.oN?.includes('2'))
          odds.away = o.hO;
        else if (label.includes('empate') || o.oN?.includes('X'))
          odds.draw = o.hO;
      });
    }
  } else if (f.odd) {
    if (f.selectionName === homeName) odds.home = f.odd;
    else if (f.selectionName?.toLowerCase().includes('empate'))
      odds.draw = f.odd;
    else odds.away = f.odd;
  }

  return {
    id: String(f.fId),
    status: f.fStId > 1 || f.lvt ? 'live' : 'upcoming',
    sport: (sportName || f.stN || 'soccer').toLowerCase(),
    league: seasonName || categoryName || f.cN || 'Liga',
    home: {
      name: homeName,
      shortName: homeName.substring(0, 3).toUpperCase(),
      logo: (
        <TeamShield name={homeName} externalId={extractTeamId(f, 'home')} />
      ),
    },
    away: {
      name: awayName,
      shortName: awayName.substring(0, 3).toUpperCase(),
      logo: (
        <TeamShield name={awayName} externalId={extractTeamId(f, 'away')} />
      ),
    },
    homeScore,
    awayScore,
    minute: minute || (f.fStId === 1 ? 'Hoje' : ''),
    period,
    odds,
    markets: (f.btgs || []).map((btg) => ({
      id: String(btg.btgId),
      name: btg.btgN,
      category: 'PRINCIPAIS',
      selections: (btg.fos || []).map((o) => ({
        label: o.hSh || o.oN,
        odd: o.hO,
      })),
    })),
  };
}

/**
 * Returns all currently live matches.
 */
export async function getLiveMatches(filters = {}) {
  try {
    let matches = [];

    // Tentativa 1: live-fixture (Endpoint principal de produção)
    try {
      const data = await sportingFetch('/live-fixture', {
        sportSelfUrlKey: filters.sport || 'soccer',
        timeRangeInHours: 24,
      });

      if (data?.success && data?.data) {
        const categories = Array.isArray(data.data)
          ? data.data
          : data.data.cs || [];
        categories.forEach((cat) => {
          const sns = cat.sns || [];
          sns.forEach((sn) => {
            (sn.fs || []).forEach((f) => {
              matches.push(mapFixtureToMatch(f, cat.cN, sn.snN, cat.stN));
            });
          });
        });
      }
    } catch (e) {
      console.warn('Live API attempt 1 (live-fixture) failed:', e);
    }

    // Tentativa 2: Popular Odds (Generic API)
    if (matches.length === 0) {
      try {
        const data2 = await sportingGenericFetch('/sportbet/getPopularOdds');
        if (data2?.success && data2?.data?.length > 0) {
          matches = data2.data.map((f) => mapFixtureToMatch(f));
        }
      } catch (e) {
        console.warn('Live API attempt 2 failed:', e);
      }
    }

    if (filters.sport) {
      matches = matches.filter(
        (m) => m.sport.toLowerCase() === filters.sport.toLowerCase(),
      );
    }

    return matches;
  } catch (error) {
    console.error('Error in getLiveMatches:', error);
    return [];
  }
}

/**
 * Returns all upcoming matches.
 */
export async function getUpcomingMatches(filters = {}) {
  try {
    const data = await sportingFetch(
      '/upcoming-events',
      {
        sportSelfUrlKey: null,
      },
      ['null'],
    );

    const matches = [];
    if (data?.success && Array.isArray(data.data)) {
      data.data.forEach((sport) => {
        const categories = sport.cs || [];
        categories.forEach((cat) => {
          const seasons = cat.sns || [];
          seasons.forEach((sn) => {
            const fixtures = sn.fs || [];
            fixtures.forEach((f) => {
              if (
                filters.sport &&
                sport.stN?.toLowerCase() !== filters.sport.toLowerCase()
              )
                return;
              matches.push(mapFixtureToMatch(f, cat.cN, sn.snN, sport.stN));
            });
          });
        });
      });
    }
    return matches;
  } catch (error) {
    console.error('Error in getUpcomingMatches:', error);
    return [];
  }
}

/**
 * Returns a single match by id.
 */
export async function getMatchById(id) {
  try {
    const fixtureId = Number(id);
    if (isNaN(fixtureId)) return null;

    const data = await sportingFetch(
      '/detail-card',
      {
        fixtureIds: [fixtureId],
      },
      [id],
    );

    if (data?.success && data?.data) {
      const fixtures = data.data.fixtures || data.data;
      const f = Array.isArray(fixtures)
        ? fixtures.find((i) => i.fId === fixtureId)
        : fixtures;
      if (f && f.fId) return mapFixtureToMatch(f);
    }
    return null;
  } catch (error) {
    console.error('Error in getMatchById:', error);
    return null;
  }
}
