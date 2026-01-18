import { createContext, useContext, useState } from 'react'
import type { ReactNode } from "react";

export interface ActionableInsight {
  type: 'OPPORTUNITY' | 'RISK';
  ticker: string;
  polymarket_event: string;
  market_volume_tier: 'LOW' | 'MEDIUM' | 'HIGH';
  correlation_strength: 'LOW' | 'MEDIUM' | 'HIGH';
  transmission_mechanism: string;
  suggested_action: 'IGNORE' | 'MONITOR' | 'ACT';
}

export interface Selection {
  outcome: string;
  price: number | null;
}

export interface Market {
  id: string;
  question: string;
  image: string;
  selections: Selection[];
}

export interface InterestingEvent {
  id: string;
  title: string;
  description: string;
  markets: Market[];
}

export interface PortfolioSummary {
  risk_profile: string;
  primary_sector_exposure: string[];
}

export interface RiskAnalysisData {
  portfolio_summary: PortfolioSummary;
  actionable_insights: ActionableInsight[];
}

type AnalysisContextType = {
  analysisData: RiskAnalysisData | null;
  setAnalysisData: (data: RiskAnalysisData | null) => void;
  interestingEvents: InterestingEvent[];
  setInterestingEvents: (events: InterestingEvent[]) => void;
  clearAnalysis: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined,
);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [analysisData, setAnalysisData] = useState<RiskAnalysisData | null>(null);
  const [interestingEvents, setInterestingEvents] = useState<InterestingEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const clearAnalysis = () => {
    setAnalysisData(null);
    setInterestingEvents([]);
  };

  const value: AnalysisContextType = {
    analysisData,
    setAnalysisData,
    interestingEvents,
    setInterestingEvents,
    clearAnalysis,
    isLoading,
    setIsLoading,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
