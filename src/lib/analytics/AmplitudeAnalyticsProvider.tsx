import * as amplitude from '@amplitude/analytics-browser'
import { type PropsWithChildren, useEffect } from 'react'

import { AnalyticsContext, type AnalyticsContextState } from './AnalyticsContext'

type AmplitudeAnalyticsProviderProps = PropsWithChildren & {
  apiKey: string
}

const amplitudeAnalytics: AnalyticsContextState = {
  setUser: (id) => {
    amplitude.setUserId(id)
  },
  trackEvent: (name, data) => {
    amplitude.track(name, data)
  },
}

export const AmplitudeAnalyticsProvider = ({ apiKey, children }: AmplitudeAnalyticsProviderProps) => {
  useEffect(() => {
    amplitude.init(apiKey, { autocapture: true })
  }, [apiKey])

  return <AnalyticsContext.Provider value={amplitudeAnalytics}>{children}</AnalyticsContext.Provider>
}
