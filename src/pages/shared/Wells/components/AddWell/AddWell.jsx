import { useCallback } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useAPI from '../../../../../hooks/useAPI'
import WellForm from '../../../../../components/Well/WellForm/WellForm'
import useNotification from '../../../../../hooks/useNotification'

const AddWell = () => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const wellApi = useAPI()
	const irrigatorsApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		irrigatorsApi.init('users', { role: 'irrigator' })
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			const tempId = 'temp-' + Date.now()

			await wellApi.post('wells', values, {
				optimisticUpdate: prev => ({
					...prev,
					wells: [...(prev?.wells || []), { ...values, _id: tempId }],
				}),
				rollback: prev => ({
					...prev,
					wells: prev?.wells?.filter(w => w._id !== tempId) || [],
				}),
				responseHandler: (prev, res) => ({
					...prev,
					wells: prev.wells.map(w => (w._id === tempId ? res.well : w)),
				}),
			})

			openNotification('success', 'عملیات موفق', 'چاه با موفقیت افزوده شد.')
			close(() => form.resetFields(), 'after')
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', err?.error?.message || err?.message || 'خطایی رخ داده است')
		}
	}, [form, wellApi, close, openNotification])

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
				okText='ثبت'
				cancelText='انصراف'
				forceRender
			>
				<WellForm form={form} irrigators={irrigatorsApi.data?.users || []} />
			</Modal>
		</>
	)
}

export default AddWell
