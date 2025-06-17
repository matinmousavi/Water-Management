import { EditOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Modal, Typography } from 'antd'
import useModal from '../../../../../../hooks/useModal'
import { useForm } from 'antd/es/form/Form'
import useAPI from '../../../../../../hooks/useAPI'
import TextArea from 'antd/es/input/TextArea'
import styles from './EditNotification.module.css'
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
			const response = await api.put(`messageTemplates/${template.key}`, {
				text: values.text,
			})

			if (!response.error) {
				setTemplate(prev => ({
					...prev,
					text: values.text,
				}))
				openNotification('success', 'ذخیره موفق', `پیام «${title}» با موفقیت ذخیره شد`)
				close()
			}
		} catch (error) {
			console.error(error)
			openNotification(error)
		}
	}

	return (
		<>
			<Button onClick={() => open(handleOpen, 'before')} className='style-btn' size='middle' type='default'>
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
				<Flex vertical>
					<Typography.Title level={5} className={styles.titlePlaceholders}>
						متن پیامک را با در نظر گرفتن متغییرهای زیر وارد کنید:
					</Typography.Title>
					<Flex vertical gap={5}>
						{template.placeholders.map((item, index) => (
							<Flex key={index} align='center' gap={2}>
								<Typography.Text className={styles.textPlaceholdersText}>{item.description}</Typography.Text>
								<span>←</span>
								<Typography.Text className={styles.textPlaceholdersKey}>{item.key}</Typography.Text>
							</Flex>
						))}
					</Flex>
					<Form form={form}>
						<Form.Item name='text'>
							<TextArea className={styles.textArea} />
						</Form.Item>
					</Form>
				</Flex>
			</Modal>
		</>
	)
}

export default EditNotification
