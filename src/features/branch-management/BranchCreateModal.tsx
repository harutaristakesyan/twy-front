import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  message,
  Alert
} from 'antd'
import type { BranchFormData } from '@/entities/branch/types'
import { createBranch } from '@/entities/branch/api'
import type { User } from '@/entities/user/types'

const { Option } = Select
const { TextArea } = Input

interface BranchCreateModalProps {
  visible: boolean
  owners: User[]
  loadingOwners: boolean
  onCancel: () => void
  onSuccess: () => void
}

const BranchCreateModal: React.FC<BranchCreateModalProps> = ({
  visible,
  owners,
  loadingOwners,
  onCancel,
  onSuccess
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: BranchFormData) => {
    setLoading(true)
    try {
      await createBranch(values)
      message.success('Branch created successfully')
      form.resetFields()
      onSuccess()
    } catch (error: any) {
      // Handle duplicate branch name error
      const errorMessage = error?.response?.data?.error || error?.message || ''
      
      if (errorMessage.includes('duplicate key value violates unique constraint "branch_name_key"') ||
          errorMessage.includes('branch_name_key')) {
        message.error(`Branch name "${values.name}" already exists. Please use a different name.`)
      } else {
        message.error('Failed to create branch')
      }
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
      title="Create New Branch"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Alert
        message="Branch Creation"
        description="Create a new branch. Branch name and owner are required."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        id="branchCreateForm"
      >
        <Form.Item
          name="name"
          label="Branch Name"
          rules={[
            { required: true, message: 'Please enter branch name' },
            { min: 2, message: 'Branch name must be at least 2 characters' }
          ]}
        >
          <Input placeholder="Enter branch name" id="create-name" />
        </Form.Item>

        <Form.Item
          name="contact"
          label="Contact Information"
          rules={[
            { max: 500, message: 'Contact information cannot exceed 500 characters' }
          ]}
        >
          <TextArea 
            placeholder="Enter contact information (phone, email, address, etc.)" 
            rows={3}
            id="create-contact"
          />
        </Form.Item>

        <Form.Item
          name="owner"
          label="Branch Owner"
          rules={[{ required: true, message: 'Please select a branch owner' }]}
        >
          <Select 
            placeholder="Select branch owner" 
            loading={loadingOwners}
            showSearch
            optionLabelProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
              (option?.email ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {owners.map(owner => (
              <Option 
                key={owner.id} 
                value={owner.id}
                label={`${owner.firstName} ${owner.lastName}`}
                email={owner.email}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {owner.firstName} {owner.lastName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {owner.email} - {owner.role}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Branch
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default BranchCreateModal

