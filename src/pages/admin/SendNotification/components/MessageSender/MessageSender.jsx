import { useCallback } from 'react'
import { Button, Flex, Modal, Form, Input, Select, Checkbox, Row, Col } from 'antd'
import { MailOutlined } from '@ant-design/icons'
import useModal from '../../../../../hooks/useModal'
import useNotification from '../../../../../hooks/useNotification'

import styles from './MessageSender.module.css'
import useAPI from '../../../../../hooks/useAPI'

const { TextArea } = Input

const MessageSender = ({ api }) => {
	const { isOpen, open, close, handleAfterChange } = useModal()
	const [form] = Form.useForm()
	const { openNotification } = useNotification()
	const apiWells = useAPI()
	apiWells.init('wells')
	const wells = apiWells.data?.wells
	console.log(apiWells.data?.wells)

	const handleOpen = () => {
		form.resetFields()
	}

	const handleCancel = useCallback(() => {
		close(() => {
			form.resetFields()
		}, 'after')
	}, [form, close])
	const wellOptions = wells?.map(well => ({
		label: well.title,
		value: well._id,
	}))

	const selectOptions = [{ label: 'همه چاه‌ها', value: 'ALL_WELLS' }, ...(wellOptions || [])]

	const handleSubmit = useCallback(async () => {
		try {
			const values = await form.validateFields()

			const payload = {
				...values,
				medium: 'sms',
			}

			console.log('📦 Payload to send:', payload)

			const response = await api.post('notifications', payload, {
				optimisticUpdate: current => current,
				responseHandler: (current, res) => {
					openNotification('success', 'عملیات موفق', 'پیام با موفقیت ارسال شد.')
					return {
						...current,
						notifications: [res.data, ...(current?.notifications || [])],
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
					<Form.Item label='مخاطبین' name='recipientGroup' rules={[{ required: true, message: 'گروه مخاطبان را انتخاب کنید' }]}>
						<Checkbox.Group>
							<Row>
								<Col span={22}>
									<Checkbox value='landOwner'>مالکان زمین</Checkbox>
								</Col>
								<Col span={22}>
									<Checkbox value='irrigator'>میرآب‌ها</Checkbox>
								</Col>
							</Row>
						</Checkbox.Group>
					</Form.Item>

					<Form.Item label='چاه' name='wellIds' rules={[{ required: true, message: 'چاه ها را انتخاب کنید' }]}>
						<Select mode='multiple' size='large' placeholder='انتخاب' options={selectOptions} />
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
