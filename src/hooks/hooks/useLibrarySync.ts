"use client";

import { useEffect } from "react";

import { supabase } from "@/backend/supabase/client";
import { usePlayerStore } from "@/frontend/store/player.store";

export function useLibrarySync() {
  const addSong = usePlayerStore((state) => state.addSong);

  useEffect(() => {
    const channel = supabase
      .channel("library-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "songs" },
        (payload) => {
          addSong(payload.new as never);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [addSong]);
}
