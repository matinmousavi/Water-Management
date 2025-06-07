import { useCallback } from 'react'
import { Button, Flex, Modal, Form, notification } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useAPI from '../../../../../hooks/useAPI'
import WellForm from '../../../../../components/Well/WellForm/WellForm'

const AddWell = ({ setData }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const wellApi = useAPI()
	const irrigatorsApi = useAPI()

	const handleOpen = () => {
		irrigatorsApi.init('users', { role: 'irrigator' })
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			const response = await wellApi.post('wells', values)

			if (response?.error) {
				notification.error({
					message: 'خطا',
					description: response.message,
				})
			} else {
				notification.success({
					message: 'عملیات موفق',
					description: 'چاه با موفقیت افزوده شد.',
				})
				setData(prev => ({
					...prev,
					wells: [...(prev?.wells || []), response.well],
				}))
				close(() => {
					form.resetFields()
				}, 'after')
			}
		} catch (err) {
			notification.error({
				message: 'خطا',
				description: err?.error?.message || 'خطایی رخ داده است',
			})
		}
	}, [form, wellApi, close, setData])

	return (
		<>
			<Button type='primary' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={5} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن چاه</span>
				</Flex>
			</Button>

			<Modal
				title='افزودن چاه'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				confirmLoading={wellApi.isLoading}
				loading={irrigatorsApi.isLoading}
				okText='ذخیره'
				cancelText='انصراف'
				forceRender
			>
				<WellForm form={form} irrigators={irrigatorsApi.data.users} />
			</Modal>
		</>
	)
}

export default AddWell
