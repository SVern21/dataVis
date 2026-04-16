/**
 * data-loader.js
 * ─────────────────────────────────────────────────────────────
 * Async CSV / JSON loader with in-memory caching.
 *
 * HOW TO SWAP MOCKS FOR REAL DATA
 * ─────────────────────────────────────────────────────────────
 * Each viz page currently calls a mock generator (e.g.
 * mockSpotifyTracks()). To use real CSVs once they are
 * populated in /data/:
 *
 *   // Before (mock):
 *   const tracks = mockSpotifyTracks();
 *
 *   // After (real):
 *   const tracks = await loadCSV('../data/spotify-tracks.csv');
 *
 * The loader uses d3.csv / d3.json under the hood and caches
 * results so the same file is never fetched twice per session.
 *
 * REQUIRES: D3 v7 loaded as a global (window.d3) via CDN.
 * ─────────────────────────────────────────────────────────────
 */

/** @type {Map<string, any>} Simple request cache keyed by path. */
const _cache = new Map();

/**
 * Load and parse a CSV file. Returns a Promise resolving to
 * an array of objects with auto-typed numeric columns.
 *
 * @param {string} path - Relative or absolute URL to the .csv
 * @returns {Promise<object[]>}
 */
export async function loadCSV(path) {
  if (_cache.has(path)) return _cache.get(path);
  const data = await d3.csv(path, d3.autoType);
  _cache.set(path, data);
  return data;
}

/**
 * Load and parse a JSON file.
 *
 * @param {string} path - Relative or absolute URL to the .json
 * @returns {Promise<any>}
 */
export async function loadJSON(path) {
  if (_cache.has(path)) return _cache.get(path);
  const data = await d3.json(path);
  _cache.set(path, data);
  return data;
}

/**
 * Invalidate the cache for a specific path, or clear all if
 * no path is given.
 * @param {string} [path]
 */
export function clearCache(path) {
  if (path) _cache.delete(path);
  else _cache.clear();
}

// ══════════════════════════════════════════════════════════════
//  MOCK DATA GENERATORS
//  Replace these calls with loadCSV() once /data/ is populated.
// ══════════════════════════════════════════════════════════════

const GENRES   = ['Pop', 'Hip-Hop', 'Electronic', 'Latin', 'R&B', 'Afrobeats', 'Rock', 'Indie'];
const REGIONS  = ['Europe', 'Americas', 'Africa', 'Asia', 'Oceania'];
const COUNTRIES = {
  Europe:   ['UK', 'Germany', 'France', 'Sweden', 'Spain', 'Netherlands'],
  Americas: ['USA', 'Brazil', 'Colombia', 'Canada', 'Mexico'],
  Africa:   ['Nigeria', 'South Africa', 'Ghana', 'Kenya'],
  Asia:     ['South Korea', 'Japan', 'India', 'Indonesia'],
  Oceania:  ['Australia', 'New Zealand'],
};

function rnd(min, max)  { return Math.random() * (max - min) + min; }
function rndInt(min, max) { return Math.floor(rnd(min, max + 1)); }
function pick(arr)      { return arr[rndInt(0, arr.length - 1)]; }

/**
 * Generate mock Spotify track data.
 * @param {number} [n=120] Number of tracks
 * @returns {object[]}
 */
export function mockSpotifyTracks(n = 120) {
  return Array.from({ length: n }, (_, i) => {
    const region  = pick(REGIONS);
    const country = pick(COUNTRIES[region]);
    const year    = rndInt(1986, 2024);
    return {
      track_id:       `track_${i}`,
      artist_name:    `Artist ${i}`,
      artist_country: country,
      region,
      genre:          pick(GENRES),
      year,
      energy:         +rnd(0, 1).toFixed(3),
      valence:        +rnd(0, 1).toFixed(3),
      tempo:          +rnd(60, 180).toFixed(1),
      danceability:   +rnd(0, 1).toFixed(3),
      popularity:     rndInt(0, 100),
    };
  });
}

/**
 * Generate mock genre trend data (year × genre popularity).
 * @param {number[]} [years] Array of years, defaults to 2000–2024
 * @returns {object[]}
 */
export function mockGenreTrends(years = d3.range(2000, 2025)) {
  const rows = [];
  GENRES.forEach(genre => {
    let base = rnd(20, 60);
    years.forEach(year => {
      base += rnd(-4, 5);
      base  = Math.max(5, Math.min(100, base));
      rows.push({ year, genre, popularity_score: +base.toFixed(2), track_count: rndInt(50, 800) });
    });
  });
  return rows;
}

