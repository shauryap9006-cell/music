"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function PlayerTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ y: "100vh" }}
      animate={{ y: 0 }}
      transition={{ 
        type: "tween",
        ease: [0.22, 1, 0.36, 1],
        duration: 0.6
      }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden"
      style={{
        transformOrigin: "bottom center"
      }}
    >
      <div className="fixed inset-0 bg-background/80" />
      {children}
    </motion.div>
  );
}
