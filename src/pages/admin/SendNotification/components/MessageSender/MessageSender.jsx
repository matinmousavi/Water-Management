import { useCallback } from 'react'
import { Button, Flex, Modal, Form, Input, Select, Checkbox, Row, Col, Grid } from 'antd'
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
	const screens = Grid.useBreakpoint()
	const isMobile = screens.xs


	const apiWells = useAPI()
	apiWells.init('wells')

	const wells = Array.isArray(apiWells.data?.wells) ? apiWells.data.wells : []

	const wellOptions = wells.map(well => ({
		label: well.title,
		value: well._id,
	}))

	const selectOptions = [{ label: 'همه چاه‌ها', value: 'ALL_WELLS' }, ...wellOptions]

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

			const payload = {
				...values,
				medium: 'sms',
			}

			await api.post('notifications', payload, {
				responseHandler: (current, res) => {
					return {
						...current,
						data: [res.data, ...(Array.isArray(current?.data) ? current.data : [])],
					}
				},
			})

			openNotification('success', 'عملیات موفق', 'پیام با موفقیت ارسال شد.')
			form.resetFields()
		} catch (err) {
			openNotification('error', 'خطا', err?.error?.message || 'خطایی رخ داده است')
		}
	}, [form, api, openNotification])

	return (
		<>
			<Button type='primary' onClick={() => open(handleOpen, 'before')}>
				<Flex gap={5} align='center' justify='center'>
					<MailOutlined />
					<span>ارسال پیامک</span>
				</Flex>
			</Button>

			<Modal title='ارسال پیامک' open={isOpen} onCancel={handleCancel} afterOpenChange={handleAfterChange} footer={null}>
				<Form
					form={form}
					className={styles['message-sender-form']}
					layout='horizontal'
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 18 }}
					colon={false}
					labelAlign='left'
					onFinish={handleSubmit}
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
						<Select mode='multiple' size={isMobile ? 'middle' : 'large'} placeholder='انتخاب' options={selectOptions} />
					</Form.Item>

					<Form.Item label='متن پیامک' name='message' rules={[{ required: true, message: 'متن پیامک الزامی است' }]}>
						<TextArea rows={4} />
					</Form.Item>

					<Flex gap={8} justify='end'>
						<Button onClick={handleCancel}>انصراف</Button>
						<Button type='primary' htmlType='submit' loading={api.isLoading}>
							ارسال
						</Button>
					</Flex>
				</Form>
			</Modal>
		</>
	)
}

export default MessageSender
