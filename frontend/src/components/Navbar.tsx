"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => { listener.subscription.unsubscribe(); };
  }, []);

  // Hide navbar on dashboard and results pages (they have their own sidebar)
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/results")) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-5 bg-black/80 backdrop-blur-md border-b border-[#222]">
      <Link href="/" className="text-2xl font-heading font-black tracking-widest uppercase text-white hover:text-acid transition-colors">
        Aura
      </Link>
      <div className="flex items-center gap-6 font-mono text-sm uppercase font-bold">
        <Link href="/#engine" className="text-gray-400 hover:text-white transition-colors hidden sm:block">Engine</Link>
        {user ? (
          <Link href="/dashboard" className="bg-acid text-black px-6 py-2 rounded-full hover:bg-white transition-colors tracking-widest">
            Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Log In</Link>
            <Link href="/signup" className="bg-acid text-black px-6 py-2 rounded-full hover:bg-white transition-colors tracking-widest">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
