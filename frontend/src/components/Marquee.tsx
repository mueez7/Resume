"use client";

import { motion } from "framer-motion";

export default function Marquee({ text }: { text: string }) {
  return (
    <div className="flex w-full overflow-hidden whitespace-nowrap bg-accent text-black py-4 brutalist-border transform -rotate-2 scale-105 my-12">
      <motion.div
        className="flex shrink-0 space-x-8 text-4xl md:text-6xl font-black uppercase font-heading"
        animate={{ x: "-50%" }}
        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
      >
        {Array(20).fill(text).map((t, i) => (
          <span key={i} className="mx-4">{t}</span>
        ))}
      </motion.div>
    </div>
  );
}
