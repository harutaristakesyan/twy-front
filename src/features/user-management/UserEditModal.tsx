import React, { useState, useEffect } from 'react'
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
  Alert
} from 'antd'
import { UserRole, USER_ROLE_LABELS } from '@/entities/user/types'
import type { User, UpdateUserRequest } from '@/entities/user/types'
import { updateUser } from '@/entities/user/api'

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

  useEffect(() => {
    if (visible && user) {
      // Support both old format (branchId) and new format (branch.id)
      const branchId = user.branch?.id || user.branchId
      
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        branchId: branchId
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
        branchId: values.branchId
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
    onCancel()
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
          branchId: user?.branch?.id || user?.branchId
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
          name="branchId"
          label="Branch"
          rules={[{ required: false, message: 'Please select a branch' }]}
        >
          <Select placeholder="Select branch">
            {/* Display current user's branch - value is ID, label is name */}
            {user?.branch && (
              <Option value={user.branch.id}>{user.branch.name}</Option>
            )}
            {/* Fallback for old format */}
            {!user?.branch && user?.branchId && user?.branchName && (
              <Option value={user.branchId}>{user.branchName}</Option>
            )}
            {/* TODO: Later this will be populated from branches API */}
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
