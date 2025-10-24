import ApiClient from '@/shared/api/ApiClient.ts'
import type { ApiResponse } from '@/shared/api/types.ts'
import type { MessageDto } from '@/shared/constants/request.ts'
import type { UserProfile } from '@/entities/user/types.ts'

//This is just examples
export const getUserInfo = async () => {
  const response = await ApiClient.get<ApiResponse<UserProfile>>('/user', {})
  return response.data
}

export const updateUserInfo = async (data: UserProfile) => {
  const response = await ApiClient.put<ApiResponse<MessageDto>>('/user', data)
  return response.data
}

export const deleteUserInfo = async () => {
  return await ApiClient.delete<ApiResponse<{ message: string }>>('/user')
}
