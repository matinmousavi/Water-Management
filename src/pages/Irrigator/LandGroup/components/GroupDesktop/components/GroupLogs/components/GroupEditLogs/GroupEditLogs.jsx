import { Button, Flex, Form, Modal } from 'antd'
import { PlusCircleOutlined, EditOutlined } from '@ant-design/icons'
import useModal from '../../../../../../../../../hooks/useModal'
import GroupFormLogs from '../GroupFormLogs/GroupFormLogs'
import useAPI from '../../../../../../../../../hooks/useAPI'
import dayjs from 'dayjs'
import { useState, useEffect } from 'react'
import useNotification from '../../../../../../../../../hooks/useNotification'

const GroupEditLogs = ({ mode = 'add', groupId, wellId, log, onLogAdded, onLogUpdated }) => {
	const [form] = Form.useForm()
	const { open, isOpen, close } = useModal()
	const api = useAPI()
	const [submitting, setSubmitting] = useState(false)
	const { openNotification } = useNotification()

	useEffect(() => {
		if (mode === 'edit' && log) {
			form.setFieldsValue({
				endDate: log.endedAt ? dayjs(log.endedAt) : null,
				endTime: log.endedAt ? dayjs(log.endedAt) : null,
				note: log.note || '',
			})
		}
	}, [mode, log, form])

	const handleCancel = () => {
		form.resetFields()
		close()
	}

	const handleSubmit = async () => {
		if (submitting) return
		setSubmitting(true)

		try {
			const values = await form.validateFields()

			if (mode === 'add') {
				const startDateTime = values.isOngoing
					? dayjs().toISOString()
					: dayjs(values.startDate).hour(dayjs(values.startTime).hour()).minute(dayjs(values.startTime).minute()).second(0).toISOString()

				const payload = {
					landGroupId: groupId,
					wellId,
					startTime: startDateTime,
					endTime: null,
					isOngoing: values.isOngoing || false,
					note: values.note || '',
				}

				const res = await api.post('irrigations', payload)
				if (res?.irrigations?.[0]) {
					onLogAdded?.(res.irrigations[0])
				}
				openNotification('success', 'عملیات موفق', 'لاگ ایجاد شد')
			} else if (mode === 'edit' && log) {
				let endDateTime = null
				if (values.endDate && values.endTime) {
					endDateTime = dayjs(values.endDate).hour(dayjs(values.endTime).hour()).minute(dayjs(values.endTime).minute()).second(0).toISOString()
				}

				const payload = {
					endTime: endDateTime,
					note: values.note || '',
				}

				const res = await api.patch(`irrigations/${log._id}`, payload)
				if (res?.irrigation) {
					onLogUpdated?.(res.irrigation)
				}
				openNotification('success', 'عملیات موفق', 'لاگ ویرایش شد')
			}

			form.resetFields()
			close()
		} catch (error) {
			console.error('خطا:', error)
			openNotification('error', 'خطا', error.message)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<>
			{mode === 'add' ? (
				<Button color='primary' variant='outlined' size='middle' onClick={open}>
					<Flex gap={8} align='center' justify='center'>
						<PlusCircleOutlined />
						<span>افزودن لاگ</span>
					</Flex>
				</Button>
			) : (
				<EditOutlined className='edit-icon' onClick={open} />
			)}

			<Modal
				title={mode === 'add' ? 'افزودن لاگ توزیع' : 'ویرایش لاگ توزیع'}
				open={isOpen}
				onCancel={handleCancel}
				footer={
					<Flex gap={12} justify='end'>
						<Button onClick={handleCancel}>انصراف</Button>
						<Button type='primary' loading={submitting} onClick={handleSubmit}>
							{mode === 'add' ? 'ثبت' : 'ثبت تغییرات'}
						</Button>
					</Flex>
				}
				forceRender
			>
				<GroupFormLogs form={form} type={mode === 'add' ? 'admin' : 'irrigator'} mode={mode} />
			</Modal>
		</>
	)
}

export default GroupEditLogs
