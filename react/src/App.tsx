import { Routes, Route } from 'react-router-dom'
import { PortfolioProvider } from './contexts/PortfolioContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Portfolio from './pages/Portfolio'
import NotFound from './pages/NotFound'
import './App.css'

function App() {
  return (
    <PortfolioProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </PortfolioProvider>
  )
}

export default App
