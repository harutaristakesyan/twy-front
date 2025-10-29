import React, { useState } from 'react';
import { Flex, Typography, Card, Steps, Form, Input, Button, Space, Switch, Upload, App } from 'antd';
import { UploadOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { UploadFile } from 'antd';
import { loadApi, type CreateLoadDto } from '@/entities/load';
import { fileApi } from '@/shared/api/fileApi';

const { Title } = Typography;

const CreateLoadPage: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

  const steps = [
    { title: 'Customer', description: 'Customer Information' },
    { title: 'Carrier', description: 'Carrier Information' },
    { title: 'Service', description: 'Service Information' },
    { title: 'Booking', description: 'Booking Information' },
    { title: 'Pick-up', description: 'Pick-up Location' },
    { title: 'Drop-off', description: 'Drop-off Location' },
    { title: 'Files', description: 'Additional Files' },
  ];

  const handleNext = async () => {
    try {
      await form.validateFields(getFieldsForStep(currentStep));
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await form.validateFields();

      const values = form.getFieldsValue();
      const payload: CreateLoadDto = {
        ...values,
        fileIds: uploadedFileIds,
      };

      await loadApi.create(payload);
      message.success('Load created successfully');
      navigate('/loads');
    } catch (error) {
      console.error('Failed to create load:', error);
      message.error('Failed to create load');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/loads');
  };

  const handleFileUpload = async (file: File): Promise<boolean> => {
    try {
      message.loading({ content: 'Uploading file...', key: 'upload' });
      const fileId = await fileApi.uploadFile(file);
      setUploadedFileIds((prev) => [...prev, fileId]);
      message.success({ content: 'File uploaded successfully', key: 'upload' });
      return true;
    } catch (error) {
      console.error('File upload failed:', error);
      message.error({ content: 'File upload failed', key: 'upload' });
      return false;
    }
  };

  const handleFileRemove = async (file: UploadFile) => {
    const index = fileList.indexOf(file);
    if (index > -1 && uploadedFileIds[index]) {
      try {
        await fileApi.deleteFile(uploadedFileIds[index]);
        setUploadedFileIds((prev) => prev.filter((_, i) => i !== index));
        message.success('File removed successfully');
      } catch (error) {
        console.error('Failed to delete file:', error);
        message.error('Failed to remove file');
      }
    }
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 0: // Customer Information
        return ['customer', 'referenceNumber', 'contactName'];
      case 1: // Carrier Information
        return ['carrierRate'];
      case 2: // Service Information
        return ['loadType', 'serviceType', 'serviceGivenAs', 'commodity'];
      case 3: // Booking Information
        return ['bookedAs', 'soldAs', 'weight'];
      case 4: // Pick-up Location
        return ['pickupSelectCarrier', 'pickupName', 'pickupAddress'];
      case 5: // Drop-off Location
        return ['dropoffSelectCarrier', 'dropoffName', 'dropoffAddress'];
      case 6: // Files
        return [];
      default:
        return [];
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Customer Information
        return (
          <>
            <Form.Item
              label="Customer"
              name="customer"
              rules={[{ required: true, message: 'Please enter customer name' }]}
            >
              <Input placeholder="Enter customer name" size="large" />
            </Form.Item>
            <Form.Item
              label="Reference Number"
              name="referenceNumber"
              rules={[{ required: true, message: 'Please enter reference number' }]}
            >
              <Input placeholder="Enter reference number" size="large" />
            </Form.Item>
            <Form.Item label="Customer Rate" name="customerRate">
              <Input placeholder="Enter customer rate" size="large" />
            </Form.Item>
            <Form.Item
              label="Contact Name"
              name="contactName"
              rules={[{ required: true, message: 'Please enter contact name' }]}
            >
              <Input placeholder="Enter contact name" size="large" />
            </Form.Item>
          </>
        );

      case 1: // Carrier Information
        return (
          <>
            <Form.Item label="Carrier" name="carrier">
              <Input placeholder="Enter carrier" size="large" />
            </Form.Item>
            <Form.Item label="Carrier Payment Method" name="carrierPaymentMethod">
              <Input placeholder="Enter payment method" size="large" />
            </Form.Item>
            <Form.Item
              label="Carrier Rate"
              name="carrierRate"
              rules={[{ required: true, message: 'Please enter carrier rate' }]}
            >
              <Input placeholder="Enter carrier rate" size="large" />
            </Form.Item>
          </>
        );

      case 2: // Service Information
        return (
          <>
            <Form.Item
              label="Charge Service Fee to Office"
              name="chargeServiceFeeToOffice"
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Load Type"
              name="loadType"
              rules={[{ required: true, message: 'Please enter load type' }]}
            >
              <Input placeholder="Enter load type" size="large" />
            </Form.Item>
            <Form.Item
              label="Service Type"
              name="serviceType"
              rules={[{ required: true, message: 'Please enter service type' }]}
            >
              <Input placeholder="Enter service type" size="large" />
            </Form.Item>
            <Form.Item
              label="Service Given As"
              name="serviceGivenAs"
              rules={[{ required: true, message: 'Please enter service given as' }]}
            >
              <Input placeholder="Enter service given as" size="large" />
            </Form.Item>
            <Form.Item
              label="Commodity"
              name="commodity"
              rules={[{ required: true, message: 'Please enter commodity' }]}
            >
              <Input placeholder="Enter commodity" size="large" />
            </Form.Item>
          </>
        );

      case 3: // Booking Information
        return (
          <>
            <Form.Item
              label="Booked As"
              name="bookedAs"
              rules={[{ required: true, message: 'Please enter booked as' }]}
            >
              <Input placeholder="Enter booked as" size="large" />
            </Form.Item>
            <Form.Item
              label="Sold As"
              name="soldAs"
              rules={[{ required: true, message: 'Please enter sold as' }]}
            >
              <Input placeholder="Enter sold as" size="large" />
            </Form.Item>
            <Form.Item
              label="Weight"
              name="weight"
              rules={[{ required: true, message: 'Please enter weight' }]}
            >
              <Input placeholder="Enter weight" size="large" />
            </Form.Item>
            <Form.Item label="Temperature" name="temperature">
              <Input placeholder="Enter temperature" size="large" />
            </Form.Item>
          </>
        );

      case 4: // Pick-up Location
        return (
          <>
            <Form.Item label="City / Zipcode" name="pickupCityZipcode">
              <Input placeholder="Enter city or zipcode" size="large" />
            </Form.Item>
            <Form.Item label="Phone Number" name="pickupPhoneNumber">
              <Input placeholder="Enter phone number" size="large" />
            </Form.Item>
            <Form.Item
              label="Select Carrier"
              name="pickupSelectCarrier"
              rules={[{ required: true, message: 'Please enter carrier' }]}
            >
              <Input placeholder="Enter carrier" size="large" />
            </Form.Item>
            <Form.Item
              label="Name"
              name="pickupName"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter name" size="large" />
            </Form.Item>
            <Form.Item
              label="Address"
              name="pickupAddress"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input.TextArea placeholder="Enter address" rows={3} size="large" />
            </Form.Item>
          </>
        );

      case 5: // Drop-off Location
        return (
          <>
            <Form.Item label="City / Zipcode" name="dropoffCityZipcode">
              <Input placeholder="Enter city or zipcode" size="large" />
            </Form.Item>
            <Form.Item label="Phone Number" name="dropoffPhoneNumber">
              <Input placeholder="Enter phone number" size="large" />
            </Form.Item>
            <Form.Item
              label="Select Carrier"
              name="dropoffSelectCarrier"
              rules={[{ required: true, message: 'Please enter carrier' }]}
            >
              <Input placeholder="Enter carrier" size="large" />
            </Form.Item>
            <Form.Item
              label="Name"
              name="dropoffName"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter name" size="large" />
            </Form.Item>
            <Form.Item
              label="Address"
              name="dropoffAddress"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input.TextArea placeholder="Enter address" rows={3} size="large" />
            </Form.Item>
          </>
        );

      case 6: // Files
        return (
          <Form.Item label="Upload Files">
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={(file) => {
                handleFileUpload(file).then((success) => {
                  if (success) {
                    setFileList((prev) => [
                      ...prev,
                      {
                        uid: file.uid,
                        name: file.name,
                        status: 'done',
                        size: file.size,
                        type: file.type,
                      },
                    ]);
                  }
                });
                return false; // Prevent auto upload
              }}
              onRemove={handleFileRemove}
              iconRender={() => <DeleteOutlined />}
            >
              <Button icon={<UploadOutlined />} size="large">
                Select Files
              </Button>
            </Upload>
            <div style={{ marginTop: 8, color: '#666' }}>
              Upload documents related to this load (multiple files allowed)
            </div>
          </Form.Item>
        );

      default:
        return null;
    }
  };

  return (
    <Flex vertical gap={24}>
      <Flex justify="space-between" align="center">
        <Title level={2} style={{ margin: 0 }}>
          Create New Load
        </Title>
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
          Back to Loads
        </Button>
      </Flex>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <Form form={form} layout="vertical" size="large">
          {renderStepContent()}
        </Form>

        <Flex justify="space-between" style={{ marginTop: 32 }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev} size="large">
                Previous
              </Button>
            )}
          </Space>
          <Space>
            <Button onClick={handleCancel} size="large">
              Cancel
            </Button>
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext} size="large">
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleSubmit} loading={loading} size="large">
                Create Load
              </Button>
            )}
          </Space>
        </Flex>
      </Card>
    </Flex>
  );
};

export default CreateLoadPage;

