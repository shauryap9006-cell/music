# AURA — The Cinematic Audio Experience

![Aura Logo](https://pollinations.ai/p/cinematic%20music%20logo%20neon%20violet%20glassmorphism%20dark%20background?nologo=true)

Aura is a visually stunning, high-fidelity music player application designed to transform your digital library into a premium auditory and visual journey. Built with **Next.js 14**, **Framer Motion**, and the **Web Audio API**, it offers an immersive, "hardware-inspired" experience that breathes life into every track.

---

## 🌟 Vision & Purpose
**Aura** was created for the modern audiophile who values aesthetics as much as audio quality. In an era of generic streaming interfaces, Aura offers a "living" player that prioritizes **visual storytelling**. It's designed to be a centerpiece — whether you're relaxing with a lo-fi playlist or analyzing a high-fidelity FLAC track.

### Design Philosophy: "Digital Hardware"
Aura utilizes a **matte-black skeuomorphic aesthetic** combined with modern glassmorphism. Every button, slider, and panel is designed to feel physical, while dynamic light blobs and parallax layers remind you that it's a living, digital experience.

---

## 🚀 Key Features

### 🎧 Pro-Grade Audio Engine
- **High-Fidelity Playback**: Powered by **Howler.js** for seamless, gapless audio performance across all major formats (.mp3, .flac, .wav, .ogg).
- **Physical 5-Band Equalizer**: A hardware-inspired EQ panel allowing you to carve your sound (Bass Boost, Vocal Clarity, Electronic, etc.).
- **Real-Time Visualization**: Dynamic frequency bars and waveforms that react with zero latency to every beat.

### 📚 Hybrid Library Discovery
- **Local & Cloud Sync**: Effortlessly load local folders or upload your personal collection to a **Supabase-backed cloud library** using **Vercel Blob**.
- **Smart Metadata Parsing**: Automatic ID3 tag extraction for instant organization by title, artist, and album.
- **Intelligent Artwork Resolver**: No more missing covers. Aura uses a tiered fallback system:
    1. **Embedded Art** (Priority)
    2. **iTunes Search API** (Official matching)
    3. **AI-Generated Posters** (Pollinations.ai mood-based generation)

### 💬 Cinematic Lyrics & Motion
- **Synced LRC Lyrics**: Automatic fetching and synchronization from the **LRCLIB API**.
- **Living Lyrics Panel**: Smooth, layout-aware animations where the active line scales and highlights as the artist sings.
- **Scroll Reveals**: Cinematic staggered animations for library grids and search results using **Framer Motion**.

---

## 🛠️ How It Works (The Tech Stack)

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | Performance, SEO, and robust routing. |
| **Logic** | TypeScript | Type-safe, reliable codebase. |
| **Animation** | Framer Motion | Cinematic transitions and micro-interactions. |
| **State** | Zustand | Lightweight and fast global player management. |
| **Backend** | Supabase | Real-time database for cloud-synced libraries. |
| **Storage** | Vercel Blob | High-speed audio and artwork hosting. |
| **Audio** | Web Audio API / Howler.js | Pro-grade sound processing and analysis. |

---

## 🎨 User Experience Flow

1. **Discovery**: Land on a cinematic hero page featuring parallax backgrounds and instant search.
2. **Library**: Simply select a folder or drag-and-drop your files. Aura handles the heavy lifting of parsing and resolving art.
3. **The Player**: Enter a 3-panel immersive player view:
   - **Left**: Your animated, searchable playlist.
   - **Center**: The heart of Aura — rotating vinyl art, playback controls, and visualizers.
   - **Right**: The synced lyrics engine.
4. **Refinement**: Toggle the Equalizer at any time to adjust the audio profile to your liking.

---

*Aura is more than just a player — it's an atmosphere.*

**Built with Precision · Designed for the Soul · Powered by Next.js**
