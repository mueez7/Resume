"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // If email confirmation is disabled in Supabase, session is available immediately
    if (data.session) {
      router.push("/dashboard");
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md p-10 brutalist-border bg-black text-center shadow-[8px_8px_0px_0px_#D6FF00]">
          <CheckCircle2 className="text-acid mx-auto mb-6" size={64} />
          <h2 className="text-3xl font-black uppercase font-heading mb-4">Check Your Email</h2>
          <p className="text-gray-400 font-mono text-sm mb-8">
            A confirmation link has been sent to <span className="text-acid">{email}</span>. 
            Click it to activate your account and log in.
          </p>
          <Link href="/login" className="brutalist-button py-3 px-8 inline-block hover:bg-acid hover:text-black rounded-lg">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center p-6 pt-32 pb-12 relative overflow-x-hidden min-h-screen">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-acid/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md p-10 brutalist-border bg-black relative z-10 shadow-[8px_8px_0px_0px_#D6FF00] my-auto mx-auto mt-12 md:mt-auto">
        <div className="absolute -top-3 -left-3 w-6 h-6 bg-acid" />
        <h2 className="text-4xl font-black uppercase mb-2 font-heading text-center">New Entity</h2>
        <p className="text-center text-gray-400 font-mono text-sm mb-8">Initialize your career graph.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 mb-6 font-mono text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-[#333] p-4 text-white focus:outline-none focus:border-acid transition-all font-mono rounded-lg"
              placeholder="John Doe"
              required
              autoComplete="name"
            />
          </div>
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
              Password <span className="text-gray-600 normal-case font-normal">(min. 6 chars)</span>
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-[#333] p-4 pr-12 text-white focus:outline-none focus:border-acid transition-all font-mono rounded-lg"
                placeholder="••••••••"
                required
                autoComplete="new-password"
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
            {loading ? <><Loader2 className="animate-spin" size={18} /> Creating Account...</> : "Initialize Account →"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-mono text-gray-500">
          Already have clearance?{" "}
          <Link href="/login" className="text-acid hover:underline">
            Authenticate
          </Link>
        </div>
      </div>
    </div>
  );
}
