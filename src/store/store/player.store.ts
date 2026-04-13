"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { parseMetadataFromUrl, revokeSongAssets } from "@/frontend/lib/metadata";
import { getPoster } from "@/frontend/lib/poster";
import { hashToColor } from "@/frontend/lib/utils";
import type { RepeatMode, Song, SongSource } from "@/frontend/types";

function normalizeSong(input: Partial<Song> & Pick<Song, "id" | "title">): Song {
  const audioUrl = input.audio_url ?? input.src ?? "";
  const posterUrl = input.poster_url ?? input.artUrl ?? null;
  const source = (input.source ?? "uploaded") as SongSource;
  const artist = input.artist?.trim() || "Unknown Artist";
  const album = input.album?.trim() || "Unknown Album";
  const fileName = input.fileName ?? audioUrl.split("/").pop() ?? input.title;
  const playCount = input.play_count ?? input.playCount ?? 0;

  return {
    id: input.id,
    audio_url: audioUrl,
    title: input.title,
    artist,
    album,
    year: input.year,
    genre: input.genre,
    duration: input.duration ?? 0,
    poster_url: posterUrl,
    source,
    uploaded_at: input.uploaded_at ?? null,
    play_count: playCount,
    src: audioUrl,
    fileName,
    mimeType: input.mimeType ?? "audio/mpeg",
    folder:
      input.folder ??
      (source === "preloaded" ? "Preview Songs" : source === "uploaded" ? "Shared Library" : "Local Library"),
    relativePath: input.relativePath ?? fileName,
    artUrl: posterUrl ?? undefined,
    artworkSource: input.artworkSource,
    artworkPrompt: input.artworkPrompt,
    artworkCacheKey: input.artworkCacheKey ?? input.id,
    addedAt:
      input.addedAt ??
      (input.uploaded_at ? new Date(input.uploaded_at).getTime() : Date.now()),
    playCount,
    dominantColor: input.dominantColor ?? hashToColor(`${artist}-${input.title}`)
  };
}

