import { Button, Flex, Form, Modal } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useCallback } from 'react'

import LandForm from '../../../../../../../components/Land/LandForm/LandForm'
import useModal from '../../../../../../../hooks/useModal'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const LandEdit = ({ initialValue, setData, setPageTitle }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const landApi = useAPI()
	const userApi = useAPI()
	const wellApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		userApi.init('users', { role: 'landOwner' })
		wellApi.init('wells')

		if (initialValue) {
			form.setFieldsValue({
				...initialValue,
				owner: initialValue.owner?._id,
				wellId: initialValue.wells?.[0]?._id || undefined,
			})
		}
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			const response = await landApi.patch(`lands/${initialValue._id}`, values)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت ویرایش شد')
				setData?.({ land: response.land })

				console.log(response)

				if (typeof setPageTitle === 'function') {
					const newTitle = response.land.name
					setPageTitle(prev => (newTitle !== prev ? newTitle : prev))
				}
				close(() => form.resetFields(), 'after')
			}
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', err?.error?.message || 'خطا در ارسال داده‌ها')
		}
	}, [form, landApi, initialValue, setData, close, openNotification])

	return (
		<>
			<Button type='default' size='middle' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={8}>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<Modal
				title='ویرایش زمین'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				okText='ثبت'
				cancelText='انصراف'
				confirmLoading={landApi.isLoading}
				loading={userApi.isLoading || wellApi.isLoading}
			>
				<LandForm form={form} landOwners={userApi.data?.users || []} wells={wellApi.data?.wells || []} />
			</Modal>
		</>
	)
}

export default LandEdit
