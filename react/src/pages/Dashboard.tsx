
import { usePortfolio } from '../contexts/PortfolioContext'
import { useAuth } from 'react-oidc-context'
import { useNavigate } from 'react-router-dom'
import * as portfolioService from '../services/portfolioService'

function Dashboard() {
  const { assets, getTotalValue, getAssetCount, removeAsset } = usePortfolio()
  const { user, signoutRedirect } = useAuth()
  const navigate = useNavigate()

  const totalValue = getTotalValue()

  const handleRemoveAsset = async (symbol: string) => {
    const token = user?.access_token || ''
    
    try {
      await portfolioService.removeAsset(token, symbol)
      removeAsset(symbol)
    } catch (error) {
      console.error(`Error removing asset from database:`, error)
    }
  }

  // Calculate portfolio distribution percentages
  const assetDistribution = assets.map(asset => {
    const assetValue = (asset.value || 0) * asset.quantity
    const percentage = totalValue > 0 ? (assetValue / totalValue) * 100 : 0
    return {
      ...asset,
      assetValue,
      percentage
    }
  }).sort((a, b) => b.percentage - a.percentage)

  // Group into top 5 and "Other"
  const TOP_ASSETS_COUNT = 5
  const topAssets = assetDistribution.slice(0, TOP_ASSETS_COUNT)
  const otherAssets = assetDistribution.slice(TOP_ASSETS_COUNT)
  
  const chartData = [...topAssets]
  
  if (otherAssets.length > 0) {
    const otherTotal = otherAssets.reduce((sum, asset) => sum + asset.assetValue, 0)
    const otherPercentage = otherAssets.reduce((sum, asset) => sum + asset.percentage, 0)
    chartData.push({
      symbol: 'OTHER',
      name: 'Other',
      quantity: 0,
      assetValue: otherTotal,
      percentage: otherPercentage
    })
  }

  // Calculate category colors (you can customize this logic)
  const getAssetColor = (index: number) => {
    const colors = ['#0fa0bd', '#f7931a', '#10b981', '#64748b', '#8b5cf6', '#ef4444']
    return colors[index % colors.length]
  }

  // Calculate donut chart segments
  let cumulativePercent = 0
  const donutSegments = chartData.map((asset, index) => {
    const startPercent = cumulativePercent
    cumulativePercent += asset.percentage
    return {
      ...asset,
      startPercent,
      color: getAssetColor(index)
    }
  })

  return (
    <div className="min-h-screen font-display bg-slate-950 text-slate-100">
      {/* Main Content */}
      <main className="flex flex-col">
        {/* Content */}
        <div className="p-8 max-w-[1400px]">
          {/* Total Value */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Total Portfolio Value</p>
              <button 
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                onClick={() => navigate('/portfolio')}
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
                Edit Portfolio
              </button>
            </div>
            <div className="flex items-baseline gap-4">
              <h3 className="text-5xl font-bold tracking-tighter text-white">
                ${totalValue.toFixed(2)}
              </h3>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Asset Breakdown Table */}
            <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Asset Breakdown</h4>
                <div className="text-xs text-slate-500">
                  {getAssetCount()} {getAssetCount() === 1 ? 'Asset' : 'Assets'}
                </div>
              </div>
              <div className="overflow-x-auto">
                {assets.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <span className="material-symbols-outlined text-5xl mb-4 opacity-20">inbox</span>
                    <p className="text-sm">No assets in portfolio</p>
                    <button 
                      className="mt-4 px-4 py-2 rounded bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all"
                      onClick={() => navigate('/portfolio')}
                    >
                      Add Assets
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-800">
                        <th className="px-6 py-4">Symbol</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Weight (%)</th>
                        <th className="px-6 py-4 text-right">Current Value</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {assetDistribution.map((asset, index) => (
                        <tr key={asset.symbol} className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="size-8 rounded flex items-center justify-center font-bold text-xs"
                                style={{ 
                                  backgroundColor: `${getAssetColor(index)}20`,
                                  color: getAssetColor(index)
                                }}
                              >
                                {asset.symbol.slice(0, 4)}
                              </div>
                              <span className="font-medium">{asset.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400">
                            {asset.quantity}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full"
                                style={{ 
                                  width: `${asset.percentage}%`,
                                  backgroundColor: getAssetColor(index)
                                }}
                              ></div>
                            </div>
                            <span className="text-[10px] mt-1 block">{asset.percentage.toFixed(1)}%</span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold">
                            ${asset.assetValue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              className="text-red-500 hover:text-red-400 transition-colors"
                              onClick={() => handleRemoveAsset(asset.symbol)}
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden h-full">
              <div className="p-6 border-b border-slate-800">
                <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Distribution</h4>
              </div>
              <div className="p-8 flex items-center justify-center h-full min-h-[400px]">
                {assets.length === 0 ? (
                  <div className="text-center text-slate-500">
                    <span className="material-symbols-outlined text-5xl mb-4 opacity-20">pie_chart</span>
                    <p className="text-sm">Add assets to see distribution</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-16 w-full justify-center">
                    <div className="relative size-48">
                      <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">

                        {donutSegments.map((segment, _) => (
                          <circle
                            key={segment.symbol}
                            cx="18"
                            cy="18"
                            fill="none"
                            r="15.915"
                            stroke={segment.color}
                            strokeDasharray={`${segment.percentage} 100`}
                            strokeDashoffset={-segment.startPercent}
                            strokeWidth="3"
                            className="donut-segment"
                          />
                        ))}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{getAssetCount()}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">Assets</span>
                      </div>
                    </div>
                    <div className="space-y-4 flex-1 max-w-xs">
                      {chartData.map((asset, index) => (
                        <div key={asset.symbol} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="size-2 rounded-full"
                              style={{ backgroundColor: getAssetColor(index) }}
                            ></div>
                            <span className="text-slate-400">{asset.symbol}</span>
                          </div>
                          <span className="font-bold">{asset.percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-800 px-8 py-4 bg-slate-950 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">account_circle</span>
              <span>{user?.profile?.name || 'User'}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <span className="text-primary">ConsensusCapital v1.0</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default Dashboard
