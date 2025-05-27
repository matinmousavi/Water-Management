import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'antd'
import useAPI from '../../../../../hooks/useAPI'
import useNotification from '../../../../../hooks/useNotification'
import FormFields from '../../../../../components/FormFields/FormFields'
import SelectOwner from './components/SelectOwner/SelectOwner'

const irrigationOptions = [
	{ value: 'قطره‌ای', label: 'قطره‌ای' },
	{ value: 'بارانی', label: 'بارانی' },
	{ value: 'سطحی', label: 'سطحی' },
	{ value: 'چاه دستی', label: 'چاه دستی' },
	{ value: 'سایر', label: 'سایر' },
]

const LandFormModal = ({ type = 'add', landData = null, setLandsData }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [form] = Form.useForm()
	const landApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && landData) {
			form.setFieldsValue({
				name: landData.name,
				owner: landData.owner?.id,
				area: landData.area,
				kFactor: landData.kFactor,
				location: landData.location,
				irrigationType: landData.irrigationType,
			})
		}
	}, [type, landData, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response

			if (type === 'add') {
				response = await landApi.post('lands', values)
			} else if (type === 'edit' && landData?._id) {
				response = await landApi.patch(`lands/${landData._id}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `زمین با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)

				if (setLandsData) {
					setLandsData(prev =>
						type === 'add' ? [...prev, response.land] : prev.map(item => (item._id === response.land._id ? response.land : item))
					)
				}

				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'عملیات ناموفق بود.')
		}
	}

	const landFormFields = [
		{
			name: 'name',
			label: 'نام',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'owner',
			label: 'مالک',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
			customComponent: <SelectOwner />,
		},
		{
			name: 'area',
			label: 'مساحت (هکتار)',
			rules: [
				{ required: true, message: 'این فیلد الزامی است' },
				{ pattern: /^\d+$/, message: 'فقط عدد وارد کنید' },
			],
		},
		{
			name: 'kFactor',
			label: 'ضریب K',
			rules: [
				{ required: true, message: 'این فیلد الزامی است' },
				{ pattern: /^[0-9.]+$/, message: 'فرمت ضریب معتبر نیست' },
			],
		},
		{
			name: 'location',
			label: 'موقعیت',
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'irrigationType',
			label: 'نوع آبیاری',
			inputType: 'select',
			options: irrigationOptions,
			placeholder: 'نوع آبیاری مورد نظر را انتخاب کنید',
			allowClear: true,
			rules: [{ required: true, message: 'لطفاً نوع آبیاری را انتخاب کنید!' }],
		},
	]

	return (
		<>
			<Button type={type === 'add' ? 'primary' : 'default'} onClick={() => setIsOpen(true)}>
				{type === 'add' ? 'افزودن زمین' : 'ویرایش'}
			</Button>

			<Modal
				title={type === 'add' ? 'فرم افزودن زمین' : 'فرم ویرایش زمین'}
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				okText='ذخیره'
				cancelText='انصراف'
			>
				<Form form={form} layout='vertical'>
					<FormFields fields={landFormFields} />
				</Form>
			</Modal>
		</>
	)
}

export default LandFormModal
