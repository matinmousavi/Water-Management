import { useEffect } from 'react'
import { Modal, Form } from 'antd'
import useAPI from '../../../hooks/useAPI'
import useNotification from '../../../hooks/useNotification'
import WellForm from '../WellForm/WellForm'

const WellModal = ({ type = 'add', wellData = null, isOpen, setIsOpen, setWellsData }) => {
	const [form] = Form.useForm()
	const wellApi = useAPI()
	const { openNotification } = useNotification()

	useEffect(() => {
		if (type === 'edit' && wellData) {
			form.setFieldsValue(wellData)
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
			} else {
				response = await wellApi.patch(`wells/${wellData._id}`, values)
			}

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', `چاه با موفقیت ${type === 'add' ? 'افزوده' : 'ویرایش'} شد.`)

				if (setWellsData) {
					setWellsData(response.well)
				}

				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داده است')
		}
	}

	return (
		<Modal
			title={type === 'add' ? 'افزودن چاه' : 'ویرایش چاه'}
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
			forceRender
		>
			<WellForm form={form} />
		</Modal>
	)
}

export default WellModal
