import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosRequestHeaders, type AxiosResponse } from 'axios'
import { getAccessToken, getRefreshToken, isTokenExpired, setAccessToken, setIdToken, clearTokens, clearAuthMethod } from '@/shared/utils/jwt.ts'
import MockInterceptor from './mockInterceptor'

class ApiClient {
  private static instance: AxiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
  })

  static init() {
    // Initialize mock interceptor first (if enabled, it will intercept before real requests)
    MockInterceptor.init(ApiClient.instance)

    // Add request interceptor for auth
    ApiClient.instance.interceptors.request.use(async (config) => {
      const headers = config.headers as AxiosRequestHeaders

      if (headers?.['skipAuth']) {
        delete headers['skipAuth']
        return config
      }

      let token = getAccessToken()
      if (token && isTokenExpired(token)) {
        token = await ApiClient.refreshAccessToken()
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      return config
    })

    // Add response interceptor to handle 401 errors
    ApiClient.instance.interceptors.response.use(
      (response) => {
        // Return successful responses as-is
        return response
      },
      (error) => {
        // Check if the error is a 401 Unauthorized
        if (error.response?.status === 401) {
          console.log('🔒 401 Unauthorized - Redirecting to login page')
          // Clear all authentication tokens and auth method
          clearTokens()
          clearAuthMethod()
          // Redirect to login page
          window.location.href = '/login'
        }
        // Reject the promise to allow error handling in components
        return Promise.reject(error)
      }
    )
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = getRefreshToken()
    if (!refreshToken) return null

    try {
      const res = await axios.post('/api/refresh-token', { refreshToken })
      const { accessToken, idToken } = res.data
      setAccessToken(accessToken)
      setIdToken(idToken)
      return accessToken
    } catch {
      return null
    }
  }

  private static async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: object,
    params?: Record<string, string | number | boolean>,
    skipAuth: boolean = false
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: path,
      data: body,
      params,
    }

    if (skipAuth) {
      ;(config.headers ||= {})['skipAuth'] = true
    }

    try {
      const res: AxiosResponse<T> = await ApiClient.instance.request<T>(config)
      return res.data
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Request failed'
      throw new Error(message)
    }
  }

  // --- Public HTTP methods ---

  static get<T>(path: string, params?: Record<string, string | number | boolean>, skipAuth = false) {
    return this.request<T>('GET', path, undefined, params, skipAuth)
  }

  static post<T>(path: string, body: object, skipAuth = false) {
    return this.request<T>('POST', path, body, undefined, skipAuth)
  }

  static put<T>(path: string, body: object, skipAuth = false) {
    return this.request<T>('PUT', path, body, undefined, skipAuth)
  }

  static patch<T>(path: string, body: object, skipAuth = false) {
    return this.request<T>('PATCH', path, body, undefined, skipAuth)
  }

  static delete<T>(path: string, skipAuth = false) {
    return this.request<T>('DELETE', path, undefined, undefined, skipAuth)
  }
}

// Initialize interceptors once
ApiClient.init()

export default ApiClient
