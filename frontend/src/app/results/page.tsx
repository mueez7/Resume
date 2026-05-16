"use client";

import { useState, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { AlertTriangle, FileText, Crosshair, ArrowLeft, Search, Bell, LogOut, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function Results() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('aura_analysis');
    if (storedData) {
      setData(JSON.parse(storedData));
    } else {
      setData({
        atsScore: 0,
        rewrittenBullets: [{ original: "No data", optimized: "Please upload a resume first." }],
        skillGaps: [{ skillName: "N/A", userScore: 0, marketRequirement: 100 }],
        interviewQuestions: ["Please process a resume first."]
      });
    }
  }, []);

  if (!data) return <div className="h-screen bg-black flex items-center justify-center text-acid font-mono">DECRYPTING PAYLOAD...</div>;

  const chartData = data.skillGaps?.map((gap: any) => ({
    subject: gap.skillName,
    A: gap.userScore,
    B: gap.marketRequirement,
    fullMark: 150
  })) || [];

  return (
    <div className="flex-1 w-full bg-black p-4 flex flex-col md:flex-row gap-4 font-sans text-white min-h-screen relative">
      {/* Left Sidebar (Matches Dashboard) */}
      <div className="w-full md:w-64 bg-[#050505] border border-[#222] rounded-[2rem] p-6 flex flex-col justify-between flex-shrink-0 md:sticky md:top-4 h-auto md:h-[calc(100vh-2rem)] z-20">
        <div>
          <Link href="/" className="text-4xl font-heading font-black tracking-widest uppercase text-white hover:text-acid transition-colors block mb-8 md:mb-12 text-center md:text-left">
            Aura
          </Link>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 pl-4 hidden md:block">General</div>
          <div className="flex md:flex-col gap-2 mb-8 overflow-x-auto custom-scrollbar md:overflow-visible pb-2 md:pb-0">
            <Link href="/dashboard" className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm transition-all rounded-xl text-gray-500 hover:text-white hover:bg-[#111]">
              <ArrowLeft size={18} />
              <span className="whitespace-nowrap">Back to Hub</span>
            </Link>
            <button className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm transition-all rounded-xl bg-[#111] text-acid">
              <FileText size={18} />
              <span className="whitespace-nowrap">Analysis Report</span>
            </button>
          </div>
        </div>
        
        <button className="hidden md:flex items-center gap-4 px-4 py-3 text-gray-500 hover:text-red-500 transition-colors uppercase font-bold tracking-widest text-sm rounded-xl hover:bg-red-500/10 mt-auto">
          <LogOut size={18}/> Log out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-4 w-full">
        
        {/* Top Header */}
        <div className="hidden md:flex justify-between items-center bg-[#050505] border border-[#222] rounded-full p-3 px-6 shadow-sm sticky top-4 z-10">
          <div className="flex-1 max-w-md flex items-center gap-3 bg-black border border-[#222] rounded-full px-4 py-2">
            <Search size={16} className="text-gray-500" />
            <input type="text" placeholder="Search report metrics..." className="bg-transparent border-none outline-none text-sm font-mono w-full text-white placeholder-gray-600" />
          </div>
          
          <div className="flex items-center gap-4 ml-4">
            <button className="w-10 h-10 rounded-full bg-black border border-[#222] flex items-center justify-center text-white hover:text-acid transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-[#222]">
              <div className="text-right hidden sm:block">
                <div className="text-xs uppercase font-bold text-gray-500 tracking-widest">Active User</div>
                <div className="text-sm font-mono text-acid">john.doe@aura</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold font-heading text-lg">JD</div>
            </div>
          </div>
        </div>

        {/* Results Grid - Natural Scroll */}
        <div className="flex-1 flex flex-col gap-4 pb-10 mt-4 md:mt-0 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full">
            
            {/* Left Column (Main Analysis) */}
            <div className="xl:col-span-2 flex flex-col gap-4">
              
              <div className="flex gap-4">
                {/* Score Card */}
                <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col justify-between hover:border-acid transition-colors">
                  <div>
                    <h2 className="text-2xl font-black uppercase font-heading mb-2">ATS Score</h2>
                    <p className="text-gray-400 text-sm font-mono">Parsing algorithm match rate.</p>
                  </div>
                  <div className="text-7xl font-black font-heading text-acid mt-8">{data.atsScore}<span className="text-3xl text-gray-500">/100</span></div>
                </div>

                {/* Radar Chart Card */}
                <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-6 flex-1 hover:border-acid transition-colors">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2"><Crosshair size={14} className="text-acid"/> Skill Matrix</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#333" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                        <Radar name="You" dataKey="A" stroke="#D6FF00" fill="#D6FF00" fillOpacity={0.4} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Roasted Verbs Card */}
              <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col hover:border-red-500/50 transition-colors">
                <h3 className="text-xl font-black uppercase font-heading mb-6 flex items-center gap-2 border-b border-[#222] pb-4"><AlertTriangle className="text-red-500" /> Weak Verbs Roasted</h3>
                <ul className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1">
                  {data.rewrittenBullets?.map((bullet: any, idx: number) => (
                    <li key={idx} className="bg-black border border-[#222] rounded-2xl p-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50 group-hover:bg-red-500 transition-colors"></div>
                      <div className="line-through text-red-500/80 mb-3 font-mono text-xs uppercase tracking-wider pl-2">&quot;{bullet.original}&quot;</div>
                      <div className="flex gap-3 items-start pl-2">
                        <CheckCircle2 size={16} className="text-acid mt-0.5 flex-shrink-0" />
                        <div className="text-white font-mono text-sm leading-relaxed">&quot;{bullet.optimized}&quot;</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column (Interview Sim) */}
            <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-heading font-black uppercase border-b border-[#222] pb-4">Interview Sim</h2>
                <p className="text-gray-400 mt-4 font-mono text-sm">Aggressive behavioral and technical questions generated from your skill gaps.</p>
              </div>
              
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 flex-1">
                {data.interviewQuestions?.map((q: string, i: number) => (
                  <div key={i} className="bg-black border border-[#222] rounded-2xl p-5 relative group hover:border-acid transition-colors">
                    <div className="text-acid font-heading text-xl mb-2 opacity-50 group-hover:opacity-100 transition-opacity">Q{i+1}.</div>
                    <h4 className="text-sm font-mono leading-relaxed text-gray-300 group-hover:text-white transition-colors">{q}</h4>
                  </div>
                ))}
              </div>
              
              <button className="w-full brutalist-button py-4 text-sm bg-white text-black hover:bg-acid mt-auto uppercase font-black tracking-widest rounded-xl border-white hover:border-acid">
                Start Mock Interview
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
