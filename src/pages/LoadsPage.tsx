import React from 'react'
import { Flex, Typography } from 'antd'
import { LoadManagementTable } from '@/features/load-management'

const { Title } = Typography

const LoadsPage: React.FC = () => {
  return (
    <Flex vertical gap={24}>
      <Title level={2}>Loads Management</Title>
      <LoadManagementTable />
    </Flex>
  )
}

export default LoadsPage
