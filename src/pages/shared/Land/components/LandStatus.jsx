// components/LandStatus.jsx
import { Tag, Modal, Select, Form, Flex } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import useNotification from '../../../../hooks/useNotification'
import useAPI from '../../../../hooks/useAPI'
import useModal from '../../../../hooks/useModal'
import { useUser } from '../../../../contexts/UserContext'

const LandStatus = ({ landId, status, setStatus, landTitle }) => {
	const [form] = Form.useForm()
	const { openNotification } = useNotification()
	const landApi = useAPI()
	const { isOpen, open, close, handleAfterChange } = useModal()
	const { isAdmin } = useUser()
	const handleOpen = () => {
		open(() => {
			form.setFieldsValue({ status })
		}, 'before')
	}

	const handleStatusChange = async () => {
		try {
			const values = await form.validateFields()
			const response = await landApi.patch(`lands/${landId}`, { status: values.status })

			if (response.error) {
				openNotification('error', response.error)
				return
			}

			setStatus(response.land.status)
			openNotification('success', 'وضعیت با موفقیت به‌روزرسانی شد')
			close()
		} catch (error) {
			openNotification('error', 'خطا در تغییر وضعیت زمین')
			console.error('خطا در تغییر وضعیت زمین:', error)
		}
	}

	return (
		<>
			<Tag color={status === 'active' ? 'green' : 'red'} style={{ cursor: 'pointer' }}>
				<Flex align='center' gap={3}>
					{status === 'active' ? 'فعال' : 'غیرفعال'} {isAdmin ? <EditOutlined onClick={handleOpen} /> : null}
				</Flex>
			</Tag>

			<Modal
				title={`تغییر وضعیت ${landTitle}`}
				open={isOpen}
				onCancel={close}
				onOk={handleStatusChange}
				okText='ثبت'
				cancelText='انصراف'
				afterOpenChange={handleAfterChange}
				confirmLoading={landApi.isLoading}
			>
				<Form form={form} layout='horizontal' labelCol={{ span: 8 }} wrapperCol={{ span: 16 }} colon={false}>
					<Form.Item name='status' label='وضعیت'>
						<Select
							size='large'
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

export default LandStatus
