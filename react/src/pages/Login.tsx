import Header from '../components/Header'
import AuthButtons from "../components/AuthButtons.tsx";

function Login() {

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      <main className="relative min-h-screen technical-grid">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 py-12 lg:py-20 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left Narrative Section */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold text-primary tracking-widest uppercase">Live Polymarket Integration</span>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tighter">
                Quantify <span className="text-primary">Uncertainty</span> with Prediction Markets
              </h1>
              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                Harness real-time crowd intelligence to stress-test your portfolio against global volatility. We turn event odds into actionable risk metrics.
              </p>
            </div>
            {/* Bento Box Metrics Teaser */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-primary">analytics</span>
                  <span className="text-[10px] text-primary/60 font-mono">POLY-VIX</span>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight">84.2%</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Event Confidence</div>
                </div>
              </div>
              <div className="glass-panel p-5 rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="material-symbols-outlined text-emerald-500">security</span>
                  <span className="text-[10px] text-emerald-500/60 font-mono">STRESS-LVL</span>
                </div>
                <div>
                  <div className="text-2xl font-bold tracking-tight text-emerald-500">Low</div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Risk Exposure</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Authentication Panel */}
          <div className="relative">
            {/* Abstract Glow Backdrop */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="glass-panel rounded-2xl p-8 lg:p-10 shadow-2xl relative z-10">
              <div className="flex flex-col gap-4">
                <AuthButtons />
              </div>
            </div>
          </div>
        </div>

        {/* Technical Footer Decoration */}
        <div className="max-w-[1400px] mx-auto px-6 lg:px-20 py-10 flex flex-wrap gap-8 items-center justify-center opacity-40 grayscale hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="material-symbols-outlined text-primary text-lg">api</span>
            POWERED BY POLYMARKET API
          </div>
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="material-symbols-outlined text-primary text-lg">data_exploration</span>
            REAL-TIME RISK MODELING
          </div>
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
            SOC2 COMPLIANT INFRA
          </div>
          <div className="flex items-center gap-2 font-bold text-xs">
            <span className="material-symbols-outlined text-primary text-lg">hub</span>
            CROSS-CHAIN AGGREGATION
          </div>
        </div>
      </main>

      {/* Background Decoration Image */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 pointer-events-none -z-10 opacity-10">
        <div className="w-full h-full bg-gradient-to-t from-primary/20 to-transparent"></div>
      </div>

      <style>{`
        .glass-panel {
          background: rgba(28, 37, 39, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(59, 79, 84, 0.5);
        }
        .glow-cyan {
          box-shadow: 0 0 20px rgba(15, 160, 189, 0.2);
        }
        .technical-grid {
          background-image: radial-gradient(circle at 2px 2px, #283639 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  )
}

export default Login
