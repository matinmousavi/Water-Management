import { Flex, Modal, Typography } from 'antd'
import { useState } from 'react'

import useAPI from '../../../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../../../hooks/useNotification'

import moment from 'moment-jalaali'

import EditDescriptionLog from '../EditDescriptionLog/EditDescriptionLog'

import styles from './DescriptionModalCell.module.css'

import { EyeOutlined, EditOutlined } from '@ant-design/icons'

const { Text } = Typography

const DescriptionModalCell = ({ record, descriptionEditHours }) => {
	const [openEdit, setOpenEdit] = useState(false)
	const [openDescription, setOpenDescription] = useState(false)
	const [notes, setNotes] = useState(record?.note || null)

	const { openNotification } = useNotification()
	const api = useAPI()

	const isEditAllowed = moment().diff(moment(record?.createdAt), 'hours') < descriptionEditHours

	const handleEditClick = () => {
		if (!notes && isEditAllowed) {
			setOpenEdit(true)
		} else {
			setOpenDescription(true)
		}
	}

	const handleSubmit = async () => {
		const hadNoteBefore = Boolean(record?.note)

		try {
			const response = await api.patch(`irrigations/${record?._id}`, { note: notes })

			setNotes(response.irrigation.note)

			openNotification('success', hadNoteBefore ? 'ویرایش موفق' : 'ثبت موفق', hadNoteBefore ? 'توضیحات با موفقیت ویرایش شد' : 'توضیحات با موفقیت ثبت شد')

			setOpenEdit(false)
			setOpenDescription(false)
		} catch (error) {
			openNotification('error', 'خطا', 'مشکلی در ثبت اطلاعات به‌وجود آمد')
		}
	}

	const cancelEdit = () => {
		setOpenEdit(false)
	}

	const openEditFromModal = () => {
		setOpenDescription(false)
		setTimeout(() => setOpenEdit(true), 300)
	}

	return (
		<>
			<Flex align='center' justify='center' onClick={handleEditClick}>
				{isEditAllowed ? <EditOutlined className={styles.icon} /> : <EyeOutlined onClick={() => setOpenDescription(true)} className={styles.icon} />}
			</Flex>

			<Modal
				title={`توضیحات لاگ توزیع آب ${moment(record?.startedAt).format('dddd jD jMMMM jYYYY')}`}
				open={openDescription}
				onCancel={() => setOpenDescription(false)}
				centered
				footer={
					isEditAllowed &&
					notes && (
						<Flex align='center' justify='start' onClick={openEditFromModal}>
							<EditOutlined className={styles.icon} />
							<Text className={styles.icon}>ویرایش</Text>
						</Flex>
					)
				}
				className={styles.modal}
			>
				<Text className={styles.text_note}>{notes || 'بدون توضیحات'}</Text>
			</Modal>

			<EditDescriptionLog loading={api.isLoading} isOpen={openEdit} onSubmit={handleSubmit} setNotes={setNotes} note={notes} onClose={cancelEdit} />
		</>
	)
}

export default DescriptionModalCell
