import React, { useEffect } from 'react'
import { Modal, Form } from 'antd'
import dayjs from 'dayjs'
import useAPI from '../../hooks/useAPI'
import useNotification from '../../hooks/useNotification'
import { useUser } from '../../contexts/UserContext'

const IrrigationModal = ({ isOpen, setIsOpen, wellId, type = 'add', initialData = null, children }) => {
	const [form] = Form.useForm()
	const api = useAPI()
	const landsApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

	if (isOpen) {
		landsApi.init('lands')
	}

	useEffect(() => {
		if (isOpen && type === 'edit' && initialData) {
			const vals = {
				lands: initialData.land?._id,
				startNotes: initialData.notes?.start || '',
				endNotes: initialData.notes?.end || '',
			}

			if (isAdmin) {
				if (initialData.startTime) vals.startTime = dayjs(initialData.startTime)
				if (initialData.endTime) vals.endTime = dayjs(initialData.endTime)
				vals.isOngoing = initialData.endTime == null
			} else {
				vals.isStart = initialData.isStart
				vals.isEnd = !initialData.isStart
			}

			form.setFieldsValue(vals)
		}
	}, [isOpen, type, initialData, isAdmin, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const selectedLand = landsApi.data.lands.find(l => l._id === values.lands)
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
				response = await api.post('irrigations', payload)
			} else {
				const irrigationId = initialData?._id
				if (!irrigationId) {
					openNotification('error', 'خطا', 'شناسه لاگ نامشخص است.')
					return
				}
				response = await api.patch(`irrigations/${irrigationId}`, payload)
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
			confirmLoading={api.isLoading}
			loading={landsApi.isLoading}
			forceRender
		>
			{children &&
				React.cloneElement(children, {
					form,
					lands: landsApi.data.lands || [],
				})}
		</Modal>
	)
}

export default IrrigationModal
