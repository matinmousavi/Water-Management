import { EditOutlined } from '@ant-design/icons'
import { useForm } from 'antd/es/form/Form'
import useModal from '../../../../../../hooks/useModal'
import styles from './EditLogging.module.css'
import useAPI from '../../../../../../hooks/useAPI'
import useNotification from '../../../../../../hooks/useNotification'
import { Button, Flex, Form, Input, Modal, Typography } from 'antd'

const EditLogging = ({ template, setTemplate, title }) => {
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
				time: values.time,
			})

			if (!response.error) {
				setTemplate(prev => ({
					...prev,
					time: values.time,
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
				<Flex gap={10} justify='space-between' align='center' className={styles['modal-content']}>
					<Typography.Title level={5} className={styles.titlePlaceholders}>
						میرآب تا چه زمانی پس از ثبت لاگ امکان ویرایش توضیحات دارد؟
					</Typography.Title>
					<Form form={form} className={styles.form}>
						<Form.Item name='time'>
							<Input addonAfter={template.key == 'log_change_description' ? 'ساعت' : 'دقیقه'} defaultValue='mysite' />
						</Form.Item>
					</Form>
				</Flex>
			</Modal>
		</>
	)
}

export default EditLogging
