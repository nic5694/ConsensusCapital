import React, { useState, useMemo, useEffect } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';

interface ScenarioItem {
  id: string;
  title: string;
  probability: number;
  leftLabel: string;
  rightLabel: string;
}

interface ActionableInsight {
  type: 'OPPORTUNITY' | 'RISK';
  ticker: string;
  polymarket_event: string;
  market_volume_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  correlation_strength: 'LOW' | 'MEDIUM' | 'HIGH';
  transmission_mechanism: string;
  suggested_action: 'IGNORE' | 'MONITOR' | 'ACT';
}

interface PortfolioSummary {
  risk_profile: string;
  primary_sector_exposure: string[];
}

interface RiskAnalysisData {
  portfolio_summary: PortfolioSummary;
  actionable_insights: ActionableInsight[];
}

const RiskAnalysis: React.FC = () => {
  const { assets, getTotalValue } = usePortfolio();
  
  // Scenarios will be dynamically loaded from Polymarket API
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  
  // Risk analysis insights - will be fetched from API
  const [riskAnalysisData, setRiskAnalysisData] = useState<RiskAnalysisData | null>(null);

  const handleScenarioChange = (id: string, value: number) => {
    setScenarios((prev) =>
      prev.map((scenario) =>
        scenario.id === id ? { ...scenario, probability: value } : scenario
      )
    );
  };

  const resetScenarios = () => {
    // Will reset to dynamically loaded scenarios from API
    setScenarios([]);
  };

  // Calculate portfolio metrics
  const totalValue = useMemo(() => getTotalValue(), [assets, getTotalValue]);
  const atRiskValue = useMemo(() => totalValue * 0.95, [totalValue]); // 95% of portfolio at risk
  const hedgeScore = useMemo(() => Math.floor(72 + (Math.random() * 10 - 5)), [assets]); // Simulated hedge score
  const simulatedDrawdown = useMemo(() => totalValue * -0.087, [totalValue]); // -8.7% worst case

  // Filter insights by type
  const riskInsights = useMemo(() => 
    riskAnalysisData?.actionable_insights.filter(i => i.type === 'RISK' && i.suggested_action !== 'IGNORE') || []
  , [riskAnalysisData]);

  const opportunityInsights = useMemo(() => 
    riskAnalysisData?.actionable_insights.filter(i => i.type === 'OPPORTUNITY' && i.suggested_action !== 'IGNORE') || []
  , [riskAnalysisData]);

  const getInsightIcon = (type: string) => {
    return type === 'RISK' ? 'warning' : 'trending_up';
  };

  const getInsightColor = (type: string) => {
    return type === 'RISK' ? 'text-[#fa5f38]' : 'text-[#0bda54]';
  };

  const getActionBadgeColor = (action: string) => {
    switch(action) {
      case 'ACT': return 'bg-[#fa5f38]/20 text-[#fa5f38]';
      case 'MONITOR': return 'bg-[#ffa500]/20 text-[#ffa500]';
      default: return 'bg-slate-700/20 text-slate-400';
    }
  };

  const getVolumeTierColor = (tier: string) => {
    switch(tier) {
      case 'HIGH': return 'bg-[#0bda54]/20 text-[#0bda54]';
      case 'MEDIUM': return 'bg-[#ffa500]/20 text-[#ffa500]';
      case 'LOW': return 'bg-slate-700/20 text-slate-400';
      default: return 'bg-slate-700/20 text-slate-400';
    }
  };

  // Get unique asset symbols from portfolio for correlation matrix
  const portfolioAssets = useMemo(() => {
    const assetSet = new Set(assets.map(a => a.symbol.toUpperCase()));
    // Default assets if portfolio is empty
    return assetSet.size > 0 ? Array.from(assetSet).slice(0, 5) : ['BTC', 'ETH', 'NVDA', 'GOLD', 'USDC'];
  }, [assets]);

  const correlationData = useMemo(() => [
    {
      event: 'US Election',
      correlations: portfolioAssets.reduce((acc, symbol) => {
        acc[symbol] = symbol === 'BTC' ? 0.85 : symbol === 'ETH' ? 0.72 : symbol === 'NVDA' ? 0.45 : symbol === 'GOLD' ? -0.12 : 0.05;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      event: 'Fed Rate',
      correlations: portfolioAssets.reduce((acc, symbol) => {
        acc[symbol] = symbol === 'BTC' ? 0.78 : symbol === 'ETH' ? 0.81 : symbol === 'NVDA' ? 0.64 : symbol === 'GOLD' ? 0.38 : -0.02;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      event: 'AI Bill',
      correlations: portfolioAssets.reduce((acc, symbol) => {
        acc[symbol] = symbol === 'BTC' ? 0.12 : symbol === 'ETH' ? 0.24 : symbol === 'NVDA' ? 0.94 : symbol === 'GOLD' ? 0.08 : 0.01;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      event: 'ETH ETF',
      correlations: portfolioAssets.reduce((acc, symbol) => {
        acc[symbol] = symbol === 'BTC' ? 0.52 : symbol === 'ETH' ? 0.98 : symbol === 'NVDA' ? 0.15 : symbol === 'GOLD' ? 0.04 : -0.05;
        return acc;
      }, {} as Record<string, number>),
    },
  ], [portfolioAssets]);

  let correlationDataArray = correlationData;

  const getCorrelationColor = (value: number) => {
    const absValue = Math.abs(value);
    if (absValue >= 0.8) return 'bg-primary text-white';
    if (absValue >= 0.6) return 'bg-primary/80 text-white';
    if (absValue >= 0.4) return 'bg-primary/60 text-white';
    if (absValue >= 0.2) return 'bg-primary/40 text-white';
    return 'bg-slate-800 text-slate-500';
  };

  return (
    <div className="flex min-h-screen bg-[#121416]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="space-y-1">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
                Analytical Environment
              </p>
              <h1 className="text-white text-4xl font-black font-display tracking-tight leading-none">
                Portfolio Risk Matrix
              </h1>
              <p className="text-slate-400 text-sm max-w-md">
                Real-time impact assessment modeled against Polymarket event probabilities and
                synthetic correlation data.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1a1e22] border border-[#283639] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Total At-Risk Value
                </p>
                <p className="text-white font-display text-3xl font-bold leading-none">
                  ${atRiskValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[#0bda54]">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span className="text-sm font-bold">+2.4% volatility</span>
              </div>
            </div>
            <div className="bg-[#1a1e22] border border-[#283639] rounded-xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                  Simulated Drawdown
                </p>
                <p className="text-white font-display text-3xl font-bold leading-none">
                  ${simulatedDrawdown.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-4 text-slate-500">
                <span className="material-symbols-outlined text-sm">info</span>
                <span className="text-sm font-medium">Worst case scenario (95% CI)</span>
              </div>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scenario Console (Left) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <section className="bg-[#1a1e22] border border-[#283639] rounded-xl flex flex-col h-full min-h-[500px]">
                <div className="p-5 border-b border-[#283639] flex justify-between items-center">
                  <h3 className="text-white font-display font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0fa0bd]">tune</span>
                    What-if Console
                  </h3>
                  <span className="text-[10px] bg-[#0fa0bd]/20 text-[#0fa0bd] px-2 py-0.5 rounded-full font-bold">
                    LIVE SYNC
                  </span>
                </div>
                <div className="p-5 space-y-6 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>
                  {scenarios.map((scenario) => (
                    <div key={scenario.id} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-slate-300 font-medium">{scenario.title}</p>
                        <p className="text-[#0fa0bd] font-display text-lg font-bold">
                          {scenario.probability}% Yes
                        </p>
                      </div>
                      <input
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#0fa0bd]"
                        type="range"
                        min="0"
                        max="100"
                        value={scenario.probability}
                        onChange={(e) => handleScenarioChange(scenario.id, Number(e.target.value))}
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        <span>{scenario.leftLabel}</span>
                        <span>{scenario.rightLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-auto p-4 bg-slate-900/50">
                  <button
                    onClick={resetScenarios}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded transition-colors uppercase tracking-widest"
                  >
                    Reset to Market Odds
                  </button>
                </div>
              </section>
            </div>

            {/* Main Analysis (Center/Right) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Portfolio Summary */}
              {riskAnalysisData && (
                <section className="bg-[#0fa0bd]/5 border border-[#0fa0bd]/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0fa0bd] text-white">
                      <span className="material-symbols-outlined text-lg">account_balance</span>
                    </div>
                    <h3 className="text-[#0fa0bd] font-display font-bold uppercase tracking-tight">
                      Portfolio Profile
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-[#121416]/50 border border-[#283639] rounded-lg px-4 py-2">
                      <p className="text-slate-400 text-xs mb-1">Risk Profile</p>
                      <p className="text-white font-bold">{riskAnalysisData.portfolio_summary.risk_profile}</p>
                    </div>
                    <div className="bg-[#121416]/50 border border-[#283639] rounded-lg px-4 py-2">
                      <p className="text-slate-400 text-xs mb-1">Primary Sectors</p>
                      <div className="flex gap-2">
                        {riskAnalysisData.portfolio_summary.primary_sector_exposure.map((sector) => (
                          <span key={sector} className="bg-[#0fa0bd]/20 px-2 py-0.5 rounded text-[#0fa0bd] text-xs font-bold">
                            {sector}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Risk Insights */}
              {riskInsights.length > 0 && (
                <section className="bg-[#fa5f38]/5 border border-[#fa5f38]/20 rounded-xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#fa5f38] text-white">
                      <span className="material-symbols-outlined text-lg">warning</span>
                    </div>
                    <h3 className="text-[#fa5f38] font-display font-bold uppercase tracking-tight">
                      Risk Alerts
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {riskInsights.map((insight, idx) => (
                      <div key={idx} className="bg-[#121416]/50 border border-[#283639] rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#0fa0bd]/20 px-2 py-0.5 rounded text-[#0fa0bd] text-xs font-bold">
                              {insight.ticker}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getActionBadgeColor(insight.suggested_action)}`}>
                              {insight.suggested_action}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getVolumeTierColor(insight.market_volume_tier)}`}>
                              {insight.market_volume_tier} VOL
                            </span>
                          </div>
                        </div>
                        <p className="text-white text-sm font-medium mb-2">{insight.polymarket_event}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{insight.transmission_mechanism}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Opportunity Insights */}
              {opportunityInsights.length > 0 && (
                <section className="bg-[#0bda54]/5 border border-[#0bda54]/20 rounded-xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-[#0bda54] text-white">
                      <span className="material-symbols-outlined text-lg">trending_up</span>
                    </div>
                    <h3 className="text-[#0bda54] font-display font-bold uppercase tracking-tight">
                      Opportunities
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {opportunityInsights.map((insight, idx) => (
                      <div key={idx} className="bg-[#121416]/50 border border-[#283639] rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="bg-[#0fa0bd]/20 px-2 py-0.5 rounded text-[#0fa0bd] text-xs font-bold">
                              {insight.ticker}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getActionBadgeColor(insight.suggested_action)}`}>
                              {insight.suggested_action}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${getVolumeTierColor(insight.market_volume_tier)}`}>
                              {insight.market_volume_tier} VOL
                            </span>
                          </div>
                        </div>
                        <p className="text-white text-sm font-medium mb-2">{insight.polymarket_event}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{insight.transmission_mechanism}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Correlation Matrix */}
              <section className="bg-[#1a1e22] border border-[#283639] rounded-xl flex flex-col">
                <div className="p-5 border-b border-[#283639] flex justify-between items-center">
                  <h3 className="text-white font-display font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0fa0bd]">grid_view</span>
                    Asset Correlation Matrix
                  </h3>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                      <div className="w-2 h-2 rounded-full bg-[#0fa0bd]"></div> High
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div> Low
                    </div>
                  </div>
                </div>
                <div className="p-6 overflow-x-auto">
                  <table className="w-full border-separate" style={{ borderSpacing: '6px' }}>
                    <thead>
                      <tr>
                        <th className="p-2"></th>
                        {portfolioAssets.map((asset) => (
                          <th key={asset} className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                            {asset}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {correlationDataArray.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                            {row.event}
                          </td>
                          {portfolioAssets.map((asset) => {
                            const value = row.correlations[asset] || 0;
                            return (
                              <td
                                key={asset}
                                className={`p-4 rounded text-xs font-bold text-center transition-all duration-200 hover:shadow-[0_0_15px_rgba(15,160,189,0.4)] hover:z-10 ${getCorrelationColor(
                                  value
                                )}`}
                              >
                                {value.toFixed(2)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskAnalysis;
