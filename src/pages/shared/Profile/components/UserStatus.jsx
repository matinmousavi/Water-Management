import { useState } from 'react'
import { Form, Modal, Select, Tag, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import useNotification from '../../../../hooks/useNotification'
import useAPI from '../../../../hooks/useAPI'
import useModal from '../../../../hooks/useModal'

const UserStatus = ({ userId, currentStatus }) => {
	const [status, setStatus] = useState(currentStatus)
	const [form] = Form.useForm()
	const { openNotification } = useNotification()
	const userApi = useAPI()
	const { isOpen, open, close, handleAfterChange } = useModal()

	const handleStatusChange = async () => {
		try {
			const values = await form.validateFields()
			const response = await userApi.patch(`users/${userId}`, { status: values.status })

			if (response.error) {
				openNotification('error', response.error)
				return
			}

			setStatus(response.user.status)
			openNotification('success', 'وضعیت با موفقیت به‌روزرسانی شد')
			close()
		} catch (error) {
			openNotification('error', 'خطا در تغییر وضعیت کاربر')
			console.error('خطا در تغییر وضعیت کاربر:', error)
		}
	}

	return (
		<>
			<Tag color={status === 'active' ? 'green' : 'red'} style={{ cursor: 'pointer' }}>
				<Flex align='center' gap={3}>
					{status === 'active' ? 'فعال' : 'غیرفعال'} <EditOutlined />
				</Flex>
			</Tag>

			<Modal
				title='تغییر وضعیت'
				open={isOpen}
				onCancel={close}
				onOk={handleStatusChange}
				okText='ثبت'
				cancelText='انصراف'
				afterOpenChange={handleAfterChange}
				confirmLoading={userApi.isLoading}
			>
				<Form layout='vertical' form={form}>
					<Form.Item name='status' label='وضعیت' rules={[{ required: true, message: 'لطفا وضعیت را انتخاب کنید' }]}>
						<Select
							optionLabelProp='label'
							options={[
								{
									label: <Tag color='green'>فعال</Tag>,
									value: 'active',
								},
								{
									label: <Tag color='red'>غیرفعال</Tag>,
									value: 'inactive',
								},
							]}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default UserStatus
