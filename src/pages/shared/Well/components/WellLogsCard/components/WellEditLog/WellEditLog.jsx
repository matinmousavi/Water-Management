import { useState } from 'react'
import { Modal, Form } from 'antd'
import { useUser } from '../../../../../../../contexts/UserContext'
import useNotification from '../../../../../../../hooks/useNotification'
import useAPI from '../../../../../../../hooks/useAPI'
import AdminWellLogForm from '../AdminWellLogForm/AdminWellLogForm'
import IrrigatorWellLogForm from '../IrrigatorWellLogForm/IrrigatorWellLogForm'
import dayjs from 'dayjs'

const WellEditLog = ({ logData, setLogs, onClose }) => {
	const [isOpen, setIsOpen] = useState(true)
	const [form] = Form.useForm()
	const irrigationApi = useAPI()
	const landsApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

	const close = () => {
		setIsOpen(false)
		onClose?.()
	}

	const handleCancel = () => {
		form.resetFields()
		close()
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			const payload = { notes: {} }

			if (isAdmin) {
				payload.startTime = values.startTime
				payload.startDate = values.startDate
				payload.isOngoing = values.isOngoing
				payload.endDate = values.isOngoing ? null : values.endDate
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

			const response = await irrigationApi.patch(`irrigations/${logData._id}`, payload)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'ویرایش موفق', 'لاگ با موفقیت ویرایش شد.')
				if (typeof setLogs === 'function') {
					setLogs(prev => prev.map(item => (item._id === logData._id ? { ...item, ...response.irrigation } : item)))
				}
				form.resetFields()
				close()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}

	const initialFormValues = () => {
		const values = {
			landId: logData.land?._id,
			startNotes: logData.notes?.start || '',
			endNotes: logData.notes?.end || '',
		}

		if (isAdmin) {
			values.startTime = dayjs(logData.start)
			values.endTime = dayjs(logData.end)
			values.startDate = dayjs(logData.start)
			values.endDate = dayjs(logData.end)
			values.isOngoing = !logData.end
		} else {
			values.isStart = !!logData.start
			values.isEnd = !!logData.end
		}

		form.setFieldsValue(values)
	}

	// Trigger init lands and set form values on mount
	landsApi.init('lands')
	useState(() => {
		initialFormValues()
	})

	return (
		<Modal
			title='ویرایش لاگ توزیع'
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ثبت'
			cancelText='انصراف'
			confirmLoading={irrigationApi.isLoading}
			loading={landsApi.isLoading}
			forceRender
		>
			{isAdmin ? (
				<AdminWellLogForm form={form} lands={landsApi.data.lands} />
			) : (
				<IrrigatorWellLogForm type='edit' form={form} lands={landsApi.data.lands} />
			)}
		</Modal>
	)
}

export default WellEditLog
