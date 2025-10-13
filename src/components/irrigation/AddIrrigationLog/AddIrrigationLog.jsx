import { useState } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import { useUser } from '../../../contexts/UserContext'
import IrrigationLogForm from '../IrrigationLogForm/IrrigationLogForm'
import dayjs from 'dayjs'

const combineDateTime = (date, time) => {
	if (!date || !time) return date
	const validDate = dayjs(date)
	const validTime = dayjs(time)
	return validDate.hour(validTime.hour()).minute(validTime.minute()).second(0).millisecond(0)
}

const AddIrrigationLog = ({ setLogs, wellId, landId, page = 'well', landsData }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [form] = Form.useForm()
	const irrigationApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

	const open = () => setIsOpen(true)
	const close = () => setIsOpen(false)

	const handleCancel = () => {
		form.resetFields()
		close()
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let payload = {}

			// **FIX:** Combine date and time before creating payload
			const combinedStartDate = combineDateTime(values.startDate, values.startTime)
			const combinedEndDate = combineDateTime(values.endDate, values.endTime)

			if (page === 'land') {
				payload = { wellId: values.wellId || wellId, landId: landId, note: values.note || '' }
				if (isAdmin) {
					payload.startDate = combinedStartDate
					payload.startTime = combinedStartDate // Send combined object
					payload.endDate = combinedEndDate
					payload.endTime = combinedEndDate // Send combined object
					payload.isOngoing = values.isOngoing
				} else {
					payload.startTime = combinedStartDate
					payload.endTime = null
				}
			} else if (page === 'well') {
				if (typeof values.landId === 'string' && values.landId.startsWith('group-')) {
					const groupId = values.landId.replace('group-', '')
					payload = { wellId, landGroupId: groupId, note: values.note || '' }
				} else {
					payload = { wellId, landId: values.landId, note: values.note || '' }
				}

				if (isAdmin) {
					payload.startDate = combinedStartDate
					payload.startTime = combinedStartDate
					payload.isOngoing = values.isOngoing
					payload.endTime = values.isOngoing ? null : combinedEndDate
					payload.endDate = values.isOngoing ? null : combinedEndDate
				} else {
					// This part seems to have logic for starting/stopping irrigation, kept as is.
					if (values.isStart) {
						payload.startDate = combinedStartDate
						payload.startTime = combinedStartDate
						payload.endTime = null
						payload.isStart = true
					}
					if (values.isEnd) {
						payload.endTime = combinedEndDate
						payload.endDate = combinedEndDate
						payload.isStart = false
					}
				}
			}

			const response = await irrigationApi.post('irrigations', payload)
			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'لاگ ایجاد شد.')
				if (typeof setLogs === 'function') {
					setLogs(prev => [...prev, ...(response.irrigations || [response.irrigation])])
				}
				form.resetFields()
				handleCancel()
			}
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}

	return (
		<>
			<Button color='primary' variant='outlined' size='middle' onClick={open}>
				<Flex gap={8} align='center' justify='center'>
					<PlusCircleOutlined />
					<span>افزودن لاگ</span>
				</Flex>
			</Button>
			<Modal
				title='افزودن لاگ توزیع'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				okText='ثبت'
				cancelText='انصراف'
				confirmLoading={irrigationApi?.isLoading}
				forceRender
				destroyOnClose
			>
				<IrrigationLogForm
					page={page}
					mode='add'
					type={isAdmin ? 'admin' : 'irrigator'}
					form={form}
					lands={landsData?.lands || []}
					landGroups={landsData?.landGroups || []}
				/>
			</Modal>
		</>
	)
}

export default AddIrrigationLog
