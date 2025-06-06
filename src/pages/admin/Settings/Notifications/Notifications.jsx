import { useEffect, useState } from 'react'
import { Flex, Card, Typography, Input, Button, Row, Col, Form, Space } from 'antd'
import BreadCrumbs from '../../../../components/BreadCrumbs/BreadCrumbs'
import useAPI from '../../../../hooks/useAPI'
import Loading from '../../../../components/Loading/Loading'
import useNotification from '../../../../hooks/useNotification'

const keyTitles = {
	otp: 'پیام تأیید ورود (OTP)',
	irrigation_start: 'شروع آبرسانی',
	irrigation_end: 'پایان آبرسانی',
}

const renderPlaceholders = (placeholders = []) => {
	if (!placeholders.length) return null

	return (
		<Flex vertical gap={4}>
			<Typography.Text strong>مقادیر قابل استفاده در پیام:</Typography.Text>
			<Flex vertical gap={8}>
				{placeholders.map(placeholder => (
					<Space key={placeholder.key} direction='horizontal'>
						<Typography.Text code copyable>
							{`{{${placeholder.key}}}`}
						</Typography.Text>
						<Typography.Text type='secondary'>{placeholder.description}</Typography.Text>
					</Space>
				))}
			</Flex>
		</Flex>
	)
}

const Notifications = () => {
	const [form] = Form.useForm()
	const [savingKey, setSavingKey] = useState(null)
	const { openNotification } = useNotification()

	const api = useAPI()
	api.init('messageTemplates')

	useEffect(() => {
		if (api.data.templates) {
			const initialValues = {}
			api.data.templates.forEach(item => {
				initialValues[item.key] = item.text
			})
			form.setFieldsValue(initialValues)
		}
	}, [api.data.templates, form])

	const handleSave = async key => {
		try {
			setSavingKey(key)
			const value = form.getFieldValue(key)
			const response = await api.put(`messageTemplates/${key}`, { text: value })
			response.error
				? openNotification('error', 'عملیات ناموفق', `ذخیره پیام «${keyTitles[key]}» ناموفق بود`)
				: openNotification('success', 'عملیات موفق', `ذخیره پیام «${keyTitles[key]}» با موفقیت انجام شد`)
		} catch {
			openNotification('error', 'عملیات ناموفق', `ذخیره پیام «${keyTitles[key]}» با خطا مواجه شد`)
		} finally {
			setSavingKey(null)
		}
	}

	if (api.isLoading || !api.data) return <Loading />

	const getTemplate = key => api.data.templates.find(t => t.key === key)

	return (
		<Flex vertical gap={32}>
			<BreadCrumbs />
			<Typography.Title level={1} className='text-page-title'>
				اطلاع رسانی ها - پیامکی
			</Typography.Title>
			<Form form={form} layout='vertical'>
				<Flex vertical gap={16}>
					<Card>
						<Flex vertical gap={16}>
							<Typography.Title level={2} className='text-h2'>
								اطلاع رسانی OTP
							</Typography.Title>
							<Typography.Text>پیامک حاوی کد تأیید هنگام ورود کاربر به سیستم ارسال می‌شود.</Typography.Text>

							<Form.Item name='otp'>
								<Input.TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
							</Form.Item>

							{renderPlaceholders(getTemplate('otp')?.placeholders)}

							<Flex justify='end'>
								<Button type='primary' loading={savingKey === 'otp'} onClick={() => handleSave('otp')}>
									ذخیره
								</Button>
							</Flex>
						</Flex>
					</Card>

					<Card>
						<Flex vertical gap={20}>
							<Typography.Title level={2} className='text-h2'>
								اطلاع رسانی آبرسانی
							</Typography.Title>
							<Typography.Text>پیامک حاوی اطلاعات آبرسانی به میراب و مالک زمین ارسال می‌شود.</Typography.Text>

							<Row gutter={16}>
								<Col span={12}>
									<Flex vertical gap={8}>
										<Flex justify='space-between' align='center'>
											<Typography.Text>شروع آبرسانی</Typography.Text>
											<Button type='primary' loading={savingKey === 'irrigation_start'} onClick={() => handleSave('irrigation_start')}>
												ذخیره
											</Button>
										</Flex>
										<Form.Item name='irrigation_start'>
											<Input.TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
										</Form.Item>
										{renderPlaceholders(getTemplate('irrigation_start')?.placeholders)}
									</Flex>
								</Col>

								<Col span={12}>
									<Flex vertical gap={8}>
										<Flex justify='space-between' align='center'>
											<Typography.Text>پایان آبرسانی</Typography.Text>
											<Button type='primary' loading={savingKey === 'irrigation_end'} onClick={() => handleSave('irrigation_end')}>
												ذخیره
											</Button>
										</Flex>
										<Form.Item name='irrigation_end'>
											<Input.TextArea rows={4} placeholder='متن پیامک را وارد کنید' />
										</Form.Item>
										{renderPlaceholders(getTemplate('irrigation_end')?.placeholders)}
									</Flex>
								</Col>
							</Row>
						</Flex>
					</Card>
				</Flex>
			</Form>
		</Flex>
	)
}

export default Notifications
