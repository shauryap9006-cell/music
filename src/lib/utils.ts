import type { AlbumGroup, ArtistGroup, Song } from "@/frontend/types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function formatDuration(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "0:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function stripFileDecorators(fileName: string) {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/_spotdown\.org/gi, "")
    .replace(/\s*\(\d+\)$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hashToColor(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 58%)`;
}

export function formatFolderLabel(folderName: string | null) {
  if (!folderName) {
    return "No folder loaded";
  }

  return folderName.replace(/[_-]+/g, " ").trim();
}

export function sumDuration(songs: Song[]) {
  return songs.reduce((total, song) => total + song.duration, 0);
}

export function getAlbumGroups(songs: Song[]): AlbumGroup[] {
  const map = new Map<string, AlbumGroup>();

  songs.forEach((song) => {
    const key = `${song.album}::${song.artist}`;
    const existing = map.get(key);

    if (existing) {
      existing.songs.push(song);
      existing.duration += song.duration;
      return;
    }

    map.set(key, {
      id: key,
      name: song.album,
      artist: song.artist,
      artUrl: song.artUrl,
      dominantColor: song.dominantColor,
      songs: [song],
      duration: song.duration
    });
  });

  return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export function getArtistGroups(songs: Song[]): ArtistGroup[] {
  const map = new Map<string, ArtistGroup>();

  songs.forEach((song) => {
    const key = song.artist || "Unknown artist";
    const existing = map.get(key);

    if (existing) {
      existing.songs.push(song);
      existing.duration += song.duration;
      return;
    }

    map.set(key, {
      id: key,
      name: key,
      artUrl: song.artUrl,
      dominantColor: song.dominantColor,
      songs: [song],
      duration: song.duration
    });
  });

  return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
}

export function toTitleLetters(value: string) {
  return value.split("");
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

