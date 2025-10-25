import React from 'react'
import { Typography } from 'antd'
import UserSelfUpdate from '@/features/user-management/UserSelfUpdate'

const { Title } = Typography

const ProfilePage: React.FC = () => {
  return (
    <div>
      <Title level={2}>My Profile</Title>
      <UserSelfUpdate />
    </div>
  )
}

export default ProfilePage

