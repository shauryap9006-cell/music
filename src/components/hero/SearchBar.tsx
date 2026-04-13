"use client";

import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { GlassCard } from "@/frontend/components/ui/GlassCard";
import { formatDuration } from "@/frontend/lib/utils";
import { usePlayerStore } from "@/frontend/store/player.store";

export function SearchBar() {
  const router = useRouter();
  const songs = usePlayerStore((state) => state.songs);
  const addRecentSearch = usePlayerStore((state) => state.addRecentSearch);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const normalized = query.toLowerCase();
    return songs
      .filter((song) =>
        [song.title, song.artist, song.album].some((value) =>
          value.toLowerCase().includes(normalized)
        )
      )
      .slice(0, 5);
  }, [query, songs]);

  const submit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/search");
      return;
    }

    addRecentSearch(trimmed);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl px-6">
      <GlassCard className="relative overflow-visible rounded-full p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full border border-white/6 bg-black/30 px-4 py-2">
            <Search className="h-4 w-4 text-white/20" />
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submit();
                }
              }}
              placeholder="Search songs, artists, albums..."
              value={query}
            />
          </div>
          <button
            className="rounded-full bg-white px-5 py-2 text-xs font-bold text-zinc-950 transition hover:bg-white/90 md:min-w-[100px] cursor-pointer"
            onClick={submit}
            type="button"
          >
            Search
          </button>
        </div>

        {query.trim() && songs.length > 0 ? (
          <div className="absolute left-0 right-0 top-[calc(100%+1rem)] z-20">
            <GlassCard className="mx-4 overflow-hidden border-white/6 bg-[#0c0c0f]/95 p-2">
              {results.length > 0 ? (
                results.map((song) => (
                  <button
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/4 cursor-pointer"
                    key={song.id}
                    onClick={() => {
                      addRecentSearch(song.title);
                      router.push(`/search?q=${encodeURIComponent(song.title)}`);
                    }}
                    type="button"
                  >
                    <div>
                      <p className="font-medium text-white">{song.title}</p>
                      <p className="text-sm text-white/35">
                        {`${song.artist} - ${song.album}`}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-white/20">
                      {formatDuration(song.duration)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-5 text-sm text-white/35">
                  No matching tracks found.
                </div>
              )}
            </GlassCard>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
