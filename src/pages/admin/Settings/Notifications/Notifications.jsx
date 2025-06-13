import { useEffect, useState } from 'react'
import { Flex, Card, Typography, Input, Button, Row, Col, Form, Space } from 'antd'
import BreadCrumbs from '../../../../components/BreadCrumbs/BreadCrumbs'
import useAPI from '../../../../hooks/useAPI'
import Loading from '../../../../components/Loading/Loading'
import useNotification from '../../../../hooks/useNotification'
import styles from './Notifications.module.css'
import { EditOutlined } from '@ant-design/icons'

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
	console.log(api.data?.templates)

	const getTemplate = key => api.data.templates.find(t => t.key === key)

	return (
		<Flex vertical gap={32}>
			<BreadCrumbs />
			<Typography.Title level={1} className='text-page-title'>
				تنظیمات اطلاع رسانی
			</Typography.Title>
			<Flex vertical className={styles.list}>
				<Card className={styles.item}>
					<Flex vertical>
						<Flex align='center' className={styles.itemContainer} justify='space-between'>
							<Typography.Title className='text-page-title'>اطلاع رسانی کد تایید</Typography.Title>
							<Button className='style-btn' size='middle' type='default'>
								<Flex gap={8}>
									<EditOutlined />
									<span>ویرایش</span>
								</Flex>
							</Button>
						</Flex>
						<Typography.Text className={styles.text}>
							لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در
							ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد فراوان جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را
							برای طراحان رایانه ای علی الخصوص طراحان خلاقی، و فرهنگ پیشرو در زبان فارسی ایجاد کرد.
						</Typography.Text>
					</Flex>
				</Card>
			</Flex>
		</Flex>
	)
}

export default Notifications
