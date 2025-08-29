import { Button, Flex, Form, Modal } from 'antd'
import { PlusCircleOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../../../hooks/useModal'
import GroupFormLogs from '../GroupFormLogs/GroupFormLogs'
import useAPI from '../../../../../../../../../hooks/useAPI'
import dayjs from 'dayjs'
import { useState } from 'react'

const GroupEditLogs = ({ onLogAdded, groupId, wellId }) => {
	const [form] = Form.useForm()
	const { open, isOpen, close } = useModal()
	const api = useAPI()
	const [submitting, setSubmitting] = useState(false)

	const handleCancel = () => {
		form.resetFields()
		close()
	}

	const handleSubmit = async () => {
		if (submitting) return
		setSubmitting(true)

		try {
			const values = await form.validateFields()

			const startDateTime = dayjs(values.startDate).hour(dayjs(values.startTime).hour()).minute(dayjs(values.startTime).minute()).second(0).toISOString()

			let endDateTime = null
			if (values.endDate && values.endTime) {
				endDateTime = dayjs(values.endDate).hour(dayjs(values.endTime).hour()).minute(dayjs(values.endTime).minute()).second(0).toISOString()
			}

			const payload = {
				landGroupId: groupId,
				wellId,
				startTime: startDateTime,
				endTime: endDateTime,
				isOngoing: values.isOngoing || false,
				note: values.note || '',
			}
			console.log('ارسال به بک‌اند:', payload)

			const res = await api.post('irrigations', payload)

			if (res?.irrigations?.[0]) {
				onLogAdded?.(res.irrigations[0])
			}

			form.resetFields()
			close()
		} catch (e) {
			console.error('خطا در ثبت لاگ:', e)
		} finally {
			setSubmitting(false)
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
				onCancel={handleCancel}
				footer={
					<Flex gap={12} justify='end'>
						<Button onClick={handleCancel}>انصراف</Button>
						<Button type='primary' loading={submitting} onClick={handleSubmit}>
							ثبت
						</Button>
					</Flex>
				}
				forceRender
			>
				<GroupFormLogs form={form} />
			</Modal>
		</>
	)
}

export default GroupEditLogs
