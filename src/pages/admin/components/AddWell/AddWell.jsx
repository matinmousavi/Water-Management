import { Form, Input, Modal } from 'antd'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'

const AddWell = ({ isOpen, setIsOpen, setIsRenderList }) => {
	const { openNotification } = useNotification()
	const [form] = Form.useForm()
	const wellApi = useAPI()

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			const res = await wellApi.post('/wells', values)

			if (res.error) {
				openNotification('error', res.message)
			} else {
				openNotification('success', 'عملیات موفق', 'چاه با موفقیت اضافه شد.')
				form.resetFields()
				setIsRenderList(prev => !prev)
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error.error.message)
		}
	}

	return (
		<Modal title=' افزودن چاه' closable={{ 'aria-label': 'Custom Close Button' }} open={isOpen} onOk={handleSubmit} onCancel={() => setIsOpen(false)}>
			<Form form={form} layout='vertical'>
				<Form.Item name='licenseCode' label='کد پروانه' rules={[{ required: true, message: 'لطفاً کد پروانه را وارد کنید!' }]}>
					<Input />
				</Form.Item>
				<Form.Item name='title' label=' عنوان' rules={[{ required: true, message: 'لطفاً عنوان را وارد کنید!' }]}>
					<Input />
				</Form.Item>
				<Form.Item
					name='cycleDays'
					label='تعداد روزهای چرخه'
					rules={[
						{ required: true, message: 'لطفاً تعداد روزهای چرخه را وارد کنید!' },
						{ type: 'text', message: 'تعداد روزهای چرخه معتبر نیست!' },
					]}
				>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	)
}
export default AddWell
