import { useEffect } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import React from 'react'

const LandModal = ({ type = 'add', landData = null, setLandsData, isOpen, setIsOpen, children }) => {
	const [form] = Form.useForm()
	const api = useAPI()
	const { openNotification } = useNotification()
	const land = api.data?.land || landData
	const selectApi = useAPI()
	useEffect(() => {
		if (type === 'edit' && land) {
			form.setFieldsValue(land)
		} else {
			form.resetFields()
		}
	}, [type, land, form])

	const handleCancel = () => {
		if (type === 'add') {
			form.resetFields()
		}
		setIsOpen(false)
	}

	if (isOpen) {
		selectApi.init('lands')
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await api.post('lands', values)
			} else if (type === 'edit' && land?._id) {
				response = await api.patch(`lands/${land._id}`, values)
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

	const childWithFormProp = React.isValidElement(children) ? React.cloneElement(children, { form, dataSelects: selectApi.data?.well }) : children

	return (
		<Modal
			title={type === 'add' ? 'فرم افزودن زمین' : 'فرم ویرایش زمین'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ثبت'
			cancelText='انصراف'
			confirmLoading={api.isLoading}
			loading={selectApi.isLoading}
		>
			{childWithFormProp}
		</Modal>
	)
}

export default LandModal
