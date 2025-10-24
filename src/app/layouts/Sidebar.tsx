import React, { useState } from 'react'
import { Flex, Layout, Menu, type MenuProps, Typography } from 'antd'
import { LineChartOutlined } from '@ant-design/icons'
import { useLocation } from 'react-router-dom'
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
  const [collapsed, setCollapsed] = useState(false)

  useEvent(EventType.SidebarCollapsed, (payload) => setCollapsed(payload))

  const items: MenuProps['items'] = [{ key: '/', icon: <LineChartOutlined />, label: 'Users' }]

  return (
    <Sider style={siderStyle} trigger={null} collapsible collapsed={collapsed} theme="light" width={240} breakpoint="md">
      {!collapsed && (
        <Flex vertical justify="center" style={{ padding: 15 }}>
          <Title>TWY</Title>
        </Flex>
      )}

      <Menu mode="inline" style={{ borderInlineEnd: 'none' }} selectedKeys={[location.pathname]} items={items} />
    </Sider>
  )
}

export default Sidebar
