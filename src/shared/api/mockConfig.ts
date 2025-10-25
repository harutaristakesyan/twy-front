/**
 * Mock API Configuration
 * 
 * Set ENABLE_MOCK_API to true to use mock data instead of real API calls
 * This is useful for development and testing without a backend
 * 
 * Environment Variables (optional):
 * - VITE_ENABLE_MOCKS: Set to 'true' to enable mocks
 * - VITE_MOCK_DELAY: Network delay in milliseconds
 * 
 * Create a .env.development file with:
 * VITE_ENABLE_MOCKS=true
 * VITE_MOCK_DELAY=500
 */

export const MOCK_CONFIG = {
  // Master switch - set to true to enable mock APIs
  // Or use environment variable VITE_ENABLE_MOCKS=true
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCKS === 'true' || false,
  
  // Delay for simulating network latency (in milliseconds)
  // Or use environment variable VITE_MOCK_DELAY
  MOCK_DELAY: Number(import.meta.env.VITE_MOCK_DELAY) || 500,
  
  // Enable/disable specific endpoints (only works if ENABLE_MOCK_API is true)
  endpoints: {
    users: true,
    branches: true,
    loads: true,
  }
}

// Debug log
console.log('🔧 Mock Config:', {
  VITE_ENABLE_MOCKS: import.meta.env.VITE_ENABLE_MOCKS,
  ENABLE_MOCK_API: MOCK_CONFIG.ENABLE_MOCK_API,
  MOCK_DELAY: MOCK_CONFIG.MOCK_DELAY,
  endpoints: MOCK_CONFIG.endpoints
})

/**
 * Helper function to check if mocking is enabled for a specific endpoint
 */
export const isMockEnabled = (endpoint: keyof typeof MOCK_CONFIG.endpoints): boolean => {
  return MOCK_CONFIG.ENABLE_MOCK_API && MOCK_CONFIG.endpoints[endpoint]
}

