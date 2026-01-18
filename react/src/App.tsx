import { Routes, Route } from 'react-router-dom'
import { PortfolioProvider } from './contexts/PortfolioContext'
import { AnalysisProvider } from './contexts/AnalysisContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Portfolio from './pages/Portfolio'
import Dashboard from './pages/Dashboard'
import RiskAnalysis from './pages/RiskAnalysis'
import ScenarioBuilder from './pages/ScenarioBuilder'
import NotFound from './pages/NotFound'
import './App.css'
import { CallbackPage } from "./pages/Callback.tsx";
import { AuthenticationGuard } from "./guards/authentication-guard.tsx";

function App() {
  return (
    <PortfolioProvider>
      <AnalysisProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="portfolio" element={<AuthenticationGuard component={Portfolio} />} />
            <Route path="dashboard" element={<AuthenticationGuard component={Dashboard} />} />
            <Route path="risk-analysis" element={<AuthenticationGuard component={RiskAnalysis} />} />
            <Route path="scenario-builder" element={<AuthenticationGuard component={ScenarioBuilder} />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AnalysisProvider>
    </PortfolioProvider>
  )
}

export default App
