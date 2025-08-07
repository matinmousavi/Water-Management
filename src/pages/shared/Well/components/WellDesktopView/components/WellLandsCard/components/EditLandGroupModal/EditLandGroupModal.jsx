import { Form, Modal, Button } from 'antd'
import EditLandGroupForm from '../EditLandGroupForm/EditLandGroupForm'
import { DeleteOutlined } from '@ant-design/icons'
import styles from './EditLandGroupModal.module.css'
import { useEffect, useMemo } from 'react'
import useAPI from '../../../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../../../hooks/useNotification'

const EditLandGroupModal = ({ landGroup, onClose, activeLands, setData, wellId, landGroups }) => {
	const [form] = Form.useForm()
	const landGroupApi = useAPI()
	const { openNotification } = useNotification()

	const selectableLands = useMemo(() => {
		const allGroupedIds = new Set()
		landGroups.forEach(group => {
			if (group.groupId !== landGroup.groupId) {
				group.lands.forEach(id => allGroupedIds.add(id))
			}
		})

		return activeLands.filter(land => !allGroupedIds.has(land._id))
	}, [activeLands, landGroups, landGroup.groupId])

	useEffect(() => {
		if (landGroup) {
			form.setFieldsValue({
				groupName: landGroup.title,
				lands: landGroup.lands?.map(l => l._id),
			})
		}
	}, [landGroup, form])

	const handleSave = async () => {
		try {
			const values = await form.validateFields()

			const response = await landGroupApi.patch(`wells/${wellId}/land-groups/${landGroup.groupId}`, {
				title: values.groupName,
				lands: values.lands,
			})

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
				return
			}

			openNotification('success', 'عملیات موفق', 'گروه با موفقیت ویرایش شد.')

			const updatedGroup = response.group

			setData?.(prev => prev.map(group => (group.groupId === updatedGroup.groupId ? updatedGroup : group)))

			onClose()
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', 'خطا در ذخیره‌سازی اطلاعات')
		}
	}

	const handleDelete = async () => {
		try {
			const response = await landGroupApi.delete(`wells/${wellId}/land-groups/${landGroup.groupId}`)

			if (response?.error) {
				openNotification('error', 'خطا', response.message)
				return
			}

			openNotification('success', 'حذف موفق', 'گروه با موفقیت حذف شد.')
			const updatedGroupList = prev => prev?.filter(group => group.groupId !== landGroup.groupId)
			setData?.(updatedGroupList)
			onClose()
		} catch (err) {
			console.error(err)
			openNotification('error', 'خطا', 'حذف گروه با خطا مواجه شد.')
		}
	}

	return (
		<Modal title='ویرایش گروه' open={true} footer={null} onCancel={onClose} confirmLoading={landGroupApi.isLoading}>
			<EditLandGroupForm landGroup={landGroup} form={form} activeLands={selectableLands} />

			<div className={styles['button-container']}>
				<div>
					<Button className={styles['delete-button']} type='link' icon={<DeleteOutlined />} onClick={handleDelete} loading={landGroupApi.isLoading}>
						حذف گروه‌بندی
					</Button>
				</div>
				<div>
					<Button className={styles['cancel-button']} onClick={onClose}>
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
