"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex-1 flex flex-col items-center p-6 pt-32 pb-12 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-acid/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-10 brutalist-border bg-black relative z-10 shadow-[8px_8px_0px_0px_#D6FF00] my-auto mx-auto mt-12 md:mt-auto">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-acid" />
        <h2 className="text-4xl font-black uppercase mb-2 font-heading text-center">System Access</h2>
        <p className="text-center text-gray-400 font-mono text-sm mb-8">Authenticate to resume operations.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 mb-6 font-mono text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[#333] p-4 text-white focus:outline-none focus:border-acid transition-all font-mono rounded-lg"
              placeholder="user@domain.com"
              required
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-[#333] p-4 pr-12 text-white focus:outline-none focus:border-acid transition-all font-mono rounded-lg"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-acid transition-colors"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full brutalist-button py-4 mt-4 flex items-center justify-center gap-2 hover:bg-acid hover:text-black border-white hover:border-acid rounded-lg"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> Authenticating...</> : "Authenticate →"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-mono text-gray-500">
          No clearance?{" "}
          <Link href="/signup" className="text-acid hover:underline">
            Request Access
          </Link>
        </div>
      </div>
    </div>
  );
}
