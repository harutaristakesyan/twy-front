import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Space,
  message,
  Alert
} from 'antd'
import { UserRole, USER_ROLE_LABELS } from '@/entities/user/types'
import type { UserFormData } from '@/entities/user/types'
import { createUser } from '@/entities/user/api'

const { Option } = Select

interface UserCreateModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
}

const UserCreateModal: React.FC<UserCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: UserFormData) => {
    setLoading(true)
    try {
      await createUser(values)
      message.success('User created successfully')
      form.resetFields()
      onSuccess()
    } catch (error) {
      message.error('Failed to create user')
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
      title="Create New User"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="User Creation"
        description="All fields are required. The user will receive an email with login credentials."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        id="userCreateForm"
      >
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[
            { required: true, message: 'Please enter first name' },
            { min: 2, message: 'First name must be at least 2 characters' }
          ]}
        >
          <Input placeholder="Enter first name" id="create-firstName" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[
            { required: true, message: 'Please enter last name' },
            { min: 2, message: 'Last name must be at least 2 characters' }
          ]}
        >
          <Input placeholder="Enter last name" id="create-lastName" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' }
          ]}
        >
          <Input placeholder="Enter email address" id="create-email" />
        </Form.Item>

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
          rules={[{ required: true, message: 'Please select a branch' }]}
        >
          <Select placeholder="Select branch">
            {/* This would be populated from branches API */}
            <Option value="branch1">Main Branch</Option>
            <Option value="branch2">Secondary Branch</Option>
            <Option value="branch3">Regional Branch</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Status"
          valuePropName="checked"
          initialValue={true}
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
              Create User
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserCreateModal
