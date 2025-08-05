import { Button, Flex, Form, Modal } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import { useCallback } from 'react'
import dayjs from 'dayjs'

import WellForm from '../../../../../../../components/Well/WellForm/WellForm'
import useModal from '../../../../../../../hooks/useModal'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const EditWell = ({ initialValue, setData, setPageTitle }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const wellApi = useAPI()
	const irrigatorsApi = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		irrigatorsApi.init('users', { role: 'irrigator' })

		if (initialValue) {
			form.setFieldsValue({
				...initialValue,
				irrigator: initialValue.irrigator?._id || null,
				cycleStartDate: initialValue.cycleStartDate ? dayjs(initialValue.cycleStartDate) : null,
				startTime: initialValue.offTime?.start ? dayjs(initialValue.offTime.start) : null,
				endTime: initialValue.offTime?.end ? dayjs(initialValue.offTime.end) : null,
			})
		}
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()

			const response = await wellApi.patch(`wells/${initialValue._id}`, values)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'چاه با موفقیت ویرایش شد.')
				setData?.({ well: response.well })

				if (typeof setPageTitle === 'function') {
					const newTitle = response.well.title
					setPageTitle(prev => (newTitle !== prev ? newTitle : prev))
				}

				close(() => form.resetFields(), 'after')
			}
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', err?.error?.message || 'خطا در ارسال اطلاعات')
		}
	}, [form, wellApi, initialValue, setData, close, openNotification, setPageTitle])

	return (
		<>
			<Button color='primary' variant='outlined' size='middle' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={8} align='center' justify='center'>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<Modal
				title='ویرایش چاه'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				okText='ثبت'
				cancelText='انصراف'
				confirmLoading={wellApi.isLoading}
				loading={irrigatorsApi.isLoading}
				forceRender
			>
				<WellForm form={form} irrigators={irrigatorsApi.data?.users || []} />
			</Modal>
		</>
	)
}

export default EditWell
