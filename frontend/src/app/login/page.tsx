"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // In a real app we'd authenticate. Here we simulate for the demo to avoid real db requirement unless needed.
    // Let's use standard routing for this prototype:
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 pt-32 pb-12 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-acid/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md p-10 brutalist-border bg-black relative z-10 shadow-[8px_8px_0px_0px_#D6FF00] my-auto mx-auto mt-12 md:mt-auto">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-acid"></div>
        <h2 className="text-4xl font-black uppercase mb-8 font-heading text-center">System Access</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-6 font-mono text-sm">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">Identifier</label>
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
            {loading ? <Loader2 className="animate-spin" /> : "Authenticate"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-mono text-gray-500">
          No clearance? <Link href="/signup" className="text-acid hover:underline">Request Access</Link>
        </div>
      </div>
    </div>
  );
}
