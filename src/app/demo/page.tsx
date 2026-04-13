"use client";

import { IntroAnimation } from "@/frontend/components/ui/scroll-morph-hero";
import { useScroll } from "framer-motion";

export default function Demo() {
    const { scrollY } = useScroll();
    
    return (
        <div className="w-full h-[100vh] border rounded-lg overflow-hidden relative">
            <IntroAnimation virtualScroll={scrollY} />
        </div>
    );
}
