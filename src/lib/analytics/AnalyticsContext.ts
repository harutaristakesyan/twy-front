import { createContext, useContext } from 'react'

export type AnalyticsContextState = {
  setUser: (id: string) => void
  trackEvent: (name: string, data?: Record<string, any>) => void
}

export const AnalyticsContext = createContext<AnalyticsContextState | undefined>(undefined)

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
