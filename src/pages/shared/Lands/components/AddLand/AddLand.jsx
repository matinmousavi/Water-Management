import React, { useCallback } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import LandForm from '../../../../../components/Land/LandForm/LandForm'

const AddLand = ({ setData }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const landApi = useAPI()
	const userApi = useAPI()
	const wellApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		userApi.init('users', { role: 'landOwner' })
		wellApi.init('wells')
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			const response = await landApi.post('lands', values)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت افزوده شد.')
				console.log(response)
				setData(prev => ({
					...prev,
					lands: [...(prev?.lands || []), response.land],
				}))
				close(() => form.resetFields(), 'after')
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, landApi, setData, close, openNotification])

	const landOwners = userApi.data?.users || []
	const wells = wellApi.data?.wells || []

	return (
		<>
			<Button type='primary' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={5} align='center' justify='center'>
					<PlusOutlined />
					<span>افزودن زمین</span>
				</Flex>
			</Button>

			<Modal
				title='افزودن زمین'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				confirmLoading={landApi.isLoading}
				okText='ثبت'
				cancelText='انصراف'
				forceRender
				centered
			>
				<LandForm form={form} landOwners={landOwners} wells={wells} />
			</Modal>
		</>
	)
}

export default AddLand
