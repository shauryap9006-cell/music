import type { ArtworkResult } from "@/frontend/types";
import { buildPosterPrompt } from "@/frontend/lib/posterPrompts";

export interface ArtworkLookupInput {
  title: string;
  artist?: string;
  album?: string;
  genre?: string;
  duration?: number;
}

interface ITunesSongResult {
  artistName?: string;
  trackName?: string;
  collectionName?: string;
  artworkUrl100?: string;
}

function normalizeArtworkValue(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\((feat|ft|from|with|version|spotify singles)[^)]+\)/gi, " ")
    .replace(/\[(feat|ft|from|with|version)[^\]]+\]/gi, " ")
    .replace(/\b(feat|ft|from|official|version|soundtrack|single)\b/gi, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function overlapScore(left: string, right: string) {
  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 6;
  }

  if (left.includes(right) || right.includes(left)) {
    return 4;
  }

  const leftTokens = new Set(left.split(" "));
  const rightTokens = right.split(" ");
  const shared = rightTokens.filter((token) => leftTokens.has(token)).length;

  if (!shared) {
    return 0;
  }

  return shared / Math.max(leftTokens.size, rightTokens.length) >= 0.6 ? 3 : 1;
}

function scoreItunesCandidate(candidate: ITunesSongResult, input: ArtworkLookupInput) {
  const normalizedInputTitle = normalizeArtworkValue(input.title);
  const normalizedInputArtist = normalizeArtworkValue(input.artist);
  const normalizedInputAlbum = normalizeArtworkValue(input.album);
  const normalizedTrack = normalizeArtworkValue(candidate.trackName);
  const normalizedArtist = normalizeArtworkValue(candidate.artistName);
  const normalizedAlbum = normalizeArtworkValue(candidate.collectionName);

  let score = overlapScore(normalizedTrack, normalizedInputTitle) * 2;
  score += overlapScore(normalizedArtist, normalizedInputArtist);

  if (normalizedInputAlbum) {
    score += overlapScore(normalizedAlbum, normalizedInputAlbum);
  }

  return score;
}

export function createArtworkCacheKey(input: ArtworkLookupInput) {
  return [
    normalizeArtworkValue(input.artist),
    normalizeArtworkValue(input.title),
    normalizeArtworkValue(input.album),
    input.duration ? Math.round(input.duration) : ""
  ].join("|");
}

export function upgradeItunesArtworkUrl(url: string) {
  return url.replace(/\/\d+x\d+(bb)?\./, "/600x600$1.");
}

export function buildPollinationsImageUrl(prompt: string) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
}

export async function fetchItunesArtwork(
  input: ArtworkLookupInput,
  fetchImpl: typeof fetch = fetch
): Promise<ArtworkResult | null> {
  const params = new URLSearchParams({
    term: [input.artist, input.title].filter(Boolean).join(" "),
    entity: "song",
    limit: "5"
  });
  const cacheKey = createArtworkCacheKey(input);
  const response = await fetchImpl(`https://itunes.apple.com/search?${params.toString()}`, {
    headers: {
      Accept: "application/json"
    },
    next: {
      revalidate: 60 * 60 * 24
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { results?: ITunesSongResult[] };
  const results = payload.results ?? [];

  const bestMatch = results
    .map((candidate) => ({
      candidate,
      score: scoreItunesCandidate(candidate, input)
    }))
    .filter(({ candidate }) => Boolean(candidate.artworkUrl100))
    .sort((left, right) => right.score - left.score)[0];

  if (!bestMatch?.candidate.artworkUrl100 || bestMatch.score < 12) {
    return null;
  }

  return {
    cacheKey,
    imageUrl: upgradeItunesArtworkUrl(bestMatch.candidate.artworkUrl100),
    source: "itunes"
  };
}

export function buildFallbackArtwork(input: ArtworkLookupInput): ArtworkResult {
  const prompt = buildPosterPrompt(input);

  return {
    cacheKey: createArtworkCacheKey(input),
    imageUrl: buildPollinationsImageUrl(prompt),
    source: "ai",
    prompt
  };
}

