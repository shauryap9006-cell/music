"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue, MotionValue, animate } from "framer-motion";
import { FEATURED_SONGS, FeaturedSong } from "@/frontend/lib/featured-songs";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
    song: FeaturedSong;
    index: number;
    total: number;
    scatterPos: { x: number; y: number; rotation: number };
    containerSize: { width: number; height: number };
    phaseProgress: MotionValue<number>;
    smoothMorph: MotionValue<number>;
    smoothScrollRotate: MotionValue<number>;
    smoothMouseX: MotionValue<number>;
}

const IMG_WIDTH = 60;
const IMG_HEIGHT = 85;

// Helper to keep math clean
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

const FlipCard = React.memo(({
    song,
    index,
    total,
    scatterPos,
    containerSize,
    phaseProgress,
    smoothMorph,
    smoothScrollRotate,
    smoothMouseX,
}: FlipCardProps) => {
    // 1. Calculate static positions for the current container size
    const positions = useMemo(() => {
        const isMobile = containerSize.width < 768;
        const minDimension = Math.min(containerSize.width, containerSize.height);

        // A. Circle Phase
        const circleRadius = Math.min(minDimension * 0.35, 350);
        const circleAngle = (index / total) * 360;
        const circleRad = (circleAngle * Math.PI) / 180;
        const circlePos = {
            x: Math.cos(circleRad) * circleRadius,
            y: Math.sin(circleRad) * circleRadius,
            rotation: circleAngle + 90,
        };

        // B. Line Phase
        const lineSpacing = 70;
        const lineTotalWidth = total * lineSpacing;
        const lineX = index * lineSpacing - lineTotalWidth / 2;
        const linePos = { x: lineX, y: 0, rotation: 0 };

        // C. Arc Phase (Base)
        const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
        const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
        const arcApexY = containerSize.height * (isMobile ? 0.35 : 0.25);
        const arcCenterY = arcApexY + arcRadius;
        
        const spreadAngle = isMobile ? 120 : 160; 
        const step = spreadAngle / 10;
        const totalLoopRange = total * step;

        return {
            circlePos,
            linePos,
            arcRadius,
            arcCenterY,
            spreadAngle,
            totalLoopRange,
            step,
            arcScale: isMobile ? 1.4 : 1.8,
        };
    }, [index, total, containerSize]);

    // Interpolate static target for the CURRENT phase
    const getBasePos = (p: number) => {
        if (p < 1) {
            return {
                x: lerp(scatterPos.x, positions.linePos.x, p),
                y: lerp(scatterPos.y, positions.linePos.y, p),
                rotation: lerp(scatterPos.rotation, positions.linePos.rotation, p),
                scale: 1,
            };
        }
        const t = Math.min(p - 1, 1);
        return {
            x: lerp(positions.linePos.x, positions.circlePos.x, t),
            y: lerp(positions.linePos.y, positions.circlePos.y, t),
            rotation: lerp(positions.linePos.rotation, positions.circlePos.rotation, t),
            scale: 1,
        };
    };

    // 2. Dynamic Transforms (Motion Values)
    // PERFORMANCE OPTIMIZATION: Only calculate complex math when phase >= 2
    const x = useTransform(
        [phaseProgress, smoothMorph, smoothScrollRotate, smoothMouseX],
        ([phase, morphValue, rotateValue, parallaxValue]) => {
            const p = phase as number;
            const morph = morphValue as number;
            const bp = getBasePos(p);
            
            if (p < 2 && morph < 0.01) return bp.x;

            // Infinite loop math
            const scrollOffset = (rotateValue as number) * 0.5;
            const initialOffset = index * positions.step;
            const totalWidth = positions.totalLoopRange;
            
            let currentOffset = (initialOffset - scrollOffset) % totalWidth;
            if (currentOffset < -totalWidth / 2) currentOffset += totalWidth;
            if (currentOffset > totalWidth / 2) currentOffset -= totalWidth;

            const arcAngle = -90 + (currentOffset / totalWidth) * positions.spreadAngle;
            const arcRad = (arcAngle * Math.PI) / 180;
            const arcX = Math.cos(arcRad) * positions.arcRadius + (parallaxValue as number);

            return lerp(bp.x, arcX, morph);
        }
    );

    const y = useTransform(
        [phaseProgress, smoothMorph, smoothScrollRotate],
        ([phase, morphValue, rotateValue]) => {
            const p = phase as number;
            const morph = morphValue as number;
            const bp = getBasePos(p);
            
            if (p < 2 && morph < 0.01) return bp.y;

            const scrollOffset = (rotateValue as number) * 0.5;
            const initialOffset = index * positions.step;
            const totalWidth = positions.totalLoopRange;
            
            let currentOffset = (initialOffset - scrollOffset) % totalWidth;
            if (currentOffset < -totalWidth / 2) currentOffset += totalWidth;
            if (currentOffset > totalWidth / 2) currentOffset -= totalWidth;

            const arcAngle = -90 + (currentOffset / totalWidth) * positions.spreadAngle;
            const arcRad = (arcAngle * Math.PI) / 180;
            const arcY = Math.sin(arcRad) * positions.arcRadius + positions.arcCenterY;

            return lerp(bp.y, arcY, morph);
        }
    );

    const rotation = useTransform(
        [phaseProgress, smoothMorph, smoothScrollRotate],
        ([phase, morphValue, rotateValue]) => {
            const p = phase as number;
            const morph = morphValue as number;
            const bp = getBasePos(p);
            
            if (p < 2 && morph < 0.01) return bp.rotation;

            const scrollOffset = (rotateValue as number) * 0.5;
            const initialOffset = index * positions.step;
            const totalWidth = positions.totalLoopRange;
            
            let currentOffset = (initialOffset - scrollOffset) % totalWidth;
            if (currentOffset < -totalWidth / 2) currentOffset += totalWidth;
            if (currentOffset > totalWidth / 2) currentOffset -= totalWidth;

            const arcAngle = -90 + (currentOffset / totalWidth) * positions.spreadAngle;
            const arcRot = arcAngle + 90;

            return lerp(bp.rotation, arcRot, morph);
        }
    );

    const scale = useTransform(
        [phaseProgress, smoothMorph],
        ([phase, morph]) => {
            const p = phase as number;
            if (p < 2) return 1;
            return lerp(1, positions.arcScale, morph as number);
        }
    );

    // Initial Fade In for materialization + Edge Fading
    const opacityTransform = useTransform(
        [phaseProgress, smoothMorph, smoothScrollRotate],
        ([phaseValue, morphValue, rotateValue]) => {
            const phase = phaseValue as number;
            const morph = morphValue as number;
            
            // Materialization Fade (0 to 0.6 over the first 0.1 of phase)
            const materialOpacity = phase < 0.1 ? (phase / 0.1) * 0.6 : 0.6;
            
            if (phase < 2 || morph < 0.1) return materialOpacity;

            const scrollOffset = (rotateValue as number) * 0.5;
            const initialOffset = index * positions.step;
            const totalWidth = positions.totalLoopRange;
            
            let currentOffset = (initialOffset - scrollOffset) % totalWidth;
            if (currentOffset < -totalWidth / 2) currentOffset += totalWidth;
            if (currentOffset > totalWidth / 2) currentOffset -= totalWidth;

            const normalizedPos = Math.abs(currentOffset / (totalWidth / 2));
            const edgeFade = normalizedPos > 0.8 ? lerp(1, 0, (normalizedPos - 0.8) / 0.2) : 1;
            
            return materialOpacity * edgeFade;
        }
    );

    return (
        <motion.div
            style={{
                x,
                y,
                rotate: rotation,
                scale,
                opacity: opacityTransform,
                position: "absolute",
                width: IMG_WIDTH,
                height: IMG_HEIGHT,
                willChange: "transform",
            }}
            className="pointer-events-none transform-gpu"
        >
            <div className="relative h-full w-full overflow-hidden rounded-lg shadow-2xl">
                <img
                    src={song.poster_url}
                    alt={`hero-${index}`}
                    className="h-full w-full object-cover opacity-90"
                    loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
        </motion.div>
    );
});

