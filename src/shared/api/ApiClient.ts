import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosRequestHeaders, type AxiosResponse } from 'axios'
import { getAccessToken, getRefreshToken, isTokenExpired, setAccessToken, setIdToken } from '@/shared/utils/jwt.ts'

class ApiClient {
  private static instance: AxiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
  })

  static init() {
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
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
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

  static delete<T>(path: string, skipAuth = false) {
    return this.request<T>('DELETE', path, undefined, undefined, skipAuth)
  }
}

// Initialize interceptors once
ApiClient.init()

export default ApiClient
