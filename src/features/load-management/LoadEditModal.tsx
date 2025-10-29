import { useState, useEffect } from 'react';
import { Modal, Steps, Form, Input, Button, Space, Switch, Upload, Spin, App } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { loadApi, type Load, type UpdateLoadDto } from '@/entities/load';
import { fileApi } from '@/shared/api/fileApi';

interface LoadEditModalProps {
  open: boolean;
  loadId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const LoadEditModal: React.FC<LoadEditModalProps> = ({
  open,
  loadId,
  onClose,
  onSuccess,
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [loadData, setLoadData] = useState<Load | null>(null);

  const steps = [
    { title: 'Customer', description: 'Customer Information' },
    { title: 'Carrier', description: 'Carrier Information' },
    { title: 'Service', description: 'Service Information' },
    { title: 'Booking', description: 'Booking Information' },
    { title: 'Pick-up', description: 'Pick-up Location' },
    { title: 'Drop-off', description: 'Drop-off Location' },
    { title: 'Files', description: 'Additional Files' },
  ];

  useEffect(() => {
    if (open && loadId) {
      fetchLoadData();
    }
  }, [open, loadId]);

  const fetchLoadData = async () => {
    if (!loadId) return;

    try {
      setInitialLoading(true);
      const data = await loadApi.getById(loadId);
      setLoadData(data);
      form.setFieldsValue(data);
      
      // Set existing files
      if (data.fileIds && data.fileIds.length > 0) {
        setUploadedFileIds(data.fileIds);
        const files: UploadFile[] = data.fileIds.map((id, index) => ({
          uid: id,
          name: `File ${index + 1}`,
          status: 'done',
        }));
        setFileList(files);
      }
    } catch (error) {
      console.error('Failed to fetch load data:', error);
      message.error('Failed to load data');
    } finally {
      setInitialLoading(false);
    }
  };

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
    if (!loadId) return;

    try {
      setLoading(true);
      await form.validateFields();

      const values = form.getFieldsValue();
      const payload: UpdateLoadDto = {
        ...values,
        fileIds: uploadedFileIds,
      };

      await loadApi.update(loadId, payload);
      message.success('Load updated successfully');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Failed to update load:', error);
      message.error('Failed to update load');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setCurrentStep(0);
    setFileList([]);
    setUploadedFileIds([]);
    setLoadData(null);
    onClose();
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
    const fileId = file.uid;
    try {
      await fileApi.deleteFile(fileId);
      setUploadedFileIds((prev) => prev.filter((id) => id !== fileId));
      message.success('File removed successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      message.error('Failed to remove file');
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
              <Input placeholder="Enter customer name" />
            </Form.Item>
            <Form.Item
              label="Reference Number"
              name="referenceNumber"
              rules={[{ required: true, message: 'Please enter reference number' }]}
            >
              <Input placeholder="Enter reference number" />
            </Form.Item>
            <Form.Item label="Customer Rate" name="customerRate">
              <Input placeholder="Enter customer rate" />
            </Form.Item>
            <Form.Item
              label="Contact Name"
              name="contactName"
              rules={[{ required: true, message: 'Please enter contact name' }]}
            >
              <Input placeholder="Enter contact name" />
            </Form.Item>
          </>
        );

      case 1: // Carrier Information
        return (
          <>
            <Form.Item label="Carrier" name="carrier">
              <Input placeholder="Enter carrier" />
            </Form.Item>
            <Form.Item label="Carrier Payment Method" name="carrierPaymentMethod">
              <Input placeholder="Enter payment method" />
            </Form.Item>
            <Form.Item
              label="Carrier Rate"
              name="carrierRate"
              rules={[{ required: true, message: 'Please enter carrier rate' }]}
            >
              <Input placeholder="Enter carrier rate" />
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
            >
              <Switch />
            </Form.Item>
            <Form.Item
              label="Load Type"
              name="loadType"
              rules={[{ required: true, message: 'Please enter load type' }]}
            >
              <Input placeholder="Enter load type" />
            </Form.Item>
            <Form.Item
              label="Service Type"
              name="serviceType"
              rules={[{ required: true, message: 'Please enter service type' }]}
            >
              <Input placeholder="Enter service type" />
            </Form.Item>
            <Form.Item
              label="Service Given As"
              name="serviceGivenAs"
              rules={[{ required: true, message: 'Please enter service given as' }]}
            >
              <Input placeholder="Enter service given as" />
            </Form.Item>
            <Form.Item
              label="Commodity"
              name="commodity"
              rules={[{ required: true, message: 'Please enter commodity' }]}
            >
              <Input placeholder="Enter commodity" />
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
              <Input placeholder="Enter booked as" />
            </Form.Item>
            <Form.Item
              label="Sold As"
              name="soldAs"
              rules={[{ required: true, message: 'Please enter sold as' }]}
            >
              <Input placeholder="Enter sold as" />
            </Form.Item>
            <Form.Item
              label="Weight"
              name="weight"
              rules={[{ required: true, message: 'Please enter weight' }]}
            >
              <Input placeholder="Enter weight" />
            </Form.Item>
            <Form.Item label="Temperature" name="temperature">
              <Input placeholder="Enter temperature" />
            </Form.Item>
          </>
        );

      case 4: // Pick-up Location
        return (
          <>
            <Form.Item label="City / Zipcode" name="pickupCityZipcode">
              <Input placeholder="Enter city or zipcode" />
            </Form.Item>
            <Form.Item label="Phone Number" name="pickupPhoneNumber">
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              label="Select Carrier"
              name="pickupSelectCarrier"
              rules={[{ required: true, message: 'Please enter carrier' }]}
            >
              <Input placeholder="Enter carrier" />
            </Form.Item>
            <Form.Item
              label="Name"
              name="pickupName"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
            <Form.Item
              label="Address"
              name="pickupAddress"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input.TextArea placeholder="Enter address" rows={3} />
            </Form.Item>
          </>
        );

      case 5: // Drop-off Location
        return (
          <>
            <Form.Item label="City / Zipcode" name="dropoffCityZipcode">
              <Input placeholder="Enter city or zipcode" />
            </Form.Item>
            <Form.Item label="Phone Number" name="dropoffPhoneNumber">
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              label="Select Carrier"
              name="dropoffSelectCarrier"
              rules={[{ required: true, message: 'Please enter carrier' }]}
            >
              <Input placeholder="Enter carrier" />
            </Form.Item>
            <Form.Item
              label="Name"
              name="dropoffName"
              rules={[{ required: true, message: 'Please enter name' }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
            <Form.Item
              label="Address"
              name="dropoffAddress"
              rules={[{ required: true, message: 'Please enter address' }]}
            >
              <Input.TextArea placeholder="Enter address" rows={3} />
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
              <Button icon={<UploadOutlined />}>Select Files</Button>
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
    <Modal
      title="Edit Load"
      open={open}
      onCancel={handleClose}
      width={800}
      footer={null}
    >
      {initialLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

          <Form form={form} layout="vertical">
            {renderStepContent()}
          </Form>

          <Space style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>Previous</Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" onClick={handleSubmit} loading={loading}>
                Update Load
              </Button>
            )}
            <Button onClick={handleClose}>Cancel</Button>
          </Space>
        </>
      )}
    </Modal>
  );
};

