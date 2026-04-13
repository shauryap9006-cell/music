"use client";

import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { SongRow } from "@/frontend/components/library/SongRow";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { FolderPickerButton } from "@/frontend/components/ui/FolderPickerButton";
import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { getAlbumGroups, getArtistGroups, sumDuration } from "@/frontend/lib/utils";
import { usePlayerStore } from "@/frontend/store/player.store";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const initialQuery = searchParams.get("q") ?? "";
  const { songs, currentSong, play } = useAudioController();
  const recentSearches = usePlayerStore((state) => state.recentSearches);
  const addRecentSearch = usePlayerStore((state) => state.addRecentSearch);
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setQuery(initialQuery);
    setDebouncedQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const trimmed = query.trim();
      setDebouncedQuery(trimmed);
      if (trimmed) {
        addRecentSearch(trimmed);
      }
    }, 150);

    return () => window.clearTimeout(timeout);
  }, [addRecentSearch, query]);

  const normalizedQuery = debouncedQuery.toLowerCase();

  const filteredSongs = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    return songs.filter((song) =>
      [song.title, song.artist, song.album].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    );
  }, [normalizedQuery, songs]);

  const filteredAlbums = useMemo(() => getAlbumGroups(filteredSongs), [filteredSongs]);
  const filteredArtists = useMemo(() => getArtistGroups(filteredSongs), [filteredSongs]);

  const openSong = (songId: string | undefined) => {
    if (!songId) {
      return;
    }

    const songIndex = songs.findIndex((song) => song.id === songId);
    if (songIndex >= 0) {
      play(songIndex);
      router.push("/player");
    }
  };

  return (
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1480px] px-6 py-6 md:px-10"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.55 }}
    >
      <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Link className="font-display text-4xl text-white" href="/">
            Aura Search
          </Link>
          <p className="mt-2 text-base text-[var(--text-muted)]">
            Search songs, albums, and artists across your loaded local library.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            className="rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm text-white transition hover:bg-white/12"
            href="/player"
          >
            Player
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm text-white transition hover:bg-white/12"
            href="/library"
          >
            Library
          </Link>
          <FolderPickerButton />
        </div>
      </div>

      <GlassCard className="mb-6 p-6 md:p-8">
        <div className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-black/20 px-5 py-5">
          <Search className="h-6 w-6 text-[var(--text-muted)]" />
          <input
            className="w-full bg-transparent text-2xl text-white outline-none placeholder:text-[var(--text-muted)]"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                router.replace(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
              }
            }}
            placeholder="Search songs, albums, or artists..."
            ref={inputRef}
            value={query}
          />
        </div>

        {!query.trim() && recentSearches.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <button
                className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white transition hover:bg-white/12"
                key={item}
                onClick={() => setQuery(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
        ) : null}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-3">
        <GlassCard className="p-5 xl:col-span-2">
          {songs.length === 0 ? (
            <div className="flex min-h-[24rem] flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/8">
                <Search className="h-8 w-8 text-white/80" />
              </div>
              <h2 className="font-display text-4xl text-white">Load a library first</h2>
              <p className="max-w-md text-base leading-7 text-[var(--text-muted)]">
                Search activates once you import a local folder on the player or landing page.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {debouncedQuery ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  key={debouncedQuery}
                  transition={{ duration: 0.3 }}
                >
                  {filteredSongs.length > 0 || filteredAlbums.length > 0 || filteredArtists.length > 0 ? (
                    <div className="space-y-8">
                      <section className="space-y-3">
                        <div>
                          <p className="font-display text-3xl text-white">Songs</p>
                          <p className="text-sm text-[var(--text-muted)]">{filteredSongs.length} matches</p>
                        </div>
                        {filteredSongs.map((song) => (
                          <SongRow
                            active={currentSong?.id === song.id}
                            key={song.id}
                            onPlay={() => openSong(song.id)}
                            song={song}
                          />
                        ))}
                      </section>

                      <section className="space-y-3">
                        <div>
                          <p className="font-display text-3xl text-white">Albums</p>
                          <p className="text-sm text-[var(--text-muted)]">{filteredAlbums.length} matches</p>
                        </div>
                        {filteredAlbums.map((album) => (
                          <button
                            className="flex w-full items-center justify-between rounded-[24px] border border-white/8 bg-white/4 px-4 py-4 text-left transition hover:bg-white/8"
                            key={album.id}
                            onClick={() => openSong(album.songs[0]?.id)}
                            type="button"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white">{album.name}</p>
                              <p className="text-sm text-[var(--text-muted)]">
                                {album.artist} - {album.songs.length} tracks
                              </p>
                            </div>
                            <span className="text-sm text-[var(--text-muted)]">
                              {Math.round(sumDuration(album.songs) / 60)} min
                            </span>
                          </button>
                        ))}
                      </section>

                      <section className="space-y-3">
                        <div>
                          <p className="font-display text-3xl text-white">Artists</p>
                          <p className="text-sm text-[var(--text-muted)]">{filteredArtists.length} matches</p>
                        </div>
                        {filteredArtists.map((artist) => (
                          <button
                            className="flex w-full items-center justify-between rounded-[24px] border border-white/8 bg-white/4 px-4 py-4 text-left transition hover:bg-white/8"
                            key={artist.id}
                            onClick={() => openSong(artist.songs[0]?.id)}
                            type="button"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-white">{artist.name}</p>
                              <p className="text-sm text-[var(--text-muted)]">{artist.songs.length} tracks</p>
                            </div>
                            <span className="text-sm text-[var(--text-muted)]">
                              {Math.round(sumDuration(artist.songs) / 60)} min
                            </span>
                          </button>
                        ))}
                      </section>
                    </div>
                  ) : (
                    <div className="flex min-h-[24rem] flex-col items-center justify-center gap-4 text-center">
                      <motion.div
                        animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
                        className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-[linear-gradient(135deg,rgba(167,139,250,0.24),rgba(244,114,182,0.18))]"
                        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                      >
                        <Sparkles className="h-8 w-8 text-white/80" />
                      </motion.div>
                      <h2 className="font-display text-4xl text-white">No results for {debouncedQuery}</h2>
                      <p className="max-w-md text-base leading-7 text-[var(--text-muted)]">
                        Try another song title, artist, or album once your folder is loaded.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex min-h-[24rem] flex-col items-center justify-center gap-4 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  key="empty-search"
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/8">
                    <Search className="h-8 w-8 text-white/80" />
                  </div>
                  <h2 className="font-display text-4xl text-white">Start typing</h2>
                  <p className="max-w-md text-base leading-7 text-[var(--text-muted)]">
                    Results are debounced by 150ms and grouped by songs, albums, and artists.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="font-display text-3xl text-white">Recent searches</h2>
          <div className="mt-5 space-y-3">
            {recentSearches.length > 0 ? (
              recentSearches.map((item) => (
                <button
                  className="w-full rounded-[22px] border border-white/8 bg-white/4 px-4 py-4 text-left text-white transition hover:bg-white/8"
                  key={item}
                  onClick={() => setQuery(item)}
                  type="button"
                >
                  {item}
                </button>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--text-muted)]">
                Search terms will appear here after you start exploring your library.
              </p>
            )}
          </div>
        </GlassCard>
      </div>
    </motion.main>
  );
}

