import { useEffect, useState } from 'react'
import { Flex, Card, Typography, Form } from 'antd'
import BreadCrumbs from '../../../../components/BreadCrumbs/BreadCrumbs'
import useAPI from '../../../../hooks/useAPI'
import Loading from '../../../../components/Loading/Loading'
import useNotification from '../../../../hooks/useNotification'
import styles from './Notifications.module.css'
import EditNotifications from './components/EditNotifications'

const Notifications = () => {
	const [form] = Form.useForm()
	const [templates, setTemplates] = useState([])
	const { openNotification } = useNotification()
	const api = useAPI()

	api.init('messageTemplates')

	useEffect(() => {
		if (api.data?.templates) {
			setTemplates(api.data.templates)
			const initialValues = {}
			api.data.templates.forEach(item => {
				initialValues[item.key] = item.text
			})
			form.setFieldsValue(initialValues)
		}
	}, [api.data.templates, form])

	const handleUpdate = updatedTemplate => {
		const newTemplates = templates.map(t => (t._id === updatedTemplate._id ? updatedTemplate : t))

		setTemplates(newTemplates)
		api.setData({ templates: newTemplates })
		openNotification('success', 'ذخیره موفق', `پیام «${updatedTemplate.description}» با موفقیت ذخیره شد`)
	}

	if (api.isLoading || !api.data) return <Loading />

	return (
		<Flex vertical gap={32}>
			<BreadCrumbs />
			<Typography.Title level={1} className='text-page-title'>
				تنظیمات اطلاع رسانی
			</Typography.Title>

			<Flex vertical className={styles.list}>
				{templates.map((item, index) => (
					<Card key={index} className={styles.item}>
						<Flex vertical>
							<Flex align='center' className={styles.itemContainer} justify='space-between'>
								<Typography.Title className='text-page-title'>{item.description}</Typography.Title>
								<EditNotifications data={item} onUpdate={handleUpdate} />
							</Flex>
							<Typography.Text className={styles.text}>{item.text}</Typography.Text>
						</Flex>
					</Card>
				))}
			</Flex>
		</Flex>
	)
}

export default Notifications
