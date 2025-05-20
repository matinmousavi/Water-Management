import { Form, Modal } from 'antd'
import useAPI from '../../../../hooks/useAPI'
import useNotification from '../../../../hooks/useNotification'
import FormFields from '../../../../components/FormFields/FormFields'

const FormLands = ({ isOpen, setIsOpen }) => {
	const { post } = useAPI()
	const [form] = Form.useForm()
	const { openNotification } = useNotification()
	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			await post('/lands', values)
			openNotification('success', 'عملیات موفق', 'زمین با موفقیت اضافه شد')
			form.resetFields()
			setIsRenderList(prev => !prev)
			handleCancel()
		} catch (error) {
			openNotification('error', 'خطا', error.message || 'خطایی در ارسال داده رخ داد')
		}
	}
	const contactFormFields = [
		{
			name: 'name',
			label: 'نام',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'owner',
			label: 'مالک',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'area',
			label: 'مساحت',
			rules: [
				{
					required: true,
					message: 'این فیلد الزامی است',
				},
			],
		},
		{
			name: 'kFactor',
			label: 'ضریب K',
			rules: [
				{
					required: true,
					message: 'این فیلد الزامی است',
				},
			],
		},
		{
			name: 'location',
			label: 'موقعیت',
			rules: [
				{
					required: true,
					message: 'این فیلد الزامی است',
				},
			],
		},
		{
			name: 'irrigationType',
			label: 'نوع آبیاری',
			rules: [
				{
					required: true,
					message: 'این فیلد الزامی است',
				},
			],
		},
	]
	return (
		<Modal title='فرم افزودن زمین' open={isOpen} onOk={handleSubmit} onCancel={handleCancel} cancelText='انصراف'>
			<Form form={form} layout='vertical'>
				<FormFields fields={contactFormFields} />
			</Form>
		</Modal>
	)
}
export default FormLands
