import React, { useState } from 'react'
import { Activity, Shield, Key, ArrowRight, Upload, FileText, X, Sparkles, RefreshCw, BarChart3, Heart, Dumbbell, Apple, Scale, Info } from 'lucide-react'

function App() {
  // Navigation & UI States
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  
  // Interactive Health Panel State (Active Disease Category)
  const [activeTab, setActiveTab] = useState('diabetes')

  // Form Control States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  // Structured Health Intelligence Data Store
  const healthDatabase = {
    diabetes: {
      title: 'Type-2 Diabetes Management Protocol',
      diet: ['Emphasize complex carbohydrates like oats, quinoa, and brown rice.', 'Incorporate high-fiber vegetables (spinach, broccoli, kale).', 'Strictly avoid refined sugars, processed juices, and high-glycemic fruits.'],
      exercise: ['30 minutes of moderate brisk walking or cycling daily.', 'Light resistance training 2-3 times a week to improve insulin sensitivity.', 'Monitor glucose parameters pre and post-workout.'],
      tip: 'Never skip meals; maintain a consistent eating schedule to prevent sudden glycemic spikes.'
    },
    hypertension: {
      title: 'Hypertension & Cardiovascular Care Plan',
      diet: ['Follow the DASH diet pattern (Rich in fruits, vegetables, and lean protein).', 'Strictly restrict sodium intake to less than 1,500 mg per day.', 'Increase potassium-rich foods like bananas, avocados, and sweet potatoes.'],
      exercise: ['Aerobic exercises such as swimming, jogging, or light aerobics.', 'Avoid heavy heavy-weight lifting that causes sudden blood pressure spikes.', 'Practice deep breathing or yoga for 15 minutes to regulate autonomic stress.'],
      tip: 'Check commercial food labels carefully; hidden sodium is heavily present in packaged items.'
    },
    thyroid: {
      title: 'Hypothyroidism Metabolic Optimization',
      diet: ['Prioritize iodine and selenium-rich options (eggs, dairy, whole grains).', 'Cook goitrogen foods (cabbage, cauliflower, broccoli) thoroughly before eating.', 'Maintain a high-protein baseline to stimulate basal metabolic rates.'],
      exercise: ['Consistent moderate-intensity cardio to counteract metabolic slowing.', 'Strength training to build lean muscle mass and boost resting energy expenditure.', 'Ensure adequate joint warm-ups as thyroid imbalances can cause joint stiffness.'],
      tip: 'Take thyroid medication strictly on an empty stomach, at least 30-60 minutes before breakfast.'
    }
  }

  const handleAuthSubmit = (e) => {
    e.preventDefault()
    alert(`Establishing connection for ${authMode === 'login' ? 'Login' : 'Signup'}...`)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans antialiased relative overflow-hidden">
      
      {/* 🌌 BACKGROUND SYSTEM */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-500/[0.12] via-indigo-500/[0.02] to-transparent pointer-events-none blur-[140px]" />

      {/* 🌐 NAVBAR */}
      <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#020617]/80 border-b border-slate-800/60 px-6 md:px-12 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Activity size={20} className="animate-pulse" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            Sehat<span className="text-blue-400 font-normal">Sathi</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          <button onClick={() => { setAuthMode('login'); setIsAuthOpen(true) }} className="text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer">Sign In</button>
          <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true) }} className="bg-white hover:bg-slate-200 text-slate-950 text-sm font-semibold py-2 px-4 rounded-xl transition-all active:scale-95 cursor-pointer">Get Started</button>
        </div>
      </nav>

      {/* 🚀 HERO SECTION */}
      <header className="relative max-w-5xl mx-auto px-6 pt-24 pb-12 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 bg-blue-950/50 border border-blue-900/40 text-blue-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-inner backdrop-blur-sm">
          <Sparkles size={14} className="text-blue-400" /> Powered by Advanced Vision AI
        </div>
        
        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tight max-w-4xl leading-[1.1] mb-6">
          Understand your medical reports <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-blue-500">
            in plain, simple language
          </span>
        </h1>
        
        <p className="text-base md:text-lg text-slate-400 max-w-2xl font-normal mb-10 leading-relaxed">
          Stop guessing your health status. Upload your blood tests, lab reports, or prescriptions and get an instant, clear, and comprehensive smart breakdown.
        </p>

        <div className="w-full max-w-xs mb-20 relative z-20">
          <button onClick={() => { setAuthMode('signup'); setIsAuthOpen(true) }} className="group w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 cursor-pointer text-sm tracking-wide">
            Start Analyzing Free
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 💻 APPS DASHBOARD GRAPHIC CAPTURE VIEW */}
        <div className="w-full max-w-4xl bg-[#0b1329]/60 rounded-2xl border border-blue-950/60 p-6 shadow-2xl shadow-black/80 relative overflow-hidden group mb-28 backdrop-blur-md">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          
          <div className="flex items-center justify-between border-b border-blue-950/60 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="text-xs text-slate-400 ml-2 font-medium">AI Analysis Console</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-blue-400 bg-blue-950/40 px-3 py-1 rounded-full border border-blue-900/40">
              <RefreshCw size={12} className="animate-spin duration-[4000ms]" /> Processing Document Matrix
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 bg-[#040814] border border-slate-900 rounded-xl p-5 h-64 flex flex-col justify-between text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-bounce duration-[3000ms]" />
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                <span className="text-[10px] font-mono text-slate-500">SOURCE_FILE.PDF</span>
                <FileText size={16} className="text-blue-500" />
              </div>
              <div className="space-y-2 opacity-40 py-2">
                <div className="h-2 bg-slate-800 w-3/4 rounded" />
                <div className="h-2 bg-slate-800 w-full rounded" />
                <div className="h-2 bg-slate-800 w-5/6 rounded" />
              </div>
              <div className="bg-blue-950/30 border border-blue-900/40 rounded-lg p-3 text-center">
                <Upload size={20} className="text-blue-400 mx-auto mb-1 animate-pulse" />
                <span className="text-[11px] text-slate-400 block font-medium">Extracting tabular coordinates...</span>
              </div>
            </div>

            <div className="md:col-span-2 text-slate-700 font-mono text-xs flex flex-col items-center justify-center gap-1">
              <span className="text-blue-500 animate-pulse">➔ ➔ ➔</span>
            </div>

            <div className="md:col-span-5 bg-[#040814] border border-slate-900 rounded-xl p-5 h-64 flex flex-col justify-between text-left">
              <div className="flex items-center justify-between border-b border-slate-900/60 pb-2">
                <span className="text-[10px] font-mono text-blue-400">STRUCTURED_OUTPUT</span>
                <BarChart3 size={16} className="text-white" />
              </div>
              <div className="space-y-3 font-sans my-auto">
                <div className="p-2.5 bg-blue-950/20 border border-blue-900/30 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-300">Hemoglobin Level</span>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-semibold">14.5 g/dL (Normal)</span>
                </div>
                <div className="p-2.5 bg-slate-900/40 border border-slate-800/40 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-slate-300">Fasting Blood Sugar</span>
                  <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold">112 mg/dL (High)</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-500 flex justify-between items-center border-t border-slate-900/80 pt-2">
                <span>Confidence Rating:</span>
                <span className="text-blue-400 font-bold">99.4%</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 📊 NEW SECTION: IDEAL HEIGHT-WEIGHT INDEX (BMI REFERENCE) */}
      <section className="max-w-5xl mx-auto px-6 pb-24 relative z-10">
        <div className="bg-gradient-to-br from-[#0b1329] to-[#040814] border border-blue-950/80 rounded-3xl p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl text-left">
              <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-semibold mb-3">
                <Scale size={16} /> Clinical Reference Anthropometry
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Ideal Weight Proportions by Height (BMI Standard)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                A healthy physiological balance requires maintaining a body mass index within the standard 18.5 – 24.9 range. Check your structural weight benchmarks below:
              </p>
            </div>
            
            {/* Standard Metrics Table */}
            <div className="w-full md:w-auto bg-[#030712] border border-slate-800/80 rounded-2xl overflow-hidden shadow-inner">
              <table className="text-left border-collapse text-xs font-sans w-full md:w-80">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                    <th className="p-3 font-semibold">Height</th>
                    <th className="p-3 font-semibold">Healthy Weight Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 font-medium text-slate-300">
                  <tr><td className="p-3">5'2" (157 cm)</td><td className="p-3">46 – 61 kg</td></tr>
                  <tr><td className="p-3">5'6" (168 cm)</td><td className="p-3">53 – 70 kg</td></tr>
                  <tr><td className="p-3">5'10" (178 cm)</td><td className="p-3">61 – 80 kg</td></tr>
                  <tr><td className="p-3">6'2" (188 cm)</td><td className="p-3">70 – 91 kg</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 🍏 NEW SECTION: INTERACTIVE CLINICAL DIET & EXERCISE PROTOCOLS */}
      <section className="max-w-5xl mx-auto px-6 pb-28 relative z-10 text-left">
        <div className="text-center md:text-left mb-10">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Clinical Diet & Exercise Resource Matrix</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Select a specific health parameters to review structured therapeutic lifestyle adjustments verified by global nutrition frameworks.
          </p>
        </div>

        {/* Tab Selection Switches */}
        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-8 overflow-x-auto">
          {['diabetes', 'hypertension', 'thyroid'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-lg' 
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Display Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          
          {/* Diet Module */}
          <div className="bg-[#0b1329]/40 border border-blue-950/60 p-6 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-4">
                <Apple size={18} /> Nutrition & Diet Restrictions
              </div>
              <h4 className="text-white font-bold text-base mb-3">{healthDatabase[activeTab].title}</h4>
              <ul className="space-y-3">
                {healthDatabase[activeTab].diet.map((item, index) => (
                  <li key={index} className="text-slate-400 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-500 mt-1">▪</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exercise Module */}
          <div className="bg-[#0b1329]/40 border border-blue-950/60 p-6 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-4">
                <Dumbbell size={18} /> Structured Training Guidelines
              </div>
              <h4 className="text-white font-bold text-base mb-3">Therapeutic Physical Activity Plan</h4>
              <ul className="space-y-3">
                {healthDatabase[activeTab].exercise.map((item, index) => (
                  <li key={index} className="text-slate-400 text-xs flex items-start gap-2 leading-relaxed">
                    <span className="text-blue-500 mt-1">▪</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* Informative Toast Note Box */}
        <div className="mt-6 bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex items-start gap-3">
          <Info size={16} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-slate-400 text-xs leading-relaxed">
            <span className="text-white font-semibold">Important Notice:</span> {healthDatabase[activeTab].tip}
          </p>
        </div>
      </section>

      {/* 📚 STEP-BY-STEP FLOW GUIDE (TUTORIAL NODE) */}
      <section className="max-w-5xl mx-auto px-6 pb-32 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">How to use SehatSathi</h2>
          <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">Get your report simplified in four quick and straightforward steps.</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="bg-[#0b1329]/20 border border-blue-950/40 p-6 rounded-xl hover:border-blue-500/20 transition-all duration-300"><div className="bg-blue-950/60 text-blue-400 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mb-5 border border-blue-900/30">1</div><h4 className="text-sm font-bold text-white mb-2">Create an Account</h4><p className="text-slate-400 text-xs leading-relaxed">Sign up securely with your email address to access your personalized health space.</p></div>
          <div className="bg-[#0b1329]/20 border border-blue-950/40 p-6 rounded-xl hover:border-blue-500/20 transition-all duration-300"><div className="bg-blue-950/60 text-blue-400 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mb-5 border border-blue-900/30">2</div><h4 className="text-sm font-bold text-white mb-2">Upload Your Report</h4><p className="text-slate-400 text-xs leading-relaxed">Upload your lab reports securely as a standard PDF file or snap a clear photo from your phone.</p></div>
          <div className="bg-[#0b1329]/20 border border-blue-950/40 p-6 rounded-xl hover:border-blue-500/20 transition-all duration-300"><div className="bg-blue-950/60 text-blue-400 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mb-5 border border-blue-900/30">3</div><h4 className="text-sm font-bold text-white mb-2">AI Smart Scanning</h4><p className="text-slate-400 text-xs leading-relaxed">Our advanced system extracts information, categorizes parameters, and runs a diagnostic layout mapping.</p></div>
          <div className="bg-[#0b1329]/20 border border-blue-950/40 p-6 rounded-xl hover:border-blue-500/20 transition-all duration-300"><div className="bg-blue-950/60 text-blue-400 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm mb-5 border border-blue-900/30">4</div><h4 className="text-sm font-bold text-white mb-2">Review Summary</h4><p className="text-slate-400 text-xs leading-relaxed">Read cleanly broken-down details, definitions, and health vital charts saved forever on your dashboard timeline.</p></div>
        </div>
      </section>

      {/* 🔒 AUTH MODAL POPUP */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div onClick={() => setIsAuthOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"></div>
          <div className="relative bg-[#0b1329] w-full max-w-sm p-8 rounded-2xl border border-blue-950 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200 shadow-black/80">
            <button onClick={() => setIsAuthOpen(false)} className="absolute top-5 right-5 text-slate-500 hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"><X size={16} /></button>
            <div className="text-center mb-6"><div className="inline-flex bg-blue-950/60 border border-blue-900/30 text-blue-400 p-2.5 rounded-xl mb-3"><Activity size={20} /></div><h2 className="text-xl font-bold text-white tracking-tight">{authMode === 'login' ? 'Sign In' : 'Create Account'}</h2><p className="text-slate-400 text-xs mt-1">{authMode === 'login' ? 'Access your secure medical dashboard' : 'Set up your credentials to get started'}</p></div>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === 'signup' && (<div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label><input type="text" required placeholder="Amit Dubey" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#030712] border border-blue-950/60 focus:border-blue-500 focus:bg-[#050b18] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all" /></div>)}
              <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Email Address</label><input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#030712] border border-blue-950/60 focus:border-blue-500 focus:bg-[#050b18] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all" /></div>
              <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Password</label><input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#030712] border border-blue-950/60 focus:border-blue-500 focus:bg-[#050b18] rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all" /></div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-[0.98] mt-3 cursor-pointer text-sm">{authMode === 'login' ? 'Sign In' : 'Sign Up'}</button>
            </form>
            <div className="text-center mt-6 pt-5 border-t border-blue-950/60"><p className="text-xs text-slate-400">{authMode === 'login' ? "New to SehatSathi? " : "Already have an account? "}<button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-blue-400 font-semibold hover:underline cursor-pointer ml-1">{authMode === 'login' ? 'Create an Account' : 'Sign In'}</button></p></div>
          </div>
        </div>
      )}

      {/* 📑 FOOTER */}
      <footer className="border-t border-slate-900 bg-[#010307] py-6 text-center text-xs text-slate-500">
        © 2026 SehatSathi. Secure Medical Intelligence Layer.
      </footer>

    </div>
  )
}

export default App