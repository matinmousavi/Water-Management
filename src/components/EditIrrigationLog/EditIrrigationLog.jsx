import { useState, useEffect, useCallback } from 'react'
import { Modal, Form } from 'antd'
import { useUser } from '../../contexts/UserContext'
import useAPI from '../../hooks/useAPI'
import useNotification from '../../hooks/useNotification'
import IrrigationLogForm from '../IrrigationLogForm/IrrigationLogForm'
import dayjs from 'dayjs'

const EditIrrigationLog = ({ data, setLogs, onClose, page = 'well' }) => {
	const [isOpen, setIsOpen] = useState(true)
	const [form] = Form.useForm()
	const irrigationApi = useAPI()
	const landsApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

	landsApi.init('lands')

	useEffect(() => {
		if (isOpen && data) {
			form.setFieldsValue({
				...data,
				landId: data.land?._id,
				startTime: data.startedAt ? dayjs(data.startedAt) : null,
				startDate: data.startedAt ? dayjs(data.startedAt) : null,
				endTime: data.endedAt ? dayjs(data.endedAt) : null,
				endDate: data.endedAt ? dayjs(data.endedAt) : null,
			})
		}
	}, [isOpen, data, form])

	const closeModal = useCallback(() => {
		setIsOpen(false)
		form.resetFields()
		onClose?.()
	}, [form, onClose])

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()
			const payload = {}

			if (isAdmin) {
				payload.startTime = values.startTime
				payload.startDate = values.startDate
				payload.isOngoing = values.isOngoing

				if (!values.isOngoing) {
					payload.endDate = values.endDate
					payload.endTime = values.endTime
				}
			} else {
				payload.endTime = values.endTime
			}

			payload.note = values.note

			const response = await irrigationApi.patch(`irrigations/${data._id}`, payload)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'ویرایش موفق', 'لاگ با موفقیت ویرایش شد.')
				setLogs(prev => prev.map(item => (item._id === data._id ? { ...item, ...response.irrigation } : item)))
				closeModal()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, isAdmin, data, irrigationApi, openNotification, setLogs, closeModal])

	return (
		<Modal
			title='ویرایش لاگ توزیع'
			open={isOpen}
			onOk={handleSubmit}
			onCancel={closeModal}
			okText='ثبت'
			cancelText='انصراف'
			confirmLoading={irrigationApi.isLoading}
			loading={landsApi.isLoading}
		>
			<IrrigationLogForm page={page} mode='edit' type={isAdmin ? 'admin' : 'irrigator'} form={form} lands={landsApi.data?.lands || []} />
		</Modal>
	)
}

export default EditIrrigationLog
