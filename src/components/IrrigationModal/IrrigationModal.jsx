import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../hooks/useAPI'
import useNotification from '../../hooks/useNotification'
import { useUser } from '../../contexts/UserContext'

const IrrigationModal = ({ children, type = 'add', isOpen, setIsOpen, initialValue = null, setData, wellId }) => {
	const [form] = Form.useForm()
	const irrigationApi = useAPI()
	const selectApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

	if (isOpen) {
		selectApi.init('lands')
	}

	useEffect(() => {
		if (isOpen && type === 'edit' && initialValue) {
			const vals = {
				lands: initialValue.land?._id,
				startNotes: initialValue.notes?.start || '',
				endNotes: initialValue.notes?.end || '',
			}

			if (isAdmin) {
				if (initialValue.startTime) vals.startTime = initialValue.startTime
				if (initialValue.endTime) vals.endTime = initialValue.endTime
				vals.isOngoing = initialValue.endTime == null
			} else {
				vals.isStart = !!initialValue.startTime
				vals.isEnd = !!initialValue.endTime
			}

			form.setFieldsValue(vals)
		}
	}, [isOpen, type, initialValue, isAdmin, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const selectedLand = selectApi.data.lands.find(l => l._id === values.lands)
			if (!selectedLand) {
				openNotification('error', 'خطا', 'زمین انتخاب شده نامعتبر است.')
				return
			}

			const payload = { land: selectedLand._id, well: wellId, notes: {} }

			if (isAdmin) {
				payload.startTime = values.startTime
				payload.isOngoing = values.isOngoing
				payload.endTime = values.isOngoing ? null : values.endTime
			} else {
				if (values.isStart) {
					payload.startTime = new Date()
					payload.endTime = null
					payload.isStart = true
				}
				if (values.isEnd) {
					payload.endTime = new Date()
					payload.isStart = false
				}
			}

			if (values.startNotes) payload.notes.start = values.startNotes
			if (values.endNotes) payload.notes.end = values.endNotes

			let response
			if (type === 'add') {
				response = await irrigationApi.post('irrigations', payload)
			} else {
				const irrigationId = initialValue?._id
				if (!irrigationId) {
					openNotification('error', 'خطا', 'شناسه لاگ نامشخص است.')
					return
				}
				response = await irrigationApi.patch(`irrigations/${irrigationId}`, payload)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `لاگ ${type === 'add' ? 'ایجاد' : 'ویرایش'} شد.`)
				form.resetFields()
				handleCancel()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}

	return (
		<Modal
			title={type === 'add' ? 'افزودن لاگ توزیع' : 'ویرایش لاگ توزیع'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
			confirmLoading={irrigationApi.isLoading}
			loading={selectApi.isLoading}
			forceRender
		>
			{children &&
				React.cloneElement(children, {
					form,
					lands: selectApi.data.lands || [],
				})}
		</Modal>
	)
}

export default IrrigationModal
