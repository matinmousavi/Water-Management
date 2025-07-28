import { EditOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Modal, Typography } from 'antd'
import { useForm } from 'antd/es/form/Form'
import TextArea from 'antd/es/input/TextArea'
import styles from './EditNotification.module.css'
import useModal from '../../../../../../hooks/useModal'
import useAPI from '../../../../../../hooks/useAPI'
import useNotification from '../../../../../../hooks/useNotification'

const EditNotification = ({ template, setTemplate, title }) => {
	const { open, close, isOpen } = useModal()
	const [form] = useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		form.setFieldsValue(template)
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleOk = async () => {
		const values = form.getFieldsValue()

		try {
			const response = await api.put(`settings/notifications/templates/${template.key}`, {
				text: values.text,
			})

			if (!response.error) {
				setTemplate(prev => prev.map(item => (item.key === template.key ? { ...item, text: values.text } : item)))
				openNotification('success', 'ذخیره موفق', `پیام «${title}» با موفقیت ذخیره شد`)
				close()
			}
		} catch (error) {
			console.error(error)
			openNotification(error)
		}
	}

	const renderPlaceholders = () => {
		if (template.key === 'otp') {
			return (
				<Flex vertical gap={5}>
					<Flex align='center' gap={2}>
						<Typography.Text className={styles.textPlaceholdersText}>کد تایید</Typography.Text>
						<span>←</span>
						<Typography.Text className={styles.textPlaceholdersKey}>
							{'{'}
							{'{'}code{'}'}
							{'}'}
						</Typography.Text>
					</Flex>
				</Flex>
			)
		} else {
			return (
				<Flex vertical gap={5}>
					{template.placeholders.map((item, index) => (
						<Flex key={index} align='center' gap={2}>
							<Typography.Text className={styles.textPlaceholdersText}>{item.description}</Typography.Text>
							<span>←</span>
							<Typography.Text className={styles.textPlaceholdersKey}>{item.key}</Typography.Text>
						</Flex>
					))}
				</Flex>
			)
		}
	}

	const renderDefaultText = () => {
		if (template.key === 'otp') {
			return 'کد تایید شما: {{code}}. لطفاً آن را به کسی ندهید.'
		}
		return 'آبیاری چاه {{well_name}} برای زمین {{land_owner_name}} از ساعت {{start_time}} آغاز شد.'
	}

	return (
		<>
			<Button onClick={() => open(handleOpen, 'before')} size='middle' type='default'>
				<Flex gap={8}>
					<EditOutlined />
					<span>ویرایش</span>
				</Flex>
			</Button>

			<Modal
				title={title}
				className={styles.modal}
				cancelText='انصراف'
				confirmLoading={api.isLoading}
				open={isOpen}
				onCancel={handleCancel}
				okText='ثبت'
				width={520}
				onOk={handleOk}
			>
				<Flex vertical gap={10}>
					<Typography.Title level={5} className={styles.titlePlaceholders}>
						{template.key === 'otp' ? (
							<p>متن پیامک را با در نظر گرفتن متغییر زیر وارد کنید:</p>
						) : (
							<p>متن پیامک را با در نظر گرفتن متغییرهای زیر وارد کنید:</p>
						)}
					</Typography.Title>

					{renderPlaceholders()}

					<Form form={form}>
						<Form.Item name='text' initialValue={renderDefaultText()}>
							<TextArea rows={4} className={styles.textArea} />
						</Form.Item>
					</Form>
				</Flex>
			</Modal>
		</>
	)
}

export default EditNotification
