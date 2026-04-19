"use client";

import { DM_Mono, DM_Sans, Syne, Cormorant_Garamond } from "next/font/google";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { AudioProvider } from "@/frontend/components/providers/AudioProvider";
import { BottomPlayer } from "@/frontend/components/player/BottomPlayer";
import { usePlayerStore } from "@/frontend/store/player.store";
import { ThemeProvider } from "next-themes";
import "@/frontend/styles/globals.css";
import CustomCursor from "@/frontend/components/ui/custom-cursor";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
    weight: ["700", "800"]
});

const cormorant = Cormorant_Garamond({
    subsets: ["latin"],
    variable: "--font-cormorant",
    weight: ["300", "400", "600", "700"],
    style: ["italic", "normal"]
});

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: "--font-dm-sans",
    weight: ["400", "500", "700"]
});

const dmMono = DM_Mono({
    subsets: ["latin"],
    variable: "--font-dm-mono",
    weight: ["400", "500"]
});

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
    const initPreloadedSongs = usePlayerStore((state) => state.initPreloadedSongs);

    useEffect(() => {
        void initPreloadedSongs();
    }, [initPreloadedSongs]);

    return (
        <html lang="en">
            <head>
                <title>Aura Music Player</title>
                <meta
                    name="description"
                    content="Aura is a cinematic music player for searching, organizing, and playing your audio collection."
                />
                <style dangerouslySetInnerHTML={{
                    __html: `
          @import url('https://fonts.googleapis.com/css2?family=Fascinate+Inline&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Bitcount+Grid+Double+Ink:wght@100..900&family=Bitcount+Grid+Double:wght@100..900&display=swap');
          
          :root {
            --font-bitcount: "Bitcount Grid Double Ink", system-ui;
            --font-fascinate: "Fascinate Inline", system-ui;
          }

          .font-fascinate {
            font-family: "Fascinate Inline", system-ui;
            font-weight: 400;
            font-style: normal;
          }

          .font-bitcount-ink {
            font-family: "Bitcount Grid Double Ink", system-ui;
            font-optical-sizing: auto;
            font-style: normal;
            font-variation-settings:
              "slnt" 0,
              "CRSV" 0.5,
              "ELSH" 0,
              "ELXP" 0,
              "SZP1" 0,
              "SZP2" 0,
              "XPN1" 0,
              "XPN2" 0,
              "YPN1" 0,
              "YPN2" 0;
          }

          .font-bitcount-double {
            font-family: "Bitcount Grid Double", system-ui;
            font-optical-sizing: auto;
            font-style: normal;
            font-variation-settings:
              "slnt" 0,
              "CRSV" 0.5,
              "ELSH" 0,
              "ELXP" 0;
          }
        `}} />
            </head>
            <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable} ${cormorant.variable}`}>
                <AudioProvider>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        <div className="pointer-events-none fixed inset-0 overflow-hidden">
                            <div className="hero-grid absolute inset-0 opacity-20" />
                            <div className="absolute left-[-10%] top-[-12%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(30,41,59,0.20),transparent_65%)] opacity-40 blur-3xl" />
                            <div className="absolute right-[-12%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.18),transparent_70%)] opacity-35 blur-3xl" />
                            <div className="absolute bottom-[-12%] left-[30%] h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.15),transparent_70%)] opacity-25 blur-3xl" />
                        </div>
                        <div className="relative min-h-screen pb-20">
                            <CustomCursor />
                            {children}
                        </div>
                        <BottomPlayer />
                    </ThemeProvider>
                </AudioProvider>
            </body>
        </html>
    );
}

