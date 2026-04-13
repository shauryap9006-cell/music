"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, AudioLines, Disc3, Search, SlidersHorizontal, Sparkles } from "lucide-react";

import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const heroImage =
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80";

const queueItems = [
  { title: "After Hours Grid", meta: "Dark pop" },
  { title: "Velvet Frequency", meta: "Synth pulse" },
  { title: "City Signal", meta: "Late drive" }
];

const lyricLines = [
  "Scroll down and the whole stage settles into place.",
  "The artwork, queue, and lyrics stay locked in one motion system.",
  "Everything stays dark, clean, and music-first."
];

const visualizerBars = [34, 68, 52, 96, 72, 104, 56, 86];
const equalizerBars = [88, 60, 102, 76, 94];

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-24 pt-8 md:pb-40 md:pt-16">
      <ContainerScroll
        cardClassName="h-[42rem] max-w-[1140px] rounded-[36px] border-white/10 bg-[#06080d]/95 p-2 md:h-[44rem] md:p-4"
        containerClassName="h-[70rem] p-0 md:h-[84rem] md:p-0"
        contentClassName="overflow-hidden rounded-[28px] bg-transparent p-0"
        headerClassName="max-w-5xl px-4"
        innerClassName="py-8 md:py-16"
        titleComponent={
          <>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/62">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Container scroll integrated
              </span>
              <span className="inline-flex items-center rounded-full border border-cyan-300/14 bg-cyan-300/[0.05] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-100/70">
                Dark scrolling card
              </span>
            </div>

            <h1 className="mt-8 text-4xl font-semibold leading-tight text-white md:text-6xl">
              Give the landing page a
              <br />
              <span className="mt-2 block font-display text-5xl uppercase leading-none tracking-[-0.04em] text-white md:text-[6.5rem]">
                Scroll-Driven Stage
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg">
              This hero now uses the shared `ContainerScroll` primitive from `/components/ui`,
              with a darker control-room layout and a card that settles into place as the user
              scrolls.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8fafc,#7dd3fc_52%,#a78bfa)] px-5 py-3 text-sm font-medium text-slate-950 transition hover:scale-[1.02]"
                href="/player"
              >
                Open Player
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
                href="/library"
              >
                Browse Library
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </>
        }
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(5,7,12,0.96))] p-3 md:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(125,211,252,0.08),transparent_34%,rgba(167,139,250,0.1))]" />

          <div className="relative flex h-full flex-col gap-4">
            <div className="flex flex-col gap-3 rounded-[26px] border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/60 md:min-w-[420px]">
                <Search className="h-4 w-4 text-white/36" />
                <span>Search the library, uploads, and previews...</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.32em] text-white/34">
                <Disc3 className="h-4 w-4" />
                Scrolling card live
              </div>
            </div>

            <div className="grid flex-1 gap-4 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
                <div className="relative min-h-[240px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1118]">
                  <Image
                    alt="Crowd at a live show"
                    className="h-full w-full object-cover"
                    draggable={false}
                    height={1200}
                    priority
                    src={heroImage}
                    width={1200}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.08),rgba(5,7,12,0.92))]" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.28em] text-white/66">
                      Unsplash backdrop
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="font-display text-3xl uppercase leading-none text-white">
                          After Hours Grid
                        </p>
                        <p className="mt-3 max-w-xs text-sm leading-6 text-white/66">
                          One scroll-linked card holding artwork, queue state, equalizer motion,
                          and lyric focus.
                        </p>
                      </div>
                      <div className="hidden rounded-full border border-white/10 bg-black/25 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-white/52 md:block">
                        Dark mode active
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[28px] border border-white/10 bg-black/20 p-4 md:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/34">
                          Queue
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-white">Pinned tracks</p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white/70">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      {queueItems.map((item) => (
                        <div
                          className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3"
                          key={item.title}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(125,211,252,0.24),rgba(167,139,250,0.22))] text-white">
                              <Disc3 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.title}</p>
                              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/38">
                                {item.meta}
                              </p>
                            </div>
                          </div>
                          <span className="h-2 w-2 rounded-full bg-cyan-200/80" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <AudioLines className="h-4 w-4" />
                        Visualizer
                      </div>
                      <div className="mt-5 flex h-28 items-end gap-2">
                        {visualizerBars.map((height, index) => (
                          <span
                            className="flex-1 rounded-full bg-[linear-gradient(180deg,rgba(125,211,252,0.95),rgba(167,139,250,0.32))]"
                            key={`${height}-${index}`}
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <SlidersHorizontal className="h-4 w-4" />
                        EQ
                      </div>
                      <div className="mt-5 flex h-28 items-end justify-between gap-3">
                        {equalizerBars.map((height, index) => (
                          <span
                            className="w-3 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(125,211,252,0.34))]"
                            key={`${height}-${index}`}
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden gap-4 xl:grid">
                <div className="rounded-[28px] border border-white/10 bg-black/25 p-5">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Sparkles className="h-4 w-4" />
                    Lyric lock
                  </div>
                  <div className="mt-5 space-y-3">
                    {lyricLines.map((line, index) => (
                      <div
                        className="rounded-[22px] border px-4 py-4 text-sm leading-7"
                        key={line}
                        style={{
                          borderColor:
                            index === 1 ? "rgba(125,211,252,0.34)" : "rgba(255,255,255,0.08)",
                          background:
                            index === 1
                              ? "linear-gradient(135deg,rgba(125,211,252,0.14),rgba(167,139,250,0.08))"
                              : "rgba(255,255,255,0.04)",
                          color: index === 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.58)"
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/34">
                        Placement
                      </p>
                      <p className="mt-2 font-display text-3xl uppercase leading-none text-white">
                        Best used as the homepage hero card.
                      </p>
                    </div>
                    <Disc3 className="h-5 w-5 text-white/44" />
                  </div>

                  <p className="mt-5 text-sm leading-7 text-white/58">
                    The component works best at the top of the landing page where its scroll depth
                    has enough vertical space to play out.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
