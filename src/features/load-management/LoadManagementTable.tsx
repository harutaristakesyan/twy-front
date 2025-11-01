import { useState, useEffect, useCallback, ChangeEvent, useRef } from 'react';
import { Table, Button, Space, Popconfirm, Input, Tag, App, Card, Row, Col, Typography, Statistic } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, ReloadOutlined, TruckOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { loadApi, type Load, type GetLoadsParams } from '@/entities/load';
import { LoadEditModal } from './LoadEditModal';

const { Search } = Input;
const { Title, Text } = Typography;

export const LoadManagementTable: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sortState, setSortState] = useState<{ field?: GetLoadsParams['sortField']; order?: GetLoadsParams['sortOrder'] }>({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const hasMountedRef = useRef(false);
  const locationRef = useRef(location.pathname);

  // Reset fetch guard when route changes
  useEffect(() => {
    if (locationRef.current !== location.pathname) {
      locationRef.current = location.pathname
      // Reset mounted flag so we can fetch when coming back to this page
      if (location.pathname === '/loads') {
        hasMountedRef.current = false
      }
    }
  }, [location.pathname])

  const fetchLoads = useCallback(
    async (
      page: number = pagination.current,
      pageSize: number = pagination.pageSize,
      search: string = searchText,
      sortField: GetLoadsParams['sortField'] = sortState.field,
      sortOrder: GetLoadsParams['sortOrder'] = sortState.order,
    ) => {
      // Only fetch if we're on the loads page
      if (location.pathname !== '/loads') {
        return;
      }

      try {
        setLoading(true);
        const response = await loadApi.getAll({
          page: page - 1,
          limit: pageSize,
          query: search ? search : undefined,
          sortField,
          sortOrder,
        });
        
        // Final safety check - only update if still on loads page
        if (location.pathname !== '/loads' || locationRef.current !== '/loads') {
          return;
        }
        
        setLoads(response.loads);
        setPagination({ current: page, pageSize, total: response.total });
      } catch (error) {
        // Only show error if still on loads page
        if (location.pathname === '/loads' && locationRef.current === '/loads') {
          console.error('Failed to fetch loads:', error);
          message.error('Failed to fetch loads');
        }
      } finally {
        // Only update loading state if still on loads page
        if (location.pathname === '/loads' && locationRef.current === '/loads') {
          setLoading(false);
        }
      }
    },
    [message, pagination.current, pagination.pageSize, searchText, sortState.field, sortState.order, location.pathname],
  );

  useEffect(() => {
    // Only fetch if we're on the loads page
    if (location.pathname !== '/loads') {
      return
    }
    
    let cancelled = false
    
    const doFetch = async () => {
      if (cancelled) return
      if (hasMountedRef.current) return
      hasMountedRef.current = true
      await fetchLoads(1, pagination.pageSize)
    }
    
    doFetch()
    
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleDelete = async (id: string) => {
    try {
      await loadApi.delete(id);
      message.success('Load deleted successfully');
      fetchLoads(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete load:', error);
      message.error('Failed to delete load');
    }
  };

  const handleEdit = (record: Load) => {
    setSelectedLoad(record);
    setEditModalOpen(true);
  };

  const handleCreateNew = () => {
    navigate('/loads/create');
  };

  const handleEditSuccess = () => {
    fetchLoads(pagination.current, pagination.pageSize);
    setEditModalOpen(false);
    setSelectedLoad(null);
  };

  const handleTableChange = (tablePagination: any, _filters: any, sorter: any) => {
    let field: GetLoadsParams['sortField'];
    let order: GetLoadsParams['sortOrder'];

    if (!Array.isArray(sorter) && sorter?.field && sorter?.order) {
      const validFields: GetLoadsParams['sortField'][] = ['referenceNumber', 'status', 'createdAt', 'customer'];
      if (validFields.includes(sorter.field)) {
        field = sorter.field;
        order = sorter.order;
      }
    }

    setSortState({ field, order });
    fetchLoads(tablePagination.current, tablePagination.pageSize, searchText, field, order);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchLoads(1, pagination.pageSize, value, sortState.field, sortState.order);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchText(value);
    if (value === '') {
      fetchLoads(1, pagination.pageSize, '', sortState.field, sortState.order);
    }
  };

  const formatCurrency = (value?: number | null) => {
    if (value === null || value === undefined) {
      return '-';
    }
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const statusColorMap: Record<string, string> = {
    Pending: 'gold',
    Approved: 'green',
    Denied: 'red',
  };

  const columns: ColumnsType<Load> = [
    {
      title: 'Reference #',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 130,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      sorter: true,
      render: (status: Load['status']) => (
        <Tag color={statusColorMap[status] || 'default'} style={{ textTransform: 'capitalize' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      width: 150,
    },
    {
      title: 'Contact',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 130,
    },
    {
      title: 'Carrier',
      dataIndex: 'carrier',
      key: 'carrier',
      width: 130,
      render: (text) => text || '-',
    },
    {
      title: 'Load Type',
      dataIndex: 'loadType',
      key: 'loadType',
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 120,
    },
    {
      title: 'Commodity',
      dataIndex: 'commodity',
      key: 'commodity',
      width: 130,
    },
    {
      title: 'Weight',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
    },
    {
      title: 'Booked As',
      dataIndex: 'bookedAs',
      key: 'bookedAs',
      width: 110,
    },
    {
      title: 'Pickup',
      key: 'pickup',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.pickup.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.pickup.cityZipCode || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Dropoff',
      key: 'dropoff',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.dropoff.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.dropoff.cityZipCode || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Carrier Rate',
      dataIndex: 'carrierRate',
      key: 'carrierRate',
      width: 120,
      render: (value: number | null | undefined) =>
        value != null ? <strong style={{ color: '#52c41a' }}>{formatCurrency(value)}</strong> : '-',
    },
    {
      title: 'Customer Rate',
      dataIndex: 'customerRate',
      key: 'customerRate',
      width: 130,
      render: (value: number | null | undefined) =>
        value != null ? <strong style={{ color: '#1890ff' }}>{formatCurrency(value)}</strong> : '-',
    },
    {
      title: 'Files',
      dataIndex: 'files',
      key: 'files',
      width: 80,
      align: 'center',
      render: (files: Load['files']) => (
        <Tag color={files && files.length > 0 ? 'green' : 'default'}>
          {files && files.length > 0 ? files.length : 0}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ padding: '4px 8px' }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Load"
            description="Are you sure you want to delete this load?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: '4px 8px' }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics Card */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Loads"
              value={pagination.total}
              prefix={<TruckOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table Card */}
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={4} style={{ margin: 0 }}>Load Management</Title>
              <Text type="secondary">Manage loads and shipments</Text>
            </Col>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateNew}
                >
                  Create New Load
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => fetchLoads(pagination.current, pagination.pageSize)}
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
              placeholder="Search loads..."
              value={searchText}
              onChange={handleSearchChange}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={loads}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1970 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['5', '10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} loads`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      <LoadEditModal
        open={editModalOpen}
        load={selectedLoad}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedLoad(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