FlipCard.displayName = "FlipCard";

export const MAX_SCROLL = 10000;

export function IntroAnimation({ virtualScroll }: { virtualScroll: MotionValue<number> }) {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const handleResize = (entries: ResizeObserverEntry[]) => {
            for (const entry of entries) {
                setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
            }
        };
        const observer = new ResizeObserver(handleResize);
        observer.observe(containerRef.current);
        setContainerSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
        return () => observer.disconnect();
    }, []);

    const phaseProgress = useMotionValue(0); 
    const morphProgress = useTransform(virtualScroll, [0, 600], [0, 1]);
    const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });
    const scrollRotate = useTransform(virtualScroll, [600, MAX_SCROLL], [0, MAX_SCROLL]);
    const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });
    const mouseX = useMotionValue(0);
    const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

    const hasRun = useRef(false);
    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const sequence = async () => {
            // Wait for mounting to stabilize
            await new Promise(r => setTimeout(r, 1000));
            // Phase 0 -> 1 (Scatter to Line)
            await animate(phaseProgress, 1, { duration: 2, ease: "easeInOut" });
            // Phase 1 -> 2 (Line to Circle)
            await animate(phaseProgress, 2, { duration: 1.5, ease: "easeInOut" });
        };
        sequence();
    }, [phaseProgress]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const normalizedX = (relativeX / rect.width) * 2 - 1;
            mouseX.set(normalizedX * 100);
        };
        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX]);

    const scatterPositions = useMemo(() => {
        return FEATURED_SONGS.map(() => ({
            x: (Math.random() - 0.5) * 800, // Tighter scatter
            y: (Math.random() - 0.5) * 600, 
            rotation: (Math.random() - 0.5) * 180,
        }));
    }, []);

    return (
        <div ref={containerRef} className="relative w-full h-[100vh] overflow-hidden" style={{ contain: "layout size paint" }}>
            <div className="absolute left-[-8%] top-[8%] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(30,58,95,0.12),transparent_65%)] blur-3xl pointer-events-none" />
            <div className="absolute right-[-10%] top-[18%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(30,41,59,0.14),transparent_70%)] blur-3xl pointer-events-none" />
            <div className="flex h-full w-full flex-col items-center justify-center perspective-1000">
                <div className="relative flex items-center justify-center w-full h-full transform-gpu">
                    {FEATURED_SONGS.map((song, i) => (
                        <FlipCard
                            key={song.id}
                            song={song}
                            index={i}
                            total={FEATURED_SONGS.length}
                            scatterPos={scatterPositions[i]}
                            containerSize={containerSize}
                            phaseProgress={phaseProgress}
                            smoothMorph={smoothMorph}
                            smoothScrollRotate={smoothScrollRotate}
                            smoothMouseX={smoothMouseX}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
