"use client";

import { useEffect } from "react";

import { supabase } from "@/backend/supabase/client";
import { usePlayerStore } from "@/frontend/store/player.store";
import type { Song } from "@/frontend/types";

export function useLibrarySync() {
  const addSong = usePlayerStore((state) => state.addSong);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      return;
    }

    const channel = client
      .channel("library-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "songs" },
        (payload) => {
          addSong(payload.new as Song);
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [addSong]);
}
