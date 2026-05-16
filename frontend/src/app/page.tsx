"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Microscope, PenTool, Crosshair, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const marqueeRotate = useTransform(scrollYProgress, [0, 1], [-2, 2]);

  const textRevealVariants = {
    hidden: { y: "100%", rotate: 5 },
    visible: (custom: number) => ({
      y: "0%",
      rotate: 0,
      transition: { duration: 1.2, delay: custom * 0.15, ease: [0.16, 1, 0.3, 1] }
    })
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
  };

  return (
    <div ref={containerRef} className="text-[#f4f4f5] min-h-screen font-sans">

      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-12 pt-32 pb-20">
        <div className="w-full max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="overflow-hidden mb-4"
          >
            <p className="text-acid font-mono text-sm uppercase tracking-[0.3em] flex items-center gap-3">
              <span className="w-2 h-2 bg-acid rounded-full animate-pulse"></span>
              System Online / v2.4.9
            </p>
          </motion.div>

          <h1 className="font-heading text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] font-bold uppercase tracking-tighter relative z-10 mt-8 mb-6">
            <div className="overflow-hidden pb-2">
              <motion.div custom={0} initial="hidden" animate="visible" variants={textRevealVariants}>
                Evolve Your
              </motion.div>
            </div>
            <div className="overflow-hidden pb-2">
              <motion.div custom={1} initial="hidden" animate="visible" variants={textRevealVariants} className="text-zinc-600">
                Career Graph.
              </motion.div>
            </div>
            <div className="overflow-hidden pb-2">
              <motion.div custom={2} initial="hidden" animate="visible" variants={textRevealVariants} className="text-acid">
                Dominate ATS.
              </motion.div>
            </div>
          </h1>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUpVariants}
              className="md:col-span-5"
            >
              <p className="text-zinc-400 text-lg md:text-xl font-light leading-relaxed">
                Stop playing by outdated rules. Aura analyzes, rips apart, and rebuilds your professional
                identity using proprietary AI to bypass ATS algorithms and secure interviews.
              </p>
            </motion.div>
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUpVariants}
              className="md:col-span-7 flex md:justify-end"
            >
              <Link href="/dashboard" className="btn-acid bg-acid text-dark border border-acid px-10 py-6 rounded-full text-lg font-heading font-semibold uppercase tracking-widest flex items-center gap-4 w-full md:w-auto justify-center">
                Upload Document
                <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <motion.div style={{ rotate: marqueeRotate }} className="overflow-hidden whitespace-nowrap flex w-[120vw] -ml-[10vw] border-t border-b border-[#333] py-6 bg-acid/10 backdrop-blur-sm z-20 relative scale-105 my-12">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          className="flex shrink-0 items-center"
        >
          {Array(15).fill(["Destroy the ATS", "★", "Get Hired", "★", "AI Powered", "★"]).flat().map((t, i) => (
            <span key={i} className={`font-heading text-6xl font-semibold uppercase px-8 ${t === '★' ? 'text-zinc-600' : 'text-outline marquee-text cursor-default'}`}>
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      <section id="engine" className="py-32 px-6 md:px-12 border-t border-[#222]">
        <div className="max-w-[1400px] mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariants}
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24"
          >
            <h2 className="font-heading text-5xl md:text-7xl font-medium uppercase tracking-tighter max-w-2xl leading-[0.9]">
              The Anatomy of <br /><span className="text-zinc-600">an unfair advantage.</span>
            </h2>
            <p className="text-zinc-500 max-w-sm mt-8 md:mt-0 font-mono text-sm uppercase">01 // System Capabilities</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-[#222]">
            {[
              { num: "01", title: "Neural Extraction", icon: Microscope, desc: "We don't parse text. We map your semantic skills. Aura finds the hidden gaps between what you did and what recruiters are actually searching for." },
              { num: "02", title: "Brutal Optimization", icon: PenTool, desc: "Weak verbs are eliminated. Metrics are enforced. We restructure your bullet points into high-impact, results-driven statements that command respect." },
              { num: "03", title: "Global Targeting", icon: Crosshair, desc: "Connect to the matrix. We cross-reference your new optimized profile against 50,000+ daily open roles across the web to find your exact match." }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 1, delay: idx * 0.2, ease: "easeOut" } } }}
                className="p-10 lg:p-16 relative group overflow-hidden border-b md:border-r border-[#222]"
              >
                <div className="absolute top-0 right-0 p-8 font-heading text-6xl text-[#222] group-hover:text-acid transition-colors duration-500">
                  {feature.num}
                </div>
                <feature.icon className="w-12 h-12 text-zinc-300 mb-12 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="font-heading text-3xl mb-4 uppercase">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed font-light">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer id="manifesto" className="bg-acid text-dark pt-32 pb-12 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20">
            <div>
              <h2 className="font-heading text-6xl md:text-8xl font-bold uppercase tracking-tighter leading-[0.85] mb-6">
                Ready to <br /> Dominate?
              </h2>
              <Link href="/dashboard" className="inline-flex items-center gap-2 font-mono text-lg uppercase font-bold border-b-2 border-dark pb-1 hover:pr-4 transition-all group">
                Deploy Resume Now <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="flex gap-12 mt-12 md:mt-0 font-mono text-sm uppercase font-bold">
              <ul className="space-y-4">
                <li><Link href="#engine" className="hover:opacity-50 transition-opacity">Engine</Link></li>
                <li><Link href="#pricing" className="hover:opacity-50 transition-opacity">Pricing</Link></li>
                <li><Link href="/login" className="hover:opacity-50 transition-opacity">Log In</Link></li>
              </ul>
              <ul className="space-y-4">
                <li><Link href="#" className="hover:opacity-50 transition-opacity">Twitter</Link></li>
                <li><Link href="#" className="hover:opacity-50 transition-opacity">LinkedIn</Link></li>
                <li><Link href="#" className="hover:opacity-50 transition-opacity">Legal</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-dark/20 pt-8 flex flex-col md:flex-row justify-between items-center font-mono text-xs uppercase font-bold">
            <p>&copy; 2026 Aura Systems.</p>
            <p className="mt-4 md:mt-0">Design By Request. Crafted with malice.</p>
          </div>
        </div>

        <div className="absolute bottom-[-15%] left-0 w-full text-center pointer-events-none opacity-10">
          <h1 className="font-heading text-[25vw] font-bold uppercase leading-none tracking-tighter">AURA</h1>
        </div>
      </footer>
    </div>
  );
}
