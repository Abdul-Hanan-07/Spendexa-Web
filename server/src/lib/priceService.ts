import * as cheerio from 'cheerio';

export type PriceAssetType = 'PSX' | 'CRYPTO' | 'REAL_ESTATE' | 'METAL';

export type PriceOutcome =
  | { ok: true; price: number; actualDate: string; requestedDate?: string; fallback: boolean }
  | { ok: false; error: string };

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Generic in-memory TTL cache
// ---------------------------------------------------------------------------

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

function setCached<T>(key: string, value: T, ttlMs: number): void {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

const FIFTEEN_MIN = 15 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const THIRTY_DAYS = 30 * ONE_DAY;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// PSX (Pakistan Stock Exchange) — dps.psx.com.pk official Data Portal
// ---------------------------------------------------------------------------

interface PsxRow {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
}

function parsePsxNumber(text: string): number {
  return Number(text.replace(/,/g, '').trim());
}

const MONTH_ABBREVIATIONS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

// PSX renders dates as "Jul 8, 2026". `new Date(text)` parses that in the
// server's local timezone, which silently shifts the date on any host not
// on UTC (e.g. Asia/Karachi, UTC+5, shifts every date back by a day). Parse
// the three fields explicitly and build a UTC date to keep it timezone-safe.
function parsePsxDate(text: string): string | null {
  const match = /^([A-Za-z]{3})\s+(\d{1,2}),\s*(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const month = MONTH_ABBREVIATIONS[match[1]!.toLowerCase()];
  if (month === undefined) return null;
  const day = Number(match[2]);
  const year = Number(match[3]);
  return toIsoDate(new Date(Date.UTC(year, month, day)));
}

async function fetchPsxHistory(symbol: string): Promise<PsxRow[]> {
  const ticker = symbol.trim().toUpperCase();
  const cacheKey = `psx:${ticker}`;
  const cached = getCached<PsxRow[]>(cacheKey);
  if (cached) return cached;

  const res = await fetchWithTimeout('https://dps.psx.com.pk/historical', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (compatible; Spendexa/1.0)',
    },
    body: `symbol=${encodeURIComponent(ticker)}`,
  });

  if (!res.ok) {
    throw new Error(`PSX source responded with ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);
  const rows: PsxRow[] = [];

  $('#historicalTable tbody tr').each((_, el) => {
    const cells = $(el).find('td');
    const isoDate = parsePsxDate($(cells[0]).text());
    if (!isoDate) return;

    rows.push({
      date: isoDate,
      open: parsePsxNumber($(cells[1]).text()),
      high: parsePsxNumber($(cells[2]).text()),
      low: parsePsxNumber($(cells[3]).text()),
      close: parsePsxNumber($(cells[4]).text()),
    });
  });

  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  setCached(cacheKey, rows, FIFTEEN_MIN);
  return rows;
}

function findPsxRowForDate(rows: PsxRow[], dateStr: string): { row: PsxRow; fallback: boolean } | null {
  // rows are sorted descending by date, so the first entry with date <= dateStr
  // is either the exact trading day or the nearest prior trading day (weekend/holiday fallback).
  const match = rows.find((r) => r.date <= dateStr);
  if (!match) return null;
  return { row: match, fallback: match.date !== dateStr };
}

async function getPsxHistoricalPrice(symbol: string, dateStr: string): Promise<PriceOutcome> {
  const rows = await fetchPsxHistory(symbol);
  if (rows.length === 0) {
    return { ok: false, error: `No PSX data found for symbol "${symbol}".` };
  }
  const match = findPsxRowForDate(rows, dateStr);
  if (!match) {
    return { ok: false, error: `No PSX price data available on or before ${dateStr} for "${symbol}".` };
  }
  return {
    ok: true,
    price: match.row.close,
    actualDate: match.row.date,
    requestedDate: dateStr,
    fallback: match.fallback,
  };
}

async function getPsxCurrentPrice(symbol: string): Promise<PriceOutcome> {
  const rows = await fetchPsxHistory(symbol);
  if (rows.length === 0) {
    return { ok: false, error: `No PSX data found for symbol "${symbol}".` };
  }
  const latest = rows[0]!;
  return { ok: true, price: latest.close, actualDate: latest.date, fallback: false };
}

// ---------------------------------------------------------------------------
// CRYPTO — CoinGecko public API (no auth required)
// ---------------------------------------------------------------------------

interface CoinGeckoListEntry {
  id: string;
  symbol: string;
  name: string;
}

async function getCoinGeckoList(): Promise<CoinGeckoListEntry[]> {
  const cacheKey = 'cg:list';
  const cached = getCached<CoinGeckoListEntry[]>(cacheKey);
  if (cached) return cached;

  const res = await fetchWithTimeout('https://api.coingecko.com/api/v3/coins/list');
  if (!res.ok) {
    throw new Error(`CoinGecko list responded with ${res.status}`);
  }
  const list = (await res.json()) as CoinGeckoListEntry[];
  setCached(cacheKey, list, ONE_DAY);
  return list;
}

interface CoinGeckoSearchCoin {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
}

async function searchCoinGecko(query: string): Promise<CoinGeckoSearchCoin[]> {
  const cacheKey = `cg:search:${query}`;
  const cached = getCached<CoinGeckoSearchCoin[]>(cacheKey);
  if (cached) return cached;

  const res = await fetchWithTimeout(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) {
    throw new Error(`CoinGecko search responded with ${res.status}`);
  }
  const json = (await res.json()) as { coins?: CoinGeckoSearchCoin[] };
  const coins = json.coins ?? [];
  setCached(cacheKey, coins, ONE_DAY);
  return coins;
}

// /coins/list has no market-cap ordering, so a naive symbol match (e.g. "btc")
// can land on an obscure token that happens to share the ticker instead of the
// real asset. /search ranks by market_cap_rank, so among exact id/symbol/name
// matches we take the best-ranked (lowest rank number) result. Falls back to
// the full list only if /search turns up nothing, to still cover long-tail coins.
async function resolveCoinGeckoId(query: string): Promise<string | null> {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const searchResults = await searchCoinGecko(q);
  const exactMatches = searchResults.filter(
    (c) => c.symbol.toLowerCase() === q || c.id.toLowerCase() === q || c.name.toLowerCase() === q,
  );
  if (exactMatches.length > 0) {
    exactMatches.sort((a, b) => (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity));
    return exactMatches[0]!.id;
  }

  const list = await getCoinGeckoList();
  return (
    list.find((c) => c.id === q)?.id ??
    list.find((c) => c.symbol === q)?.id ??
    list.find((c) => c.name.toLowerCase() === q)?.id ??
    null
  );
}

async function getCoinGeckoCurrentPrice(symbol: string, currency: string): Promise<PriceOutcome> {
  const id = await resolveCoinGeckoId(symbol);
  if (!id) {
    return { ok: false, error: `Unknown crypto symbol or name "${symbol}".` };
  }

  const vsCurrency = currency.toLowerCase();
  const cacheKey = `cg:current:${id}:${vsCurrency}`;
  const cached = getCached<number>(cacheKey);
  let price = cached;

  if (price === undefined) {
    const res = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vsCurrency)}`,
    );
    if (!res.ok) {
      return { ok: false, error: 'Price source unreachable, try again later.' };
    }
    const json = (await res.json()) as Record<string, Record<string, number>>;
    price = json[id]?.[vsCurrency];
    if (price === undefined) {
      return { ok: false, error: `No ${currency} price available for this asset.` };
    }
    setCached(cacheKey, price, FIFTEEN_MIN);
  }

  return { ok: true, price, actualDate: toIsoDate(new Date()), fallback: false };
}

