import { useState } from 'react';
import { usePortfolio } from '../contexts/PortfolioContext';
import { useAnalysis } from '../contexts/AnalysisContext';

interface ImpactPerEvent {
  market_name: string;
  impact_analysis: string;
}

interface AnalysisResult {
  main_impact_summary: string;
  impact_per_event: ImpactPerEvent[];
}

const ScenarioBuilder: React.FC = () => {
  const { assets } = usePortfolio();
  const { interestingEvents } = useAnalysis();
  
  // Track selected outcomes for each market (marketId -> outcome)
  const [selectedOutcomes, setSelectedOutcomes] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleToggleSelection = (eventId: string, marketId: string, outcome: string) => {
    setSelectedOutcomes((prev) => {
      const newSelections = { ...prev };
      
      // If selecting "Yes", clear all other "Yes" selections for this event
      if (outcome === 'Yes') {
        // Find all markets for this event
        const event = interestingEvents.find(e => e.id === eventId);
        if (event) {
          event.markets.forEach(market => {
            // Clear any existing "Yes" selections for other markets in this event
            if (market.id !== marketId && newSelections[market.id] === 'Yes') {
              delete newSelections[market.id];
            }
          });
        }
      }
      
      // Set the new selection
      newSelections[marketId] = outcome;
      
      return newSelections;
    });
  };

  const handleReset = () => {
    setSelectedOutcomes({});
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // Prepare portfolio holdings data
      const portfolioHoldings = assets.map(asset => ({
        ticker: asset.symbol,
        quantity: asset.quantity,
      }));

      // Group selections by event
      const eventSelections: Record<string, any> = {};

      Object.entries(selectedOutcomes).forEach(([marketId, outcome]) => {
        // Find the event and market for this selection
        for (const event of interestingEvents) {
          const market = event.markets.find(m => m.id === marketId);
          if (market) {
            // Initialize event group if it doesn't exist
            if (!eventSelections[event.id]) {
              eventSelections[event.id] = {
                eventTitle: event.title,
                markets: [],
              };
            }

            // Find selection price
            const selection = market.selections.find(s => s.outcome === outcome);
            
            // Add market selection to this event
            eventSelections[event.id].markets.push({
              marketQuestion: market.question,
              selectedOutcome: outcome,
              selectionPrice: selection?.price || null,
              marketId,
            });
            break;
          }
        }
      });

      // Convert to array format
      const selectionData = Object.values(eventSelections);

      console.log('Starting Gumloop scenario analysis...');
      console.log('Portfolio Holdings:', portfolioHoldings);
      console.log('Selection Data:', selectionData);

      // Start the Gumloop pipeline
      const startResponse = await fetch(
        "https://api.gumloop.com/api/v1/start_pipeline?user_id=2lqdNDT48JT5yZA37FqDARCeOnY2&saved_item_id=iEZhBfaFwkfRfpynSJMW44",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_GUMLOOP_BEARER_TOKEN}`
          },
          body: JSON.stringify({
            selection_data: selectionData,
            portfolio_holdings: portfolioHoldings,
          }),
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
          console.log("Gumloop scenario analysis completed");
          const outputData = runData.outputs?.output;
          if (outputData) {
            console.log("Analysis result:", outputData);
            // Parse the JSON from the markdown code block
            const jsonMatch = outputData.match(/```json\n([\s\S]*?)\n```/);
            if (jsonMatch && jsonMatch[1]) {
              const result = JSON.parse(jsonMatch[1]);
              setAnalysisResult(result);
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
      console.error("Error analyzing scenario:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Page Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-white text-5xl font-black font-display tracking-tight leading-none">
              What-If Analysis
            </h1>
            <p className="text-slate-400 text-lg">
              Select outcomes and view the impacts on your portfolio. Give it a try!
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={Object.keys(selectedOutcomes).length === 0 || isAnalyzing}
              className="flex items-center gap-2 rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">analytics</span>
                  <span>Analyze Possibility</span>
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl h-12 px-6 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold transition-colors"
            >
              <span className="material-symbols-outlined">restart_alt</span>
              <span>Reset Odds</span>
            </button>
          </div>
        </div>

        {/* Main Impact Summary - Below buttons */}
        {analysisResult && (
          <section className="bg-primary/5 border border-primary/20 rounded-xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <h3 className="text-white font-bold text-sm uppercase tracking-tight">
                Portfolio Impact Summary
              </h3>
            </div>
            <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <p className="text-slate-300 text-sm leading-relaxed">
                {analysisResult.main_impact_summary}
              </p>
            </div>
          </section>
        )}

        {/* Events with inline analysis results - each in separate card */}
        <div className="space-y-6">
          {interestingEvents.map((event) => {
            // Find the corresponding analysis for this event
            const eventAnalysis = analysisResult?.impact_per_event.find(
              impact => impact.market_name === event.title
            );

            return (
              <section key={event.id} className="bg-[#161a1d] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-6">
                  {/* Event Title */}
                  <div className="mb-4">
                    <h4 className="text-white font-bold text-lg mb-2">{event.title}</h4>
                  </div>

                  {/* Markets */}
                  <div className="space-y-3 mt-4 pt-4 border-t border-slate-700">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-3">Possible Outcomes</p>
                    {event.markets.filter(market => market.selections.some(sel => sel.price !== null)).map((market) => (
                      <div key={market.id} className="bg-slate-800/50 rounded p-3 space-y-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={market.image} 
                            alt={market.question}
                            className="w-8 h-8 rounded object-cover flex-shrink-0"
                          />
                          <p className="text-white text-xs font-medium leading-snug flex-1">{market.question}</p>
                        </div>
                        {market.selections && market.selections.length > 0 && (
                          <div className="flex gap-2">
                            {market.selections.map((selection, idx) => {
                              const isSelected = selectedOutcomes[market.id] === selection.outcome;
                              return (
                                <button
                                  key={idx}
                                  onClick={() => handleToggleSelection(event.id, market.id, selection.outcome)}
                                  className={`flex-1 rounded px-3 py-2 transition-all ${
                                    isSelected
                                      ? 'bg-primary text-white border-2 border-primary'
                                      : 'bg-slate-900 hover:bg-slate-800 border-2 border-transparent'
                                  }`}
                                >
                                  <p className={`text-[10px] uppercase font-bold mb-1 ${
                                    isSelected ? 'text-white' : 'text-slate-400'
                                  }`}>
                                    {selection.outcome}
                                  </p>
                                  <p className={`text-sm font-bold ${
                                    isSelected ? 'text-white' : 'text-primary'
                                  }`}>
                                    {selection.price !== null ? `${(selection.price * 100).toFixed(1)}%` : 'N/A'}
                                  </p>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Event-specific analysis result - appears below markets */}
                  {eventAnalysis && (
                    <div className="mt-6 pt-6 border-t border-slate-700">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-amber-500 text-lg">insights</span>
                        <h5 className="text-amber-500 font-bold text-xs uppercase tracking-wider">
                          Portfolio Impact for This Event
                        </h5>
                      </div>
                      <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {eventAnalysis.impact_analysis}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ScenarioBuilder;
