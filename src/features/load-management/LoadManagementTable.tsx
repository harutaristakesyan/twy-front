import { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, Input, Tag, App } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { loadApi, type Load } from '@/entities/load';
import { LoadEditModal } from './LoadEditModal';

export const LoadManagementTable: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);

  useEffect(() => {
    fetchLoads();
  }, []);

  const fetchLoads = async () => {
    try {
      setLoading(true);
      const data = await loadApi.getAll();
      setLoads(data);
    } catch (error) {
      console.error('Failed to fetch loads:', error);
      message.error('Failed to fetch loads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await loadApi.delete(id);
      message.success('Load deleted successfully');
      fetchLoads();
    } catch (error) {
      console.error('Failed to delete load:', error);
      message.error('Failed to delete load');
    }
  };

  const handleEdit = (id: string) => {
    setSelectedLoadId(id);
    setEditModalOpen(true);
  };

  const handleCreateNew = () => {
    navigate('/loads/create');
  };

  const handleEditSuccess = () => {
    fetchLoads();
    setEditModalOpen(false);
    setSelectedLoadId(null);
  };

  const filteredLoads = (loads || []).filter((load) => {
    const searchLower = searchText.toLowerCase();
    return (
      load.customer?.toLowerCase().includes(searchLower) ||
      load.referenceNumber?.toLowerCase().includes(searchLower) ||
      load.contactName?.toLowerCase().includes(searchLower) ||
      load.carrier?.toLowerCase().includes(searchLower) ||
      load.commodity?.toLowerCase().includes(searchLower)
    );
  });

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
          <div>{record.pickupName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.pickupCityZipcode || 'N/A'}
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
          <div>{record.dropoffName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.dropoffCityZipcode || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Carrier Rate',
      dataIndex: 'carrierRate',
      key: 'carrierRate',
      width: 120,
      render: (text) => <strong style={{ color: '#52c41a' }}>${text}</strong>,
    },
    {
      title: 'Customer Rate',
      dataIndex: 'customerRate',
      key: 'customerRate',
      width: 130,
      render: (text) => (text ? <strong style={{ color: '#1890ff' }}>${text}</strong> : '-'),
    },
    {
      title: 'Files',
      dataIndex: 'fileIds',
      key: 'fileIds',
      width: 80,
      align: 'center',
      render: (fileIds: string[]) => (
        <Tag color={fileIds && fileIds.length > 0 ? 'green' : 'default'}>
          {fileIds && fileIds.length > 0 ? fileIds.length : 0}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record.id)}
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
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search by customer, reference, contact, carrier, or commodity"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 400 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
        >
          Create New Load
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredLoads}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1800 }}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} loads`,
        }}
      />

      <LoadEditModal
        open={editModalOpen}
        loadId={selectedLoadId}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedLoadId(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

