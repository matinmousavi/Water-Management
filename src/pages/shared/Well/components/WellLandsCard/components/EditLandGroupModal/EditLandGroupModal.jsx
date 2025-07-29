import { Form, Modal } from 'antd'
import EditLandGroupForm from '../EditLandGroupForm/EditLandGroupForm'

const EditLandGroupModal = ({ landGroup, onClose, activeLands }) => {
	const [form] = Form.useForm()

	const handleSave = () => {
		onClose()
	}

	return (
		<Modal title='ویرایش گروه زمین' open={true} onOk={handleSave} onCancel={onClose} okText='ذخیره' cancelText='انصراف'>
			<EditLandGroupForm landGroup={landGroup} form={form} activeLands={activeLands} />
		</Modal>
	)
}

export default EditLandGroupModal
