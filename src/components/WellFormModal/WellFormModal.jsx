import { useEffect, useState } from 'react'
import { Button, Form, Modal } from 'antd'
import useAPI from '../../hooks/useAPI'
import useNotification from '../../hooks/useNotification'
import FormFields from '../FormFields/FormFields'

const WellFormModal = ({ type = 'add', wellData = null, setWellsData }) => {
	const [isOpen, setIsOpen] = useState(false)
	const [form] = Form.useForm()
	const wellApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && wellData) {
			form.setFieldsValue({
				licenseCode: wellData.licenseCode,
				title: wellData.title,
				cycleDays: wellData.cycleDays,
			})
		}
	}, [type, wellData, form])

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()

			let response
			if (type === 'add') {
				response = await wellApi.post('wells', values)
			} else if (type === 'edit' && wellData?._id) {
				response = await wellApi.patch(`wells/${wellData._id}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `چاه با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)

				if (setWellsData) {
					setWellsData(prev =>
						type === 'add' ? [...prev, response.well] : prev.map(well => (well._id === response.well._id ? response.well : well))
					)
				}

				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داده است')
		}
	}

	const wellFormFields = [
		{
			name: 'licenseCode',
			label: 'کد پروانه',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'title',
			label: 'عنوان',
			col: 12,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
		{
			name: 'cycleDays',
			label: 'تعداد روزهای چرخه',
			col: 24,
			rules: [{ required: true, message: 'این فیلد الزامی است' }],
		},
	]

	return (
		<>
			<Button type={type === 'add' ? 'primary' : 'default'} onClick={() => setIsOpen(true)}>
				{type === 'add' ? 'افزودن چاه' : 'ویرایش'}
			</Button>

			<Modal
				title={type === 'add' ? 'فرم افزودن چاه' : 'فرم ویرایش چاه'}
				open={isOpen}
				onOk={handleSubmit}
				onCancel={handleCancel}
				okText='ذخیره'
				cancelText='انصراف'
			>
				<Form form={form} layout='vertical'>
					<FormFields fields={wellFormFields} />
				</Form>
			</Modal>
		</>
	)
}

export default WellFormModal
