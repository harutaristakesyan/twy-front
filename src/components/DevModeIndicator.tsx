import React from 'react'
import { Tag } from 'antd'
import { MOCK_CONFIG } from '@/shared/api/mockConfig'

/**
 * Development Mode Indicator
 * Shows a badge when mock APIs are enabled
 * Only visible in development mode
 */
const DevModeIndicator: React.FC = () => {
  // Don't show anything if mocks are disabled
  if (!MOCK_CONFIG.ENABLE_MOCK_API) {
    return null
  }

  return (
    <Tag
      color="orange"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        fontSize: '12px',
        padding: '4px 12px',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        userSelect: 'none'
      }}
      onClick={() => {
        console.log('🎭 Mock API Status:', {
          enabled: MOCK_CONFIG.ENABLE_MOCK_API,
          delay: MOCK_CONFIG.MOCK_DELAY + 'ms',
          endpoints: MOCK_CONFIG.endpoints
        })
      }}
      title="Click to see mock configuration in console"
    >
      🎭 MOCK MODE
    </Tag>
  )
}

export default DevModeIndicator