async function getCoinGeckoHistoricalPrice(symbol: string, dateStr: string, currency: string): Promise<PriceOutcome> {
  const id = await resolveCoinGeckoId(symbol);
  if (!id) {
    return { ok: false, error: `Unknown crypto symbol or name "${symbol}".` };
  }

  const vsCurrency = currency.toLowerCase();
  const cursor = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(cursor.getTime())) {
    return { ok: false, error: `Invalid date "${dateStr}".` };
  }

  const MAX_FALLBACK_DAYS = 3;
  for (let attempt = 0; attempt <= MAX_FALLBACK_DAYS; attempt++) {
    const iso = toIsoDate(cursor);
    const cacheKey = `cg:hist:${id}:${vsCurrency}:${iso}`;
    let price = getCached<number>(cacheKey);

    if (price === undefined) {
      const day = String(cursor.getUTCDate()).padStart(2, '0');
      const month = String(cursor.getUTCMonth() + 1).padStart(2, '0');
      const year = cursor.getUTCFullYear();
      const res = await fetchWithTimeout(
        `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/history?date=${day}-${month}-${year}`,
      );
      if (res.ok) {
        const json = (await res.json()) as { market_data?: { current_price?: Record<string, number> } };
        price = json.market_data?.current_price?.[vsCurrency];
        if (price !== undefined) {
          setCached(cacheKey, price, THIRTY_DAYS);
        }
      }
    }

    if (price !== undefined) {
      return {
        ok: true,
        price,
        actualDate: iso,
        requestedDate: dateStr,
        fallback: iso !== dateStr,
      };
    }

    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { ok: false, error: `No historical price found for "${symbol}" around ${dateStr}.` };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

const NOT_AVAILABLE: PriceOutcome = {
  ok: false,
  error: 'Auto pricing is not available for this asset type.',
};

export async function getHistoricalPrice(
  assetType: PriceAssetType,
  symbol: string,
  dateStr: string,
  currency: string,
): Promise<PriceOutcome> {
  try {
    if (assetType === 'PSX') return await getPsxHistoricalPrice(symbol, dateStr);
    if (assetType === 'CRYPTO') return await getCoinGeckoHistoricalPrice(symbol, dateStr, currency);
    return NOT_AVAILABLE;
  } catch (err) {
    console.error('getHistoricalPrice error:', err);
    return { ok: false, error: 'Price source unreachable, try again later.' };
  }
}

export async function getCurrentPrice(
  assetType: PriceAssetType,
  symbol: string,
  currency: string,
): Promise<PriceOutcome> {
  try {
    if (assetType === 'PSX') return await getPsxCurrentPrice(symbol);
    if (assetType === 'CRYPTO') return await getCoinGeckoCurrentPrice(symbol, currency);
    return NOT_AVAILABLE;
  } catch (err) {
    console.error('getCurrentPrice error:', err);
    return { ok: false, error: 'Price source unreachable, try again later.' };
  }
}
