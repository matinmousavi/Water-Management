import { Form, Modal } from 'antd'
import useNotification from '../../../../../hooks/useNotification'
import useAPI from '../../../../../hooks/useAPI'
import WaterDistributionLogForm from '../WaterDistributionLogForm/WaterDistributionLogForm'

const WaterDistributionLogModal = ({ isOpen, setIsOpen, lands }) => {
  	const [form] = Form.useForm()
	const landsApi = useAPI()
	const { openNotification } = useNotification()

	const handleCancel = () => {
		form.resetFields()
		setIsOpen(false)
	}
	const handleSubmit = async () => {
		try {
			const values = await form.validateFields()
			let response = await landsApi.post('lands', values)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
			} else {
				openNotification('success', 'عملیات موفق', 'لاگ با موفقیت ایجاد شد.')
				form.resetFields()
				handleCancel()
			}
		} catch (error) {
			openNotification('error', 'خطا', error?.error?.message || 'خطایی رخ داده است')
		}
	}
	return (
		<Modal
			title='افزودن لاگ توزیع'
			open={isOpen}
			onOk={handleSubmit}
			onCancel={handleCancel}
			okText='ذخیره'
			cancelText='انصراف'
			forceRender
		>
      <WaterDistributionLogForm form={form} lands={lands} />
    </Modal>
	)
}

export default WaterDistributionLogModal
