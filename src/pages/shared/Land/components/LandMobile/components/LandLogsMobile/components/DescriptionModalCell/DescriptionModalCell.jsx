import { Flex, Modal, Typography } from 'antd'
import { useState, useEffect } from 'react'
import useAPI from '../../../../../../../../../hooks/useAPI'
import useNotification from '../../../../../../../../../hooks/useNotification'
import moment from 'moment-jalaali'
import EditDescriptionLog from '../EditDescriptionLog/EditDescriptionLog'
import styles from './DescriptionModalCell.module.css'
import { EyeOutlined, EditOutlined } from '@ant-design/icons'

const { Text } = Typography

const DescriptionModalCell = ({ record, descriptionEditHours, onNoteUpdate }) => {
	const [openEdit, setOpenEdit] = useState(false)
	const [openDescription, setOpenDescription] = useState(false)
	const [notes, setNotes] = useState(record?.note || null)

	const { openNotification } = useNotification()
	const api = useAPI()

	useEffect(() => {
		setNotes(record?.note || null)
	}, [record?.note])

	const isEditAllowed = moment().diff(moment(record?.createdAt), 'hours') < descriptionEditHours

	const handleSubmit = async newNote => {
		const hadNoteBefore = Boolean(record?.note)

		try {
			await api.patch(`irrigations/${record?._id}`, { note: newNote })
			if (onNoteUpdate) onNoteUpdate(newNote)

			setNotes(newNote)
			openNotification('success', hadNoteBefore ? 'ویرایش موفق' : 'ثبت موفق', hadNoteBefore ? 'توضیحات با موفقیت ویرایش شد' : 'توضیحات با موفقیت ثبت شد')

			setOpenEdit(false)
			setOpenDescription(false)
		} catch (error) {
			openNotification('error', 'خطا', 'مشکلی در ثبت اطلاعات به‌وجود آمد')
		}
	}

	return (
		<>
			<Flex align='center' justify='center'>
				{!notes && isEditAllowed ? (
					<EditOutlined
						className={styles.icon}
						onClick={() => {
							setNotes('')
							setOpenEdit(true)
						}}
					/>
				) : (
					<EyeOutlined
						className={styles.icon}
						onClick={() => {
							setNotes(notes)
							setOpenDescription(true)
						}}
					/>
				)}
			</Flex>
			<Modal
				title={`توضیحات لاگ توزیع آب ${moment(record?.startedAt).format('dddd jD jMMMM jYYYY')}`}
				open={openDescription}
				onCancel={() => setOpenDescription(false)}
				centered
				footer={
					isEditAllowed &&
					notes && (
						<Flex
							align='center'
							justify='start'
							onClick={() => {
								setOpenDescription(false)
								setNotes(record?.note || notes)
								setTimeout(() => setOpenEdit(true), 300)
							}}
						>
							<EditOutlined className={styles.icon} />
							<Text className={styles.icon}>ویرایش</Text>
						</Flex>
					)
				}
				className={styles.modal}
			>
				<Text className={styles.text_note}>{notes || 'بدون توضیحات'}</Text>
			</Modal>
			<EditDescriptionLog
				loading={api.isLoading}
				isOpen={openEdit}
				onSubmit={handleSubmit}
				setNotes={setNotes}
				note={notes}
				onClose={() => setOpenEdit(false)}
			/>
		</>
	)
}

export default DescriptionModalCell
