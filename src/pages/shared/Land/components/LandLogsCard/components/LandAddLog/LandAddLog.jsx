import { useState } from 'react'
import { Button, Flex, Modal, Form } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'
import { useUser } from '../../../../../../../contexts/UserContext'
import AdminLandLogForm from '../AdminLandLogForm/AdminLandLogForm'
import IrrigatorLandLogForm from '../IrrigatorLandLogForm/IrrigatorLandLogForm'
import { useParams } from 'react-router'

const LandAddLog = ({ setLogs }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [form] = Form.useForm()
	const irrigationApi = useAPI()
	const landsApi = useAPI()
	const { openNotification } = useNotification()
	const { isAdmin } = useUser()
	const { wellId } = useParams()

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

			const payload = { landId: values.landId, wellId, notes: {} }

			if (isAdmin) {
				payload.startDate = values.startDate
				payload.startTime = values.startTime
				payload.isOngoing = values.isOngoing
				payload.endTime = values.isOngoing ? null : values.endTime
			} else {
				if (values.isStart) {
					payload.startDate = new Date()
					payload.startTime = new Date()
					payload.endTime = null
					payload.isStart = true
				}
				if (values.isEnd) {
					payload.endDate = new Date()
					payload.endTime = new Date()
					payload.isStart = false
				}
			}

			if (values.startNotes) payload.notes.start = values.startNotes
			if (values.endNotes) payload.notes.end = values.endNotes

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
				<Flex gap={8}>
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
				{isAdmin ? (
					<AdminLandLogForm form={form} lands={landsApi.data.lands} />
				) : (
					<IrrigatorLandLogForm type='add' form={form} lands={landsApi.data.lands} />
				)}
			</Modal>
		</>
	)
}

export default LandAddLog
