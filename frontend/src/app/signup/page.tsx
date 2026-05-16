"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 pt-32 pb-12 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-acid/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md p-10 brutalist-border bg-black relative z-10 shadow-[8px_8px_0px_0px_#D6FF00] my-auto mx-auto mt-12 md:mt-auto">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-acid"></div>
        <h2 className="text-4xl font-black uppercase mb-2 font-heading text-center">New Entity</h2>
        <p className="text-center text-gray-400 font-mono text-sm mb-8">Initialize your career graph.</p>
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Designation (Name)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-[#333] p-4 text-white focus:outline-none focus:border-acid transition-all font-mono"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Identifier (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[#333] p-4 text-white focus:outline-none focus:border-acid transition-all font-mono"
              placeholder="user@domain.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Passcode</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border border-[#333] p-4 text-white focus:outline-none focus:border-acid transition-all font-mono"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full brutalist-button py-4 mt-4 flex items-center justify-center gap-2 group hover:bg-acid hover:text-black border-white hover:border-acid"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Initialize Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-mono text-gray-500">
          Already have clearance? <Link href="/login" className="text-acid hover:underline">Authenticate</Link>
        </div>
      </div>
    </div>
  );
}
