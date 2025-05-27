import { Modal, Form } from 'antd'
import { useEffect } from 'react'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import LandForm from '../LandForm/LandForm'

const LandModal = ({ open, onClose, setLandsData }) => {
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (!open) form.resetFields()
	}, [open])

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const response = await api.post('lands', values)

			if (response.error) {
				openNotification('error', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت اضافه شد')
				setLandsData(prev => [...prev, response.land])
				onClose()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطا در ارسال داده‌ها')
		}
	}

	return (
		<Modal title='فرم افزودن زمین' open={open} onOk={handleSubmit} onCancel={onClose} okText='ذخیره' cancelText='انصراف'>
			<LandForm form={form} />
		</Modal>
	)
}

export default LandModal