/**
 * Generate mock global crisis data.
 * @returns {object[]}
 */
export function mockGlobalCrises() {
  return [
    { crisis_id: 1, crisis_name: 'Gulf War',            crisis_type: 'armed_conflict', severity: 3, start_year: 1990, end_year: 1991 },
    { crisis_id: 2, crisis_name: '9/11 & Aftermath',    crisis_type: 'armed_conflict', severity: 5, start_year: 2001, end_year: 2003 },
    { crisis_id: 3, crisis_name: 'Global Financial Crisis', crisis_type: 'economic', severity: 5, start_year: 2007, end_year: 2009 },
    { crisis_id: 4, crisis_name: 'Arab Spring',         crisis_type: 'armed_conflict', severity: 4, start_year: 2010, end_year: 2012 },
    { crisis_id: 5, crisis_name: 'European Debt Crisis',crisis_type: 'economic',       severity: 4, start_year: 2010, end_year: 2013 },
    { crisis_id: 6, crisis_name: 'Syrian Civil War',    crisis_type: 'armed_conflict', severity: 5, start_year: 2011, end_year: 2021 },
    { crisis_id: 7, crisis_name: 'COVID-19 Pandemic',   crisis_type: 'pandemic',       severity: 5, start_year: 2020, end_year: 2022 },
    { crisis_id: 8, crisis_name: 'Russia-Ukraine War',  crisis_type: 'armed_conflict', severity: 5, start_year: 2022, end_year: 2024 },
    { crisis_id: 9, crisis_name: 'Cost-of-Living Crisis',crisis_type: 'economic',      severity: 3, start_year: 2022, end_year: 2024 },
  ];
}

/**
 * Generate mock artist collaboration network data.
 * @param {number} [n=22] Number of artist nodes
 * @returns {{ nodes: object[], links: object[] }}
 */
export function mockArtistNetwork(n = 22) {
  const artistNames = [
    'Dua Lipa', 'Bad Bunny', 'BTS', 'Burna Boy', 'Taylor Swift',
    'The Weeknd', 'Rosalía', 'Stormzy', 'Anitta', 'NCT 127',
    'Stromae', 'Shakira', 'Ed Sheeran', 'Afrozone', 'Cardi B',
    'Wizkid', 'Charli XCX', 'J Balvin', 'Yemi Alade', 'Björk',
    'Massive Attack', 'Gorillaz',
  ].slice(0, n);

  const nodes = artistNames.map((name, i) => {
    const region = pick(REGIONS);
    return {
      id:       i,
      name,
      region,
      country:  pick(COUNTRIES[region]),
      genre:    pick(GENRES),
      popularity: rndInt(40, 99),
    };
  });

  const links = [];
  const linkSet = new Set();
  // Ensure connectivity: random spanning links
  for (let i = 1; i < nodes.length; i++) {
    const src = rndInt(0, i - 1);
    const key = `${Math.min(src,i)}_${Math.max(src,i)}`;
    if (!linkSet.has(key)) {
      links.push({ source: src, target: i, weight: rndInt(1, 15), year: rndInt(2010, 2024) });
      linkSet.add(key);
    }
  }
  // Extra random links
  for (let k = 0; k < Math.floor(n * 0.8); k++) {
    const a = rndInt(0, n - 1);
    const b = rndInt(0, n - 1);
    if (a !== b) {
      const key = `${Math.min(a,b)}_${Math.max(a,b)}`;
      if (!linkSet.has(key)) {
        links.push({ source: a, target: b, weight: rndInt(1, 8), year: rndInt(2010, 2024) });
        linkSet.add(key);
      }
    }
  }

  return { nodes, links };
}

/**
 * Generate mock Sankey flow data (continent → genre).
 * @returns {{ nodes: object[], links: object[] }}
 */
export function mockSankeyData() {
  const sources = ['Europe', 'Americas', 'Africa', 'Asia'];
  const targets = ['Pop', 'Hip-Hop', 'Electronic', 'Latin', 'R&B', 'Afrobeats'];
  const nodes   = [...sources, ...targets].map((name, i) => ({ name, id: i }));

  const links = [];
  sources.forEach((src, si) => {
    targets.forEach((tgt, ti) => {
      const weight = rndInt(5, 80);
      if (weight > 20) { // sparse connections feel more natural
        links.push({
          source: si,
          target: sources.length + ti,
          value:  weight,
        });
      }
    });
  });

  return { nodes, links };
}
