import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { MOCK_CONFIG, isMockEnabled } from './mockConfig'
import { mockStore } from './mockStore'

/**
 * Mock API Interceptor
 * Intercepts axios requests and returns mock data when enabled
 */

interface MockResponse {
  data: {
    success: boolean
    data?: any
    message?: string
  }
  status: number
  statusText: string
  headers: Record<string, string>
  config: InternalAxiosRequestConfig
}

class MockInterceptor {
  /**
   * Initialize mock interceptor for axios instance
   */
  static init(axiosInstance: AxiosInstance) {
    if (!MOCK_CONFIG.ENABLE_MOCK_API) {
      console.log('🔧 Mock API is disabled')
      return
    }

    console.log('🎭 Mock API is enabled')
    
    axiosInstance.interceptors.request.use(
      async (config) => {
        // Check if this request should be mocked
        const mockResponse = await this.handleRequest(config)
        
        if (mockResponse) {
          // Cancel the real request and return mock data
          config.adapter = () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(mockResponse)
              }, MOCK_CONFIG.MOCK_DELAY)
            })
          }
        }
        
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  /**
   * Handle the request and return mock response if applicable
   */
  private static async handleRequest(
    config: InternalAxiosRequestConfig
  ): Promise<MockResponse | null> {
    const url = config.url || ''
    const method = config.method?.toUpperCase()

    console.log(`🔍 Interceptor checking: ${method} ${url}`)

    // Test endpoint for 401 responses
    if (url.includes('/test-401')) {
      console.log(`⚠️ Test endpoint: returning 401 Unauthorized`)
      return this.createResponse({ success: false, message: 'Unauthorized' }, 401, config)
    }

    // Check for /user endpoint BEFORE /users (to avoid matching /user as /users)
    if ((url.includes('/user') && !url.includes('/users')) && isMockEnabled('users')) {
      console.log(`✅ Matched user (singular) endpoint, forwarding to handler`)
      return this.handleUsersEndpoint(url, method, config)
    }

    // Users endpoints (plural)
    if (url.includes('/users') && isMockEnabled('users')) {
      console.log(`✅ Matched users (plural) endpoint, forwarding to handler`)
      return this.handleUsersEndpoint(url, method, config)
    }

    // Branches endpoints
    if (url.includes('/branches') && isMockEnabled('branches')) {
      console.log(`✅ Matched branches endpoint, forwarding to handler`)
      return this.handleBranchesEndpoint(url, method, config)
    }

    console.log(`⚠️ No mock handler found for: ${method} ${url}`)

    return null // Let the real API handle it
  }

  /**
   * Handle users endpoints
   */
  private static handleUsersEndpoint(
    url: string,
    method: string = 'GET',
    config: InternalAxiosRequestConfig
  ): MockResponse {
    console.log(`🎭 Mock ${method} ${url}`)

    // GET /users - Get users with pagination, sorting, and search
    if (method === 'GET' && url.match(/^\/api\/users\/?$/)) {
      console.log(`📋 Returning mock users from store with pagination`)
      
      // Extract query parameters
      const params = config.params || {}
      const page = params.page !== undefined ? Number(params.page) : 0
      const limit = params.limit !== undefined ? Number(params.limit) : 10
      const sortField = params.sortField || 'createdAt'
      const sortOrder = params.sortOrder || 'descend'
      const query = params.query || ''
      
      console.log(`📋 Query params:`, { page, limit, sortField, sortOrder, query })
      
      const paginatedData = mockStore.getUsers({
        page,
        limit,
        sortField,
        sortOrder,
        query
      })
      
      // Transform users to include branch object format
      const transformedUsers = paginatedData.users.map(user => ({
        ...user,
        branch: {
          id: user.branchId,
          name: user.branchName || 'Unknown Branch'
        }
      }))
      
      const responseData = {
        ...paginatedData,
        users: transformedUsers
      }
      
      console.log(`📊 Paginated response:`, responseData)
      
      return this.createResponse({
        success: true,
        data: responseData
      }, 200, config)
    }

    // Try pattern without leading /api
    if (method === 'GET' && url.match(/^\/users\/?$/)) {
      console.log(`📋 Returning mock users from store (alt pattern) with pagination`)
      
      // Extract query parameters
      const params = config.params || {}
      const page = params.page !== undefined ? Number(params.page) : 0
      const limit = params.limit !== undefined ? Number(params.limit) : 10
      const sortField = params.sortField || 'createdAt'
      const sortOrder = params.sortOrder || 'descend'
      const query = params.query || ''
      
      const paginatedData = mockStore.getUsers({
        page,
        limit,
        sortField,
        sortOrder,
        query
      })
      
      // Transform users to include branch object format
      const transformedUsers = paginatedData.users.map(user => ({
        ...user,
        branch: {
          id: user.branchId,
          name: user.branchName || 'Unknown Branch'
        }
      }))
      
      const responseData = {
        ...paginatedData,
        users: transformedUsers
      }
      
      return this.createResponse({
        success: true,
        data: responseData
      }, 200, config)
    }

    // GET /user - Get current user profile
    if (method === 'GET' && (url.match(/^\/api\/user\/?$/) || url.match(/^\/user\/?$/))) {
      console.log('👤 GET /user intercepted, fetching current user profile')
      const currentUser = mockStore.getUserById('5') // Simulate logged-in user as ID '5' (Head Owner)
      
      if (currentUser) {
        // Transform to CurrentUser format with branch object
        const transformedUser = {
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role,
          isActive: currentUser.isActive,
          branch: {
            id: currentUser.branchId,
            name: currentUser.branchName || 'Unknown Branch'
          },
          registeredDate: currentUser.registeredDate
        }
        console.log('✅ Current user profile retrieved:', transformedUser)
        return this.createResponse({
          success: true,
          data: transformedUser
        }, 200, config)
      } else {
        console.log('❌ Current user not found')
        return this.createResponse({
          success: false,
          message: 'User not found'
        }, 404, config)
      }
    }

    // GET /users/{userId} - Get user by ID
    if (method === 'GET' && url.match(/^\/api\/users\/[^\/]+\/?$/)) {
      const id = url.split('/').filter(Boolean).pop() || ''
      const user = mockStore.getUserById(id)
      
      if (user) {
        // Transform to include branch object format
        const transformedUser = {
          ...user,
          branch: {
            id: user.branchId,
            name: user.branchName || 'Unknown Branch'
          }
        }
        
        return this.createResponse({
          success: true,
          data: transformedUser
        }, 200, config)
      } else {
        return this.createResponse({
          success: false,
          message: 'User not found'
        }, 404, config)
      }
    }

    // POST /users - Create user
    if (method === 'POST' && url.match(/^\/api\/users\/?$/)) {
      const userData = config.data
      console.log('🔵 POST /users intercepted, creating user:', userData)
      const newUser = mockStore.createUser(userData)
      console.log('✅ User created successfully:', newUser)
      console.log('📊 Total users in store:', mockStore.getAllUsers().length)
      
      return this.createResponse({
        success: true,
        data: newUser,
        message: 'User created successfully'
      }, 201, config)
    }

    // Alternative POST pattern without /api
    if (method === 'POST' && url.match(/^\/users\/?$/)) {
      const userData = config.data
      console.log('🔵 POST /users intercepted (alt pattern), creating user:', userData)
      const newUser = mockStore.createUser(userData)
      console.log('✅ User created successfully:', newUser)
      console.log('📊 Total users in store:', mockStore.getAllUsers().length)
      
      return this.createResponse({
        success: true,
        data: newUser,
        message: 'User created successfully'
      }, 201, config)
    }

    // PUT /users/{userId} - Update user
    if (method === 'PUT' && url.match(/^\/api\/users\/[^\/]+\/?$/)) {
      const id = url.split('/').filter(Boolean).pop() || ''
      const updateData = config.data
      console.log(`🟡 PUT /users/${id} intercepted, updating user:`, updateData)
      
      const updatedUser = mockStore.updateUser(id, updateData)
      
      if (updatedUser) {
        console.log('✅ User updated successfully:', updatedUser)
        return this.createResponse({
          success: true,
          data: updatedUser,
          message: 'User updated successfully'
        }, 200, config)
      } else {
        console.log('❌ User not found for update:', id)
        return this.createResponse({
          success: false,
          message: 'User not found'
        }, 404, config)
      }
    }

    // Alternative PUT pattern without /api
    if (method === 'PUT' && url.match(/^\/users\/\d+\/?$/)) {
      const id = url.split('/').filter(Boolean).pop() || ''
      const updateData = config.data
      console.log(`🟡 PUT /users/${id} intercepted (alt pattern), updating user:`, updateData)
      
      const updatedUser = mockStore.updateUser(id, updateData)
      
      if (updatedUser) {
        console.log('✅ User updated successfully:', updatedUser)
        return this.createResponse({
          success: true,
          data: updatedUser,
          message: 'User updated successfully'
        }, 200, config)
      } else {
        console.log('❌ User not found for update:', id)
        return this.createResponse({
          success: false,
          message: 'User not found'
        }, 404, config)
      }
    }

    // PATCH /user - Self update (name only)
    if (method === 'PATCH' && (url.match(/^\/api\/user\/?$/) || url.match(/^\/user\/?$/))) {
      const updateData = config.data
      const currentUserId = '5' // Simulate logged-in user as ID '5' (Head Owner)
      console.log('👤 PATCH /user intercepted, updating current user name:', updateData)
      
      const updatedUser = mockStore.updateUser(currentUserId, updateData)
      
      if (updatedUser) {
        console.log('✅ User name updated successfully:', updatedUser)
        return this.createResponse({
          success: true,
          data: {
            message: 'User updated successfully'
          }
        }, 200, config)
      } else {
        console.log('❌ Failed to update user')
        return this.createResponse({
          success: false,
          message: 'Failed to update user'
        }, 500, config)
      }
    }

    // DELETE /users/{userId} - Delete user
    if (method === 'DELETE' && url.match(/^\/api\/users\/[^\/]+\/?$/)) {
      const id = url.split('/').filter(Boolean).pop() || ''
      console.log(`🔴 DELETE /users/${id} intercepted, deleting user`)
      const success = mockStore.deleteUser(id)
      
      if (success) {
        console.log('✅ User deleted successfully, ID:', id)
        console.log('📊 Remaining users in store:', mockStore.getAllUsers().length)
        return this.createResponse({
          success: true,
          data: {
            message: 'User deleted successfully'
          }
        }, 200, config)
      } else {
        console.log('❌ User not found for deletion:', id)
        return this.createResponse({
          success: false,
          message: 'User not found'
        }, 404, config)
      }
    }

    // Alternative DELETE pattern without /api
    if (method === 'DELETE' && url.match(/^\/users\/[^\/]+\/?$/)) {
      const id = url.split('/').filter(Boolean).pop() || ''
      console.log(`🔴 DELETE /users/${id} intercepted (alt pattern), deleting user`)
      const success = mockStore.deleteUser(id)
      
      if (success) {
        console.log('✅ User deleted successfully, ID:', id)
        console.log('📊 Remaining users in store:', mockStore.getAllUsers().length)
        return this.createResponse({
          success: true,
          data: {
            message: 'User deleted successfully'
          }
        }, 200, config)
      } else {
        console.log('❌ User not found for deletion:', id)
        return this.createResponse({
          success: false,
          message: 'User not found'
        }, 404, config)
      }
    }

    // Fallback for unhandled user endpoints
    return this.createResponse({
      success: false,
      message: 'Mock endpoint not implemented'
    }, 501, config)
  }

  /**
   * Handle branches endpoints
   */
  private static handleBranchesEndpoint(
    url: string,
    method: string = 'GET',
    config: InternalAxiosRequestConfig
  ): MockResponse {
    console.log(`🎭 Mock ${method} ${url}`)

    // GET /branches - Get branches with pagination, sorting, and search
    if (method === 'GET' && (url.match(/^\/api\/branches\/?$/) || url.match(/^\/branches\/?$/))) {
      console.log(`📋 Returning mock branches from store with pagination`)
      
      // Extract query parameters
      const params = config.params || {}
      const page = params.page !== undefined ? Number(params.page) : 0
      const limit = params.limit !== undefined ? Number(params.limit) : 10
      const sortField = params.sortField || 'createdAt'
      const sortOrder = params.sortOrder || 'descend'
      const query = params.query || ''
      
      console.log(`📋 Query params:`, { page, limit, sortField, sortOrder, query })
      
      const paginatedData = mockStore.getBranches({
        page,
        limit,
        sortField,
        sortOrder,
        query
      })
      
      console.log(`📊 Paginated response:`, paginatedData)
      
      return this.createResponse({
        success: true,
        data: paginatedData
      }, 200, config)
    }

    // GET /branches/:id - Get branch by ID
    if (method === 'GET' && (url.match(/^\/api\/branches\/[^\/]+\/?$/) || url.match(/^\/branches\/[^\/]+\/?$/))) {
      const id = url.split('/').filter(Boolean).pop() || ''
      console.log(`📋 Getting branch by ID: ${id}`)
      const branch = mockStore.getBranchById(id)
      
      if (branch) {
        return this.createResponse({
          success: true,
          data: branch
        }, 200, config)
      } else {
        return this.createResponse({
          success: false,
          message: 'Branch not found'
        }, 404, config)
      }
    }

    // POST /branches - Create branch
    if (method === 'POST' && (url.match(/^\/api\/branches\/?$/) || url.match(/^\/branches\/?$/))) {
      const branchData = config.data
      console.log('🔵 POST /branches intercepted, creating branch:', branchData)
      
      try {
        const newBranch = mockStore.createBranch(branchData)
        console.log('✅ Branch created successfully:', newBranch)
        console.log('📊 Total branches in store:', mockStore.getBranches({ limit: 1000 }).total)
        
        return this.createResponse({
          success: true,
          data: newBranch,
          message: 'Branch created successfully'
        }, 201, config)
      } catch (error) {
        console.log('❌ Failed to create branch:', error)
        return this.createResponse({
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create branch'
        }, 400, config)
      }
    }

    // PUT /branches/:id - Update branch
    if (method === 'PUT' && (url.match(/^\/api\/branches\/[^\/]+\/?$/) || url.match(/^\/branches\/[^\/]+\/?$/))) {
      const id = url.split('/').filter(Boolean).pop() || ''
      const updateData = config.data
      console.log(`🟡 PUT /branches/${id} intercepted, updating branch:`, updateData)
      
      const updatedBranch = mockStore.updateBranch(id, updateData)
      
      if (updatedBranch) {
        console.log('✅ Branch updated successfully:', updatedBranch)
        return this.createResponse({
          success: true,
          data: updatedBranch,
          message: 'Branch updated successfully'
        }, 200, config)
      } else {
        console.log('❌ Branch not found for update:', id)
        return this.createResponse({
          success: false,
          message: 'Branch not found'
        }, 404, config)
      }
    }

    // DELETE /branches/:id - Delete branch
    if (method === 'DELETE' && (url.match(/^\/api\/branches\/[^\/]+\/?$/) || url.match(/^\/branches\/[^\/]+\/?$/))) {
      const id = url.split('/').filter(Boolean).pop() || ''
      console.log(`🔴 DELETE /branches/${id} intercepted, deleting branch`)
      const success = mockStore.deleteBranch(id)
      
      if (success) {
        console.log('✅ Branch deleted successfully, ID:', id)
        console.log('📊 Remaining branches in store:', mockStore.getBranches({ limit: 1000 }).total)
        return this.createResponse({
          success: true,
          data: {
            message: 'Branch deleted successfully'
          }
        }, 200, config)
      } else {
        console.log('❌ Branch not found for deletion:', id)
        return this.createResponse({
          success: false,
          message: 'Branch not found'
        }, 404, config)
      }
    }

    // Fallback for unhandled branch endpoints
    return this.createResponse({
      success: false,
      message: 'Mock branch endpoint not implemented'
    }, 501, config)
  }

  /**
   * Create a standardized mock response matching ApiResponse<T> format
   */
  private static createResponse(
    data: { success: boolean; data?: any; message?: string },
    status: number,
    config: InternalAxiosRequestConfig
  ): MockResponse {
    // Transform to ApiResponse format: { data: T, requestId: string, error?: string }
    const responseData = {
      data: data.data !== undefined ? data.data : null,
      requestId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error: data.success === false ? (data.message || 'An error occurred') : undefined
    }
    
    return {
      data: responseData,
      status,
      statusText: status === 200 || status === 201 ? 'OK' : 'Error',
      headers: {
        'content-type': 'application/json'
      },
      config
    }
  }
}

export default MockInterceptor

