#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Lists the game suggestions visitors have submitted through the site's
 * "suggest a game" dialog, which the Angular app writes to the Firestore
 * `suggestions` collection (see src/app/services/suggestions.service.ts).
 *
 * This is the discovery half of the add-game workflow: run it to see what
 * people have asked for, then add the good ones to games.json.
 *
 * Reading the collection needs Firestore admin credentials, so it
 * authenticates with the service-account key kept at the repo root
 * (gitignored). There is deliberately no firebase-admin dependency: the
 * service account is used to mint an OAuth token by hand and the Firestore
 * REST API is called directly, which keeps the build dependency-free.
 *
 * Usage:
 *   node scripts/list-suggestions.js            # human-readable table
 *   node scripts/list-suggestions.js --json     # machine-readable JSON
 *
 * Credentials are discovered from $GOOGLE_APPLICATION_CREDENTIALS, or
 * otherwise from any *.json service-account key in the repo root.
 */

const REPO_ROOT = path.join(__dirname, '..');
const GAMES_JSON = path.join(REPO_ROOT, 'src', 'assets', 'games.json');
const COLLECTION = 'suggestions';
const PAGE_SIZE = 300;
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/datastore';

/**
 * Finds the service-account key: an explicit path wins, otherwise scan the
 * repo root for a JSON file that looks like a Google service account.
 */
function findCredentials() {
  const explicit = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      throw new Error(`GOOGLE_APPLICATION_CREDENTIALS points at a missing file: ${explicit}`);
    }
    return explicit;
  }

  for (const entry of fs.readdirSync(REPO_ROOT)) {
    if (!entry.endsWith('.json')) {
      continue;
    }
    const full = path.join(REPO_ROOT, entry);
    try {
      const parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (parsed.type === 'service_account' && parsed.project_id && parsed.private_key) {
        return full;
      }
    } catch {
      // Not a JSON credentials file; keep looking.
    }
  }

  throw new Error(
    'No service-account key found. Place the Firebase service-account JSON at the ' +
      'repo root (it is gitignored), or set GOOGLE_APPLICATION_CREDENTIALS.'
  );
}

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const signingInput = `${base64url(
    JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: key.private_key_id })
  )}.${base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600
    })
  )}`;
  const signature = crypto.createSign('RSA-SHA256').update(signingInput).sign(key.private_key);
  const assertion = `${signingInput}.${base64url(signature)}`;

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion
    })
  });

  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Token request failed (HTTP ${response.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

async function fetchSuggestions(token, projectId) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${COLLECTION}`;
  const rows = [];
  let pageToken;

  do {
    const url = new URL(base);
    url.searchParams.set('pageSize', String(PAGE_SIZE));
    if (pageToken) {
      url.searchParams.set('pageToken', pageToken);
    }

    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(`Firestore query failed (HTTP ${response.status}): ${JSON.stringify(body)}`);
    }

    for (const doc of body.documents ?? []) {
      const fields = doc.fields?.suggestion?.mapValue?.fields ?? {};
      rows.push({
        id: doc.name?.split('/').pop() ?? '',
        name: fields.name?.stringValue ?? '',
        url: fields.url?.stringValue ?? '',
        created: doc.createTime ?? ''
      });
    }
    pageToken = body.nextPageToken;
  } while (pageToken);

  return rows.sort((a, b) => (a.created < b.created ? -1 : 1));
}

/**
 * Normalises a URL so a suggestion can be matched against a catalogue entry
 * regardless of protocol, www, trailing slash or tracking query string.
 */
function normaliseUrl(value) {
  if (!value) {
    return '';
  }
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const pathname = url.pathname.replace(/\/+$/, '');
    return `${host}${pathname}`.toLowerCase();
  } catch {
    return String(value).trim().toLowerCase();
  }
}

function loadCatalogue() {
  if (!fs.existsSync(GAMES_JSON)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(GAMES_JSON, 'utf8'));
}

/**
 * Marks each suggestion as already in the catalogue or awaiting review, so the
 * table only needs a glance rather than a cross-check by hand.
 */
function annotate(suggestions, games) {
  const listed = new Set();
  for (const game of games) {
    if (game.url) {
      listed.add(normaliseUrl(game.url));
    }
    if (game.name) {
      listed.add(String(game.name).trim().toLowerCase());
    }
    if (game.slug) {
      listed.add(String(game.slug).trim().toLowerCase());
    }
  }

  return suggestions.map(suggestion => ({
    ...suggestion,
    listed:
      listed.has(normaliseUrl(suggestion.url)) || listed.has(suggestion.name.trim().toLowerCase())
  }));
}

function printTable(rows) {
  if (!rows.length) {
    console.log('No suggestions found.');
    return;
  }

  const nameWidth = Math.max(4, ...rows.map(row => row.name.length));
  for (const row of rows) {
    const marker = row.listed ? 'listed ' : 'NEW    ';
    console.log(
      `${marker} ${row.created.slice(0, 10)}  ${row.name.padEnd(nameWidth)}  ${row.url}`
    );
  }

  const newCount = rows.filter(row => !row.listed).length;
  console.log(
    `\n${rows.length} suggestion(s): ${newCount} not yet in the catalogue, ${rows.length - newCount} already listed.`
  );
}

async function main() {
  const asJson = process.argv.includes('--json');

  const credentialsPath = findCredentials();
  const key = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

  const token = await getAccessToken(key);
  const suggestions = await fetchSuggestions(token, key.project_id);
  const rows = annotate(suggestions, loadCatalogue());

  if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  printTable(rows);
}

main().catch(error => {
  console.error(`list-suggestions: ${error.message}`);
  process.exit(1);
});
