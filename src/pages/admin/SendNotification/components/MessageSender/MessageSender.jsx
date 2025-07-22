import { useCallback } from 'react'
import { Button, Flex, Modal, Form, Input, Select } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useNotification from '../../../../../hooks/useNotification'

import styles from './MessageSender.module.css'

const { TextArea } = Input

const MessageSender = ({ api }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		form.resetFields()
	}

	const handleCancel = useCallback(() => {
		close(() => {
			form.resetFields()
		}, 'after')
	}, [form, close])

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()

			const response = await api.post('notifications', values, {
				optimisticUpdate: current => current,
				responseHandler: (current, res) => {
					openNotification('success', 'عملیات موفق', 'پیام با موفقیت ارسال شد.')

					if (!current?.notifications) {
						return { notifications: [res.notification] }
					}

					return {
						...current,
						notifications: [res.notification, ...current.notifications],
					}
				},
			})

			if (!response?.error) {
				handleCancel()
			}
		} catch (err) {
			console.error('Submission error:', err)
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, api, openNotification, handleCancel])

	return (
		<>
			<Button type='primary' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={5} align='center' justify='center'>
					<MailOutlined />
					<span>ارسال پیامک</span>
				</Flex>
			</Button>

			<Modal
				title='ارسال پیامک'
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				afterOpenChange={handleAfterChange}
				confirmLoading={api.isLoading}
				okText='ثبت'
				cancelText='انصراف'
			>
				<Form
					form={form}
					className={styles['message-sender-form']}
					layout='horizontal'
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 18 }}
					colon={false}
					labelAlign='left'
				>
					<Form.Item label='گروه مخاطبان' name='recipientGroup' rules={[{ required: true, message: 'گروه مخاطبان را انتخاب کنید' }]}>
						<Select
							size='large'
							placeholder='انتخاب'
							options={[
								{ value: 'all', label: 'همه' },
								{ value: 'admin', label: 'ادمین‌ها' },
								{ value: 'irrigator', label: 'میرآب‌ها' },
								{ value: 'landOwner', label: 'مالکین زمین' },
							]}
						/>
					</Form.Item>

					<Form.Item label='متن پیامک' name='message' rules={[{ required: true, message: 'متن پیامک الزامی است' }]}>
						<TextArea rows={4} />
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

export default MessageSender
