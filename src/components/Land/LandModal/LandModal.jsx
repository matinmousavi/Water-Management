import { useEffect } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import LandForm from '../LandForm/LandForm'

const LandModal = ({ type = 'add', landData = null, setLandsData, open, onClose }) => {
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && landData) {
			form.setFieldsValue(landData)
		} else {
			form.resetFields()
		}
	}, [type, landData, form])

	const handleCancel = () => {
		form.resetFields()
		onClose()
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await api.post('lands', values)
			} else if (type === 'edit' && landData?._id) {
				response = await api.patch(`lands/${landData._id}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `زمین با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد`)
				setLandsData(prev => (type === 'add' ? [...prev, response.land] : prev.map(l => (l._id === response.land._id ? response.land : l))))
				handleCancel()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطا در ارسال داده‌ها')
		}
	}

	return (
		<Modal
			title={type === 'add' ? 'فرم افزودن زمین' : 'فرم ویرایش زمین'}
			open={open}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={api.isLoading}
		>
			<LandForm form={form} />
		</Modal>
	)
}

export default LandModal
