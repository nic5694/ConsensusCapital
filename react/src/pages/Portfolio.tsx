import { useState } from 'react'
import Header from '../components/Header'
import { usePortfolio } from '../contexts/PortfolioContext'
import { useAuth } from 'react-oidc-context'
import * as portfolioService from '../services/portfolioService'

type TickerResult = {
  symbol: string;
  name: string;
  exchange: string;
}

type YahooQuote = {
  symbol: string;
  quoteType: string;
  shortname?: string;
  longname?: string;
  exchange: string;
}

type YahooSearchResponse = {
  quotes?: YahooQuote[];
}

function Portfolio() {
  const { assets, removeAsset, clearAssets, getAssetCount, setAssets } = usePortfolio()
  const { user } = useAuth()
  const [query, setQuery] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [searchResults, setSearchResults] = useState<TickerResult[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [showDropdown, setShowDropdown] = useState<boolean>(false)

  async function searchTicker(query: string): Promise<TickerResult[]> {
    // Using allorigins CORS proxy
    const yahooUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`

    try {
      const response = await fetch(proxyUrl)

      const data: YahooSearchResponse = await response.json()

      if (!data.quotes) return []
      console.log("quotes: " + data.quotes)
      const results = data.quotes
        .filter(item => item.quoteType === 'EQUITY' || item.quoteType === 'ETF' || item.quoteType === 'CRYPTOCURRENCY')
        .map(item => ({
          symbol: item.symbol,
          name: item.shortname ?? item.longname ?? item.symbol,
          exchange: item.exchange
        }))

      // Remove duplicates by symbol
      const uniqueResults = results.filter((result, index, self) =>
        index === self.findIndex((r) => r.symbol === result.symbol)
      )

      return uniqueResults
    } catch (error) {
      console.error('Error searching ticker:', error)
      return []
    }
  }

  const handleSearchChange = async (value: string) => {
    setQuery(value)
    
    if (value.length < 1) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    try {
      const matches = await searchTicker(value)
      setSearchResults(matches)
      setShowDropdown(matches.length > 0)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectTicker = (result: TickerResult) => {
    setQuery(result.symbol)
    setSearchResults([])
    setShowDropdown(false)
  }

  const handleAddAsset = async () => {
    if (!query || !quantity) return

    const symbol = query.toUpperCase()
    const token = user?.access_token || ''

    // Add asset to database
    try {
      await portfolioService.addAsset(token, symbol, parseFloat(quantity))
      
      // Clear form immediately for better UX
      setQuery('')
      setQuantity('')
      setSearchResults([])

      // Refetch portfolio to get updated data with prices from backend
      const portfolioResponse = await portfolioService.getPortfolio(token)
      
      if (portfolioResponse.data && portfolioResponse.data.assets) {
        setAssets(portfolioResponse.data.assets)
      }
    } catch (error) {
      console.error(`Error adding asset to database:`, error)
    }
  }

  const handleRemoveAsset = async (symbol: string) => {
    const token = user?.access_token || ''
    
    try {
      // Remove from database first
      await portfolioService.removeAsset(token, symbol)
      
      // Remove from context after successful DB operation
      removeAsset(symbol)
    } catch (error) {
      console.error(`Error removing asset from database:`, error)
    }
  }

  const handleClearAll = async () => {
    const token = user?.access_token || ''
    
    try {
      // Delete each asset individually from database
      for (const asset of assets) {
        await portfolioService.removeAsset(token, asset.symbol)
      }
      
      // Clear from context after all DB operations succeed
      clearAssets()
    } catch (error) {
      console.error(`Error clearing assets from database:`, error)
    }
  }

  const handleContinue = () => {
    // TODO: Navigate to analysis page
    console.log('Continue with assets:', assets)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950">
      <Header />
      
      <main className="relative min-h-screen technical-grid">
        <div className="mx-auto w-full px-6 py-8">
          <header className="mb-12 text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Asset Inventory Input</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">
              Manual <span className="text-primary">Portfolio Entry</span>
            </h1>
            <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
              Input your current holdings to analyze exposure against Polymarket prediction data.
            </p>
          </header>

          <div className="space-y-8">
            <div className="glass-panel rounded-2xl shadow-xl p-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-6 relative z-[60]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Asset Ticker</label>
                <input
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm py-3 px-4 transition-all text-white placeholder-slate-500"
                  placeholder="e.g. BTC, ETH, AAPL"
                  type="text"
                  value={query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
                
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-[100] w-full mt-2 rounded-xl shadow-2xl max-h-64 overflow-y-auto border border-slate-700" style={{ backgroundColor: '#1e293b' }}>
                    {searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        className="w-full px-4 py-3 text-left bg-slate-800 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-b-0"
                        onClick={() => handleSelectTicker(result)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-white">{result.symbol}</div>
                            <div className="text-xs text-slate-400">{result.name}</div>
                          </div>
                          <div className="text-xs text-slate-500">{result.exchange}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {loading && (
                  <div className="absolute right-4 top-[42px] text-primary">
                    <span className="material-icons-round animate-spin text-sm">refresh</span>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-4">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Quantity / Amount</label>
                <input
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm py-3 px-4 transition-all text-white placeholder-slate-500"
                  placeholder="0.00"
                  type="number"
                  step="0.0001"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              
              <div className="md:col-span-2">
                <button
                  className="w-full h-[46px] bg-primary text-white rounded-xl font-bold flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glow-cyan"
                  onClick={handleAddAsset}
                  disabled={!query || !quantity}
                >
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl shadow-xl overflow-hidden relative z-0">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.2em] text-slate-400 border-b border-slate-700">
                  <th className="px-8 py-5 font-bold">Ticker</th>
                  <th className="px-8 py-5 font-bold text-center">Holdings</th>
                  <th className="px-8 py-5 font-bold text-right">Price</th>
                  <th className="px-8 py-5 font-bold text-right">Value</th>
                  <th className="px-8 py-5 font-bold text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                      No assets added yet. Start by searching for a ticker above.
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => (
                    <tr key={asset.symbol} className="hover:bg-primary/5 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center">

                          <div>
                            <div className="font-bold text-white">{asset.symbol}</div>
                            <div className="text-xs text-slate-400">{asset.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className="font-mono font-medium text-slate-300">
                          {asset.quantity.toFixed(4)}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-mono font-medium text-slate-300">
                          {asset.value !== undefined ? `$${asset.value.toFixed(2)}` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-mono font-medium text-primary">
                          {asset.value !== undefined ? `$${(asset.value * asset.quantity).toFixed(2)}` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
                          onClick={() => handleRemoveAsset(asset.symbol)}
                        >
                          <span className="material-icons-round text-lg">Remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            <div className="px-8 py-4 bg-slate-900/30 border-t border-slate-700">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <div className="flex space-x-8">
                  <span>Active Assets: <span className="text-white ml-2">{getAssetCount()}</span></span>
                </div>
                <button
                  className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-[11px] font-bold uppercase tracking-widest"
                  onClick={handleClearAll}
                  disabled={getAssetCount() === 0}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center pt-8">
            <button
              className="w-full max-w-md bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-1 transition-all active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 glow-cyan"
              onClick={handleContinue}
              disabled={getAssetCount() === 0}
            >
              <span className="text-lg">Continue to Analysis</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
            <p className="mt-6 text-[10px] text-slate-500 uppercase tracking-widest text-center max-w-xs leading-relaxed">
              Aggregating portfolio risk metrics using real-time market signals
            </p>
          </div>
        </div>

        <footer className="mt-20 flex items-center justify-center border-t border-slate-800/50 pt-8">
            <button
              className="flex items-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                setQuery('')
                setQuantity('')
                setSearchResults([])
              }}
            >
              <span className="material-icons-round text-sm mr-2">refresh</span>
              Reset All Fields
            </button>
          </footer>
        </div>
      </main>

      {/* Background Decoration */}
      <div className="fixed bottom-0 left-0 w-full h-1/2 pointer-events-none -z-10 opacity-10">
        <div className="w-full h-full bg-gradient-to-t from-primary/20 to-transparent"></div>
      </div>

      <style>{`
        .glass-panel {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(51, 65, 85, 0.5);
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

export default Portfolio
