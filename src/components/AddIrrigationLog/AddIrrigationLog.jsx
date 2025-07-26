import { useState } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useAPI from '../../hooks/useAPI'
import useNotification from '../../hooks/useNotification'
import { useUser } from '../../contexts/UserContext'
import IrrigationLogForm from '../IrrigationLogForm/IrrigationLogForm'

const AddIrrigationLog = ({ setLogs, wellId, landId, page = 'well' }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [form] = Form.useForm()
	const irrigationApi = useAPI()
	const landsApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()

	if (isOpen) {
		landsApi.init('lands')
	}

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

			if (page === 'land') {
				payload = { wellId: values.wellId || wellId, landId: landId, notes: {} }

				if (isAdmin) {
					payload.startDate = values.startDate
					payload.startTime = values.startTime
					payload.endDate = values.endDate
					payload.endTime = values.endTime
					payload.isOngoing = values.isOngoing
					payload.endTime = values.isOngoing ? null : values.endTime
					payload.note = values.note
				} else {
					payload.startTime = values.startTime
					payload.endTime = null
				}
			} else if (page === 'well') {
				payload = { wellId, landId: values.landId }

				if (isAdmin) {
					payload.startDate = values.startDate
					payload.startTime = values.startTime
					payload.isOngoing = values.isOngoing
					payload.endTime = values.isOngoing ? null : values.endTime
					payload.endDate = values.isOngoing ? null : values.endDate
					payload.note = values.note
				} else {
					if (values.isStart) {
						payload.startDate = values.startDate
						payload.startTime = values.startTime
						payload.endTime = null
						payload.isStart = true
					}
					if (values.isEnd) {
						payload.endTime = values.endTime
						payload.endDate = values.endDate
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
					setLogs(prev => [...prev, response.irrigation])
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
			<Button className='style-btn' size='middle' onClick={open}>
				<Flex gap={8} align='center' justify='center'      >
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
				confirmLoading={irrigationApi.isLoading}
				loading={landsApi.isLoading}
				forceRender
			>
				<IrrigationLogForm page={page} mode='add' type={isAdmin ? 'admin' : 'irrigator'} form={form} lands={landsApi.data.lands} />
			</Modal>
		</>
	)
}

export default AddIrrigationLog
