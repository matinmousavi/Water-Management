import { Form, Modal, Button } from 'antd'
import EditLandGroupForm from '../EditLandGroupForm/EditLandGroupForm'
import { DeleteOutlined } from '@ant-design/icons'
import styles from './EditLandGroupModal.module.css'
import { useEffect } from 'react'
import useAPI from '../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../hooks/useNotification'

const EditLandGroupModal = ({ landGroup, onClose, activeLands, setData }) => {
	const [form] = Form.useForm()
	const landGroupApi = useAPI()
	const { openNotification } = useNotification()
	

	useEffect(() => {
		if (landGroup) {
			form.setFieldsValue({
				groupName: landGroup.name,
				lands: landGroup.lands?.map(l => l._id),
			})
		}
	}, [landGroup, form])

	const handleSave = async () => {
		try {
			const values = await form.validateFields()

			const response = await landGroupApi.patch(`land-groups/${landGroup._id}`, {
				name: values.groupName,
				lands: values.lands,
			})

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
				return
			}

			openNotification('success', 'عملیات موفق', 'گروه با موفقیت ویرایش شد.')
			setData?.(response.landGroup)
			onClose()
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', 'خطا در ذخیره‌سازی اطلاعات')
		}
	}

	const handleDelete = async () => {
		try {
			const response = await landGroupApi.remove(`land-groups/${landGroup._id}`)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
				return
			}

			openNotification('success', 'حذف موفق', 'گروه با موفقیت حذف شد.')
			setData?.(null)
			onClose()
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', 'حذف گروه با خطا مواجه شد.')
		}
	}

	return (
		<Modal title='ویرایش گروه' open={true} footer={null} onCancel={onClose} confirmLoading={landGroupApi.isLoading}>
			<EditLandGroupForm landGroup={landGroup} form={form} activeLands={activeLands} />

			<div className={styles.buttonContainer}>
				<div>
					<Button type='link' danger icon={<DeleteOutlined />} onClick={handleDelete} loading={landGroupApi.isLoading}>
						حذف گروه‌بندی
					</Button>
				</div>
				<div>
					<Button className={styles.cancelButton} onClick={onClose}>
						انصراف
					</Button>
					<Button type='primary' onClick={handleSave} loading={landGroupApi.isLoading}>
						ثبت
					</Button>
				</div>
			</div>
		</Modal>
	)
}

export default EditLandGroupModal
