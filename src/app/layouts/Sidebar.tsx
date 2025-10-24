import React, { useState } from 'react'
import { Flex, Layout, Menu, type MenuProps, Typography } from 'antd'
import { LineChartOutlined, BranchesOutlined, TruckOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { EventType, useEvent } from '@/shared/lib/EventBus.ts'

const { Sider } = Layout
const { Title } = Typography

const siderStyle: React.CSSProperties = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
}

const Sidebar: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  useEvent(EventType.SidebarCollapsed, (payload) => setCollapsed(payload))

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const items: MenuProps['items'] = [
    { key: '/', icon: <LineChartOutlined />, label: 'Users' },
    { key: '/branches', icon: <BranchesOutlined />, label: 'Branches' },
    { key: '/loads', icon: <TruckOutlined />, label: 'Loads' }
  ]

  return (
    <Sider style={siderStyle} trigger={null} collapsible collapsed={collapsed} theme="light" width={240} breakpoint="md">
      {!collapsed && (
        <Flex vertical justify="center" style={{ padding: 15 }}>
          <Title>TWY</Title>
        </Flex>
      )}

      <Menu 
        mode="inline" 
        style={{ borderInlineEnd: 'none' }} 
        selectedKeys={[location.pathname]} 
        items={items}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}

export default Sidebar
