import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Input,
  Select,
  DatePicker,
  Tooltip,
  Badge
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  UserOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { UserRole, USER_ROLE_LABELS } from '@/entities/user/types'
import type { User, CurrentUser } from '@/entities/user/types'
import { getUsers, deleteUser, getCurrentUser } from '@/entities/user/api'
import UserEditModal from './UserEditModal'
import UserCreateModal from './UserCreateModal'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker

const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  // const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  // const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0) // zero-indexed
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [sortField, setSortField] = useState<'firstName' | 'lastName' | 'email' | 'role' | 'isActive' | 'createdAt' | 'branch' | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | undefined>(undefined)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await getUsers({
        page: currentPage,
        limit: pageSize,
        sortField,
        sortOrder,
        query: searchText || undefined
      })
      setUsers(response.users)
      setTotal(response.total)
    } catch (error) {
      message.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await getCurrentUser()
        setCurrentUser(userData)
      } catch (error) {
        console.error('Failed to fetch current user:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortField, sortOrder, searchText])

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      message.success('User deleted successfully')
      
      // If deleting the last item on the current page (and not on page 0), go to previous page
      if (users.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1)
      } else {
        // Otherwise just refresh the current page
        fetchUsers()
      }
    } catch (error) {
      message.error('Failed to delete user')
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsEditModalVisible(true)
  }

  const handleEditSuccess = () => {
    setIsEditModalVisible(false)
    setEditingUser(null)
    fetchUsers()
  }

  const handleCreateSuccess = () => {
    setIsCreateModalVisible(false)
    fetchUsers()
  }

  // Handle search with debouncing
  const [searchInput, setSearchInput] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchText(searchInput)
      setCurrentPage(0) // Reset to first page on search
    }, 500) // 500ms debounce
    
    return () => clearTimeout(timer)
  }, [searchInput])

  // Handle table changes (pagination, sorting, filters)
  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    // Handle page size change (only if it actually changed)
    if (pagination.pageSize !== undefined && pagination.pageSize !== pageSize) {
      setPageSize(pagination.pageSize)
      setCurrentPage(0) // Reset to first page when page size changes
    }
    // Handle page change (only if page size didn't change)
    else if (pagination.current !== undefined) {
      setCurrentPage(pagination.current - 1) // Convert to zero-indexed
    }

    // Handle sorting (always update, even if cleared)
    if (sorter.field !== undefined) {
      setSortField(sorter.field)
      setSortOrder(sorter.order)
    } else if (sorter.order === undefined) {
      // Sort was cleared
      setSortField(undefined)
      setSortOrder(undefined)
    }
  }

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.OWNER]: 'red',
      [UserRole.HEAD_OWNER]: 'magenta',
      [UserRole.HEAD_ACCOUNTANT]: 'purple',
      [UserRole.ACCOUNTANT]: 'blue',
      [UserRole.AGENT]: 'green',
      [UserRole.CARRIER]: 'orange'
    }
    return colors[role]
  }

  // No client-side filtering - using server-side search instead
  const filteredUsers = users || []

  const columns: ColumnsType<User> = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'firstName',
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <div>
            <div style={{ fontWeight: 500 }}>{record.firstName} {record.lastName}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
          </div>
        </Space>
      ),
      sorter: true,
      sortOrder: sortField === 'firstName' ? sortOrder : undefined
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {USER_ROLE_LABELS[role]}
        </Tag>
      ),
      sorter: true,
      sortOrder: sortField === 'role' ? sortOrder : undefined
    },
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branch',
      render: (branchName, record) => {
        // Support both formats: branch.name or branchName
        const displayName = record.branch?.name || branchName || 'N/A'
        return displayName
      },
      sorter: true,
      sortOrder: sortField === 'branch' ? sortOrder : undefined
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Active' : 'Inactive'}
        />
      ),
      sorter: true,
      sortOrder: sortField === 'isActive' ? sortOrder : undefined
    },
    {
      title: 'Registered Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string, record) => {
        const dateToShow = date || record.registeredDate
        return dateToShow ? new Date(dateToShow).toLocaleDateString() : 'N/A'
      },
      sorter: true,
      sortOrder: sortField === 'createdAt' ? sortOrder : undefined
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title={currentUser?.email === record.email ? "You cannot edit yourself" : "Edit User"}>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={currentUser?.email === record.email}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={currentUser?.email === record.email}
          >
            <Tooltip title={currentUser?.email === record.email ? "You cannot delete yourself" : "Delete User"}>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={currentUser?.email === record.email}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      {/* Statistics Card */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>User Management</Title>
              <Text type="secondary">Manage users, roles, and permissions</Text>
            </Col>
            <Col>
              <Space>
                {/* <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
                >
                  Add User
                </Button> */}
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchUsers}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Space>
            </Col>
          </Row>
        </div>

        {/* Search */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: currentPage + 1, // Convert from zero-indexed to one-indexed
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            pageSizeOptions: ['5', '10', '20', '50', '100']
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Modals */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          visible={isEditModalVisible}
          onCancel={() => {
            setIsEditModalVisible(false)
            setEditingUser(null)
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      <UserCreateModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}

export default UserManagementTable