interface PlayerStore {
  songs: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  folderName: string | null;
  hasInitialized: boolean;
  recentSearches: string[];
  playCounts: Record<string, number>;
  expandedEq: boolean;
  progress: number;
  duration: number;
  addSong: (song: Song) => void;
  setSongs: (songs: Song[], folderName: string | null) => void;
  clearSongs: () => void;
  setCurrentIndex: (index: number) => void;
  setIsPlaying: (value: boolean) => void;
  setVolume: (value: number) => void;
  setMuted: (value: boolean) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  setExpandedEq: (value: boolean) => void;
  setProgress: (value: number) => void;
  setDuration: (value: number) => void;
  reorderSongs: (songs: Song[]) => void;
  addRecentSearch: (term: string) => void;
  incrementPlayCount: (songId: string) => void;
  initPreloadedSongs: () => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      songs: [],
      currentIndex: -1,
      isPlaying: false,
      volume: 0.8,
      muted: false,
      shuffle: false,
      repeatMode: "none",
      folderName: null,
      hasInitialized: false,
      recentSearches: [],
      playCounts: {},
      expandedEq: true,
      progress: 0,
      duration: 0,
      addSong: (song) =>
        set((state) => {
          const normalized = normalizeSong(song);
          if (state.songs.some((existingSong) => existingSong.id === normalized.id)) {
            return state;
          }

          if (normalized.source === "preloaded") {
            return {
              songs: [normalized, ...state.songs]
            };
          }

          const preloadedCount = state.songs.filter(
            (existingSong) => existingSong.source === "preloaded"
          ).length;
          const nextSongs = [...state.songs];
          nextSongs.splice(preloadedCount, 0, normalized);

          return {
            songs: nextSongs
          };
        }),
      setSongs: (songs, folderName) =>
        set((state) => {
          revokeSongAssets(state.songs);
          const nextSongs = songs.map((song) => {
            const normalized = normalizeSong(song);
            return {
              ...normalized,
              playCount: state.playCounts[normalized.id] ?? normalized.playCount,
              play_count: state.playCounts[normalized.id] ?? normalized.play_count
            };
          });

          return {
            songs: nextSongs,
            folderName,
            currentIndex: nextSongs.length > 0 ? 0 : -1,
            isPlaying: false,
            progress: 0,
            duration: nextSongs[0]?.duration ?? 0
          };
        }),
      clearSongs: () =>
        set((state) => {
          revokeSongAssets(state.songs);
          return {
            songs: [],
            currentIndex: -1,
            isPlaying: false,
            progress: 0,
            duration: 0
          };
        }),
      setCurrentIndex: (index) =>
        set((state) => ({
          currentIndex: index,
          duration: state.songs[index]?.duration ?? 0,
          progress: 0
        })),
      setIsPlaying: (value) => set({ isPlaying: value }),
      setVolume: (value) => set({ volume: value }),
      setMuted: (value) => set({ muted: value }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      cycleRepeatMode: () =>
        set((state) => ({
          repeatMode:
            state.repeatMode === "none"
              ? "all"
              : state.repeatMode === "all"
                ? "one"
                : "none"
        })),
      setExpandedEq: (value) => set({ expandedEq: value }),
      setProgress: (value) => set({ progress: value }),
      setDuration: (value) => set({ duration: value }),
      reorderSongs: (songs) =>
        set((state) => {
          const activeSongId = state.songs[state.currentIndex]?.id;
          return {
            songs,
            currentIndex: activeSongId ? songs.findIndex((song) => song.id === activeSongId) : -1
          };
        }),
      addRecentSearch: (term) =>
        set((state) => {
          const normalized = term.trim();
          if (!normalized) {
            return state;
          }

          return {
            recentSearches: [
              normalized,
              ...state.recentSearches.filter(
                (item) => item.toLowerCase() !== normalized.toLowerCase()
              )
            ].slice(0, 6)
          };
        }),
      incrementPlayCount: (songId) =>
        set((state) => {
          const playCount = (state.playCounts[songId] ?? 0) + 1;
          return {
            playCounts: {
              ...state.playCounts,
              [songId]: playCount
            },
            songs: state.songs.map((song) =>
              song.id === songId
                ? { ...song, playCount, play_count: playCount }
                : song
            )
          };
        }),
      initPreloadedSongs: async () => {
        if (get().hasInitialized) {
          return;
        }

        let preloadedSongs: Song[] = [];
        try {
          const response = await fetch("/api/songs/preloaded");
          const preloaded = (await response.json()) as Song[];

          preloadedSongs = await Promise.all(
            preloaded.map(async (song) => {
              const metadata = await parseMetadataFromUrl(song.audio_url);
              const poster = await getPoster({
                title: metadata?.title ?? song.title,
                artist: metadata?.artist ?? song.artist ?? "",
                genre: metadata?.genre ?? song.genre ?? ""
              });

              return normalizeSong({
                ...song,
                title: metadata?.title ?? song.title,
                artist: metadata?.artist ?? song.artist,
                album: metadata?.album ?? song.album,
                genre: metadata?.genre ?? song.genre,
                duration: metadata?.duration ?? song.duration,
                poster_url: metadata?.coverUrl ?? poster,
                artUrl: metadata?.coverUrl ?? poster,
                source: "preloaded",
                folder: "Preview Songs"
              });
            })
          );
        } catch {
          preloadedSongs = [];
        }

        let uploadedSongs: Song[] = [];
        try {
          const { supabase } = await import("@/backend/supabase/client");
          const { data } = await supabase
            .from("songs")
            .select("*")
            .order("uploaded_at", { ascending: false });

          uploadedSongs = (data ?? []).map((song) =>
            normalizeSong({
              ...(song as Partial<Song>),
              audio_url: (song as Partial<Song>).audio_url,
              poster_url: (song as Partial<Song>).poster_url,
              source: "uploaded",
              folder: "Shared Library"
            })
          );
        } catch {
          uploadedSongs = [];
        }

        set((state) => ({
          songs: [...preloadedSongs, ...uploadedSongs],
          currentIndex:
            state.currentIndex >= 0
              ? state.currentIndex
              : preloadedSongs.length || uploadedSongs.length
                ? 0
                : -1,
          duration:
            state.currentIndex >= 0
              ? state.duration
              : preloadedSongs[0]?.duration ?? uploadedSongs[0]?.duration ?? 0,
          hasInitialized: true
        }));
      }
    }),
    {
      name: "aura-player-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        shuffle: state.shuffle,
        repeatMode: state.repeatMode,
        folderName: state.folderName,
        hasInitialized: state.hasInitialized,
        recentSearches: state.recentSearches,
        playCounts: state.playCounts,
        expandedEq: state.expandedEq
      })
    }
  )
);
