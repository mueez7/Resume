"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  
  const isAppRoute = pathname.includes('/dashboard') || pathname.includes('/results');
  
  if (isAppRoute) {
    return null;
  }

  return (
    <div className="fixed top-4 md:top-6 left-0 w-full flex justify-center z-50 px-4 md:px-6 pointer-events-none">
      <nav className="pointer-events-auto w-full max-w-7xl bg-[#050505]/95 backdrop-blur-md border border-[#222] rounded-full px-6 py-3 flex justify-between items-center shadow-2xl transition-all">
        <Link href="/" className="text-xl font-heading font-black tracking-widest uppercase text-white hover:text-acid transition-colors">
          Aura
        </Link>
        
        {!isAppRoute ? (
          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest font-bold text-zinc-400">
              {pathname === "/" ? (
                <>
                  <Link href="#engine" className="hover:text-acid transition-colors">Engine</Link>
                  <Link href="#manifesto" className="hover:text-acid transition-colors">Manifesto</Link>
                </>
              ) : (
                <Link href="/" className="hover:text-acid transition-colors">Home</Link>
              )}
            </div>
            <Link href="/signup" className="text-xs font-bold uppercase tracking-widest border border-zinc-700 px-6 py-2 rounded-full hover:border-acid hover:text-acid transition-all bg-[#111] text-white shadow-lg">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-acid text-black flex items-center justify-center font-bold font-heading text-lg">JD</div>
          </div>
        )}
      </nav>
    </div>
  );
}
