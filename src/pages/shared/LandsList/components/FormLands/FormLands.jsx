import { Form, Modal } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import FormFields from '../../../../../components/FormFields/FormFields'
import SelectOwner from './components/SelectOwner/SelectOwner'
import SelectIrrigationType from './components/SelectIrrigationType/SelectIrrigationType'

const FormLands = ({ isOpen, setIsOpen, setIsRenderList }) => {
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
			console.log(values)
			const res = await post('/lands', values)
			if (res.error) {
				openNotification('error', res.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت اضافه شد')
				form.resetFields()
				setIsRenderList(prev => !prev)
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error.error.message)
		}
	}
	const contactFormFields = [
		{
			name: 'name',
			label: 'نام',
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
				{
					pattern: /[1-9]/g,
					message: 'فرمت مساحت معتبر نیست',
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
				{
					pattern: /[1-9]/g,
					message: 'فرمت ضریب k معتبر نیست',
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
				{
					pattern: /[1-9]/g,
					message: 'فرمت موقعیت معتبر نیست',
				},
			],
		},
	]
	return (
		<Modal title='فرم افزودن زمین' open={isOpen} onOk={handleSubmit} onCancel={handleCancel} cancelText='انصراف'>
			<Form form={form} layout='vertical'>
				<Form.Item
					rules={[
						{
							required: true,
							message: 'این فیلد الزامی است',
						},
					]}
					name='owner'
					label='مالک'
				>
					<SelectOwner />
				</Form.Item>
				<FormFields fields={contactFormFields} />
				<Form.Item
					rules={[
						{
							required: true,
							message: 'این فیلد الزامی است',
						},
					]}
					name='irrigationType'
					label='نوع آبیاری'
				>
					<SelectIrrigationType />
				</Form.Item>
			</Form>
		</Modal>
	)
}
export default FormLands
