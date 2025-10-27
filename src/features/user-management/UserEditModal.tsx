import React, { useState, useEffect, useRef } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  message,
  Divider,
  Alert,
  Spin
} from 'antd'
import { UserRole, USER_ROLE_LABELS } from '@/entities/user/types'
import type { User, UpdateUserRequest } from '@/entities/user/types'
import { updateUser } from '@/entities/user/api'
import { getBranches } from '@/entities/branch/api'
import type { Branch } from '@/entities/branch/types'

const { Option } = Select

interface UserEditModalProps {
  user: User
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  user,
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // Branch select state
  const [branches, setBranches] = useState<Branch[]>([])
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [branchPage, setBranchPage] = useState(0)
  const [branchTotal, setBranchTotal] = useState(0)
  const [branchSearch, setBranchSearch] = useState('')
  const [hasMoreBranches, setHasMoreBranches] = useState(true)
  const branchSearchTimeoutRef = useRef<NodeJS.Timeout>()
  const isInitialFetchRef = useRef(false)

  // Fetch branches
  const fetchBranches = async (page: number, search: string, append: boolean = false) => {
    setLoadingBranches(true)
    try {
      const response = await getBranches({
        page,
        limit: 20,
        query: search || undefined
      })
      
      if (append) {
        setBranches(prev => [...prev, ...response.branches])
      } else {
        setBranches(response.branches)
      }
      
      setBranchTotal(response.total)
      setHasMoreBranches((page + 1) * 20 < response.total)
    } catch (error) {
      message.error('Failed to fetch branches')
    } finally {
      setLoadingBranches(false)
    }
  }

  // Load initial branches when modal opens
  useEffect(() => {
    if (visible && !isInitialFetchRef.current) {
      isInitialFetchRef.current = true
      setBranchPage(0)
      setBranchSearch('')
      setHasMoreBranches(true)
      fetchBranches(0, '')
    } else if (!visible) {
      isInitialFetchRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  // Set form values
  useEffect(() => {
    if (visible && user) {
      const branchId = user.branch?.id || user.branchId
      
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        branch: branchId
      })
    }
  }, [visible, user, form])

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const updateData: UpdateUserRequest = {
        id: user.id,
        role: values.role,
        isActive: values.isActive,
        branch: values.branch
      }

      await updateUser(updateData)
      message.success('User updated successfully')
      onSuccess()
    } catch (error) {
      message.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setBranches([])
    setBranchPage(0)
    setBranchSearch('')
    onCancel()
  }

  // Handle branch search
  const handleBranchSearch = (value: string) => {
    if (branchSearchTimeoutRef.current) {
      clearTimeout(branchSearchTimeoutRef.current)
    }

    branchSearchTimeoutRef.current = setTimeout(() => {
      setBranchSearch(value)
      setBranchPage(0)
      fetchBranches(0, value, false)
    }, 300)
  }

  // Handle branch select scroll (infinite scroll)
  const handleBranchScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const isBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10

    if (isBottom && !loadingBranches && hasMoreBranches) {
      const nextPage = branchPage + 1
      setBranchPage(nextPage)
      fetchBranches(nextPage, branchSearch, true)
    }
  }

  return (
    <Modal
      title="Edit User"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="User Information"
        description="You can only update the user's role, branch assignment, and active status. For personal information updates, users should use the self-update feature."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          role: user?.role,
          isActive: user?.isActive,
          branch: user?.branch?.id || user?.branchId
        }}
      >
        {/* Read-only personal information */}
        <Form.Item label="First Name">
          <Input value={user?.firstName} disabled />
        </Form.Item>

        <Form.Item label="Last Name">
          <Input value={user?.lastName} disabled />
        </Form.Item>

        <Form.Item label="Email">
          <Input value={user?.email} disabled />
        </Form.Item>

        <Divider />

        {/* Editable fields */}
        <Form.Item
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select placeholder="Select role">
            {Object.values(UserRole).map(role => (
              <Option key={role} value={role}>
                {USER_ROLE_LABELS[role]}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="branch"
          label="Branch"
          rules={[{ required: false, message: 'Please select a branch' }]}
        >
          <Select
            placeholder="Search and select branch"
            showSearch
            filterOption={false}
            onSearch={handleBranchSearch}
            onPopupScroll={handleBranchScroll}
            loading={loadingBranches}
            notFoundContent={loadingBranches ? <Spin size="small" /> : 'No branches found'}
            allowClear
            optionLabelProp="label"
          >
            {branches.map(branch => (
              <Option key={branch.id} value={branch.id} label={branch.name}>
                <div>
                  <div style={{ fontWeight: 500 }}>{branch.name}</div>
                  {branch.owner && (
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Owner: {branch.owner.firstName} {branch.owner.lastName}
                    </div>
                  )}
                </div>
              </Option>
            ))}
            {loadingBranches && hasMoreBranches && (
              <Option key="loading" disabled>
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <Spin size="small" /> Loading more...
                </div>
              </Option>
            )}
          </Select>
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Status"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update User
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserEditModal
