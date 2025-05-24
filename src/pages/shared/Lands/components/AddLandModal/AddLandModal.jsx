import { Button, Form, Modal } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import FormFields from '../../../../../components/FormFields/FormFields'
import SelectOwner from './components/SelectOwner/SelectOwner'
import { useState } from 'react'

const AddLandModal = ({ refetchLands }) => {
	const [isOpen, setIsOpen] = useState(false)
	const { post, get } = useAPI()
	const [form] = Form.useForm()
	const { openNotification } = useNotification()
	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			const res = await post('/lands', values)
			if (res.error) {
				openNotification('error', res.message)
			} else {
				openNotification('success', 'عملیات موفق', 'زمین با موفقیت اضافه شد')
				form.resetFields()
				await get('lands')
				refetchLands()
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
			rules: [
				{
					required: true,
					message: 'این فیلد الزامی است',
				},
			],
			name: 'owner',
			label: 'مالک',
			customComponent: <SelectOwner />,
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
		{
			name: 'irrigationType',
			label: 'نوع آبیاری',
			inputType: 'select',
			options: [
				{ value: 'قطره‌ای', label: 'قطره‌ای' },
				{ value: 'بارانی', label: 'بارانی' },
				{ value: 'سطحی', label: 'سطحی' },
				{ value: 'چاه دستی', label: 'چاه دستی' },
				{ value: 'سایر', label: 'سایر' },
			],
			rules: [{ required: true, message: 'لطفاً نوع آبیاری را انتخاب کنید!' }],
			placeholder: 'نوع آبیاری مورد نظر را انتخاب کنید',
			allowClear: true,
		},
	]
	return (
		<div>
			<Button onClick={() => setIsOpen(true)} type='primary'>
				افزودن زمین
			</Button>
			<Modal title='فرم افزودن زمین' open={isOpen} onOk={handleSubmit} onCancel={handleCancel} cancelText='انصراف'>
				<Form form={form} layout='vertical'>
					<FormFields fields={contactFormFields} />
				</Form>
			</Modal>
		</div>
	)
}
export default AddLandModal
