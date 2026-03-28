/**
 * sportingtech.js — Core service for Sportingtech Frontend API
 * 
 * Handles base URLs, mandatory headers (languageid, bragiurl, etc.),
 * and Base64 encoding for the 'encodedbody' parameter.
 */

// Use relative paths for development (handled by Vite proxy in vite.config.js)
// In production, these would be absolute or environment-specific
const BASE_URL = '/api-v2';
const GENERIC_URL = '/api-generic';
const BRAGI_URL = '/bragi'; 
const CUSTOM_ORIGIN = 'https://esportesdasorte.bet.br';

const DEFAULT_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'languageid': '23',
  'device': 'd',
  'customorigin': CUSTOM_ORIGIN,
  'bragiurl': 'https://bragi.sportingtech.com/',
  'Origin': CUSTOM_ORIGIN,
  'Referer': CUSTOM_ORIGIN + '/',
};

/**
 * Executes a GET request to the Sportingtech API-generic (popular odds).
 */
export async function sportingGenericFetch(endpoint, params = {}) {
  const query = new URLSearchParams({
    languageId: '23',
    deviceType: 'd',
    ...params
  }).toString();
  
  const url = `${GENERIC_URL}${endpoint}?${query}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS
    });
    if (!response.ok) throw new Error(`Generic API Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from Generic API:', error);
    throw error;
  }
}

/**
 * Base64 encodes a JSON object for use in API paths.
 * @param {Object} [body={}] - The JSON body to encode
 * @returns {string} Base64 string
 */
function encodeBody(body = {}) {
  const json = JSON.stringify({ requestBody: body });
  return btoa(json);
}

/**
 * Executes a GET request to the Sportingtech API-v2.
 * @param {string} endpoint - The path (e.g., '/popular-fixture')
 * @param {Object} [params={}] - Parameters to be encoded in 'encodedbody'
 * @param {string[]} [extraSegments=[]] - Additional path segments before encodedBody
 * @param {string} [context='d/23/esportesdasortevip'] - URL context
 * @returns {Promise<any>}
 */
export async function sportingFetch(endpoint, params = {}, extraSegments = [], context = 'd/23/esportesdasortevip') {
  const encoded = encodeBody(params);
  
  // Sportingtech structure: /api-v2/{endpoint}/{context}/{extraSegments...}/{encodedbody}
  let url = `${BASE_URL}${endpoint}/${context}`;
  
  if (extraSegments.length > 0) {
    url += `/${extraSegments.join('/')}`;
  }
  
  url += `/${encoded}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...DEFAULT_HEADERS,
        'encodedbody': encoded
      },
    });

    if (!response.ok) {
      throw new Error(`Sportingtech API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch from Sportingtech:', error);
    throw error;
  }
}
