"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, useTransform, useMotionValue } from "framer-motion";
import { IntroAnimation, MAX_SCROLL } from "@/frontend/components/ui/scroll-morph-hero";
import Preloader from "@/components/ui/preloader";
import { SearchBar } from "@/frontend/components/hero/SearchBar";
import { Play, Library } from "lucide-react";
import { useAudioController } from "@/frontend/components/providers/AudioProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
const centerWords = [
  "Welcome",        // English
  "Bienvenue",      // French
  "Benvenuto",      // Italian
  "Bem-vindo",      // Portuguese
  "ようこそ",        // Japanese
  "Välkommen",      // Swedish
  "Willkommen",     // German
  "স্বাগতম",        // Bengali
  "स्वागत है",      // Hindi
  "Bienvenido",     // Spanish
  "स्वागत",         // Marathi
  "ਜੀ ਆਇਆਂ ਨੂੰ",   // Punjabi
  "Bem-vindo"       // Portuguese (correct spelling)
];


export function HeroSection() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const router = useRouter();
  const { togglePlayback } = useAudioController();
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Global Scroll Lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Cycle center words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % centerWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 2. Local Virtual Scroll Driver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;

      const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  // 3. Scroll-Linked Opacity Transforms
  const centerOpacity = useTransform(virtualScroll, [100, 200], [1, 0]);
  const centerScale = useTransform(virtualScroll, [100, 200], [1, 1.2]);

  const titleOpacity = useTransform(virtualScroll, [100, 300, 800, 1100], [0, 1, 1, 0]);
  const titleY = useTransform(virtualScroll, [800, 1100], [0, -40]);

  const subtitleOpacity = useTransform(virtualScroll, [200, 500, 600, 900, 1100], [0, 0, 1, 1, 0]);
  const subtitleY = useTransform(virtualScroll, [900, 1100], [0, -40]);

  const buttonsOpacity = useTransform(virtualScroll, [1100, 1400, 10000], [0, 1, 1]);
  const buttonsScale = useTransform(virtualScroll, [1100, 1400], [0.8, 1]);
  const buttonsY = useTransform(virtualScroll, [1100, 1400], [20, 0]);
  const buttonsPointerEvents = useTransform(virtualScroll, (v) => v > 1200 ? "auto" : "none");

  return (
    <>
      {showPreloader && <Preloader onComplete={() => setShowPreloader(false)} />}
      <main ref={containerRef} className="bg-black min-h-screen select-none relative overflow-hidden">
        {/* LAYER 0: Cinematic Video Background — EXTREME BACK */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260330_145725_08886141-ed95-4a8e-8d6d-b75eaadce638.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for readability on top of video */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 1,
            // background: "linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.25) 70%, rgba(0,0,0,0.40) 100%)",
          }}
        />

        {/* LAYER 1: Morphological Hero Scroll Animation */}
        <section className="relative w-full h-[100vh]" style={{ zIndex: 2 }}>
          <div className="absolute inset-0">
            <IntroAnimation virtualScroll={virtualScroll} startAnimation={!showPreloader} />
          </div>

          {/* LAYER 2: Overlay Container - Text & Buttons on top of everything */}
          <div className="absolute inset-0 flex flex-col items-center justify-center h-full text-center px-6 pointer-events-none" style={{ zIndex: 10 }}>

            {/* Layer 0: Central Decoration (Pulsing Heartbeat) */}
            <motion.div
              style={{ opacity: centerOpacity, scale: centerScale }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Pulsing Rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: [0, 0.15, 0],
                    scale: [0.8, 1.4, 1.9],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 1.2,
                    ease: "easeOut",
                  }}
                  className="absolute w-[250px] h-[250px] border border-white/20 rounded-full"
                />
              ))}

              {/* Central Monogram */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [0.98, 1.02, 0.98]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <motion.h2
                  key={wordIndex}
                  initial={{ opacity: 0, filter: "blur(5px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.9 }}
                  className="text-4xl md:text-7xl font-fascinate text-[#06cda5]/30 tracking-[0.2em] select-none text-center"
                >
                  {centerWords[wordIndex]}
                </motion.h2>
              </motion.div>
            </motion.div>

            {/* Layer 1: Title & Subtitle */}
            <div className="flex flex-col items-center">
              <motion.h1
                style={{ opacity: titleOpacity, y: titleY }}
                className="text-5xl md:text-8xl font-fascinate tracking-wide text-white mb-4 uppercase"
              >
                AURA <span className="text-zinc-500 underline decoration-zinc-800 underline-offset-12">MUSIC</span>
              </motion.h1>

              <motion.p
                style={{ opacity: subtitleOpacity, y: subtitleY }}
                className="text-lg md:text-xl text-zinc-400 max-w-2xl font-medium tracking-wide leading-relaxed"
              >
                Experience your collection through a cinematic lens.
                Smooth transitions, immersive visuals.
              </motion.p>
            </div>

            {/* Layer 2: Action Buttons & Search Bar (Stacked in Center) */}
            <motion.div
              style={{
                opacity: buttonsOpacity,
                scale: buttonsScale,
                y: buttonsY,
                pointerEvents: buttonsPointerEvents as any
              }}
              className="absolute inset-x-0 top-0 bottom-[15%] flex flex-col items-center justify-center gap-7 w-full max-w-5xl mx-auto"
            >
              <div className="flex flex-col md:flex-row items-center gap-6">
                <button
                  onClick={() => {
                    togglePlayback();
                    router.push("/player");
                  }}
                  className="group relative px-6 py-2.5 bg-white text-black text-xs font-bold rounded-full overflow-hidden transition-transform active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.15)] pointer-events-auto"
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>START LISTENING</span>
                  </div>
                  <div className="absolute inset-0 bg-zinc-200 translate-y-full transition-transform group-hover:translate-y-0" />
                </button>

                <Link
                  href="/library"
                  className="group px-6 py-2.5 bg-transparent border border-white/20 text-white text-xs font-bold rounded-full backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40 active:scale-95 pointer-events-auto"
                >
                  <div className="flex items-center gap-2">
                    <Library className="w-3.5 h-3.5" />
                    <span>LIBRARY</span>
                  </div>
                </Link>
              </div>

              {/* Search Bar integrated into the center reveal */}
              <div className="w-full px-4 md:px-0">
                <SearchBar />
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
