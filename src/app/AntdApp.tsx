import React, { type FC, type PropsWithChildren } from 'react'
import { App, ConfigProvider, Empty } from 'antd'
import GlobalErrorBoundary from '@components/GlobalErrorBoundary.tsx'

const AntdApp: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ConfigProvider renderEmpty={() => <Empty description={false} />}>
      <App>
        <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
      </App>
    </ConfigProvider>
  )
}

export default AntdApp
