import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'

const LandModal = ({ children, type = 'add', isOpen, setIsOpen, initialData = null, setData, setPageTitle }) => {
	const [form] = Form.useForm()
	const landApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && initialData) {
			form.setFieldsValue(initialData)
		} else {
			form.resetFields()
		}
	}, [type, initialData, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await landApi.post('lands', values)
			} else if (type === 'edit' && initialData?._id) {
				response = await landApi.patch(`lands/${initialData._id}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `زمین با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد`)
				setData(prev => (type === 'add' ? [...prev, response.land] : prev.map(l => (l._id === response.land._id ? response.land : l))))
				handleCancel()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطا در ارسال داده‌ها')
		}
	}

	const childWithProps = React.isValidElement(children) ? React.cloneElement(children, { form }) : children

	return (
		<Modal
			title={type === 'add' ? 'افزودن زمین' : 'ویرایش زمین'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={landApi.isLoading}
		>
			{childWithProps}
		</Modal>
	)
}

export default LandModal
