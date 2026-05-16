"use client";

import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { AlertTriangle, FileText, Crosshair, ArrowLeft, Search, Bell, LogOut, CheckCircle2, Copy, Loader2, Download, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Results() {
  const [data, setData] = useState<any>(null);
  const [context, setContext] = useState<any>({});
  const [coverLetter, setCoverLetter] = useState("");
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState("");
  const [copied, setCopied] = useState(false);
  const [userName, setUserName] = useState("User");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("aura_analysis");
    const ctx = localStorage.getItem("aura_context");
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setData({
        atsScore: 0,
        summary: "No analysis data found. Please upload a resume first.",
        rewrittenBullets: [{ original: "No data", optimized: "Please upload a resume first." }],
        skillGaps: [{ skillName: "N/A", userScore: 0, marketRequirement: 100 }],
        interviewQuestions: ["Please process a resume first."],
        weakPoints: [],
        missingSkills: [],
      });
    }
    if (ctx) setContext(JSON.parse(ctx));

    supabase.auth.getUser().then(({ data: d }) => {
      if (d.user) setUserName(d.user.user_metadata?.full_name || d.user.email?.split("@")[0] || "User");
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("aura_analysis");
    localStorage.removeItem("aura_context");
    router.push("/login");
  };

  const generateCoverLetter = async () => {
    setCoverLoading(true);
    setCoverError("");
    try {
      const res = await fetch("http://localhost:5000/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: context.targetRole || "Software Engineer",
          company: "",
          resumeText: data?.resumeText || "",
          userName,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Server error" }));
        throw new Error(err.error);
      }
      const result = await res.json();
      setCoverLetter(result.coverLetter || "");
    } catch (err: any) {
      setCoverError(err.message || "Failed to generate cover letter.");
    } finally {
      setCoverLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-acid font-mono">LOADING ANALYSIS...</div>;

  const chartData = data.skillGaps?.map((gap: any) => ({
    subject: gap.skillName,
    A: gap.userScore,
    B: gap.marketRequirement,
    fullMark: 100,
  })) || [];

  const scoreColor = data.atsScore >= 75 ? "text-acid" : data.atsScore >= 50 ? "text-yellow-400" : "text-red-400";
  const initials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex-1 w-full bg-black p-4 flex flex-col md:flex-row gap-4 font-sans text-white min-h-screen relative">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-[#050505] border border-[#222] rounded-[2rem] p-6 flex flex-col justify-between flex-shrink-0 md:sticky md:top-4 h-auto md:h-[calc(100vh-2rem)] z-20">
        <div>
          <Link href="/" className="text-4xl font-heading font-black tracking-widest uppercase text-white hover:text-acid transition-colors block mb-8 md:mb-12 text-center md:text-left">Aura</Link>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 pl-4 hidden md:block">Navigation</div>
          <div className="flex md:flex-col gap-2 mb-8 overflow-x-auto custom-scrollbar md:overflow-visible pb-2 md:pb-0">
            <Link href="/dashboard" className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm transition-all rounded-xl text-gray-500 hover:text-white hover:bg-[#111]">
              <ArrowLeft size={18} />
              <span className="whitespace-nowrap">Back to Hub</span>
            </Link>
            <div className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm rounded-xl bg-[#111] text-acid">
              <FileText size={18} />
              <span className="whitespace-nowrap">Analysis Report</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="hidden md:flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors uppercase font-bold tracking-widest text-sm rounded-xl hover:bg-red-500/10 mt-auto">
          <LogOut size={18} /> Log out
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="hidden md:flex justify-between items-center bg-[#050505] border border-[#222] rounded-full p-3 px-6 shadow-sm sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <div className="text-sm font-mono text-gray-400">Analysis for: <span className="text-acid font-bold">{context.targetRole || "General"}</span></div>
          </div>
          <div className="flex items-center gap-4 ml-4">
            <div className="flex items-center gap-3 pl-4 border-l border-[#222]">
              <div className="text-right hidden sm:block">
                <div className="text-xs uppercase font-bold text-gray-500 tracking-widest">Active User</div>
                <div className="text-sm font-mono text-acid">{userName}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-acid text-black flex items-center justify-center font-bold font-heading text-lg">{initials}</div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 flex flex-col gap-4 pb-10 mt-4 md:mt-0 w-full">
          {/* Summary Banner */}
          {data.summary && (
            <div className="bg-[#050505] border border-acid/30 rounded-[2rem] p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-acid mb-2 flex items-center gap-2"><Sparkles size={14} /> AI Summary</h3>
              <p className="text-gray-300 font-mono text-sm leading-relaxed">{data.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Score */}
                <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col justify-between hover:border-acid transition-colors">
                  <div>
                    <h2 className="text-2xl font-black uppercase font-heading mb-2">ATS Score</h2>
                    <p className="text-gray-400 text-sm font-mono">Algorithm match rate.</p>
                  </div>
                  <div className={`text-7xl font-black font-heading ${scoreColor} mt-8`}>{data.atsScore}<span className="text-3xl text-gray-500">/100</span></div>
                </div>

                {/* Radar */}
                <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-6 flex-1 hover:border-acid transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2"><Crosshair size={14} className="text-acid" /> Skill Matrix</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 10 }} />
                        <Radar name="You" dataKey="A" stroke="#D6FF00" fill="#D6FF00" fillOpacity={0.4} />
                        <Radar name="Market" dataKey="B" stroke="#ff4444" fill="#ff4444" fillOpacity={0.15} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-4 justify-center mt-2 text-xs font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-acid rounded-full" /> You</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> Market</span>
                  </div>
                </div>
              </div>

              {/* Missing Skills */}
              {data.missingSkills?.length > 0 && (
                <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-6 hover:border-yellow-500/50 transition-colors">
                  <h3 className="text-lg font-black uppercase font-heading mb-4 flex items-center gap-2 border-b border-[#222] pb-3">
                    <AlertTriangle className="text-yellow-500" size={18} /> Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.missingSkills.map((skill: string, i: number) => (
                      <span key={i} className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-full font-mono text-sm">{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Rewritten Bullets */}
              <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex flex-col hover:border-red-500/50 transition-colors">
                <h3 className="text-xl font-black uppercase font-heading mb-6 flex items-center gap-2 border-b border-[#222] pb-4"><AlertTriangle className="text-red-500" /> Optimized Bullets</h3>
                <ul className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {data.rewrittenBullets?.map((bullet: any, idx: number) => (
                    <li key={idx} className="bg-black border border-[#222] rounded-2xl p-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 group-hover:bg-red-500 transition-colors" />
                      <div className="line-through text-red-500/80 mb-3 font-mono text-xs uppercase tracking-wider pl-2">&quot;{bullet.original}&quot;</div>
                      <div className="flex gap-3 items-start pl-2">
                        <CheckCircle2 size={16} className="text-acid mt-0.5 flex-shrink-0" />
                        <div className="text-white font-mono text-sm leading-relaxed">&quot;{bullet.optimized}&quot;</div>
                      </div>
                      <button onClick={() => copyToClipboard(bullet.optimized)} className="absolute top-4 right-4 text-gray-600 hover:text-acid transition-colors opacity-0 group-hover:opacity-100">
                        <Copy size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cover Letter Generator */}
              <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex flex-col">
                <h3 className="text-xl font-black uppercase font-heading mb-4 flex items-center gap-2 border-b border-[#222] pb-4"><FileText className="text-acid" /> Cover Letter Generator</h3>
                {!coverLetter ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-gray-400 font-mono text-sm mb-6 max-w-md">Generate a tailored cover letter based on your resume and target role.</p>
                    {coverError && <p className="text-red-400 font-mono text-sm mb-4">{coverError}</p>}
                    <button onClick={generateCoverLetter} disabled={coverLoading}
                      className="brutalist-button py-3 px-8 rounded-xl hover:bg-acid hover:text-black border-white hover:border-acid disabled:opacity-50 flex items-center gap-2">
                      {coverLoading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Cover Letter</>}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="bg-black border border-[#222] rounded-2xl p-6 font-mono text-sm leading-relaxed text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar">{coverLetter}</div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => copyToClipboard(coverLetter)} className="brutalist-button py-2 px-6 rounded-xl text-sm hover:bg-acid hover:text-black flex items-center gap-2">
                        {copied ? <><CheckCircle2 size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                      </button>
                      <button onClick={() => setCoverLetter("")} className="brutalist-button py-2 px-6 rounded-xl text-sm hover:bg-white hover:text-black">Regenerate</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Interview */}
            <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-heading font-black uppercase border-b border-[#222] pb-4">Interview Sim</h2>
                <p className="text-gray-400 mt-4 font-mono text-sm">Behavioral and technical questions from your skill gaps.</p>
              </div>
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {data.interviewQuestions?.map((q: string, i: number) => (
                  <div key={i} className="bg-black border border-[#222] rounded-2xl p-5 relative group hover:border-acid transition-colors">
                    <div className="text-acid font-heading text-xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">Q{i + 1}.</div>
                    <h4 className="text-sm font-mono leading-relaxed text-gray-300 group-hover:text-white transition-colors">{q}</h4>
                  </div>
                ))}
              </div>

              {/* Weak Points */}
              {data.weakPoints?.length > 0 && (
                <div className="border-t border-[#222] pt-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Weak Points</h3>
                  <ul className="space-y-2">
                    {data.weakPoints.map((point: string, i: number) => (
                      <li key={i} className="text-sm font-mono text-red-400/80 flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link href="/dashboard" className="w-full brutalist-button py-4 text-sm bg-white text-black hover:bg-acid mt-auto uppercase font-black tracking-widest rounded-xl border-white hover:border-acid text-center block">
                Upload New Resume
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
