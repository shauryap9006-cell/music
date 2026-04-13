interface SongInfo {
  title: string;
  artist: string;
  genre: string;
}

const moodMap: Record<string, string> = {
  "hip-hop": "urban street art, dark moody, neon city",
  electronic: "abstract geometric, synthwave, electric glow",
  classical: "elegant marble, renaissance, soft golden light",
  "lo-fi": "cozy anime room, warm tones, rain window",
  rock: "dramatic lightning, dark stormy sky",
  jazz: "smoky club, vintage noir, warm amber",
  pop: "bright colorful confetti, vibrant gradient",
  bollywood: "ornate architecture, golden hour, vibrant colors",
  "r&b": "velvet curtains, moody purple light, soulful"
};

function normalizeArtist(artist: string) {
  const trimmed = artist.trim();
  if (!trimmed || /^unknown artist$/i.test(trimmed)) {
    return "";
  }

  return trimmed;
}

export function buildPosterFallbackUrl({ genre }: Pick<SongInfo, "genre">) {
  const mood = moodMap[genre?.toLowerCase()] ?? "abstract colorful music art";
  const prompt = `album cover art, ${mood}, no text, no words, cinematic, square`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=600&nologo=true`;
}

export async function getPoster({ title, artist, genre }: SongInfo): Promise<string> {
  try {
    const safeArtist = normalizeArtist(artist);
    const query = encodeURIComponent(`${safeArtist} ${title}`.trim());
    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`
    );
    const payload = (await response.json()) as {
      results?: Array<{ artworkUrl100?: string }>;
    };

    if (payload.results?.[0]?.artworkUrl100) {
      return payload.results[0].artworkUrl100.replace("100x100bb", "600x600bb");
    }
  } catch {
    // Fall through to the generated poster.
  }

  return buildPosterFallbackUrl({ genre });
}
