import { EditOutlined } from '@ant-design/icons'
import { useForm } from 'antd/es/form/Form'
import useModal from '../../../../../../hooks/useModal'
import useAPI from '../../../../../../hooks/useAPI'
import useNotification from '../../../../../../hooks/useNotification'
import { Button, Flex, Form, InputNumber, Modal, Typography } from 'antd'
import styles from './EditLogging.module.css'

const EditLogging = ({ value, setValues, title }) => {
	const { open, close, isOpen } = useModal()
	const [form] = useForm()
	const api = useAPI()
	const { openNotification } = useNotification()

	const handleOpen = () => {
		form.setFieldsValue({ time: value.time })
	}

	const handleCancel = () => {
		close(() => form.resetFields(), 'after')
	}

	const handleOk = async () => {
		try {
			const values = await form.validateFields()

			const response = await api.patch('settings/irrigations', {
				[value.key]: { time: values.time },
			})

			if (!response.error) {
				setValues(prev => prev.map(t => (t.key === value.key ? { ...t, time: values.time } : t)))
				openNotification('success', 'ذخیره موفق', `مقدار «${title}» با موفقیت ذخیره شد`)
				close()
			}
		} catch (error) {
			console.error(error)
			openNotification(error)
		}
	}

	const getTimeUnit = () => {
		if (value.key.includes('Hours')) return 'ساعت'
		if (value.key.includes('Minutes')) return 'دقیقه'
		return ''
	}

	const getQuestion = () => {
		if (value.key === 'descriptionEditHours') return 'میرآب تا چه زمانی پس از ثبت لاگ امکان ویرایش توضیحات دارد؟'
		if (value.key === 'logTimeMarginMinutes') return 'میرآب تا چند دقیقه پیش از زمان لاگ می‌تواند آن را ثبت کند؟'
		return 'مقدار زمان را وارد کنید'
	}

	return (
		<>
			<Button color='primary' variant='outlined' onClick={() => open(handleOpen, 'before')} size='middle' type='default'>
				<Flex align='center' justify='center' gap={8}>
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
						{getQuestion()}
					</Typography.Title>
					<Form form={form} className={styles.form}>
						<Form.Item name='time' rules={[{ required: true, message: 'لطفاً مقدار زمان را وارد کنید' }]}>
							<InputNumber addonAfter={getTimeUnit()} min={1} />
						</Form.Item>
					</Form>
				</Flex>
			</Modal>
		</>
	)
}

export default EditLogging
