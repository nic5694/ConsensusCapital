import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useAnalysis } from '../contexts/AnalysisContext';
import { useAuth } from 'react-oidc-context';
import type { RiskAnalysisData, InterestingEvent } from '../contexts/AnalysisContext';

interface NotableEvent {
  id: string;
  title: string;
  probability: number;
  volume_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
}

const RiskAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const { assets, getTotalValue } = usePortfolio();
  const { analysisData, setAnalysisData, interestingEvents, setInterestingEvents, isLoading, setIsLoading } = useAnalysis();
  const { user } = useAuth();
  
  // Notable events will be dynamically loaded from Polymarket API
  const [notableEvents, setNotableEvents] = useState<NotableEvent[]>([]);

  // Calculate portfolio metrics
  const totalValue = useMemo(() => getTotalValue(), [assets, getTotalValue]);
  const atRiskValue = useMemo(() => totalValue * 0.95, [totalValue]); // 95% of portfolio at risk
  const hedgeScore = useMemo(() => Math.floor(72 + (Math.random() * 10 - 5)), [assets]); // Simulated hedge score
  const simulatedDrawdown = useMemo(() => totalValue * -0.087, [totalValue]); // -8.7% worst case

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    try {
      // Construct portfolio payload
      const portfolioPayload = {
        portfolioId: "PF-" + Math.random().toString(36).substring(2, 9).toUpperCase(),
        userId: "user_" + Math.random().toString(36).substring(2, 9),
        totalValue: totalValue,
        assets: assets.map(asset => ({
          symbol: asset.symbol,
          name: asset.name,
          quantity: asset.quantity,
          value: asset.value || 0,
          keywords: asset.keywords || [],
          description: asset.description || ""
        }))
      };

      console.log("Starting analysis generation...");

      // Start both analyses in parallel with independent error handling
      const results = await Promise.allSettled([
        // Gumloop risk analysis
        (async () => {
          try {
            console.log("Starting Gumloop pipeline...");
            const startResponse = await fetch(
              "https://api.gumloop.com/api/v1/start_pipeline?api_key=3e95818c061a45f7ab312cb2ddee32f9&user_id=2lqdNDT48JT5yZA37FqDARCeOnY2&saved_item_id=tz7L5vc6mheecf3JtmXhsT",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(portfolioPayload),
              }
            );

            if (!startResponse.ok) {
              throw new Error(`HTTP error! status: ${startResponse.status}`);
            }

            const startData = await startResponse.json();
            const { run_id } = startData;
            console.log("Pipeline started with run_id:", run_id);

            // Poll for the run status
            const pollInterval = 2000;
            const maxAttempts = 60;
            let attempts = 0;

            while (attempts < maxAttempts) {
              attempts++;
              
              const pollResponse = await fetch(
                `https://api.gumloop.com/api/v1/get_pl_run?user_id=2lqdNDT48JT5yZA37FqDARCeOnY2&run_id=${run_id}`,
                {
                  headers: {
                    "Authorization": `Bearer ${import.meta.env.VITE_GUMLOOP_BEARER_TOKEN}`,
                  },
                }
              );

              if (!pollResponse.ok) {
                throw new Error(`Polling error! status: ${pollResponse.status}`);
              }

              const runData = await pollResponse.json();
              
              if (runData.state === "DONE") {
                console.log("Gumloop pipeline completed");
                const outputData = runData.outputs?.output;
                if (outputData) {
                  const jsonMatch = outputData.match(/```json\n([\s\S]*?)\n```/);
                  if (jsonMatch && jsonMatch[1]) {
                    return JSON.parse(jsonMatch[1]);
                  }
                }
                return runData.outputs || runData;
              }
              
              if (runData.state === "FAILED") {
                throw new Error("Pipeline run failed");
              }

              await new Promise(resolve => setTimeout(resolve, pollInterval));
            }
            
            throw new Error("Polling timeout - analysis is taking longer than expected");
          } catch (error) {
            console.error("Gumloop analysis error:", error);
            throw error;
          }
        })(),
        
        // Fetch interesting events
        (async () => {
          try {
            const url = `${import.meta.env.VITE_REACT_APP_API_SERVER_URL}/api/v1/analysis/summary`;
            console.log("Fetching events from:", url);
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${user?.access_token}`,
                'Content-Type': 'application/json',
              },
            });
            
            console.log("Events API response status:", response.status);
            
            if (!response.ok) {
              throw new Error(`Events API error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Events API data received:", data);
            return data;
          } catch (error) {
            console.error("Events API error:", error);
            throw error;
          }
        })()
      ]);
      
      // Handle results from Promise.allSettled
      const [analysisResult, eventsResult] = results;
      
      if (analysisResult.status === 'fulfilled') {
        console.log("Setting analysis data:", analysisResult.value);
        setAnalysisData(analysisResult.value as RiskAnalysisData);
      } else {
        console.error("Analysis failed:", analysisResult.reason);
      }
      
      if (eventsResult.status === 'fulfilled') {
        console.log("Setting interesting events:", eventsResult.value);
        setInterestingEvents(eventsResult.value as InterestingEvent[]);
      } else {
        console.error("Events fetch failed:", eventsResult.reason);
      }
    } catch (error) {
      console.error("Error generating analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter insights by type
  const riskInsights = useMemo(() => 
    analysisData?.actionable_insights.filter(i => i.type === 'RISK' && i.suggested_action !== 'IGNORE') || []
  , [analysisData]);

  const opportunityInsights = useMemo(() => 
    analysisData?.actionable_insights.filter(i => i.type === 'OPPORTUNITY' && i.suggested_action !== 'IGNORE') || []
  , [analysisData]);

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

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'HIGH': return 'text-[#fa5f38]';
      case 'MEDIUM': return 'text-[#ffa500]';
      case 'LOW': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  // All insights combined for table display
  const allInsights = useMemo(() => 
    analysisData?.actionable_insights.filter(i => i.suggested_action !== 'IGNORE') || []
  , [analysisData]);

  return (
    <div className="flex min-h-screen bg-[#121416]">
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="space-y-1">
              <h1 className="text-white text-4xl font-black font-display tracking-tight leading-none">
                Portfolio Risk Analyzer
              </h1>
            </div>
            <button
              onClick={handleGenerateAnalysis}
              disabled={isLoading || assets.length === 0}
              className="bg-[#0fa0bd] hover:bg-[#0fa0bd]/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Generating...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">auto_awesome</span>
                  Generate Analysis
                </>
              )}
            </button>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Loading State */}
            {isLoading && (
              <div className="lg:col-span-12">
                <div className="bg-[#1a1e22] border border-[#283639] rounded-xl p-12 flex flex-col items-center justify-center gap-4">
                  <span className="material-symbols-outlined animate-spin text-[#0fa0bd] text-6xl">autorenew</span>
                  <div className="text-center">
                    <p className="text-white font-display text-xl font-bold mb-2">Generating Risk Analysis</p>
                    <p className="text-slate-400 text-sm">Analyzing portfolio against prediction markets...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content - Only show when not loading */}
            {!isLoading && (
              <>
                {/* Notable Events (Left) */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  <section className="bg-[#1a1e22] border border-[#283639] rounded-xl flex flex-col">
                    <div className="p-5 border-b border-[#283639] flex justify-between items-center">
                      <h3 className="text-white font-display font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#0fa0bd]">event</span>
                        Notable Events
                      </h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate('/scenario-builder')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-lg transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">analytics</span>
                          What-If
                        </button>
                        <span className="text-[10px] bg-[#0fa0bd]/20 text-[#0fa0bd] px-2 py-0.5 rounded-full font-bold">
                          LIVE
                        </span>
                      </div>
                    </div>
                    <div className="p-5 space-y-3 overflow-y-auto max-h-[600px]" style={{ scrollbarWidth: 'thin' }}>
                      {interestingEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block">event_busy</span>
                          <p className="text-slate-500 text-sm">No notable events at this time</p>
                        </div>
                      ) : (
                        interestingEvents.map((event) => (
                          <div key={event.id} className="bg-slate-900/50 border border-[#283639] rounded-lg p-4 hover:border-[#0fa0bd]/30 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-white text-sm font-medium flex-1">{event.title}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>

                {/* Insights Table (Right) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Portfolio Summary - Only show if analysis data exists */}
                  {analysisData && (
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
                          <p className="text-white font-bold">{analysisData.portfolio_summary.risk_profile}</p>
                        </div>
                        <div className="bg-[#121416]/50 border border-[#283639] rounded-lg px-4 py-2">
                          <p className="text-slate-400 text-xs mb-1">Primary Sectors</p>
                          <div className="flex gap-2">
                            {analysisData.portfolio_summary.primary_sector_exposure.map((sector) => (
                              <span key={sector} className="bg-[#0fa0bd]/20 px-2 py-0.5 rounded text-[#0fa0bd] text-xs font-bold">
                                {sector}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Insights Table - Only show if analysis data exists */}
                  {analysisData && (
                    <section className="bg-[#1a1e22] border border-[#283639] rounded-xl flex flex-col">
                      <div className="p-5 border-b border-[#283639]">
                        <h3 className="text-white font-display font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#0fa0bd]">insights</span>
                          AI Insights
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-900/50">
                            <tr>
                              <th className="p-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                              <th className="p-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ticker</th>
                              <th className="p-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Event</th>
                              <th className="p-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mechanism</th>
                              <th className="p-3 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {allInsights.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-8 text-center">
                                  <span className="material-symbols-outlined text-slate-600 text-5xl mb-3 block">psychology</span>
                                  <p className="text-slate-500 text-sm mb-1">No actionable insights generated</p>
                                  <p className="text-slate-600 text-xs">The analysis completed but found no insights requiring action at this time.</p>
                                </td>
                              </tr>
                            ) : (
                              allInsights.map((insight, idx) => (
                                <tr key={idx} className="border-t border-[#283639] hover:bg-slate-900/30 transition-colors">
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <span className={`material-symbols-outlined text-lg ${getInsightColor(insight.type)}`}>
                                        {getInsightIcon(insight.type)}
                                      </span>
                                      <span className="text-white text-xs font-medium">{insight.type}</span>
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className="bg-[#0fa0bd]/20 px-2 py-1 rounded text-[#0fa0bd] text-xs font-bold">
                                      {insight.ticker}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <p className="text-white text-xs font-medium max-w-xs">{insight.polymarket_event}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${getVolumeTierColor(insight.market_volume_tier)}`}>
                                      {insight.market_volume_tier}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <p className="text-slate-400 text-xs leading-relaxed max-w-md">{insight.transmission_mechanism}</p>
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-3 py-1 rounded text-xs font-bold ${getActionBadgeColor(insight.suggested_action)}`}>
                                      {insight.suggested_action}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  )}

                  {/* Empty State - Show when no analysis has been run yet */}
                  {!analysisData && (
                    <div className="bg-[#1a1e22] border border-[#283639] rounded-xl p-12 flex flex-col items-center justify-center gap-4">
                      <span className="material-symbols-outlined text-slate-600 text-6xl">bar_chart</span>
                      <div className="text-center">
                        <p className="text-white font-display text-lg font-bold mb-2">No Analysis Generated</p>
                        <p className="text-slate-400 text-sm">Click "Generate Analysis" to analyze your portfolio</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskAnalysis;
