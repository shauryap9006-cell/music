export type RepeatMode = "none" | "one" | "all";
export type AudioExtension = "mp3" | "flac" | "wav" | "ogg";
export type ArtworkSource = "embedded" | "itunes" | "ai";
export type SongSource = "preloaded" | "uploaded" | "local";
export type EQBandKey =
  | "subBass"
  | "bass"
  | "midrange"
  | "presence"
  | "brilliance";
export type LibraryFilter = "all" | "albums" | "artists" | "recent";
export type LibrarySort = "az" | "za" | "duration" | "mostPlayed";
export type LibraryView = "grid" | "list";

export interface Song {
  id: string;
  audio_url: string;
  title: string;
  artist: string;
  album: string;
  year?: string;
  genre?: string;
  duration: number;
  poster_url?: string | null;
  source: SongSource;
  uploaded_at?: string | null;
  play_count: number;
  src: string;
  fileName: string;
  mimeType: string;
  folder: string;
  relativePath: string;
  artUrl?: string;
  artworkSource?: ArtworkSource;
  artworkPrompt?: string;
  artworkCacheKey: string;
  addedAt: number;
  playCount: number;
  dominantColor: string;
}

export interface ArtworkResult {
  cacheKey: string;
  imageUrl: string;
  source: ArtworkSource;
  prompt?: string;
}

export interface PreviewTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  src: string;
  artGradient: string;
}

export interface LyricLine {
  timestamp: number;
  text: string;
  raw: string;
}

export interface LyricsPayload {
  synced: LyricLine[];
  plainText: string | null;
  rawLrc: string | null;
}

export interface EQBand {
  key: EQBandKey;
  label: string;
  frequency: number;
  gain: number;
}

export interface AlbumGroup {
  id: string;
  name: string;
  artist: string;
  artUrl?: string;
  dominantColor: string;
  songs: Song[];
  duration: number;
}

export interface ArtistGroup {
  id: string;
  name: string;
  artUrl?: string;
  dominantColor: string;
  songs: Song[];
  duration: number;
}
