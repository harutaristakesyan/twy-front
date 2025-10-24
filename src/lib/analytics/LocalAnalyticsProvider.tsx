import { AnalyticsContext, type AnalyticsContextState } from './AnalyticsContext'
import type { FC, PropsWithChildren } from 'react'

const localAnalytics: AnalyticsContextState = {
  setUser: (id) => {
    console.log('Set user for analytics: ', id)
  },
  trackEvent: (name, data) => {
    console.log('Track event: ', name, data)
  },
}

export const LocalAnalyticsProvider: FC<PropsWithChildren> = ({ children }) => {
  return <AnalyticsContext.Provider value={localAnalytics}>{children}</AnalyticsContext.Provider>
}
