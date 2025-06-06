import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'

const LandModal = ({ children, type = 'add', isOpen, setIsOpen, initialValue = null, setData, setPageTitle }) => {
	const [form] = Form.useForm()
	const landApi = useAPI()
	const userApi = useAPI()
	const wellApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && initialValue) {
			const patchedInitialValue = {
				...initialValue,
				owner: initialValue.owner?._id,
				wellId: initialValue.wells?.[0]?._id || undefined,
			}
			form.setFieldsValue(patchedInitialValue)
		} else {
			form.resetFields()
		}
	}, [type, initialValue, form])

	if (isOpen) {
		userApi.init('users', { role: 'landOwner' })
		wellApi.init('wells')
	}

	const handleCancel = () => {
		if (type === 'add') {
			form.resetFields()
		}
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await landApi.post('lands', values)
			} else if (type === 'edit' && initialValue?._id) {
				response = await landApi.patch(`lands/${initialValue._id}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `زمین با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد`)
				setData(response)
				handleCancel()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطا در ارسال داده‌ها')
		}
	}

	const landOwners = userApi.data?.users || []
	const wells = wellApi.data?.wells || []

	const childWithProps = React.isValidElement(children)
		? React.cloneElement(children, {
				form,
				landOwners,
				wells,
		  })
		: children

	return (
		<Modal
			title={type === 'add' ? 'افزودن زمین' : 'ویرایش زمین'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ثبت'
			cancelText='انصراف'
			confirmLoading={landApi.isLoading}
		>
			{childWithProps}
		</Modal>
	)
}

export default LandModal
