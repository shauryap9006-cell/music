const genreMoodMap: Record<string, string> = {
  "hip hop": "urban street art, dark moody, neon lights",
  hiphop: "urban street art, dark moody, neon lights",
  rap: "urban street art, dark moody, neon lights",
  electronic: "abstract geometric forms, synthwave glow, luminous energy",
  edm: "abstract geometric forms, synthwave glow, luminous energy",
  techno: "abstract geometric forms, synthwave glow, luminous energy",
  house: "abstract geometric forms, synthwave glow, luminous energy",
  classical: "elegant marble, renaissance mood, soft golden light",
  orchestral: "elegant marble, renaissance mood, soft golden light",
  "lo fi": "cozy room, anime-inspired warmth, soft grain",
  lofi: "cozy room, anime-inspired warmth, soft grain",
  rock: "dramatic lightning, dark sky, bold energy",
  metal: "dramatic lightning, dark sky, bold energy",
  jazz: "smoky club, vintage texture, warm amber tones"
};

function normalizeGenre(value?: string) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPosterMood(genre?: string) {
  const normalized = normalizeGenre(genre);

  if (!normalized) {
    return "abstract colorful music";
  }

  if (genreMoodMap[normalized]) {
    return genreMoodMap[normalized];
  }

  const partialMatch = Object.entries(genreMoodMap).find(([key]) => normalized.includes(key));
  return partialMatch?.[1] ?? "abstract colorful music";
}

export function buildPosterPrompt({
  genre,
  title,
  artist
}: {
  genre?: string;
  title?: string;
  artist?: string;
}) {
  const mood = getPosterMood(genre);
  const descriptors = [genre?.trim(), title?.trim(), artist?.trim()].filter(Boolean).join(", ");
  const inspiredBy = descriptors ? `inspired by ${descriptors}, ` : "";

  return `album cover art, ${inspiredBy}${mood}, cinematic, high quality, square composition, no text, no typography`;
}
