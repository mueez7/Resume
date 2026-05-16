"use client";

import { useState, useEffect } from "react";
import { Upload, Sparkles, X, FileText, BarChart, Briefcase, Settings, LogOut, Search, Bell, AlertCircle, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [salary, setSalary] = useState("");
  const [workType, setWorkType] = useState("remote");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [hasResults, setHasResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (localStorage.getItem('aura_analysis')) {
      setHasResults(true);
    }
  }, []);

  const stats = [
    { label: "Avg ATS Score", value: "---", color: "text-gray-500", bg: "bg-[#050505]" },
    { label: "Saved Jobs", value: "0", color: "text-acid", bg: "bg-[#050505]" },
    { label: "Resumes Analyzed", value: hasResults ? "1" : "0", color: "text-white", bg: "bg-[#050505]" },
  ];

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setShowModal(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setShowModal(true);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("targetRole", targetRole || 'Software Engineer');
      formData.append("salary", salary);
      formData.append("workType", workType);

      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }
      
      const data = await res.json();

      // Validate we got something useful back
      if (typeof data.atsScore === 'undefined' && typeof data.error === 'string') {
        throw new Error(data.error);
      }

      localStorage.setItem('aura_analysis', JSON.stringify(data));
      localStorage.setItem('aura_context', JSON.stringify({ targetRole, salary, workType }));
      setHasResults(true);
      router.push("/results");
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      setIsProcessing(false);
      setShowModal(false);
      setError((err as Error).message || "Unable to process payload. Please try again.");
    }
  };

  if (isProcessing) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-acid/10 via-black to-black"></div>
        <div className="z-10 flex flex-col items-center text-center">
          <div className="relative w-32 h-32 mb-8">
            <div className="absolute inset-0 rounded-full border-t-2 border-acid animate-spin opacity-50"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-white animate-[spin_2s_linear_infinite] opacity-70"></div>
            <div className="absolute inset-4 rounded-full border-b-2 border-acid animate-[spin_3s_linear_infinite]"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-acid" size={32} />
          </div>
          <h2 className="text-4xl font-black uppercase font-heading mb-4 animate-pulse">Neural Extraction</h2>
          <p className="text-gray-400 font-mono tracking-widest max-w-md">
            Quantifying achievements. Identifying weak verbs. Simulating ATS algorithms...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: BarChart, label: "Dashboard" },
    { id: "upload", icon: Upload, label: "Upload Payload" },
    { id: "jobs", icon: Briefcase, label: "Target Jobs" },
    { id: "settings", icon: Settings, label: "System Config" },
  ];

  return (
    <div className="flex-1 w-full bg-black p-4 flex flex-col md:flex-row gap-4 font-sans text-white min-h-screen relative">
      {/* Left Sidebar */}
      <div className="w-full md:w-64 bg-[#050505] border border-[#222] rounded-[2rem] p-6 flex flex-col justify-between flex-shrink-0 md:sticky md:top-4 h-auto md:h-[calc(100vh-2rem)] z-20">
        <div>
          <Link href="/" className="text-4xl font-heading font-black tracking-widest uppercase text-white hover:text-acid transition-colors block mb-8 md:mb-12 text-center md:text-left">
            Aura
          </Link>
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 pl-4 hidden md:block">General</div>
          <div className="flex md:flex-col gap-2 mb-8 overflow-x-auto custom-scrollbar md:overflow-visible pb-2 md:pb-0">
            {navItems.slice(0, 3).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm transition-all rounded-xl ${activeTab === item.id ? 'bg-[#111] text-acid' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
              >
                <item.icon size={18} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>
          
          <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-4 pl-4 hidden md:block">Tools</div>
          <div className="flex md:flex-col gap-2">
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm transition-all rounded-xl ${activeTab === "settings" ? 'bg-[#111] text-acid' : 'text-gray-500 hover:text-white hover:bg-[#111]'}`}
            >
              <Settings size={18} />
              Settings
            </button>
            {hasResults && (
              <Link href="/results" className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-4 px-4 py-3 uppercase font-bold tracking-widest text-xs md:text-sm transition-all rounded-xl text-acid hover:bg-[#111] border border-acid/20">
                <FileText size={18} />
                View Results
              </Link>
            )}
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
            <input type="text" placeholder="Search targets, jobs, analytics..." className="bg-transparent border-none outline-none text-sm font-mono w-full text-white placeholder-gray-600" />
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

        {/* Dashboard Grid - Natural Scroll */}
        <div className="flex-1 flex flex-col gap-4 pb-10 mt-4 md:mt-0 w-full">

          {/* Inline Error Banner */}
          {error && (
            <div className="bg-red-950/60 border border-red-500/50 rounded-2xl p-5 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-bold uppercase text-red-400 tracking-widest mb-1">System Failure</p>
                <p className="text-sm font-mono text-red-300">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-white transition-colors ml-2">
                <X size={16} />
              </button>
            </div>
          )}
          
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full min-h-max">
              <div className="xl:col-span-2 flex flex-col gap-4">
                <div className="pt-4 pb-2 px-2">
                  <h1 className="text-4xl font-heading font-black mb-2">Command Center, <span className="text-acid">JD.</span></h1>
                  <p className="text-gray-400 font-mono text-sm max-w-2xl">Aura systems nominal. Waiting for payload deployment to initialize neural extraction.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className={`${stat.bg} border border-[#222] rounded-[2rem] p-6 hover:border-acid transition-colors group flex flex-col justify-between min-h-[160px]`}>
                      <div className="text-sm uppercase tracking-widest font-bold text-gray-500 group-hover:text-gray-300 transition-colors">{stat.label}</div>
                      <div className={`text-6xl font-black font-heading ${stat.color} mt-4 group-hover:scale-105 transition-transform origin-left`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Quick Upload Action */}
                <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col min-h-[300px]">
                   <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-heading font-black uppercase flex items-center gap-2">
                      <Upload className="text-acid"/> Quick Deploy
                    </h2>
                  </div>
                  <button onClick={() => setActiveTab('upload')} className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#333] hover:border-acid rounded-[1.5rem] bg-black hover:bg-acid/5 p-8 text-center cursor-pointer transition-all group relative overflow-hidden">
                    <div className="w-16 h-16 rounded-full bg-[#111] group-hover:bg-acid/20 flex items-center justify-center mb-6 transition-colors">
                      <Upload size={24} className="text-gray-500 group-hover:text-acid transition-colors" />
                    </div>
                    <p className="text-2xl font-bold uppercase mb-2 group-hover:text-white transition-colors font-heading tracking-wide">Go to Upload</p>
                    <p className="text-gray-500 font-mono text-sm max-w-sm">Navigate to the payload deployment center to run ATS simulation.</p>
                  </button>
                </div>
              </div>

              {/* Right Column */}
              <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-[#222] pb-4">
                  <h2 className="text-xl font-heading font-black uppercase">Recent Analysis</h2>
                </div>
                
                {hasResults ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle2 size={48} className="text-acid mb-4" />
                    <h3 className="font-bold uppercase text-lg mb-2">Results Available</h3>
                    <p className="text-sm text-gray-500 font-mono mb-6">Your latest resume analysis is ready to view.</p>
                    <Link href="/results" className="w-full brutalist-button py-3 text-sm bg-white text-black hover:bg-acid text-center block rounded-xl">
                      View Report
                    </Link>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <AlertCircle size={48} className="text-gray-600 mb-4" />
                    <h3 className="font-bold uppercase text-lg mb-2 text-gray-500">No Data</h3>
                    <p className="text-sm text-gray-600 font-mono">Upload a resume to generate an analysis report.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "upload" && (
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-[#222] pb-6">
                  <div>
                    <h2 className="text-3xl font-heading font-black uppercase flex items-center gap-3 mb-2">
                      <Upload className="text-acid" size={28}/> Deploy Payload
                    </h2>
                    <p className="text-gray-400 font-mono text-sm">Upload your PDF resume to initialize the neural extraction and ATS simulation.</p>
                  </div>
                  <div className="text-xs font-mono text-gray-500 bg-black px-4 py-2 rounded-full border border-[#222]">PDF ONLY</div>
                </div>
                
                <label 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#333] hover:border-acid rounded-[2rem] bg-black hover:bg-acid/5 p-8 text-center cursor-pointer transition-all group relative overflow-hidden min-h-[400px]"
                >
                  <input type="file" className="hidden" accept=".pdf" onChange={handleFileSelect} />
                  <div className="w-24 h-24 rounded-full bg-[#111] group-hover:bg-acid/20 flex items-center justify-center mb-6 transition-colors">
                    <Upload size={36} className="text-gray-500 group-hover:text-acid transition-colors" />
                  </div>
                  <p className="text-3xl font-bold uppercase mb-4 group-hover:text-white transition-colors font-heading tracking-wide">Drop PDF Resume Here</p>
                  <p className="text-gray-500 font-mono text-base max-w-md">Click or drag and drop. Upload your current resume to run the ATS simulation and extract targeted improvements.</p>
                </label>
              </div>
            </div>
          )}

          {activeTab === "jobs" && (
            <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col">
               <div className="flex justify-between items-center border-b border-[#222] pb-6 mb-6">
                  <div>
                    <h2 className="text-3xl font-heading font-black uppercase mb-2">Target Jobs</h2>
                    <p className="text-gray-400 font-mono text-sm">Live market data and matched opportunities.</p>
                  </div>
                  <button className="brutalist-button px-6 py-2 rounded-xl text-sm">Scan Market</button>
               </div>
               <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-black rounded-[1.5rem] border border-[#222]">
                  <Briefcase size={64} className="text-gray-700 mb-6" />
                  <h3 className="text-2xl font-black uppercase font-heading mb-2">No Live Targets</h3>
                  <p className="text-gray-500 font-mono max-w-md">The live job board integration is pending configuration. Upload your resume first to unlock personalized market scans.</p>
               </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-[#050505] border border-[#222] rounded-[2rem] p-8 flex-1 flex flex-col">
               <div className="border-b border-[#222] pb-6 mb-6">
                  <h2 className="text-3xl font-heading font-black uppercase mb-2">System Config</h2>
                  <p className="text-gray-400 font-mono text-sm">Manage your Aura account and preferences.</p>
               </div>
               <div className="max-w-2xl space-y-8">
                 <div>
                   <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-4">Account</h3>
                   <div className="space-y-4">
                      <div className="bg-black p-4 rounded-xl border border-[#222] flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm">Email Address</div>
                          <div className="text-gray-500 font-mono text-xs">john.doe@aura.com</div>
                        </div>
                        <button className="text-xs uppercase font-bold text-gray-400 hover:text-white">Edit</button>
                      </div>
                      <div className="bg-black p-4 rounded-xl border border-[#222] flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm">Password</div>
                          <div className="text-gray-500 font-mono text-xs">********</div>
                        </div>
                        <button className="text-xs uppercase font-bold text-gray-400 hover:text-white">Change</button>
                      </div>
                   </div>
                 </div>
                 <div>
                   <h3 className="text-lg font-bold uppercase tracking-widest text-white mb-4">Preferences</h3>
                   <div className="space-y-4">
                      <div className="bg-black p-4 rounded-xl border border-[#222] flex justify-between items-center">
                        <div>
                          <div className="font-bold text-sm">Dark Mode</div>
                          <div className="text-gray-500 font-mono text-xs">Forced. Brutalist aesthetic active.</div>
                        </div>
                        <div className="w-12 h-6 rounded-full bg-acid relative cursor-not-allowed">
                          <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-black"></div>
                        </div>
                      </div>
                   </div>
                 </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Target Parameters Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#050505] rounded-[2rem] border border-[#222] p-8 w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#111] transition-colors">
              <X size={20} />
            </button>
            <h3 className="text-2xl font-black uppercase mb-2 font-heading">Target Parameters</h3>
            <p className="text-gray-400 mb-8 text-sm font-mono border-b border-[#222] pb-6">Provide context to optimize the AI simulation.</p>
            
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Target Role</label>
                <input 
                  type="text" 
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full bg-black border border-[#222] rounded-xl p-4 text-white focus:outline-none focus:border-acid font-mono transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Expected Salary (USD)</label>
                <input 
                  type="text" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g. $150,000"
                  className="w-full bg-black border border-[#222] rounded-xl p-4 text-white focus:outline-none focus:border-acid font-mono transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Environment</label>
                <select 
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value)}
                  className="w-full bg-black border border-[#222] rounded-xl p-4 text-white focus:outline-none focus:border-acid font-mono appearance-none cursor-pointer transition-colors"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-Site</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={handleProcess}
              disabled={!targetRole}
              className="w-full brutalist-button py-4 rounded-xl bg-white text-black hover:bg-acid border-white hover:border-acid disabled:opacity-50 disabled:cursor-not-allowed uppercase font-black tracking-widest"
            >
              Initialize Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
