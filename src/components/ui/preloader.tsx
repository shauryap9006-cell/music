"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

const DottedSurface = dynamic(() => import("@/components/ui/dotted-surface").then(mod => mod.DottedSurface), { ssr: false })

const words = [
  "Hello",
  "नमस्ते",
  "Bonjour",
  "Ciao",
  "Olá",
  "やあ",
  "Hallå",
  "Guten tag",
  "হ্যালো",
  "Hola",
  "नमस्कार",
  "Olá"
];

const textSuck = {
  initial: {
    opacity: 0,
    scale: 1,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 1, delay: 0.2 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    filter: "blur(10px)",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
  },
}

const vortexSuck = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  exit: {
    scale: 0,
    opacity: 0,
    rotate: 15,
    filter: "blur(20px)",
    transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 },
  },
}

interface PreloaderProps {
  onComplete?: () => void
}

export default function Preloader({ onComplete }: PreloaderProps) {

  const [index, setIndex] = useState(0)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    if (index === words.length - 1) {
      // Start exit animation after showing the last word
      setTimeout(() => {
        setIsExiting(true)
        // Call onComplete after exit animation
        setTimeout(() => {
          onComplete?.()
        }, 1200) // Slightly longer to allow vortex to finish
      }, 1000)
      return
    }

    setTimeout(
      () => {
        setIndex(index + 1)
      },
      index === 0 ? 1000 : 150,
    )
  }, [index, onComplete])

  return (
    <motion.div
      variants={vortexSuck}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black z-[99999999999] origin-center"
    >
      {dimension.width > 0 && (
        <>
          <svg className="absolute top-0 w-full h-full z-0">
            <rect width="100%" height="100%" fill="#000000ff" />
          </svg>
          <DottedSurface className="absolute inset-0 size-full z-[5] opacity-70" isExiting={isExiting} />
          <motion.p
            variants={textSuck}
            initial="initial"
            animate="enter"
            exit="exit"
            className="flex items-center text-[#06cda5] text-4xl md:text-5xl lg:text-6xl absolute z-10 font-medium"
          >
            <span className="block w-2.5 h-2.5 bg-[#06cda5] rounded-full mr-2.5"></span>
            {words[index]}
          </motion.p>
        </>
      )}
    </motion.div>
  );
};
