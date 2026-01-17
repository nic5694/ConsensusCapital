import { createContext, useContext, useState, ReactNode } from 'react'

export type Asset = {
  symbol: string
  name: string
  quantity: number
  value?: number
  keywords?: string[]
  description?: string
}

type PortfolioContextType = {
  assets: Asset[]
  addAsset: (asset: Asset) => void
  removeAsset: (symbol: string) => void
  updateAsset: (symbol: string, updates: Partial<Asset>) => void
  clearAssets: () => void
  getAsset: (symbol: string) => Asset | undefined
  getTotalValue: () => number
  getAssetCount: () => number
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([])

  const addAsset = (asset: Asset) => {
    setAssets((prev) => {
      // Check if asset already exists
      const existingIndex = prev.findIndex((a) => a.symbol === asset.symbol)
      if (existingIndex !== -1) {
        // Update existing asset by adding quantities
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + asset.quantity,
        }
        return updated
      }
      // Add new asset
      return [...prev, asset]
    })
  }

  const removeAsset = (symbol: string) => {
    setAssets((prev) => prev.filter((asset) => asset.symbol !== symbol))
  }

  const updateAsset = (symbol: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((asset) =>
        asset.symbol === symbol ? { ...asset, ...updates } : asset
      )
    )
  }

  const clearAssets = () => {
    setAssets([])
  }

  const getAsset = (symbol: string): Asset | undefined => {
    return assets.find((asset) => asset.symbol === symbol)
  }

  const getTotalValue = (): number => {
    return assets.reduce((total, asset) => {
      const assetValue = asset.value && asset.quantity ? asset.value * asset.quantity : 0
      return total + assetValue
    }, 0)
  }

  const getAssetCount = (): number => {
    return assets.length
  }

  const value: PortfolioContextType = {
    assets,
    addAsset,
    removeAsset,
    updateAsset,
    clearAssets,
    getAsset,
    getTotalValue,
    getAssetCount,
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolio() {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider')
  }
  return context
}
