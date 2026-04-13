"use client";

import React, { useEffect, useRef, useState } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/frontend/lib/utils";

interface ContainerScrollProps {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
  containerClassName?: string;
  innerClassName?: string;
  headerClassName?: string;
  cardClassName?: string;
  contentClassName?: string;
}

export function ContainerScroll({
  titleComponent,
  children,
  containerClassName,
  innerClassName,
  headerClassName,
  cardClassName,
  contentClassName
}: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [0.7, 0.9] : [1.05, 1]);
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      className={cn(
        "relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-20",
        containerClassName
      )}
      ref={containerRef}
    >
      <div
        className={cn("relative w-full py-10 md:py-40", innerClassName)}
        style={{ perspective: "1000px" }}
      >
        <Header
          className={headerClassName}
          titleComponent={titleComponent}
          translate={translate}
        />
        <Card
          cardClassName={cardClassName}
          contentClassName={contentClassName}
          rotate={rotate}
          scale={scale}
          translate={translate}
        >
          {children}
        </Card>
      </div>
    </div>
  );
}

interface HeaderProps {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
  className?: string;
}

export function Header({ translate, titleComponent, className }: HeaderProps) {
  return (
    <motion.div
      className={cn("mx-auto max-w-5xl text-center", className)}
      style={{ translateY: translate }}
    >
      {titleComponent}
    </motion.div>
  );
}

interface CardProps {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
  cardClassName?: string;
  contentClassName?: string;
}

export function Card({
  rotate,
  scale,
  children,
  cardClassName,
  contentClassName
}: CardProps) {
  return (
    <motion.div
      className={cn(
        "mx-auto -mt-12 h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-2 shadow-2xl md:h-[40rem] md:p-6",
        cardClassName
      )}
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003"
      }}
    >
      <div
        className={cn(
          "h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4",
          contentClassName
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
