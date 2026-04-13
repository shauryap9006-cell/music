"use client";

import Link from "next/link";
import { Grid2X2, List, Music2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AlbumCard } from "@/frontend/components/library/AlbumCard";
import { SongGrid } from "@/frontend/components/library/SongGrid";
import { SongRow } from "@/frontend/components/library/SongRow";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import { Button } from "@/frontend/components/ui/Button";
import { FolderPickerButton } from "@/frontend/components/ui/FolderPickerButton";
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
    <motion.main
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-[1480px] px-6 py-6 md:px-10"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.55 }}
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
            className="rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm text-white transition hover:bg-white/12"
            href="/player"
          >
            Player
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm text-white transition hover:bg-white/12"
            href="/search"
          >
            Search
          </Link>
          <FolderPickerButton />
        </div>
      </div>

      <GlassCard className="mb-6 p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <Button
                key={item.value}
                onClick={() => setFilter(item.value)}
                type="button"
                variant={filter === item.value ? "primary" : "secondary"}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/6 p-1">
              <button
                className={`rounded-full p-2 ${view === "grid" ? "bg-white/12 text-white" : "text-[var(--text-muted)]"}`}
                onClick={() => setView("grid")}
                type="button"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
              <button
                className={`rounded-full p-2 ${view === "list" ? "bg-white/12 text-white" : "text-[var(--text-muted)]"}`}
                onClick={() => setView("list")}
                type="button"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <select
              className="rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none"
              onChange={(event) => setSort(event.target.value as LibrarySort)}
              value={sort}
            >
              {sorts.map((item) => (
                <option className="bg-[#0c0a16]" key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {songs.length === 0 ? (
        <GlassCard className="flex min-h-[24rem] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8">
            <Music2 className="h-7 w-7 text-white/70" />
          </div>
          <h2 className="font-display text-3xl text-white">No library loaded</h2>
          <p className="max-w-lg text-base leading-7 text-[var(--text-muted)]">
            Load a local folder to browse albums, artists, recently added tracks, and the full song list.
          </p>
          <FolderPickerButton label="Open Folder" navigateOnLoad />
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
            <GlassCard className="p-5" key={artist.id}>
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
  );
}

