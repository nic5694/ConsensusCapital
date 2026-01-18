import { useState } from 'react';

interface EventScenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  probability: number;
  leftLabel: string;
  rightLabel: string;
  accentColor: string;
  metadata?: string;
  mode?: 'binary' | 'range';
}

const ScenarioBuilder: React.FC = () => {
  const [scenarios, setScenarios] = useState<EventScenario[]>([
    {
      id: '1',
      title: 'Federal Reserve Interest Rate Decision',
      description: 'Market expectation: 25bps cut (72%)',
      icon: 'account_balance',
      iconColor: 'text-primary bg-primary/10',
      probability: 85,
      leftLabel: 'Hold / Hike',
      rightLabel: '25bps+ Cut',
      accentColor: 'primary',
      metadata: 'September Meeting',
    },
    {
      id: '2',
      title: '2024 Presidential Election Winner',
      description: 'Polymarket Volume: $240M+',
      icon: 'how_to_vote',
      iconColor: 'text-amber-500 bg-amber-500/10',
      probability: 42,
      leftLabel: 'Candidate A',
      rightLabel: 'Candidate B',
      accentColor: 'amber-500',
      mode: 'binary',
    },
    {
      id: '3',
      title: 'SEC Spot ETH ETF Staking Approval',
      description: 'Recent odds dropped by 12%',
      icon: 'gavel',
      iconColor: 'text-emerald-500 bg-emerald-500/10',
      probability: 15,
      leftLabel: 'Denied',
      rightLabel: 'Approved',
      accentColor: 'emerald-500',
    },
  ]);

  const handleProbabilityChange = (id: string, value: number) => {
    setScenarios(prev =>
      prev.map(scenario =>
        scenario.id === id ? { ...scenario, probability: value } : scenario
      )
    );
  };

  const handleReset = () => {
    setScenarios(prev =>
      prev.map(scenario => ({ ...scenario, probability: 50 }))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-8 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">analytics</span>
            <h2 className="text-white text-lg font-bold font-display uppercase tracking-tight">
              Scenario Builder
            </h2>
          </div>
          <nav className="flex items-center gap-6">
            <a className="text-white text-sm font-medium border-b-2 border-primary pb-1" href="#">
              Active Simulation
            </a>
            <a className="text-slate-400 hover:text-white text-sm font-medium transition-colors" href="#">
              Saved Scenarios
            </a>
            <a className="text-slate-400 hover:text-white text-sm font-medium transition-colors" href="#">
              Historical Impact
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live Polymarket Data</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Page Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-white text-5xl font-black font-display tracking-tight leading-none">
              What-If Analysis
            </h1>
            <p className="text-slate-400 text-lg">
              Simulate event outcomes and visualize portfolio stress in real-time.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-colors"
            >
              <span className="material-symbols-outlined">restart_alt</span>
              <span>Reset Odds</span>
            </button>
            <button className="flex items-center gap-2 rounded-xl h-12 px-8 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-all shadow-xl shadow-primary/30">
              <span className="material-symbols-outlined">save</span>
              <span>Save Scenario</span>
            </button>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Event Simulator */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-[#161a1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                  <div>
                    <h3 className="text-white font-display font-bold text-xl">
                      Event Outcome Simulator
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Adjust Polymarket probabilities to see downstream effects
                    </p>
                  </div>
                </div>
                <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Event
                </button>
              </div>

              <div className="p-6 space-y-8">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="bg-[#1c2226] p-4 rounded-lg border border-transparent hover:border-primary/30 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className={`p-2 ${scenario.iconColor} rounded-lg h-fit`}>
                          <span className="material-symbols-outlined">{scenario.icon}</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-base">{scenario.title}</h4>
                          <p className="text-slate-500 text-xs">{scenario.description}</p>
                        </div>
                      </div>
                      {scenario.metadata && (
                        <select className="bg-slate-950 border-slate-700 text-slate-300 text-xs rounded focus:ring-primary focus:border-primary px-2 py-1">
                          <option>{scenario.metadata}</option>
                        </select>
                      )}
                      {scenario.mode === 'binary' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold">MODE:</span>
                          <button className="px-2 py-1 bg-primary/20 text-primary text-[10px] font-bold rounded">
                            BINARY
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {scenario.leftLabel}
                        </span>
                        <span className={`text-${scenario.accentColor} font-display font-bold text-xl tracking-tighter`}>
                          {scenario.accentColor === 'amber-500'
                            ? `Win Chance: ${scenario.probability}%`
                            : scenario.accentColor === 'emerald-500'
                            ? `Prob: ${scenario.probability}% Yes`
                            : `Probability: ${scenario.probability}% Cut`}
                        </span>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {scenario.rightLabel}
                        </span>
                      </div>
                      <input
                        className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${scenario.accentColor}`}
                        type="range"
                        min="0"
                        max="100"
                        value={scenario.probability}
                        onChange={(e) => handleProbabilityChange(scenario.id, parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Impact & Insights */}
          <div className="lg:col-span-5 space-y-6">
            {/* Portfolio Impact Card */}
            <section className="bg-gradient-to-br from-[#161a1d] to-[#1c2226] border border-primary/20 rounded-xl p-6 shadow-xl">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
                Simulated Portfolio Impact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Delta P&L</p>
                  <p className="text-[#fa5f38] font-display text-2xl font-bold">-$14,205</p>
                  <div className="flex items-center gap-1 text-[10px] text-red-400 mt-1">
                    <span className="material-symbols-outlined text-xs">trending_down</span>
                    -8.2% Total Portfolio
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Vol. Shift</p>
                  <p className="text-amber-400 font-display text-2xl font-bold">+12.4%</p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-1">
                    <span className="material-symbols-outlined text-xs">warning</span>
                    High Sensitivity
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">VaR (95%)</p>
                  <p className="text-white font-display text-2xl font-bold">$22,400</p>
                  <p className="text-[10px] text-slate-500 mt-1">Daily Potential Loss</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <p className="text-slate-500 text-[10px] font-bold uppercase mb-1">Sharpe (Sim)</p>
                  <p className="text-emerald-400 font-display text-2xl font-bold">1.82</p>
                  <p className="text-[10px] text-slate-500 mt-1">Adjusted Efficiency</p>
                </div>
              </div>
            </section>

            {/* AI Strategy Insight */}
            <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                <h3 className="text-white font-bold text-sm uppercase tracking-tight">
                  AI Strategy Insight
                </h3>
              </div>
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  In this scenario, your high exposure to <span className="text-primary font-bold">ETH</span>{' '}
                  creates a correlation bottleneck. The SEC denial risk is currently{' '}
                  <span className="bg-primary/20 px-1 py-0.5 rounded text-white text-xs">Unhedged</span>.
                </p>
                <div className="flex gap-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="material-symbols-outlined text-amber-500 text-lg">lightbulb</span>
                  <p className="text-slate-400 text-xs">
                    Consider buying <span className="text-white font-medium">Out-of-the-money ETH puts</span>{' '}
                    or shortening <span className="text-white font-medium">COIN</span> equity positions to
                    offset 65% of the simulated drawdown.
                  </p>
                </div>
              </div>
            </section>

            {/* Correlation Matrix */}
            <section className="bg-[#161a1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/20">
                <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                  Scenario Correlation
                </h3>
                <span className="material-symbols-outlined text-slate-500 text-sm">unfold_more</span>
              </div>
              <div className="p-4">
                <table className="w-full text-[10px] text-center border-separate border-spacing-1">
                  <thead>
                    <tr className="text-slate-500 font-bold uppercase">
                      <td></td>
                      <td className="pb-2">BTC</td>
                      <td className="pb-2">ETH</td>
                      <td className="pb-2">NVDA</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-left font-bold text-slate-500 pr-2">Fed Cut</td>
                      <td className="p-2 rounded bg-primary text-white font-bold">0.82</td>
                      <td className="p-2 rounded bg-primary/80 text-white font-bold">0.71</td>
                      <td className="p-2 rounded bg-primary/40 text-white font-bold">0.34</td>
                    </tr>
                    <tr>
                      <td className="text-left font-bold text-slate-500 pr-2">Election</td>
                      <td className="p-2 rounded bg-primary/90 text-white font-bold">0.78</td>
                      <td className="p-2 rounded bg-primary/20 text-white font-bold">0.12</td>
                      <td className="p-2 rounded bg-slate-800 text-slate-500">-0.05</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ScenarioBuilder;
