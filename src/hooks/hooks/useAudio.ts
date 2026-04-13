"use client";

import { Howl, Howler } from "howler";
import { useEffect, useMemo, useRef } from "react";

import { audioEngine } from "@/frontend/lib/audio";
import { clamp } from "@/frontend/lib/utils";
import { usePlayerStore } from "@/frontend/store/player.store";

function getRandomIndex(currentIndex: number, length: number) {
  if (length <= 1) {
    return currentIndex;
  }

  let nextIndex = currentIndex;
  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }
  return nextIndex;
}

export function useAudio() {
  const songs = usePlayerStore((state) => state.songs);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const muted = usePlayerStore((state) => state.muted);
  const shuffle = usePlayerStore((state) => state.shuffle);
  const repeatMode = usePlayerStore((state) => state.repeatMode);
  const folderName = usePlayerStore((state) => state.folderName);
  const progress = usePlayerStore((state) => state.progress);
  const duration = usePlayerStore((state) => state.duration);
  const setCurrentIndex = usePlayerStore((state) => state.setCurrentIndex);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setVolumeState = usePlayerStore((state) => state.setVolume);
  const toggleMuteState = usePlayerStore((state) => state.toggleMute);
  const toggleShuffle = usePlayerStore((state) => state.toggleShuffle);
  const cycleRepeatMode = usePlayerStore((state) => state.cycleRepeatMode);
  const setMuted = usePlayerStore((state) => state.setMuted);
  const setProgress = usePlayerStore((state) => state.setProgress);
  const setDuration = usePlayerStore((state) => state.setDuration);
  const incrementPlayCount = usePlayerStore((state) => state.incrementPlayCount);

  const howlRef = useRef<Howl | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const countedSongRef = useRef<string | null>(null);
  const latestStateRef = useRef({
    songs,
    currentIndex,
    shuffle,
    repeatMode
  });

  const currentSong = songs[currentIndex] ?? null;

  useEffect(() => {
    latestStateRef.current = {
      songs,
      currentIndex,
      shuffle,
      repeatMode
    };
  }, [songs, currentIndex, shuffle, repeatMode]);

  useEffect(() => {
    audioEngine.initialize();

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      howlRef.current?.unload();
      howlRef.current = null;
    };
  }, []);

  const stopProgressLoop = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const startProgressLoop = () => {
    stopProgressLoop();

    const update = () => {
      if (howlRef.current) {
        const seek = howlRef.current.seek();
        setProgress(typeof seek === "number" ? seek : 0);
        setDuration(howlRef.current.duration());
        animationFrameRef.current = window.requestAnimationFrame(update);
      }
    };

    animationFrameRef.current = window.requestAnimationFrame(update);
  };

  const goToIndex = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= songs.length) {
      return;
    }

    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const next = () => {
    if (!songs.length) {
      return;
    }

    if (shuffle) {
      goToIndex(getRandomIndex(currentIndex, songs.length));
      return;
    }

    if (currentIndex < songs.length - 1) {
      goToIndex(currentIndex + 1);
      return;
    }

    goToIndex(0);
  };

  const previous = () => {
    if (!songs.length) {
      return;
    }

    if (progress > 3) {
      howlRef.current?.seek(0);
      setProgress(0);
      return;
    }

    if (shuffle) {
      goToIndex(getRandomIndex(currentIndex, songs.length));
      return;
    }

    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
      return;
    }

    goToIndex(songs.length - 1);
  };

  const handleTrackEnd = () => {
    const state = latestStateRef.current;
    if (!state.songs.length) {
      setIsPlaying(false);
      return;
    }

    if (state.repeatMode === "one") {
      howlRef.current?.seek(0);
      howlRef.current?.play();
      return;
    }

    if (state.shuffle) {
      goToIndex(getRandomIndex(state.currentIndex, state.songs.length));
      return;
    }

    if (state.currentIndex < state.songs.length - 1) {
      goToIndex(state.currentIndex + 1);
      return;
    }

    if (state.repeatMode === "all") {
      goToIndex(0);
      return;
    }

    setIsPlaying(false);
    setProgress(0);
  };

  useEffect(() => {
    if (!currentSong) {
      howlRef.current?.unload();
      howlRef.current = null;
      stopProgressLoop();
      setProgress(0);
      return;
    }

    stopProgressLoop();
    howlRef.current?.unload();
    countedSongRef.current = null;

    const nextHowl = new Howl({
      src: [currentSong.src],
      html5: false,
      volume: muted ? 0 : volume,
      onload: () => {
        setDuration(nextHowl.duration() || currentSong.duration);
      },
      onplay: () => {
        if (countedSongRef.current !== currentSong.id) {
          incrementPlayCount(currentSong.id);
          countedSongRef.current = currentSong.id;
        }

        setIsPlaying(true);
        startProgressLoop();
      },
      onpause: () => {
        setIsPlaying(false);
        stopProgressLoop();
      },
      onstop: () => {
        stopProgressLoop();
      },
      onend: () => {
        stopProgressLoop();
        handleTrackEnd();
      },
      onloaderror: () => {
        setIsPlaying(false);
      }
    });

    howlRef.current = nextHowl;
    setProgress(0);
    setDuration(currentSong.duration);

    if (isPlaying) {
      void Howler.ctx?.resume();
      nextHowl.play();
    }

    return () => {
      stopProgressLoop();
      nextHowl.unload();
      if (howlRef.current === nextHowl) {
        howlRef.current = null;
      }
    };
  }, [currentSong?.id]);

  useEffect(() => {
    if (!howlRef.current) {
      return;
    }

    howlRef.current.volume(muted ? 0 : volume);
  }, [volume, muted]);

  useEffect(() => {
    const howl = howlRef.current;
    if (!howl) {
      return;
    }

    if (isPlaying) {
      void Howler.ctx?.resume();
      if (!howl.playing()) {
        howl.play();
      }
      return;
    }

    if (howl.playing()) {
      howl.pause();
    }
  }, [isPlaying, currentSong?.id]);

  const setVolume = (nextVolume: number) => {
    setMuted(false);
    setVolumeState(clamp(nextVolume, 0, 1));
  };

  const seek = (time: number) => {
    if (!howlRef.current) {
      return;
    }

    const nextTime = clamp(time, 0, duration || howlRef.current.duration() || 0);
    howlRef.current.seek(nextTime);
    setProgress(nextTime);
  };

  const play = (index?: number) => {
    if (!songs.length) {
      return;
    }

    if (typeof index === "number") {
      setCurrentIndex(index);
    } else if (currentIndex < 0) {
      setCurrentIndex(0);
    }

    setIsPlaying(true);
  };

  const pause = () => setIsPlaying(false);

  const togglePlayback = () => {
    if (!songs.length) {
      return;
    }

    if (currentIndex < 0) {
      play(0);
      return;
    }

    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = async () => {
    if (typeof document === "undefined") {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isTyping) {
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
        return;
      }

      if (event.code === "ArrowRight" && event.shiftKey) {
        event.preventDefault();
        seek(progress + 5);
        return;
      }

      if (event.code === "ArrowLeft" && event.shiftKey) {
        event.preventDefault();
        seek(progress - 5);
        return;
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        next();
        return;
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        previous();
        return;
      }

      if (event.code === "ArrowUp") {
        event.preventDefault();
        setVolume(volume + 0.05);
        return;
      }

      if (event.code === "ArrowDown") {
        event.preventDefault();
        setVolume(volume - 0.05);
        return;
      }

      if (event.code === "KeyM") {
        event.preventDefault();
        toggleMuteState();
        return;
      }

      if (event.code === "KeyS") {
        event.preventDefault();
        toggleShuffle();
        return;
      }

      if (event.code === "KeyR") {
        event.preventDefault();
        cycleRepeatMode();
        return;
      }

      if (event.code === "KeyF") {
        event.preventDefault();
        void toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    cycleRepeatMode,
    next,
    previous,
    progress,
    toggleMuteState,
    togglePlayback,
    toggleShuffle,
    volume
  ]);

  const progressPercent = useMemo(() => {
    if (!duration) {
      return 0;
    }
    return Math.min((progress / duration) * 100, 100);
  }, [progress, duration]);

  return {
    songs,
    currentSong,
    currentIndex,
    isPlaying,
    volume,
    muted,
    shuffle,
    repeatMode,
    folderName,
    progress,
    duration,
    progressPercent,
    play,
    pause,
    togglePlayback,
    next,
    previous,
    seek,
    setVolume,
    toggleMute: toggleMuteState,
    toggleShuffle,
    cycleRepeatMode,
    toggleFullscreen
  };
}

