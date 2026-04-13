"use client";

import Link from "next/link";
import { Grid2X2, List, Music2, Play, Search, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AlbumCard } from "@/frontend/components/library/AlbumCard";
import { SongGrid } from "@/frontend/components/library/SongGrid";
import { SongRow } from "@/frontend/components/library/SongRow";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { UploadButton } from "@/frontend/components/upload/UploadButton";
import { Button } from "@/frontend/components/ui/Button";
import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { getAlbumGroups, getArtistGroups, sumDuration } from "@/frontend/lib/utils";
import type { LibraryFilter, LibrarySort, LibraryView, Song } from "@/frontend/types";

const filters: Array<{ label: string; value: LibraryFilter }> = [
  { label: "All", value: "all" },
  { label: "Albums", value: "albums" },
  { label: "Artists", value: "artists" },
  { label: "Recently Added", value: "recent" }
];

const sorts: Array<{ label: string; value: LibrarySort }> = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Duration", value: "duration" },
  { label: "Most Played", value: "mostPlayed" }
];

function sortSongs(songs: Song[], sort: LibrarySort) {
  const nextSongs = [...songs];

  nextSongs.sort((left, right) => {
    if (sort === "az") {
      return left.title.localeCompare(right.title);
    }
    if (sort === "za") {
      return right.title.localeCompare(left.title);
    }
    if (sort === "duration") {
      return right.duration - left.duration;
    }
    return right.playCount - left.playCount;
  });

  return nextSongs;
}

export default function LibraryPage() {
  const router = useRouter();
  const { songs, currentSong, play } = useAudioController();
  const [filter, setFilter] = useState<LibraryFilter>("all");
  const [sort, setSort] = useState<LibrarySort>("az");
  const [view, setView] = useState<LibraryView>("grid");
  const [expandedAlbumId, setExpandedAlbumId] = useState<string | null>(null);

  const filteredSongs = useMemo(() => {
    const baseSongs = filter === "recent" ? [...songs].sort((a, b) => b.addedAt - a.addedAt) : songs;
    return sortSongs(baseSongs, sort);
  }, [filter, songs, sort]);

  const albums = useMemo(() => getAlbumGroups(filteredSongs), [filteredSongs]);
  const artists = useMemo(() => getArtistGroups(filteredSongs), [filteredSongs]);

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
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background video — rotated 180° (upside down) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="pointer-events-none fixed inset-0 h-full w-full object-cover"
        style={{ zIndex: 0, transform: "rotate(180deg)" }}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4"
      />

      {/* Dark overlay for readability */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.10) 50%, rgba(0,0,0,0.20) 100%)",
        }}
      />

      {/* Page content — above the video */}
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto max-w-[1480px] px-6 py-6 md:px-10"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.55 }}
        style={{ zIndex: 2 }}
      >
        <div className="mb-6 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <Link className="font-display text-4xl text-white" href="/">
              Aura Library
            </Link>
            <p className="mt-2 text-base text-[var(--text-muted)]">
              {songs.length} songs - {Math.round(sumDuration(songs) / 60)} minutes total
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition hover:bg-white/90 cursor-pointer"
              href="/player"
            >
              <Play className="h-4 w-4" />
              Player
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/14 hover:text-white cursor-pointer backdrop-blur-sm"
              href="/search"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/70 transition hover:border-white/14 hover:text-white cursor-pointer backdrop-blur-sm"
              href="/"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <UploadButton />
          </div>
        </div>

        <GlassCard className="mb-6 p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {filters.map((item) => (
                <Button
                  key={item.value}
                  onClick={() => setFilter(item.value)}
                  type="button"
                  variant={filter === item.value ? "primary" : "secondary"}
                  className="!px-3 !py-1.5 !text-xs"
                >
                  {item.label}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.04] p-1">
                <button
                  className={`rounded-full p-1.5 transition-all ${view === "grid" ? "bg-white text-zinc-950 shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                  onClick={() => setView("grid")}
                  type="button"
                >
                  <Grid2X2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className={`rounded-full p-1.5 transition-all ${view === "list" ? "bg-white text-zinc-950 shadow-md" : "text-white/40 hover:text-white hover:bg-white/5"}`}
                  onClick={() => setView("list")}
                  type="button"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative group">
                <select
                  className="appearance-none rounded-full border border-white/8 bg-white/[0.04] pl-3 pr-8 py-1.5 text-xs font-medium text-white transition-all hover:border-white/14 hover:bg-white/[0.08] outline-none cursor-pointer focus:ring-2 focus:ring-white/10"
                  onChange={(event) => setSort(event.target.value as LibrarySort)}
                  value={sort}
                >
                  {sorts.map((item) => (
                    <option className="bg-[#0c0a16] text-white" key={item.value} value={item.value}>
                      Sort: {item.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 group-hover:text-white transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {songs.length === 0 ? (
          <GlassCard className="flex min-h-[24rem] flex-col items-center justify-center gap-4 p-8 text-center backdrop-blur-md">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8">
              <Music2 className="h-7 w-7 text-white/70" />
            </div>
            <h2 className="font-display text-3xl text-white">Waiting for songs</h2>
            <p className="max-w-lg text-base leading-7 text-[var(--text-muted)]">
              Preview tracks load automatically from `/public/preview-songs`, and every upload lands here for all
              listeners.
            </p>
            <UploadButton />
          </GlassCard>
        ) : null}

        {songs.length > 0 && (filter === "all" || filter === "recent") ? (
          view === "grid" ? (
            <SongGrid
              activeSongId={currentSong?.id}
              onPlay={(index) => openSong(filteredSongs[index]?.id)}
              songs={filteredSongs}
            />
          ) : (
            <div className="space-y-3">
              {filteredSongs.map((song) => (
                <SongRow
                  active={currentSong?.id === song.id}
                  key={song.id}
                  onPlay={() => openSong(song.id)}
                  song={song}
                />
              ))}
            </div>
          )
        ) : null}

        {songs.length > 0 && filter === "albums" ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {albums.map((album) => (
              <AlbumCard
                album={album}
                expanded={expandedAlbumId === album.id}
                key={album.id}
                onPlaySong={openSong}
                onToggle={() =>
                  setExpandedAlbumId((current) => (current === album.id ? null : album.id))
                }
              />
            ))}
          </div>
        ) : null}

        {songs.length > 0 && filter === "artists" ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {artists.map((artist) => (
              <GlassCard className="p-5 backdrop-blur-md" key={artist.id}>
                <div className="mb-4 flex items-center gap-4">
                  <div
                    className="h-16 w-16 rounded-[22px] border border-white/10"
                    style={{
                      backgroundImage: artist.artUrl
                        ? `url(${artist.artUrl})`
                        : `linear-gradient(135deg, ${artist.dominantColor}, rgba(255,255,255,0.04))`,
                      backgroundPosition: "center",
                      backgroundSize: "cover"
                    }}
                  />
                  <div>
                    <p className="font-display text-3xl text-white">{artist.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {artist.songs.length} tracks
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {artist.songs.map((song) => (
                    <SongRow
                      active={currentSong?.id === song.id}
                      key={song.id}
                      onPlay={() => openSong(song.id)}
                      song={song}
                    />
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        ) : null}
      </motion.main>
    </div>
  );
}

